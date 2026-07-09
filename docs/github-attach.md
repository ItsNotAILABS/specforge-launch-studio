# GitHub Attachment Plan

This repository is the dedicated home for SpecForge Launch Studio.

## Repository

```text
ItsNotAILABS/specforge-launch-studio
```

## Product Surface

SpecForge Launch Studio is a desktop-style browser app for visually designing professional app specifications with click-only choices, managing a project portfolio, and preparing clone-ready launcher products.

## Branch Strategy

The current scaffold is attached directly to `main` so local AIs and deployment tools can consume it immediately. Future major changes should use feature branches such as:

```text
feature/specforge-frontend
feature/launcher-marketplace
feature/spec-export-engine
```

## Local Commands

```bash
npm install
npm run dev
npm run verify
npm run build
npm run static
```

## Static Fallback

The repo includes a dependency-free static preview for machines that do not have Node packages installed yet:

```bash
python3 launch_static.py
```

Then open:

```text
http://127.0.0.1:5190
```

## Files Committed

- Vite + React + TypeScript frontend scaffold
- Builder/Launcher app shell
- Click-only 10-section spec builder
- Portfolio and project table view
- Marketplace and creator profile model
- 6-step post-clone Launcher onboarding
- Pricing advisor formula
- Static preview launcher
- Product surface and component system docs
- GitHub Actions verification workflow
