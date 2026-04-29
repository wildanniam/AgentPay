## ADDED Requirements

### Requirement: Paid wrapper requires x402 payment
The system SHALL protect `POST /api/tools/{toolId}/call` with x402 payment requirements on Stellar testnet.

#### Scenario: Request without payment receives 402
- **WHEN** a client calls an active tool wrapper endpoint without a valid x402 payment
- **THEN** the system responds with HTTP 402 Payment Required
- **AND** the response includes machine-readable x402 payment requirements

#### Scenario: Unknown tool is rejected
- **WHEN** a client calls a wrapper endpoint for a missing or inactive tool
- **THEN** the system returns a non-success error without attempting payment settlement

### Requirement: Paid wrapper settles before forwarding
The system SHALL forward requests to provider APIs only after x402 payment succeeds.

#### Scenario: Payment succeeds
- **WHEN** a client retries a wrapper request with a valid x402 Stellar testnet payment payload
- **THEN** the system verifies and settles the payment through the configured facilitator
- **AND** the system forwards the request body to the provider API
- **AND** the provider response is returned to the client

#### Scenario: Payment fails
- **WHEN** payment verification or settlement fails
- **THEN** the system does not call the provider API
- **AND** the system returns a clear payment failure response

### Requirement: Provider forwarding preserves request intent
The system SHALL forward the external agent request body to the registered provider endpoint using the tool's configured HTTP method.

#### Scenario: Provider receives paid request body
- **WHEN** a paid wrapper request succeeds
- **THEN** the provider endpoint receives the submitted JSON payload

#### Scenario: Provider timeout is handled
- **WHEN** the provider endpoint does not respond within the configured timeout
- **THEN** the system returns a provider timeout error and records a failed usage log

### Requirement: Testnet-only default
The system SHALL default all MVP x402 payments to `stellar:testnet`.

#### Scenario: Discovery and wrapper agree on testnet
- **WHEN** a tool is discovered and then called
- **THEN** both discovery metadata and wrapper payment requirements use `stellar:testnet`
