# Provider Test Tools

Use these demo provider APIs when testing the Provider Dashboard registration flow.

Each endpoint is a normal HTTPS API route. The important part is that the provider still registers it through AgentPay, signs the AgentPayRegistry transaction with Freighter, and receives payment through the x402 wrapper.

If you test on the deployed Vercel app, replace `http://localhost:3000` with `https://agent-pay-jet.vercel.app` in the provider endpoint field. Production registration only accepts public HTTPS provider URLs.

Base URL while testing locally:

```txt
http://localhost:3000
```

Base URL after pushing and redeploying Vercel:

```txt
https://agent-pay-jet.vercel.app
```

## Manual Provider Test Flow

1. Open `/provider`.
2. Connect Freighter on Stellar Testnet.
3. Confirm XLM balance and USDC trustline are ready.
4. Enter the registration access token.
5. Choose one tool below and paste the form values.
6. Click `Register Tool`.
7. Sign the AgentPayRegistry transaction in Freighter.
8. Open `/marketplace` and confirm the tool appears with an on-chain proof badge.
9. Run the external agent demo with a matching prompt.

## Startup Pitch Critic

Provider endpoint:

```txt
http://localhost:3000/api/provider-seed/pitch-critic
```

Form values:

```txt
Provider name: AgentPay Demo Provider
Tool name: Startup Pitch Critic
Category: utility
USDC price: 0.01
Description: Reviews startup pitches and returns strengths, risks, and a sharper one-line rewrite.
```

Input example JSON:

```json
{
  "pitch": "AgentPay is an API marketplace where external agents discover paid tools and pay with Stellar testnet USDC."
}
```

Output example JSON:

```json
{
  "verdict": "promising",
  "score": 82,
  "strengths": ["Names a concrete audience or workflow."],
  "risks": ["The pitch should show why this product is urgent now."],
  "suggestedIteration": "Rewrite the pitch as: user segment, painful workflow, paid action, proof point, and next milestone."
}
```

Demo command:

```bash
npm run demo:agent -- "Critique this startup pitch: AgentPay helps external agents discover paid APIs and pay with Stellar USDC."
```

## JSON Inspector

Provider endpoint:

```txt
http://localhost:3000/api/provider-seed/json-inspector
```

Form values:

```txt
Provider name: AgentPay Demo Provider
Tool name: JSON Inspector
Category: data
USDC price: 0.01
Description: Validates and normalizes JSON payloads before agents send structured requests.
```

Input example JSON:

```json
{
  "json": "{\"tool\":\"agentpay\",\"paid\":true}"
}
```

Output example JSON:

```json
{
  "valid": true,
  "type": "object",
  "keys": ["tool", "paid"],
  "normalizedJson": "{\n  \"tool\": \"agentpay\",\n  \"paid\": true\n}"
}
```

Demo command:

```bash
npm run demo:agent -- "Validate this JSON payload: {\"tool\":\"agentpay\",\"paid\":true}"
```

## Meeting Action Extractor

Provider endpoint:

```txt
http://localhost:3000/api/provider-seed/meeting-actions
```

Form values:

```txt
Provider name: AgentPay Demo Provider
Tool name: Meeting Action Extractor
Category: utility
USDC price: 0.01
Description: Turns meeting transcripts into action items, decisions, and follow-up reminders.
```

Input example JSON:

```json
{
  "transcript": "Wildan will deploy the app today. The team agreed to record a demo video. We should update the README."
}
```

Output example JSON:

```json
{
  "summary": "Wildan will deploy the app today.",
  "actionItems": [
    {
      "id": 1,
      "owner": "Wildan",
      "task": "Wildan will deploy the app today.",
      "priority": "high"
    }
  ],
  "decisions": ["The team agreed to record a demo video."]
}
```

Demo command:

```bash
npm run demo:agent -- "Extract meeting actions: Wildan will deploy the app today. The team agreed to record a demo video."
```
