#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token::{AdminClient as TokenAdminClient, Client as TokenClient},
    Address, Env, String,
};
use paystream_reputation::{ReputationContract, ReputationContractClient};

fn create_token_contract<'a>(
    env: &Env,
    admin: &Address,
) -> (TokenClient<'a>, TokenAdminClient<'a>) {
    let token_id = env.register_stellar_asset_contract(admin.clone());
    (
        TokenClient::new(env, &token_id),
        TokenAdminClient::new(env, &token_id),
    )
}

#[test]
fn test_escrow_happy_path_with_reputation_intercontract_call() {
    let env = Env::default();
    env.mock_all_auths();

    // 1. Setup contracts
    let admin = Address::generate(&env);
    let client_addr = Address::generate(&env);
    let freelancer_addr = Address::generate(&env);

    let (token_client, token_admin) = create_token_contract(&env, &admin);

    let rep_id = env.register_contract(None, ReputationContract);
    let rep_contract_client = ReputationContractClient::new(&env, &rep_id);

    let escrow_id = env.register_contract(None, EscrowContract);
    let escrow_client = EscrowContractClient::new(&env, &escrow_id);

    // Initialize both contracts and link them
    rep_contract_client.initialize(&admin, &escrow_id);
    escrow_client.initialize(&admin, &rep_id);

    // 2. Fund client account with token
    let amount: i128 = 1000_0000000;
    token_admin.mint(&client_addr, &amount);
    assert_eq!(token_client.balance(&client_addr), amount);

    // 3. Create milestone
    let deadline = env.ledger().timestamp() + 3600;
    let milestone_id = escrow_client.create_milestone(
        &client_addr,
        &freelancer_addr,
        &amount,
        &token_client.address,
        &deadline,
    );
    assert_eq!(milestone_id, 1);

    let milestone = escrow_client.get_milestone(&milestone_id);
    assert_eq!(milestone.status, MilestoneStatus::Created);

    // 4. Fund milestone
    escrow_client.fund_milestone(&client_addr, &milestone_id);
    assert_eq!(token_client.balance(&client_addr), 0);
    assert_eq!(token_client.balance(&escrow_id), amount);

    let milestone_funded = escrow_client.get_milestone(&milestone_id);
    assert_eq!(milestone_funded.status, MilestoneStatus::Funded);

    // 5. Submit deliverable
    let cid = String::from_str(&env, "ipfs://QmbWqxBEKC8P8h08i09u");
    escrow_client.submit_deliverable(&freelancer_addr, &milestone_id, &cid);

    let milestone_submitted = escrow_client.get_milestone(&milestone_id);
    assert_eq!(milestone_submitted.status, MilestoneStatus::Submitted);
    assert_eq!(milestone_submitted.deliverable_cid, cid);

    // 6. Approve milestone -> transfers token to freelancer AND updates reputation
    escrow_client.approve_milestone(&client_addr, &milestone_id);

    // Check balances
    assert_eq!(token_client.balance(&escrow_id), 0);
    assert_eq!(token_client.balance(&freelancer_addr), amount);

    // Check milestone status
    let milestone_approved = escrow_client.get_milestone(&milestone_id);
    assert_eq!(milestone_approved.status, MilestoneStatus::Approved);

    // Verify inter-contract call updated freelancer's reputation!
    let rep = rep_contract_client.get_reputation(&freelancer_addr);
    assert_eq!(rep.completed_milestones, 1);
    assert_eq!(rep.total_earned, amount);
}

#[test]
#[should_panic(expected = "HostError")]
fn test_unauthorized_fund_rejection() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let client_addr = Address::generate(&env);
    let freelancer_addr = Address::generate(&env);
    let imposter = Address::generate(&env);

    let (token_client, _) = create_token_contract(&env, &admin);

    let rep_id = env.register_contract(None, ReputationContract);
    let escrow_id = env.register_contract(None, EscrowContract);
    let escrow_client = EscrowContractClient::new(&env, &escrow_id);

    env.mock_all_auths();
    escrow_client.initialize(&admin, &rep_id);

    let deadline = env.ledger().timestamp() + 3600;
    let milestone_id = escrow_client.create_milestone(
        &client_addr,
        &freelancer_addr,
        &100_0000000,
        &token_client.address,
        &deadline,
    );

    // Clear auth mocking to ensure non-client funding fails
    // Imposter calling fund_milestone should fail require_auth
    escrow_client.fund_milestone(&imposter, &milestone_id);
}

