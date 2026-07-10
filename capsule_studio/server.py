from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any, Dict, Tuple
from urllib.parse import parse_qs, urlparse

from .orchestrator import CapsuleOrchestrator


class CapsuleStudioAPI(BaseHTTPRequestHandler):
    orchestrator = CapsuleOrchestrator()

    def do_GET(self) -> None:
        route, query = self.route()
        if route == "/health":
            self.json({"ok": True, "service": "capsule-studio-api"})
            return
        if route == "/api/runtimes":
            self.json({"ok": True, "runtimes": self.orchestrator.list_runtimes()})
            return
        if route.startswith("/api/session/"):
            session_id = route.split("/")[-1]
            try:
                self.json({"ok": True, "session": self.orchestrator.get_session(session_id).to_dict()})
            except KeyError as exc:
                self.json({"ok": False, "error": str(exc)}, status=404)
            return
        if route == "/api/sessions":
            self.json({"ok": True, "sessions": [session.to_dict() for session in self.orchestrator.sessions.values()]})
            return
        self.json({"ok": True, "routes": ["/health", "/api/runtimes", "/api/sessions", "/api/session/<id>"]})

    def do_POST(self) -> None:
        route, _ = self.route()
        payload = self.body_json()

        if route == "/api/session":
            runtime = str(payload.get("runtime", "python"))
            name = payload.get("name")
            session = self.orchestrator.create_session(runtime, str(name) if name else None)
            self.json({"ok": True, "session": session.to_dict()})
            return

        if route.startswith("/api/session/") and route.endswith("/file"):
            session_id = route.split("/")[3]
            try:
                session = self.orchestrator.get_session(session_id)
                path = str(payload.get("path", session.runtime.default_file))
                content = str(payload.get("content", ""))
                written = self.orchestrator.write_file(session, path, content)
                self.json({"ok": True, "path": str(written)})
            except Exception as exc:
                self.json({"ok": False, "error": str(exc)}, status=400)
            return

        if route.startswith("/api/session/") and route.endswith("/run"):
            session_id = route.split("/")[3]
            result = self.orchestrator.run_session(session_id)
            self.json({"ok": bool(result.get("ok")), "result": result})
            return

        if route.startswith("/api/session/") and route.endswith("/manifest"):
            session_id = route.split("/")[3]
            manifest = self.orchestrator.build_manifest(session_id)
            self.json({"ok": True, "manifest": manifest.to_dict()})
            return

        if route.startswith("/api/session/") and route.endswith("/deploy-plan"):
            session_id = route.split("/")[3]
            plan = self.orchestrator.deploy_plan(session_id)
            self.json({"ok": True, "plan": plan})
            return

        self.json({"ok": False, "error": "unknown route"}, status=404)

    def route(self) -> Tuple[str, Dict[str, Any]]:
        parsed = urlparse(self.path)
        return parsed.path.rstrip("/") or "/", parse_qs(parsed.query)

    def body_json(self) -> Dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0"))
        if length <= 0:
            return {}
        try:
            return json.loads(self.rfile.read(length).decode("utf-8"))
        except json.JSONDecodeError:
            return {}

    def json(self, payload: Dict[str, Any], status: int = 200) -> None:
        data = json.dumps(payload, indent=2, default=str).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, format: str, *args: object) -> None:
        return


def run_api_server(host: str = "127.0.0.1", port: int = 8764) -> None:
    server = ThreadingHTTPServer((host, port), CapsuleStudioAPI)
    print(f"Capsule Studio API on http://{host}:{port}")
    server.serve_forever()
