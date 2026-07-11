# Parallel CAPSULA Studio Build

CAPSULA is now the runtime-focused parallel build for Capsule Studio.

- Product/spec/launcher platform: `ItsNotAILABS/specforge-launch-studio`
- Runtime/MCP/mobile/worker platform: `ItsNotAILABS/CAPSULA`

## Split of Responsibility

`specforge-launch-studio` remains the product design, spec builder, marketplace, launcher, and capsule architecture surface.

`CAPSULA` now owns:

- Python runtime server
- preview server
- MCP-style inner server
- AI provider bridge
- Web Worker capsule scaffold
- Expo Go generator
- WASM/WASI planner
- runtime session orchestration
- deploy-plan engine

## Shared Direction

Both repos follow the same capsule flow:

```text
code -> runtime session -> preview -> capsule manifest -> worker/app/mobile/wasm target -> GitHub deploy
```

## Active Runtime Repo

CAPSULA repo:

```text
https://github.com/ItsNotAILABS/CAPSULA
```

Use it as the dedicated runtime capsule studio while this repo continues to develop the higher-level builder and launcher product surface.
