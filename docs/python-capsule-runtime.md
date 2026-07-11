# Python Capsule Runtime

This is the first real backend layer for Capsule Studio. It is intentionally built in Python with the standard library so the platform can start running in a local coding session before heavier infrastructure is installed.

## What It Provides

- Runtime registry for Python, HTML, Node, React, C, C++, Java, Julia, MATLAB/Octave-style sessions
- Local coding session creation
- Safe workspace storage boundary
- File write/read support inside session roots
- Runtime command execution with toolchain-aware error reporting
- Static web preview routing
- JSON API server
- Capsule manifest generation
- WASM/WASI build planning for C and C++
- Deploy-plan generation for GitHub handoff
- Tests and CI workflow

## Run API Server

```bash
python -m capsule_studio.cli api
```

Default API server:

```text
http://127.0.0.1:8764
```

Routes:

- `GET /health`
- `GET /api/runtimes`
- `POST /api/session`
- `GET /api/session/<id>`
- `POST /api/session/<id>/file`
- `POST /api/session/<id>/run`
- `POST /api/session/<id>/manifest`
- `POST /api/session/<id>/deploy-plan`

## Run Preview Server

```bash
python -m capsule_studio.cli preview
```

Default preview server:

```text
http://127.0.0.1:8765
```

Preview route:

```text
http://127.0.0.1:8765/preview/<session_id>/
```

## Create Session From CLI

```bash
python -m capsule_studio.cli create python --name demo-python
python -m capsule_studio.cli create html --name demo-web
python -m capsule_studio.cli run demo-python
python -m capsule_studio.cli manifest demo-python
```

## WASM Planning

```bash
python -m capsule_studio.cli wasm-plan native/specforge_core.cpp --kind cpp
```

The WASM planner is honest. It detects whether Emscripten or clang/WASI tools exist locally. If not, it returns the missing toolchain instead of claiming compilation happened.

## Production Direction

The current Python layer is the deployable local runtime foundation. Next production layers can attach:

- authenticated workspace users
- persistent SQLite/Postgres state
- queue-backed background workers
- WebSocket log streaming
- real compiler containers
- browser-based code editor
- GitHub write-back automation
- WASM artifact hosting
- MCP tool service adapters
