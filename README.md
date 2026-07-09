# SpecForge Launch Studio

Desktop-style frontend for visually designing professional app specifications with click-only choices, managing project work, browsing clone-ready apps, and preparing Launcher publish flows.

## Stack

- Vite
- React
- TypeScript
- CSS custom properties
- GitHub Actions verification

## Product Surface

- Builder/Launcher home dashboard split
- Click-only 10-section spec builder
- Portfolio and project workspace with detailed table view
- App marketplace with creator profiles
- Guided post-clone setup
- 6-step Launcher onboarding: Brand, Audience, Content, Features, Updates, Go Live
- Pricing advisor formula: `base + complexity + support + market`

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

## Verify

```bash
npm run verify
npm run build
```
