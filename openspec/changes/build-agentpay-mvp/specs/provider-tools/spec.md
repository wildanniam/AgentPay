## ADDED Requirements

### Requirement: Provider tool registration
The system SHALL allow a provider to register an HTTP API endpoint as a paid AgentPay tool.

#### Scenario: Valid tool is registered
- **WHEN** a provider submits a tool with provider name, provider wallet, name, description, category, endpoint URL, method, price, asset, and JSON examples
- **THEN** the system stores the provider and tool
- **AND** the tool becomes available for marketplace and discovery responses

#### Scenario: Wrapper endpoint is assigned
- **WHEN** a tool is registered successfully
- **THEN** the system assigns the paid call URL `/api/tools/{toolId}/call`

### Requirement: Registration validation
The system SHALL reject invalid provider tool registrations before storing them.

#### Scenario: Invalid provider wallet is rejected
- **WHEN** a provider submits a wallet address that is not a valid Stellar public key shape
- **THEN** the system rejects the registration with a validation error

#### Scenario: Invalid endpoint URL is rejected
- **WHEN** a provider submits an endpoint URL that is not allowed for the current environment
- **THEN** the system rejects the registration with a validation error

#### Scenario: Invalid price is rejected
- **WHEN** a provider submits a non-positive price amount
- **THEN** the system rejects the registration with a validation error

#### Scenario: Invalid JSON examples are rejected
- **WHEN** a provider submits input or output examples that cannot be parsed as JSON
- **THEN** the system rejects the registration with a validation error

### Requirement: Seed demo tools
The system SHALL seed first-party demo tools for repeatable local and judging demos.

#### Scenario: Seed tools are available
- **WHEN** the database is seeded
- **THEN** Paper Summarizer, Campus FAQ RAG, and Stellar Explainer tools are available as active tools
