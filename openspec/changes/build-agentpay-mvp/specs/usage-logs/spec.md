## ADDED Requirements

### Requirement: Usage log creation
The system SHALL record a usage log for each paid wrapper attempt after payment processing begins.

#### Scenario: Successful tool call is logged
- **WHEN** a paid tool call completes successfully
- **THEN** the system stores tool, provider, amount, asset, network, payment status, payment proof, payer address when available, request preview, response preview, and timestamp

#### Scenario: Failed tool call is logged
- **WHEN** payment or provider forwarding fails after a wrapper call begins
- **THEN** the system stores a failed usage log with the error reason

### Requirement: Logs API
The system SHALL expose payment and usage logs through `GET /api/logs`.

#### Scenario: Logs API returns recent logs
- **WHEN** a client requests `GET /api/logs`
- **THEN** the system returns recent logs with tool name, amount, asset, payment status, proof or transaction reference, provider wallet, and timestamp

### Requirement: Payment logs dashboard
The system SHALL show payment and usage logs in the AgentPay dashboard UI.

#### Scenario: Provider reviews logs
- **WHEN** a user opens Payment Logs
- **THEN** the dashboard shows log rows with tool, provider wallet, amount, asset, status, proof, and timestamp

#### Scenario: Payment proof can be copied
- **WHEN** a log row has payment proof metadata
- **THEN** the UI provides a way to copy or inspect the proof

### Requirement: Sensitive data is not logged
The system SHALL NOT store private keys, full secret-bearing payment payloads, or large raw request/response bodies in usage logs.

#### Scenario: Log previews are bounded
- **WHEN** a wrapper request or provider response is logged
- **THEN** the system stores only bounded previews suitable for dashboard display