#[test]
#[should_panic(expected = "Milestone cannot be approved in current status")]
fn test_double_approval_rejection() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let client_addr = Address::generate(&env);
    let freelancer_addr = Address::generate(&env);

    let (token_client, token_admin) = create_token_contract(&env, &admin);
    let rep_id = env.register_contract(None, ReputationContract);
    let rep_contract_client = ReputationContractClient::new(&env, &rep_id);
    let escrow_id = env.register_contract(None, EscrowContract);
    let escrow_client = EscrowContractClient::new(&env, &escrow_id);

    rep_contract_client.initialize(&admin, &escrow_id);
    escrow_client.initialize(&admin, &rep_id);

    let amount = 500_0000000;
    token_admin.mint(&client_addr, &amount);

    let deadline = env.ledger().timestamp() + 3600;
    let milestone_id = escrow_client.create_milestone(
        &client_addr,
        &freelancer_addr,
        &amount,
        &token_client.address,
        &deadline,
    );

    escrow_client.fund_milestone(&client_addr, &milestone_id);
    escrow_client.submit_deliverable(
        &freelancer_addr,
        &milestone_id,
        &String::from_str(&env, "ipfs://demo"),
    );

    // First approval succeeds
    escrow_client.approve_milestone(&client_addr, &milestone_id);

    // Second approval should panic with invalid status
    escrow_client.approve_milestone(&client_addr, &milestone_id);
}

#[test]
fn test_expired_refund_path() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let client_addr = Address::generate(&env);
    let freelancer_addr = Address::generate(&env);

    let (token_client, token_admin) = create_token_contract(&env, &admin);
    let rep_id = env.register_contract(None, ReputationContract);
    let escrow_id = env.register_contract(None, EscrowContract);
    let escrow_client = EscrowContractClient::new(&env, &escrow_id);

    escrow_client.initialize(&admin, &rep_id);

    let amount = 300_0000000;
    token_admin.mint(&client_addr, &amount);

    let deadline = env.ledger().timestamp() + 1000;
    let milestone_id = escrow_client.create_milestone(
        &client_addr,
        &freelancer_addr,
        &amount,
        &token_client.address,
        &deadline,
    );

    escrow_client.fund_milestone(&client_addr, &milestone_id);

    // Fast-forward ledger time past deadline
    env.ledger().set_timestamp(deadline + 500);

    // Refund client
    escrow_client.refund_expired(&client_addr, &milestone_id);

    assert_eq!(token_client.balance(&client_addr), amount);
    assert_eq!(token_client.balance(&escrow_id), 0);

    let milestone = escrow_client.get_milestone(&milestone_id);
    assert_eq!(milestone.status, MilestoneStatus::Refunded);
}

#[test]
fn test_raise_dispute_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let client_addr = Address::generate(&env);
    let freelancer_addr = Address::generate(&env);

    let (token_client, token_admin) = create_token_contract(&env, &admin);
    let rep_id = env.register_contract(None, ReputationContract);
    let escrow_id = env.register_contract(None, EscrowContract);
    let escrow_client = EscrowContractClient::new(&env, &escrow_id);

    escrow_client.initialize(&admin, &rep_id);

    let amount = 200_0000000;
    token_admin.mint(&client_addr, &amount);

    let deadline = env.ledger().timestamp() + 3600;
    let milestone_id = escrow_client.create_milestone(
        &client_addr,
        &freelancer_addr,
        &amount,
        &token_client.address,
        &deadline,
    );

    escrow_client.fund_milestone(&client_addr, &milestone_id);

    // Freelancer raises dispute
    escrow_client.raise_dispute(&freelancer_addr, &milestone_id);

    let milestone = escrow_client.get_milestone(&milestone_id);
    assert_eq!(milestone.status, MilestoneStatus::Disputed);
}
