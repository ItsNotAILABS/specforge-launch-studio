from __future__ import annotations

import sys
from typing import Any, Callable, Dict

from capsule_studio.ai import CapsuleAI
from capsule_studio.orchestrator import CapsuleOrchestrator
from capsule_studio.wasm import WasmCapsuleBuilder

from .protocol import JSONRPCError, error_response, parse_request, success_response


class CapsuleMCPServer:
    """Small stdio JSON-RPC tool server for Capsule Studio.

    This is intentionally dependency-light. It exposes an MCP-like inner server
    shape to local AI clients and can later be replaced by the official MCP SDK
    without changing the platform tool contracts.
    """

    def __init__(self) -> None:
        self.orchestrator = CapsuleOrchestrator()
        self.ai = CapsuleAI()
        self.wasm = WasmCapsuleBuilder()
        self.tools: Dict[str, Callable[[Dict[str, Any]], Any]] = {
            "capsule.runtimes": self.runtimes,
            "capsule.create_session": self.create_session,
            "capsule.write_file": self.write_file,
            "capsule.run_session": self.run_session,
            "capsule.manifest": self.manifest,
            "capsule.deploy_plan": self.deploy_plan,
            "capsule.ai_generate": self.ai_generate,
            "capsule.ai_review": self.ai_review,
            "capsule.wasm_plan": self.wasm_plan,
        }

    def handle(self, line: str) -> str:
        request_id: Any = None
        try:
            request = parse_request(line)
            request_id = request.id
            if request.method in {"initialize", "mcp.initialize"}:
                return success_response(request.id, self.initialize())
            if request.method in {"tools/list", "mcp.tools.list"}:
                return success_response(request.id, self.list_tools())
            if request.method in {"tools/call", "mcp.tools.call"}:
                name = request.params.get("name")
                arguments = request.params.get("arguments") or {}
                if not isinstance(name, str) or name not in self.tools:
                    raise JSONRPCError(-32601, f"unknown tool: {name}")
                if not isinstance(arguments, dict):
                    raise JSONRPCError(-32602, "arguments must be an object")
                return success_response(request.id, self.tools[name](arguments))
            if request.method in self.tools:
                return success_response(request.id, self.tools[request.method](request.params))
            raise JSONRPCError(-32601, f"unknown method: {request.method}")
        except JSONRPCError as exc:
            return error_response(request_id, exc.code, exc.message)
        except Exception as exc:
            return error_response(request_id, -32000, str(exc))

    def serve_forever(self) -> None:
        for line in sys.stdin:
            line = line.strip()
            if not line:
                continue
            print(self.handle(line), flush=True)

    def initialize(self) -> Dict[str, Any]:
        return {
            "serverInfo": {"name": "capsule-studio-mcp", "version": "0.1.0"},
            "capabilities": {"tools": True, "resources": False, "prompts": False},
        }

    def list_tools(self) -> Dict[str, Any]:
        return {
            "tools": [
                {"name": "capsule.runtimes", "description": "List Capsule Studio runtime lanes."},
                {"name": "capsule.create_session", "description": "Create a coding session for a runtime."},
                {"name": "capsule.write_file", "description": "Write a file into a coding session."},
                {"name": "capsule.run_session", "description": "Run the session command when the toolchain exists."},
                {"name": "capsule.manifest", "description": "Build a capsule manifest for a session."},
                {"name": "capsule.deploy_plan", "description": "Build a GitHub-oriented deploy plan."},
                {"name": "capsule.ai_generate", "description": "Generate code through the configured AI provider."},
                {"name": "capsule.ai_review", "description": "Review a capsule manifest through the configured AI provider."},
                {"name": "capsule.wasm_plan", "description": "Create an honest WASM build plan for C or C++."},
            ]
        }

    def runtimes(self, _: Dict[str, Any]) -> Dict[str, Any]:
        return {"runtimes": self.orchestrator.list_runtimes()}

    def create_session(self, args: Dict[str, Any]) -> Dict[str, Any]:
        runtime = str(args.get("runtime", "python"))
        name = args.get("name")
        session = self.orchestrator.create_session(runtime, str(name) if name else None)
        return {"session": session.to_dict()}

    def write_file(self, args: Dict[str, Any]) -> Dict[str, Any]:
        session = self.orchestrator.get_session(str(args["session"]))
        path = str(args.get("path", session.runtime.default_file))
        content = str(args.get("content", ""))
        written = self.orchestrator.write_file(session, path, content)
        return {"path": str(written)}

    def run_session(self, args: Dict[str, Any]) -> Dict[str, Any]:
        return self.orchestrator.run_session(str(args["session"]))

    def manifest(self, args: Dict[str, Any]) -> Dict[str, Any]:
        return self.orchestrator.build_manifest(str(args["session"])).to_dict()

    def deploy_plan(self, args: Dict[str, Any]) -> Dict[str, Any]:
        return self.orchestrator.deploy_plan(str(args["session"]))

    def ai_generate(self, args: Dict[str, Any]) -> Dict[str, Any]:
        result = self.ai.generate_code(
            prompt=str(args.get("prompt", "")),
            language=str(args.get("language", "python")),
            context=str(args.get("context", "")),
        )
        return result.__dict__

    def ai_review(self, args: Dict[str, Any]) -> Dict[str, Any]:
        manifest = args.get("manifest", {})
        if not isinstance(manifest, dict):
            raise JSONRPCError(-32602, "manifest must be an object")
        return self.ai.review_capsule(manifest).__dict__

    def wasm_plan(self, args: Dict[str, Any]) -> Dict[str, Any]:
        from pathlib import Path

        source = Path(str(args["source"]))
        kind = str(args.get("kind", "cpp"))
        plan = self.wasm.plan_c(source) if kind == "c" else self.wasm.plan_cpp(source)
        return plan.to_dict()


def main() -> int:
    CapsuleMCPServer().serve_forever()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
