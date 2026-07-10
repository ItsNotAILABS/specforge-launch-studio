from __future__ import annotations

import subprocess
import time
import uuid
from pathlib import Path
from typing import Dict, Iterable, List, Optional

from .models import CapsuleManifest, CodingSession, FileAsset, WorkerContract
from .runtimes import RUNTIMES, get_runtime
from .storage import CapsuleStorage

DEFAULT_WORKERS = [
    WorkerContract(
        name="Capsule Session Worker",
        role="creates session lifecycle, source tree, and capsule manifest",
        entrypoint="capsule_studio/orchestrator.py",
        persistent=True,
        target="native",
    ),
    WorkerContract(
        name="Preview Worker",
        role="routes web, api, terminal, notebook, and artifact previews",
        entrypoint="capsule_studio/preview.py",
        persistent=False,
        target="web-worker",
    ),
    WorkerContract(
        name="GitHub Publisher Worker",
        role="prepares generated files for repository deployment",
        entrypoint="tools/capsule_studio.py",
        persistent=False,
        target="github",
    ),
]

STARTER_FILES: Dict[str, str] = {
    "python": "print('Capsule Studio Python session online')\n",
    "html": "<!doctype html>\n<html><head><meta charset='utf-8'><title>Capsule App</title></head><body><h1>Capsule Studio Web App</h1><script>console.log('capsule online')</script></body></html>\n",
    "node": "console.log(JSON.stringify({ ok: true, runtime: 'node capsule' }, null, 2));\n",
    "react": "export function App() { return <main><h1>Capsule React App</h1></main>; }\n",
    "cpp": "#include <iostream>\nint main(){ std::cout << \"Capsule Studio C++ session online\\n\"; return 0; }\n",
    "c": "#include <stdio.h>\nint main(){ puts(\"Capsule Studio C session online\"); return 0; }\n",
    "java": "public class Main { public static void main(String[] args) { System.out.println(\"Capsule Studio Java session online\"); } }\n",
    "julia": "println(\"Capsule Studio Julia session online\")\n",
    "matlab": "disp('Capsule Studio MATLAB/Octave session online')\n",
}


class CapsuleOrchestrator:
    """Core application service for local Capsule Studio coding sessions."""

    def __init__(self, storage: Optional[CapsuleStorage] = None) -> None:
        self.storage = storage or CapsuleStorage()
        self.sessions: Dict[str, CodingSession] = {}

    def list_runtimes(self) -> List[Dict[str, object]]:
        return [runtime.to_dict() for runtime in RUNTIMES.values()]

    def create_session(self, runtime_key: str, name: Optional[str] = None) -> CodingSession:
        runtime = get_runtime(runtime_key)
        session_id = name or f"{runtime.key}-{uuid.uuid4().hex[:10]}"
        root = self.storage.create_session_root(session_id)
        session = CodingSession(
            id=session_id,
            runtime=runtime,
            root=root,
            preview_url=self.preview_url(session_id, runtime.preview),
            workers=list(DEFAULT_WORKERS),
        )
        starter = STARTER_FILES.get(runtime.key, "# Capsule Studio session\n")
        self.write_file(session, runtime.default_file, starter)
        session.log(f"session created for {runtime.label}")
        self.sessions[session_id] = session
        return session

    def get_session(self, session_id: str) -> CodingSession:
        if session_id not in self.sessions:
            root = self.storage.session_root(session_id)
            if not root.exists():
                raise KeyError(f"unknown session: {session_id}")
            raise KeyError(f"session {session_id} exists on disk but is not loaded in memory")
        return self.sessions[session_id]

    def write_file(self, session: CodingSession, relative_path: str, content: str) -> Path:
        path = self.storage.write_file(session.id, relative_path, content)
        language = relative_path.rsplit(".", 1)[-1] if "." in relative_path else session.runtime.kind
        session.files = [asset for asset in session.files if asset.path != relative_path]
        session.files.append(FileAsset(path=relative_path, language=language, content=content))
        session.log(f"wrote {relative_path}")
        return path

    def run_session(self, session_id: str, timeout_seconds: int = 12) -> Dict[str, object]:
        session = self.get_session(session_id)
        runtime = session.runtime
        session.state = "running"
        started = time.time()

        if runtime.run_command == ["serve-static"]:
            session.state = "running"
            session.log("static preview ready")
            return {
                "ok": True,
                "mode": "preview",
                "preview_url": session.preview_url,
                "elapsed_ms": int((time.time() - started) * 1000),
            }

        try:
            result = subprocess.run(
                runtime.run_command,
                cwd=session.root,
                text=True,
                capture_output=True,
                timeout=timeout_seconds,
                check=False,
            )
            session.state = "stopped" if result.returncode == 0 else "failed"
            session.log(result.stdout.strip() or "no stdout")
            if result.stderr.strip():
                session.log(result.stderr.strip())
            return {
                "ok": result.returncode == 0,
                "returncode": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "elapsed_ms": int((time.time() - started) * 1000),
            }
        except FileNotFoundError as exc:
            session.state = "failed"
            message = f"toolchain missing: {exc.filename}"
            session.log(message)
            return {"ok": False, "error": message, "hint": runtime.toolchain_hint}
        except subprocess.TimeoutExpired:
            session.state = "failed"
            message = f"session timed out after {timeout_seconds}s"
            session.log(message)
            return {"ok": False, "error": message}

    def build_manifest(self, session_id: str, deploy_mode: Optional[str] = None) -> CapsuleManifest:
        session = self.get_session(session_id)
        runtime = session.runtime
        files = [str(path.relative_to(session.root)) for path in self.storage.list_files(session.id)]
        mode = deploy_mode or runtime.deploy_modes[0]
        manifest = CapsuleManifest(
            id=f"capsule-{session.id}",
            name=f"{runtime.label}: {session.id}",
            version="0.1.0",
            runtime=runtime,
            entrypoint=runtime.default_file,
            languages=[runtime.kind, *[asset.language for asset in session.files]],
            targets=runtime.targets,
            deploy={"mode": mode, "destination": "github://ItsNotAILABS/specforge-launch-studio"},
            files=files,
            workers=session.workers,
            preview={"kind": runtime.preview, "url": session.preview_url or ""},
            build={
                "command": runtime.run_command,
                "server_enabled": runtime.server_enabled,
                "wasm_candidate": runtime.wasm_candidate,
                "toolchain_hint": runtime.toolchain_hint,
            },
            metadata={"state": session.state, "logs": session.logs[-20:]},
        )
        manifest_path = session.root / "capsule.manifest.json"
        self.storage.write_json(manifest_path, manifest.to_dict())
        session.log("capsule manifest written")
        return manifest

    def preview_url(self, session_id: str, preview_kind: str) -> str:
        if preview_kind == "web":
            return f"http://127.0.0.1:8765/preview/{session_id}/"
        if preview_kind == "api":
            return f"http://127.0.0.1:8765/api/session/{session_id}"
        return f"session://{preview_kind}/{session_id}"

    def deploy_plan(self, session_id: str) -> Dict[str, object]:
        manifest = self.build_manifest(session_id)
        return {
            "capsule": manifest.to_dict(),
            "steps": [
                "verify source tree",
                "run selected runtime command when toolchain exists",
                "write capsule.manifest.json",
                "copy preview artifacts",
                "stage docs and reports",
                "publish generated files to GitHub",
            ],
        }
