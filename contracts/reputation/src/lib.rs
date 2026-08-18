#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol};

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ReputationScore {
    pub completed_milestones: u32,
    pub total_earned: i128,
}

#[contracttype]
pub enum DataKey {
    EscrowContract,
    Reputation(Address),
    Admin,
}

const METRIC_EVENT: Symbol = symbol_short!("rep_upd");

#[contract]
pub struct ReputationContract;

#[contractimpl]
impl ReputationContract {
    /// Initialize the contract with the authorized Escrow Contract address
    pub fn initialize(env: Env, admin: Address, escrow_contract: Address) {
        if env.storage().instance().has(&DataKey::EscrowContract) {
            panic!("Already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::EscrowContract, &escrow_contract);
    }

    /// Update the Escrow Contract address if needed (Admin only)
    pub fn set_escrow_contract(env: Env, escrow_contract: Address) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic!("Not initialized"));
        admin.require_auth();
        env.storage().instance().set(&DataKey::EscrowContract, &escrow_contract);
    }

    /// Record milestone completion for a freelancer. Restrict invocation to authorized Escrow contract.
    pub fn record_completion(env: Env, freelancer: Address, amount: i128) {
        let escrow_contract: Address = env
            .storage()
            .instance()
            .get(&DataKey::EscrowContract)
            .unwrap_or_else(|| panic!("Escrow contract not initialized"));

        // Require authentication from the Escrow contract
        escrow_contract.require_auth();

        if amount <= 0 {
            panic!("Invalid completion amount");
        }

        let key = DataKey::Reputation(freelancer.clone());
        let current_rep: ReputationScore = env.storage().persistent().get(&key).unwrap_or(ReputationScore {
            completed_milestones: 0,
            total_earned: 0,
        });

        let updated_rep = ReputationScore {
            completed_milestones: current_rep.completed_milestones + 1,
            total_earned: current_rep.total_earned + amount,
        };

        env.storage().persistent().set(&key, &updated_rep);

        // Emit reputation event
        env.events().publish(
            (METRIC_EVENT, symbol_short!("recorded")),
            (freelancer, updated_rep.completed_milestones, updated_rep.total_earned),
        );
    }

    /// Query reputation metrics for a freelancer address
    pub fn get_reputation(env: Env, freelancer: Address) -> ReputationScore {
        let key = DataKey::Reputation(freelancer);
        env.storage().persistent().get(&key).unwrap_or(ReputationScore {
            completed_milestones: 0,
            total_earned: 0,
        })
    }

    /// Get the registered Escrow contract address
    pub fn get_escrow_contract(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::EscrowContract)
            .unwrap_or_else(|| panic!("Not initialized"))
    }
}

#[cfg(test)]
mod test;
