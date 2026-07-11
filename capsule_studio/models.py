from __future__ import annotations

from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional

RuntimeKind = Literal[
    "python",
    "javascript",
    "typescript",
    "react",
    "html",
    "c",
    "cpp",
    "java",
    "julia",
    "matlab",
    "rust",
    "go",
    "r",
    "shell",
]

PreviewKind = Literal["web", "api", "terminal", "notebook", "artifact"]
TargetKind = Literal["web-worker", "wasm", "wasi", "native", "node", "browser", "github", "artifact"]
DeployMode = Literal["agent", "web-worker", "app", "service", "report-suite", "capsule"]
SessionState = Literal["created", "running", "stopped", "failed"]


@dataclass(frozen=True)
class RuntimeSpec:
    key: str
    label: str
    kind: RuntimeKind
    default_file: str
    run_command: List[str]
    preview: PreviewKind
    targets: List[TargetKind]
    deploy_modes: List[DeployMode]
    server_enabled: bool
    wasm_candidate: bool
    toolchain_hint: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class FileAsset:
    path: str
    language: str
    content: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class WorkerContract:
    name: str
    role: str
    entrypoint: str
    persistent: bool = False
    target: TargetKind = "web-worker"

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class CodingSession:
    id: str
    runtime: RuntimeSpec
    root: Path
    state: SessionState = "created"
    preview_url: Optional[str] = None
    files: List[FileAsset] = field(default_factory=list)
    logs: List[str] = field(default_factory=list)
    workers: List[WorkerContract] = field(default_factory=list)

    def log(self, message: str) -> None:
        self.logs.append(message)

    def to_dict(self) -> Dict[str, Any]:
        payload = asdict(self)
        payload["root"] = str(self.root)
        payload["runtime"] = self.runtime.to_dict()
        return payload


@dataclass
class CapsuleManifest:
    id: str
    name: str
    version: str
    runtime: RuntimeSpec
    entrypoint: str
    languages: List[str]
    targets: List[TargetKind]
    deploy: Dict[str, str]
    files: List[str]
    workers: List[WorkerContract]
    preview: Dict[str, str]
    build: Dict[str, Any]
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "version": self.version,
            "runtime": self.runtime.to_dict(),
            "entrypoint": self.entrypoint,
            "languages": self.languages,
            "targets": self.targets,
            "deploy": self.deploy,
            "files": self.files,
            "workers": [worker.to_dict() for worker in self.workers],
            "preview": self.preview,
            "build": self.build,
            "metadata": self.metadata,
        }
