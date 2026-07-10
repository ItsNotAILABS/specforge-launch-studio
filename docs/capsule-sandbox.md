# Multi-Language Capsule Sandbox

SpecForge now includes a product surface and code contract for a multi-language coding sandbox. The sandbox is designed for live coding sessions where a local server turns on, a preview surface becomes available, and outputs can be packaged into deployable capsules.

## Goal

Support coding sessions across multiple language lanes:

- Python
- MATLAB / Octave-style scientific code
- Julia
- Java
- C++
- C
- Rust
- TypeScript
- HTML / CSS / JavaScript
- R
- Go
- Shell

Not every language can be compiled to WebAssembly directly without the right local toolchain. The interface separates readiness into `ready`, `planned`, and `requires-toolchain` so the system does not fake support.

## Session Model

A session has:

- language
- runtime
- server state
- preview route
- capsule mode
- deploy target
- manifest entries

The browser UI presents this as a live coding capsule. The server turns on for web and notebook-style sessions and the preview router decides whether output appears as a website, API result, terminal stream, notebook artifact, or generated file.

## Capsule Route

1. Code — source files are created or edited in the selected language.
2. Compile — code is compiled, interpreted, transpiled, or packaged for wasm/wasi when the toolchain exists.
3. Serve — the session server exposes a local preview URL or output route.
4. Preview — the user opens the web, terminal, notebook, or artifact preview.
5. Deploy — generated files and capsule manifest are published to GitHub.

## Daemons

The sandbox surface models the background processes required for a real local runtime:

- Session Server
- Preview Router
- Capsule Builder
- WASM Bridge
- GitHub Publisher
- Background Worker Pool

These are product contracts first. Local AIs or backend services can implement each daemon behind the same UI.

## Front-End Support

HTML, CSS, JavaScript, and TypeScript sessions use the web preview lane. This allows the sandbox to create whole websites, run them locally, preview them, then package and publish them.

## GitHub Deployment

The first deployment target is this repository. A completed capsule should include:

- source files
- capsule manifest
- build instructions
- preview route
- generated artifacts
- deploy notes

The UI exposes the deploy action as a first-class button so the system does not stop at code generation.
