# Capsule Studio Platform

Capsule Studio is the unified platform direction for this repository. It turns the previous SpecForge builder, launcher, sandbox, native interface, preview system, GitHub publisher, and background daemon concepts into one capsule-first operating surface.

## Core Idea

A capsule is a portable unit of work that can contain:

- source code
- language runtime metadata
- preview route
- web worker or service worker contract
- WebAssembly or WASI target metadata
- background daemon requirements
- generated artifacts and reports
- GitHub deployment instructions

Capsules can deploy as:

- web worker agents
- full web apps
- WASM kernels
- local services
- report suites
- GitHub release packages

## Supported Language Lanes

Capsule Studio defines lanes for:

- Python
- Java
- C
- C++
- React
- TypeScript
- Node.js
- HTML / CSS / JavaScript
- Julia
- MATLAB / Octave-style scientific sessions
- Rust
- Go
- R
- Shell

The platform separates language support into real runtime states. Some lanes are UI-ready today, some require local compilers, and some require a future WASM/WASI bridge. The point is to avoid fake compile support while still providing a unified architecture.

## Live Coding Session

When a coding session starts:

1. The session server turns on.
2. The selected language lane loads.
3. Source files are created or edited.
4. Preview routing is established.
5. A web, API, terminal, notebook, or artifact preview becomes available.
6. The result can be wrapped in a capsule manifest.
7. The capsule can be published back to GitHub.

## Web Workers as Capsules

Web workers are treated as first-class capsule deployments. A worker capsule can run agent logic, scoring logic, manifest generation, preview preparation, or long-running background work without blocking the main UI.

Current worker scaffolds:

- `src/workers/capsule.worker.ts`
- `src/workers/preview.worker.ts`

Future workers can map directly to capsules:

- `python-orchestrator.worker`
- `cpp-wasm-core.worker`
- `node-service.worker`
- `research-report.worker`
- `github-publisher.worker`

## WASM and WASI

Capsule Studio uses WebAssembly and WASI as deployment targets, not as magical universal compilers. C, C++, Rust, Go, and some JVM paths can target WASM when the local toolchain exists. Python can use WASI or Pyodide-style paths depending on the runtime. Julia and MATLAB-style lanes are modeled as native or interpreted scientific capsules unless a real bridge is installed.

## Agents

Agents are capsules with autonomous or semi-autonomous duties. Examples:

- Chief Orchestration Capsule
- Chief Research Capsule
- Runtime Engineering Capsule
- Launch Operations Capsule
- GitHub Publisher Capsule
- Preview Router Capsule
- Background Daemon Capsule

Each agent capsule has inputs, outputs, runtime lanes, and deployment targets.

## GitHub Publishing

GitHub remains the first deployment target. A capsule can publish:

- generated source tree
- capsule manifest
- build instructions
- preview instructions
- documentation
- reports
- release handoff notes

This keeps the system simple at first: build locally, preview locally, capsule the result, then commit the capsule package back to the repository.
