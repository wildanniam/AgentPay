#![no_std]

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, Address, BytesN, Env, String,
};

#[contract]
pub struct AgentPayRegistry;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ToolRecord {
    pub provider: Address,
    pub metadata_hash: BytesN<32>,
    pub ledger: u32,
}

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Tool(String),
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ToolRegistered {
    #[topic]
    pub provider: Address,
    #[topic]
    pub tool_id: String,
    pub metadata_hash: BytesN<32>,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum RegistryError {
    EmptyToolId = 1,
    ProviderMismatch = 2,
}

#[contractimpl]
impl AgentPayRegistry {
    pub fn register_tool(
        env: Env,
        provider: Address,
        tool_id: String,
        metadata_hash: BytesN<32>,
    ) -> Result<ToolRecord, RegistryError> {
        provider.require_auth();

        if tool_id.len() == 0 {
            return Err(RegistryError::EmptyToolId);
        }

        let key = DataKey::Tool(tool_id.clone());

        if let Some(existing) = env.storage().persistent().get::<DataKey, ToolRecord>(&key) {
            if existing.provider != provider {
                return Err(RegistryError::ProviderMismatch);
            }
        }

        let record = ToolRecord {
            provider: provider.clone(),
            metadata_hash: metadata_hash.clone(),
            ledger: env.ledger().sequence(),
        };

        env.storage().persistent().set(&key, &record);
        ToolRegistered {
            provider,
            tool_id,
            metadata_hash,
        }
        .publish(&env);

        Ok(record)
    }

    pub fn get_tool(env: Env, tool_id: String) -> Option<ToolRecord> {
        env.storage()
            .persistent()
            .get::<DataKey, ToolRecord>(&DataKey::Tool(tool_id))
    }
}

mod test;
