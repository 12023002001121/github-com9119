#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token::Client as TokenClient, Address, Env,
    String, Symbol,
};
use paystream_reputation::ReputationContractClient;

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum MilestoneStatus {
    Created,
    Funded,
    Submitted,
    Approved,
    Disputed,
    Refunded,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Milestone {
    pub id: u64,
    pub client: Address,
    pub freelancer: Address,
    pub amount: i128,
    pub token: Address,
    pub status: MilestoneStatus,
    pub deadline: u64,
    pub reputation_contract: Address,
    pub deliverable_cid: String,
}

#[contracttype]
pub enum DataKey {
    Milestone(u64),
    MilestoneCount,
    ReputationContract,
    Admin,
}

const TOPIC: Symbol = symbol_short!("milestone");

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Initialize the contract with default reputation contract address & admin
    pub fn initialize(env: Env, admin: Address, reputation_contract: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::ReputationContract, &reputation_contract);
        env.storage().instance().set(&DataKey::MilestoneCount, &0u64);
    }

    /// Set or update default reputation contract
    pub fn set_reputation_contract(env: Env, reputation_contract: Address) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic!("Not initialized"));
        admin.require_auth();
        env.storage().instance().set(&DataKey::ReputationContract, &reputation_contract);
    }

    /// Create a new milestone
    pub fn create_milestone(
        env: Env,
        client: Address,
        freelancer: Address,
        amount: i128,
        token: Address,
        deadline: u64,
    ) -> u64 {
        client.require_auth();

        if amount <= 0 {
            panic!("Amount must be greater than zero");
        }
        if deadline <= env.ledger().timestamp() {
            panic!("Deadline must be in the future");
        }

        let reputation_contract: Address = env
            .storage()
            .instance()
            .get(&DataKey::ReputationContract)
            .unwrap_or_else(|| panic!("Reputation contract not set"));

        let mut count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::MilestoneCount)
            .unwrap_or(0);
        count += 1;

        let milestone = Milestone {
            id: count,
            client: client.clone(),
            freelancer: freelancer.clone(),
            amount,
            token,
            status: MilestoneStatus::Created,
            deadline,
            reputation_contract,
            deliverable_cid: String::from_str(&env, ""),
        };

        env.storage().persistent().set(&DataKey::Milestone(count), &milestone);
        env.storage().instance().set(&DataKey::MilestoneCount, &count);

        // Event emission
        env.events().publish(
            (TOPIC, symbol_short!("created")),
            (count, client, freelancer, amount),
        );

        count
    }

    /// Fund an existing milestone by transferring tokens from client to escrow contract
    pub fn fund_milestone(env: Env, client: Address, milestone_id: u64) {
        client.require_auth();

        let mut milestone: Milestone = env
            .storage()
            .persistent()
            .get(&DataKey::Milestone(milestone_id))
            .unwrap_or_else(|| panic!("Milestone not found"));

        if milestone.client != client {
            panic!("Only the client can fund this milestone");
        }
        if milestone.status != MilestoneStatus::Created {
            panic!("Milestone is not in Created status");
        }

        // Transfer token from client to escrow contract
        let token_client = TokenClient::new(&env, &milestone.token);
        token_client.transfer(&client, &env.current_contract_address(), &milestone.amount);

        milestone.status = MilestoneStatus::Funded;
        env.storage().persistent().set(&DataKey::Milestone(milestone_id), &milestone);

        // Event emission
        env.events().publish(
            (TOPIC, symbol_short!("funded")),
            (milestone_id, client, milestone.amount),
        );
    }

    /// Freelancer submits deliverable IPFS CID / URL link
    pub fn submit_deliverable(
        env: Env,
        freelancer: Address,
        milestone_id: u64,
        deliverable_cid: String,
    ) {
        freelancer.require_auth();

        let mut milestone: Milestone = env
            .storage()
            .persistent()
            .get(&DataKey::Milestone(milestone_id))
            .unwrap_or_else(|| panic!("Milestone not found"));

        if milestone.freelancer != freelancer {
            panic!("Only assigned freelancer can submit deliverable");
        }
        if milestone.status != MilestoneStatus::Funded {
            panic!("Milestone must be funded before submission");
        }

        milestone.status = MilestoneStatus::Submitted;
        milestone.deliverable_cid = deliverable_cid;
        env.storage().persistent().set(&DataKey::Milestone(milestone_id), &milestone);

        // Event emission
        env.events().publish(
            (TOPIC, symbol_short!("submitted")),
            (milestone_id, freelancer),
        );
    }

    /// Client approves milestone -> releases funds to freelancer AND calls Reputation contract
    pub fn approve_milestone(env: Env, client: Address, milestone_id: u64) {
        client.require_auth();

        let mut milestone: Milestone = env
            .storage()
            .persistent()
            .get(&DataKey::Milestone(milestone_id))
            .unwrap_or_else(|| panic!("Milestone not found"));

        if milestone.client != client {
            panic!("Only client can approve milestone");
        }
        if milestone.status != MilestoneStatus::Submitted && milestone.status != MilestoneStatus::Funded {
            panic!("Milestone cannot be approved in current status");
        }

        // 1. Transfer escrowed token funds to freelancer
        let token_client = TokenClient::new(&env, &milestone.token);
        token_client.transfer(
            &env.current_contract_address(),
            &milestone.freelancer,
            &milestone.amount,
        );

        // 2. Inter-contract call to ReputationContract to record milestone completion
        let rep_client = ReputationContractClient::new(&env, &milestone.reputation_contract);
        rep_client.record_completion(&milestone.freelancer, &milestone.amount);

        milestone.status = MilestoneStatus::Approved;
        env.storage().persistent().set(&DataKey::Milestone(milestone_id), &milestone);

        // Event emission
        env.events().publish(
            (TOPIC, symbol_short!("approved")),
            (milestone_id, milestone.freelancer, milestone.amount),
        );
    }

    /// Raise a dispute (Client or Freelancer)
    pub fn raise_dispute(env: Env, caller: Address, milestone_id: u64) {
        caller.require_auth();

        let mut milestone: Milestone = env
            .storage()
            .persistent()
            .get(&DataKey::Milestone(milestone_id))
            .unwrap_or_else(|| panic!("Milestone not found"));

        if caller != milestone.client && caller != milestone.freelancer {
            panic!("Only client or freelancer can dispute milestone");
        }
        if milestone.status == MilestoneStatus::Approved || milestone.status == MilestoneStatus::Refunded {
            panic!("Cannot dispute finalized milestone");
        }

        milestone.status = MilestoneStatus::Disputed;
        env.storage().persistent().set(&DataKey::Milestone(milestone_id), &milestone);

        // Event emission
        env.events().publish(
            (TOPIC, symbol_short!("disputed")),
            (milestone_id, caller),
        );
    }

    /// Refund client if deadline has passed and deliverable is unapproved
    pub fn refund_expired(env: Env, client: Address, milestone_id: u64) {
        client.require_auth();

        let mut milestone: Milestone = env
            .storage()
            .persistent()
            .get(&DataKey::Milestone(milestone_id))
            .unwrap_or_else(|| panic!("Milestone not found"));

        if milestone.client != client {
            panic!("Only client can claim refund");
        }
        if env.ledger().timestamp() <= milestone.deadline {
            panic!("Deadline has not expired yet");
        }
        if milestone.status != MilestoneStatus::Funded && milestone.status != MilestoneStatus::Submitted {
            panic!("Milestone is not eligible for refund");
        }

        // Refund token back to client
        let token_client = TokenClient::new(&env, &milestone.token);
        token_client.transfer(
            &env.current_contract_address(),
            &milestone.client,
            &milestone.amount,
        );

        milestone.status = MilestoneStatus::Refunded;
        env.storage().persistent().set(&DataKey::Milestone(milestone_id), &milestone);

        // Event emission
        env.events().publish(
            (TOPIC, symbol_short!("refunded")),
            (milestone_id, client, milestone.amount),
        );
    }

    /// Query milestone details by ID
    pub fn get_milestone(env: Env, milestone_id: u64) -> Milestone {
        env.storage()
            .persistent()
            .get(&DataKey::Milestone(milestone_id))
            .unwrap_or_else(|| panic!("Milestone not found"))
    }

    /// Get total milestone count created
    pub fn get_milestone_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::MilestoneCount)
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod test;
