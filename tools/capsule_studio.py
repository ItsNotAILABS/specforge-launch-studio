#!/usr/bin/env python3
"""Capsule Studio local manifest and report utility.

This script does not pretend to compile every language. It creates execution-ready
capsule manifests and verifies the capsule metadata that local runtimes can use.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import List

ROOT = Path(__file__).resolve().parents[1]
CAPSULE_DIR = ROOT / "capsules"
EXAMPLE_DIR = CAPSULE_DIR / "examples"
ARTIFACT_DIR = ROOT / "artifacts" / "capsule-studio"


@dataclass
class CapsuleRuntime:
    id: str
    name: str
    languages: List[str]
    targets: List[str]
    deploy_mode: str
    destination: str
    server: bool
    preview: str


RUNTIMES = {
    "python": CapsuleRuntime(
        id="python-orchestrator",
        name="Python Orchestrator Capsule",
        languages=["Python", "JSON", "Markdown", "Shell"],
        targets=["wasi", "native", "github"],
        deploy_mode="agent",
        destination="github://ItsNotAILABS/specforge-launch-studio",
        server=True,
        preview="terminal",
    ),
    "react": CapsuleRuntime(
        id="react-worker-agent",
        name="React Worker Agent Capsule",
        languages=["TypeScript", "React", "CSS", "HTML"],
        targets=["browser", "web-worker", "github"],
        deploy_mode="app",
        destination="github://ItsNotAILABS/specforge-launch-studio",
        server=True,
        preview="web",
    ),
    "cpp": CapsuleRuntime(
        id="cpp-wasm-core",
        name="C++ WASM Core Capsule",
        languages=["C", "C++", "WAT"],
        targets=["wasm", "web-worker", "github"],
        deploy_mode="web-worker",
        destination="workers/specforge_core.worker",
        server=False,
        preview="terminal",
    ),
    "node": CapsuleRuntime(
        id="node-service-capsule",
        name="Node Service Capsule",
        languages=["Node.js", "TypeScript", "JSON-RPC"],
        targets=["node", "github"],
        deploy_mode="service",
        destination="mcp/node-service",
        server=True,
        preview="api",
    ),
    "julia": CapsuleRuntime(
        id="julia-sciml-capsule",
        name="Julia SciML Capsule",
        languages=["Julia", "Python", "Markdown"],
        targets=["native", "github"],
        deploy_mode="service",
        destination="runtimes/julia-sciml",
        server=True,
        preview="notebook",
    ),
}


def build_manifest(runtime: CapsuleRuntime) -> dict:
    return {
        "id": runtime.id,
        "name": runtime.name,
        "version": "0.1.0",
        "runtime": {
            "kind": runtime.id.split("-")[0],
            "entrypoint": "defined-by-capsule",
            "server": runtime.server,
            "preview": runtime.preview,
        },
        "languages": runtime.languages,
        "targets": runtime.targets,
        "workers": [
            {"name": "Capsule Session Worker", "role": "session manifest and lifecycle", "persistent": True},
            {"name": "Preview Worker", "role": "web api terminal notebook artifact preview", "persistent": False},
            {"name": "GitHub Publisher Worker", "role": "repo handoff and deploy metadata", "persistent": False},
        ],
        "deploy": {"mode": runtime.deploy_mode, "destination": runtime.destination},
    }


def write_manifest(runtime_key: str) -> Path:
    if runtime_key not in RUNTIMES:
      raise SystemExit(f"unknown runtime: {runtime_key}")
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = build_manifest(RUNTIMES[runtime_key])
    path = ARTIFACT_DIR / f"{manifest['id']}.capsule.json"
    path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    return path


def verify_examples() -> int:
    if not EXAMPLE_DIR.exists():
        print("no capsule examples found")
        return 1
    failures = 0
    for path in sorted(EXAMPLE_DIR.glob("*.capsule.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        required = ["id", "name", "version", "runtime", "languages", "targets", "workers", "deploy"]
        missing = [key for key in required if key not in data]
        if missing:
            failures += 1
            print(f"FAIL {path}: missing {missing}")
        else:
            print(f"OK {path.name}: {data['deploy']['mode']} -> {data['deploy']['destination']}")
    return failures


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("list")
    make = sub.add_parser("make")
    make.add_argument("runtime", choices=sorted(RUNTIMES))
    sub.add_parser("verify")
    args = parser.parse_args()

    if args.command == "list":
        print(json.dumps({key: asdict(value) for key, value in RUNTIMES.items()}, indent=2))
        return 0
    if args.command == "make":
        path = write_manifest(args.runtime)
        print(path)
        return 0
    if args.command == "verify":
        return verify_examples()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
