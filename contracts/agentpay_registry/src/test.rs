#![cfg(test)]

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Address, BytesN, Env, String};

fn setup() -> (Env, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(AgentPayRegistry, ());
    let provider = Address::generate(&env);

    (env, contract_id, provider)
}

fn hash(env: &Env, fill: u8) -> BytesN<32> {
    BytesN::from_array(env, &[fill; 32])
}

#[test]
fn register_tool_success() {
    let (env, contract_id, provider) = setup();
    let client = AgentPayRegistryClient::new(&env, &contract_id);
    let tool_id = String::from_str(&env, "tool-abc");
    let metadata_hash = hash(&env, 7);

    let record = client
        .try_register_tool(&provider, &tool_id, &metadata_hash)
        .unwrap()
        .unwrap();

    assert_eq!(record.provider, provider);
    assert_eq!(record.metadata_hash, metadata_hash);
    assert_eq!(record.ledger, env.ledger().sequence());
}

#[test]
fn get_registered_tool() {
    let (env, contract_id, provider) = setup();
    let client = AgentPayRegistryClient::new(&env, &contract_id);
    let tool_id = String::from_str(&env, "stellar-explainer");
    let metadata_hash = hash(&env, 11);

    client.register_tool(&provider, &tool_id, &metadata_hash);

    let record = client.get_tool(&tool_id).unwrap();
    assert_eq!(record.provider, provider);
    assert_eq!(record.metadata_hash, metadata_hash);
}

#[test]
fn rejects_empty_tool_id() {
    let (env, contract_id, provider) = setup();
    let client = AgentPayRegistryClient::new(&env, &contract_id);
    let empty = String::from_str(&env, "");
    let metadata_hash = hash(&env, 1);

    let error = client
        .try_register_tool(&provider, &empty, &metadata_hash)
        .unwrap_err()
        .unwrap();

    assert_eq!(error, RegistryError::EmptyToolId);
}

#[test]
fn rejects_duplicate_tool_with_different_provider() {
    let (env, contract_id, provider) = setup();
    let client = AgentPayRegistryClient::new(&env, &contract_id);
    let second_provider = Address::generate(&env);
    let tool_id = String::from_str(&env, "paid-research-tool");

    client.register_tool(&provider, &tool_id, &hash(&env, 2));

    let error = client
        .try_register_tool(&second_provider, &tool_id, &hash(&env, 3))
        .unwrap_err()
        .unwrap();

    assert_eq!(error, RegistryError::ProviderMismatch);
}
