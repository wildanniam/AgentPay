## ADDED Requirements

### Requirement: Tool marketplace listing
The system SHALL display active paid API tools in the AgentPay marketplace UI.

#### Scenario: Active tools are visible
- **WHEN** a user opens the Marketplace page
- **THEN** active tools are shown with name, description, category, provider, price, asset, network, provider wallet preview, and paid call endpoint

#### Scenario: Inactive tools are hidden from marketplace
- **WHEN** a tool is inactive
- **THEN** the Marketplace page does not show it as callable

### Requirement: Tools API discovery
The system SHALL expose active tools through `GET /api/tools` for app and external consumer usage.

#### Scenario: Tools API returns active tools
- **WHEN** a client requests `GET /api/tools`
- **THEN** the system returns active tools with id, name, description, category, price, asset, network, provider wallet, input example, output example, and call URL

### Requirement: Well-known agent discovery
The system SHALL expose active tools through `GET /.well-known/agentpay-tools.json` as a machine-readable external agent discovery document.

#### Scenario: Well-known discovery returns agent-compatible tools
- **WHEN** an external agent requests `GET /.well-known/agentpay-tools.json`
- **THEN** the system returns an AgentPay discovery document containing active tools and their paid call URLs

#### Scenario: Discovery contains payment metadata
- **WHEN** a discovery response includes a tool
- **THEN** the tool includes x402 payment metadata with scheme, price, asset, network, and provider wallet

### Requirement: Discovery excludes secrets
The system SHALL NOT expose private keys, facilitator credentials, raw payment payloads, or internal-only secrets in discovery responses.

#### Scenario: External discovery is sanitized
- **WHEN** a client requests any tool discovery endpoint
- **THEN** the response contains only public metadata required for selection and paid calls
