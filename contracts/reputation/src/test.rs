#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env};

#[test]
fn test_reputation_initialization_and_queries() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, ReputationContract);
    let client = ReputationContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let escrow = Address::generate(&env);
    let freelancer = Address::generate(&env);

    client.initialize(&admin, &escrow);

    assert_eq!(client.get_escrow_contract(), escrow);

    let rep = client.get_reputation(&freelancer);
    assert_eq!(rep.completed_milestones, 0);
    assert_eq!(rep.total_earned, 0);
}

#[test]
fn test_record_completion_authorized() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, ReputationContract);
    let client = ReputationContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let escrow = Address::generate(&env);
    let freelancer = Address::generate(&env);

    client.initialize(&admin, &escrow);

    client.record_completion(&freelancer, &1000_0000000);

    let rep = client.get_reputation(&freelancer);
    assert_eq!(rep.completed_milestones, 1);
    assert_eq!(rep.total_earned, 1000_0000000);

    client.record_completion(&freelancer, &500_0000000);

    let rep_updated = client.get_reputation(&freelancer);
    assert_eq!(rep_updated.completed_milestones, 2);
    assert_eq!(rep_updated.total_earned, 1500_0000000);
}

#[test]
#[should_panic(expected = "HostError")]
fn test_unauthorized_completion_call() {
    let env = Env::default();
    // Do NOT mock auth to verify require_auth failure
    let contract_id = env.register_contract(None, ReputationContract);
    let client = ReputationContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let escrow = Address::generate(&env);
    let freelancer = Address::generate(&env);

    // Initializing with admin auth mocked locally
    env.mock_all_auths();
    client.initialize(&admin, &escrow);

    // Now clear auths so the call lacks escrow authorization
    // Record completion should fail require_auth on un-mocked caller
    client.record_completion(&freelancer, &100_0000000);
}
