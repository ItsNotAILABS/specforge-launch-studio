# SpecForge Launch Studio

![Status](https://img.shields.io/badge/status-platform%20buildout-blue)
![Spec Sections](https://img.shields.io/badge/spec%20sections-10-6f42c1)
![Frontend](https://img.shields.io/badge/frontend-Vite%20React-0b7285)
![Python](https://img.shields.io/badge/python-stdlib%20API-3776ab)
![Launch](https://img.shields.io/badge/launcher-onboarding%206%20steps-2f9e44)
![CI](https://img.shields.io/badge/CI-smoke%20%2B%20benchmarks-success)

![SpecForge Launch Studio](assets/specforge-launch-studio.svg)

Desktop-style frontend and API platform for visually designing professional app specifications with click-only choices, managing project work, browsing clone-ready apps, and preparing Launcher publish flows.

SpecForge is the product-spec side of NOVA Build: it turns app ideas into a complete 10-section specification, then hands the launch package to Mercatus Launch Studio for pricing and go-live support.

## Human Flow

1. Pick app type, launch mode, pricing model, and integrations.
2. Complete all 10 spec sections.
3. Validate missing sections.
4. Export Markdown package.
5. Hand the result to Mercatus for pricing and go-live.

See `docs/HUMAN_AI_WORKFLOWS.md` for human and AI worker flows.

## Product Surface

- Builder/Launcher home dashboard split
- Click-only 10-section spec builder
- Portfolio and project workspace with detailed table view
- App marketplace with creator profiles
- Guided post-clone setup
- 6-step Launcher onboarding: Brand, Content, Features, Updates, Go Live, Customer Success
- Pricing handoff to Mercatus Launch Studio
- API export surface for local AIs and external builders

## Frontend Run

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5190`.

## Static Preview

```bash
python3 launch_static.py
```

## Backend Quick Start

```bash
python tools/specforgectl.py validate-sections
python tools/specforgectl.py sections
python tools/specforgectl.py validate-project examples/app-spec.json
python tests/smoke_test.py
python benchmarks/benchmark_exports.py
```

Run the API:

```bash
python server/specforge_launch_studio.py --port 8790
```

Call the API:

```bash
curl http://127.0.0.1:8790/health
curl http://127.0.0.1:8790/sections
curl -s -X POST http://127.0.0.1:8790/validate -H 'content-type: application/json' -d @examples/app-spec.json
curl -s -X POST http://127.0.0.1:8790/exports -H 'content-type: application/json' -d @examples/app-spec.json
```

## Platform Files

| Surface | Path |
| --- | --- |
| Platform manifest | `specforge-launch-studio.manifest.json` |
| Spec section model | `data/spec_sections.json` |
| API server | `server/specforge_launch_studio.py` |
| CLI | `tools/specforgectl.py` |
| Example app spec | `examples/app-spec.json` |
| Smoke tests | `tests/smoke_test.py` |
| Benchmarks | `benchmarks/benchmark_exports.py` |
| Backend CI | `.github/workflows/backend-ci.yml` |
| Workflows | `docs/HUMAN_AI_WORKFLOWS.md` |

## Ten Export Sections

Overview, Audience, Brand, Content, Features, Data and Integrations, User Workflow, Admin and Operations, Launch Plan, Proof and Acceptance.

## Verify

```bash
npm run verify
npm run build
python tools/specforgectl.py validate-sections
python tools/specforgectl.py validate-project examples/app-spec.json
```

## Search Keywords

App specification builder, click-only app spec, launch studio, app marketplace builder, clone-ready app templates, product spec export, NOVA Build, app launch workflow, professional app documentation, pricing handoff.

## Next Gates

- Persist projects.
- Export DOCX/PDF packages.
- Connect Mercatus pricing API.
- Add visual API integration to the React frontend.
- Add CI status badges after first workflow run.
