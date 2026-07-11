#!/usr/bin/env python3
"""SpecForge Launch Studio development server."""
from __future__ import annotations

import argparse
import hashlib
import json
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
SECTIONS_PATH = ROOT / "data" / "spec_sections.json"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def load_sections() -> dict[str, Any]:
    return json.loads(SECTIONS_PATH.read_text(encoding="utf-8"))


def stable_hash(payload: dict[str, Any]) -> str:
    return hashlib.sha256(json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")).hexdigest()


class SpecForgeState:
    def __init__(self) -> None:
        self.sections = load_sections()
        self.required = [item["id"] for item in self.sections.get("sections", []) if item.get("required")]

    def health(self) -> dict[str, Any]:
        return {"status": "ok", "service": "specforge-launch-studio", "time": utc_now(), "section_count": len(self.required)}

    def validate_spec(self, request: dict[str, Any]) -> dict[str, Any]:
        answers = request.get("answers", {}) if isinstance(request.get("answers", {}), dict) else {}
        missing = [section for section in self.required if not answers.get(section)]
        return {
            "schema": "nova.specforge.validation.v1",
            "status": "complete" if not missing else "incomplete",
            "missing_sections": missing,
            "completed_sections": [section for section in self.required if section not in missing],
            "required_count": len(self.required),
        }

    def export_spec(self, request: dict[str, Any]) -> tuple[int, dict[str, Any]]:
        validation = self.validate_spec(request)
        answers = request.get("answers", {}) if isinstance(request.get("answers", {}), dict) else {}
        project = request.get("project", {}) if isinstance(request.get("project", {}), dict) else {}
        lines = [f"# {project.get('name', 'Untitled App Spec')}", "", f"Generated: {utc_now()}", ""]
        for section in self.sections.get("sections", []):
            section_id = section["id"]
            lines.append(f"## {section['name']}")
            lines.append(str(answers.get(section_id, "TBD")))
            lines.append("")
        export = {
            "schema": "nova.specforge.export.v1",
            "status": validation["status"],
            "project": project,
            "validation": validation,
            "markdown": "\n".join(lines),
            "launcher_onboarding": self.sections.get("launcher_onboarding", []),
            "mercatus_handoff": {
                "recommended_template": "marketplace-clone" if project.get("launch_mode") == "Marketplace clone" else "developer-platform",
                "next_gate": "send to Mercatus Launch Studio for pricing and go-live package"
            },
        }
        export["export_hash"] = stable_hash(export)
        return (201 if validation["status"] == "complete" else 202), export


class Handler(BaseHTTPRequestHandler):
    state: SpecForgeState

    def log_message(self, format: str, *args: object) -> None:  # noqa: A003
        print(f"[{utc_now()}] {self.address_string()} {format % args}")

    def send_json(self, status: int, payload: dict[str, Any]) -> None:
        body = json.dumps(payload, indent=2, sort_keys=True).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_json_body(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0") or "0")
        if length <= 0:
            return {}
        return json.loads(self.rfile.read(length).decode("utf-8"))

    def do_GET(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        if path == "/health":
            self.send_json(200, self.state.health())
        elif path == "/sections":
            self.send_json(200, self.state.sections)
        else:
            self.send_json(404, {"paths": ["/health", "/sections", "POST /validate", "POST /exports"]})

    def do_POST(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        try:
            body = self.read_json_body()
        except json.JSONDecodeError as exc:
            self.send_json(400, {"status": "rejected", "reason": "invalid_json", "detail": str(exc)})
            return
        if path == "/validate":
            self.send_json(200, self.state.validate_spec(body))
        elif path == "/exports":
            status, payload = self.state.export_spec(body)
            self.send_json(status, payload)
        else:
            self.send_json(404, {"paths": ["POST /validate", "POST /exports"]})


def main() -> None:
    parser = argparse.ArgumentParser(description="Run SpecForge Launch Studio")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8790)
    args = parser.parse_args()
    Handler.state = SpecForgeState()
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    print(f"SpecForge Launch Studio listening on http://{args.host}:{args.port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
