# SpecForge Launch Studio

Desktop-style frontend for visually designing professional app specifications with click-only choices, managing project work, browsing clone-ready apps, and preparing Launcher publish flows.

## Stack

- Vite
- React
- TypeScript
- CSS custom properties
- Native C/C++ interface
- GitHub Actions verification

## Product Surface

- Builder/Launcher home dashboard split
- Click-only 10-section spec builder
- Portfolio and project workspace with detailed table view
- App marketplace with creator profiles
- Guided post-clone setup
- 6-step Launcher onboarding: Brand, Audience, Content, Features, Updates, Go Live
- Pricing advisor formula: `base + complexity + support + market`
- Native C/C++ scoring and export interface for local AIs, CLI tools, Python bindings, Node addons, or future WebAssembly builds

## Run

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5190`.

## Static Preview

If npm install is not available in an environment:

```bash
python3 launch_static.py
```

## Native C/C++ Interface

The `native/` folder provides a working C ABI and C++ implementation for the SpecForge scoring/export core.

```bash
c++ -std=c++17 native/specforge_core.cpp native/specforge_cli.cpp -o native/specforge_cli
c++ -std=c++17 native/specforge_core.cpp native/tests/specforge_native_tests.cpp -o native/specforge_native_tests
native/specforge_cli score
native/specforge_cli export
native/specforge_native_tests
```

Native files:

- `native/specforge_core.h` — C ABI header
- `native/specforge_core.cpp` — C++ scoring/export engine
- `native/specforge_cli.cpp` — command line interface
- `native/tests/specforge_native_tests.cpp` — smoke tests

## Verify

```bash
npm run verify
npm run build
```

GitHub Actions also verifies the native C++ interface on push and pull request.
