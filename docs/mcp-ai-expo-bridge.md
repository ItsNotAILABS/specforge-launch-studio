# MCP, AI, and Expo Go Bridge

Capsule Studio now includes a Python inner server layer that can be used by local AI clients, coding agents, and future MCP-compatible hosts.

## MCP-like Inner Server

Run the stdio JSON-RPC tool server:

```bash
python -m capsule_studio.mcp.server
```

Supported tool calls:

- `capsule.runtimes`
- `capsule.create_session`
- `capsule.write_file`
- `capsule.run_session`
- `capsule.manifest`
- `capsule.deploy_plan`
- `capsule.ai_generate`
- `capsule.ai_review`
- `capsule.wasm_plan`

This implementation is intentionally dependency-light. It follows a JSON-RPC tool shape so a local AI host can call it immediately, and it can later be swapped to the official MCP SDK without changing the platform contracts.

## AI Provider Layer

Capsule Studio has an AI abstraction in `capsule_studio/ai.py`.

Default mode is offline-safe:

```bash
CAPSULE_AI_PROVIDER=local
```

OpenAI-compatible mode:

```bash
CAPSULE_AI_PROVIDER=openai
OPENAI_API_KEY=...
CAPSULE_AI_MODEL=gpt-4.1-mini
python -m capsule_studio.mcp.server
```

The AI layer supports:

- code generation
- capsule manifest review
- provider swapping
- local fallback when no API key is available

## Expo Go Mobile Capsule Flow

Generate a mobile app capsule:

```bash
python -m capsule_studio.cli expo --name "Capsule Mobile App" --slug capsule-mobile-app --out .capsule_studio/expo/capsule-mobile-app
```

Run it with Expo Go:

```bash
cd .capsule_studio/expo/capsule-mobile-app
npm install
npm run start
```

Scan the QR code with Expo Go to preview the generated mobile capsule on a phone.

## Push and Merge Policy

For this repo, the current workflow is direct commits to `main` through the GitHub connector unless a branch/PR is explicitly requested. The platform also contains deploy-plan generation so future sessions can create branch, PR, merge, and release handoff steps.
