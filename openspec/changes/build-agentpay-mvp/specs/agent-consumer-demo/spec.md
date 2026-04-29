## ADDED Requirements

### Requirement: External agent consumer demo
The system SHALL include an external consumer demo in `examples/agent-consumer`.

#### Scenario: Demo command runs with prompt
- **WHEN** a developer runs `npm run demo:agent -- "Summarize this abstract: ..."`
- **THEN** the demo fetches AgentPay tool discovery, selects a tool, pays for the tool call, and prints the provider response

### Requirement: ToolSelector interface
The demo consumer SHALL select tools through a `ToolSelector` interface.

#### Scenario: Keyword selector is used by default
- **WHEN** the demo runs without `OPENAI_API_KEY`
- **THEN** it uses `KeywordToolSelector` and remains fully functional

#### Scenario: No matching tool is handled
- **WHEN** the selector cannot match a prompt to any discovered tool
- **THEN** the demo exits with a clear no-tool-found message and does not attempt payment

### Requirement: x402 client payment flow
The demo consumer SHALL handle the x402 HTTP 402 flow using a Stellar testnet wallet secret from environment variables.

#### Scenario: Demo pays after 402
- **WHEN** the first wrapper request returns HTTP 402
- **THEN** the demo builds and signs a payment payload using `AGENT_STELLAR_SECRET_KEY`
- **AND** the demo retries the same wrapper request with x402 payment headers

#### Scenario: Demo prints proof
- **WHEN** the paid wrapper request succeeds
- **THEN** the demo prints the selected tool, payment proof or settlement response, and provider response

### Requirement: OpenAI selector remains optional
The system SHALL NOT require an OpenAI API key for the core marketplace or external consumer demo.

#### Scenario: OpenAI key is absent
- **WHEN** `OPENAI_API_KEY` is missing
- **THEN** the AgentPay app and demo consumer still support discovery, payment, forwarding, and logging with keyword selection
