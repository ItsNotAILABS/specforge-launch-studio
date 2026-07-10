from __future__ import annotations

import argparse
import json
from pathlib import Path

from .orchestrator import CapsuleOrchestrator
from .preview import run_preview_server
from .server import run_api_server
from .wasm import WasmCapsuleBuilder


def print_json(payload: object) -> None:
    print(json.dumps(payload, indent=2, default=str))


def main() -> int:
    parser = argparse.ArgumentParser(prog="capsule-studio", description="Capsule Studio local coding runtime")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("runtimes")

    create = sub.add_parser("create")
    create.add_argument("runtime")
    create.add_argument("--name")

    run = sub.add_parser("run")
    run.add_argument("session")

    manifest = sub.add_parser("manifest")
    manifest.add_argument("session")

    api = sub.add_parser("api")
    api.add_argument("--host", default="127.0.0.1")
    api.add_argument("--port", type=int, default=8764)

    preview = sub.add_parser("preview")
    preview.add_argument("--host", default="127.0.0.1")
    preview.add_argument("--port", type=int, default=8765)

    wasm = sub.add_parser("wasm-plan")
    wasm.add_argument("source")
    wasm.add_argument("--kind", choices=["c", "cpp"], default="cpp")

    args = parser.parse_args()
    orchestrator = CapsuleOrchestrator()

    if args.command == "runtimes":
        print_json(orchestrator.list_runtimes())
        return 0

    if args.command == "create":
        session = orchestrator.create_session(args.runtime, args.name)
        print_json(session.to_dict())
        return 0

    if args.command == "run":
        print_json(orchestrator.run_session(args.session))
        return 0

    if args.command == "manifest":
        print_json(orchestrator.build_manifest(args.session).to_dict())
        return 0

    if args.command == "api":
        run_api_server(args.host, args.port)
        return 0

    if args.command == "preview":
        run_preview_server(args.host, args.port)
        return 0

    if args.command == "wasm-plan":
        builder = WasmCapsuleBuilder()
        source = Path(args.source)
        plan = builder.plan_c(source) if args.kind == "c" else builder.plan_cpp(source)
        print_json(plan.to_dict())
        return 0

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
