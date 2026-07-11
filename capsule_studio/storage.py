from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Any, Dict, Iterable

SAFE_ROOT_NAME = ".capsule_studio"


class StorageError(RuntimeError):
    pass


class CapsuleStorage:
    """Filesystem storage boundary for local capsule sessions.

    The class keeps generated sessions inside a single workspace root and rejects
    path traversal. It is intentionally dependency-free so it can run in the
    coding sandbox before a full backend stack is installed.
    """

    def __init__(self, root: Path | str = SAFE_ROOT_NAME) -> None:
        self.root = Path(root).resolve()
        self.sessions = self.root / "sessions"
        self.artifacts = self.root / "artifacts"
        self.previews = self.root / "previews"
        for directory in (self.sessions, self.artifacts, self.previews):
            directory.mkdir(parents=True, exist_ok=True)

    def safe_join(self, base: Path, relative: str) -> Path:
        candidate = (base / relative).resolve()
        if not str(candidate).startswith(str(base.resolve())):
            raise StorageError(f"unsafe path rejected: {relative}")
        return candidate

    def session_root(self, session_id: str) -> Path:
        return self.safe_join(self.sessions, session_id)

    def create_session_root(self, session_id: str) -> Path:
        root = self.session_root(session_id)
        root.mkdir(parents=True, exist_ok=True)
        (root / "src").mkdir(exist_ok=True)
        (root / "logs").mkdir(exist_ok=True)
        (root / "artifacts").mkdir(exist_ok=True)
        return root

    def write_file(self, session_id: str, relative_path: str, content: str) -> Path:
        root = self.create_session_root(session_id)
        path = self.safe_join(root, relative_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        return path

    def read_file(self, session_id: str, relative_path: str) -> str:
        path = self.safe_join(self.session_root(session_id), relative_path)
        return path.read_text(encoding="utf-8")

    def write_json(self, path: Path, payload: Dict[str, Any]) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

    def list_files(self, session_id: str) -> Iterable[Path]:
        root = self.session_root(session_id)
        if not root.exists():
            return []
        return [path for path in root.rglob("*") if path.is_file()]

    def delete_session(self, session_id: str) -> None:
        root = self.session_root(session_id)
        if root.exists():
            shutil.rmtree(root)
