from __future__ import annotations

import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional


@dataclass
class WasmBuildPlan:
    source: str
    output: str
    compiler: str
    command: List[str]
    available: bool
    note: str

    def to_dict(self) -> Dict[str, object]:
        return {
            "source": self.source,
            "output": self.output,
            "compiler": self.compiler,
            "command": self.command,
            "available": self.available,
            "note": self.note,
        }


class WasmCapsuleBuilder:
    """Build planner for WASM/WASI capsule targets.

    The builder detects real local toolchains and produces honest build plans.
    It can run commands when the compiler exists, but never claims a WASM build
    succeeded without an actual compiler.
    """

    def plan_cpp(self, source: Path, output: Optional[Path] = None) -> WasmBuildPlan:
        output = output or source.with_suffix(".wasm")
        emcc = shutil.which("emcc")
        clang = shutil.which("clang++")
        if emcc:
            command = [emcc, str(source), "-O2", "-s", "WASM=1", "-o", str(output)]
            return WasmBuildPlan(str(source), str(output), "emcc", command, True, "Emscripten compiler available")
        if clang:
            command = [clang, "--target=wasm32-wasi", str(source), "-O2", "-o", str(output)]
            return WasmBuildPlan(str(source), str(output), "clang++ wasm32-wasi", command, True, "clang++ available; requires WASI sysroot")
        return WasmBuildPlan(str(source), str(output), "missing", [], False, "Install Emscripten or clang++ with WASI SDK")

    def plan_c(self, source: Path, output: Optional[Path] = None) -> WasmBuildPlan:
        output = output or source.with_suffix(".wasm")
        emcc = shutil.which("emcc")
        clang = shutil.which("clang")
        if emcc:
            command = [emcc, str(source), "-O2", "-s", "WASM=1", "-o", str(output)]
            return WasmBuildPlan(str(source), str(output), "emcc", command, True, "Emscripten compiler available")
        if clang:
            command = [clang, "--target=wasm32-wasi", str(source), "-O2", "-o", str(output)]
            return WasmBuildPlan(str(source), str(output), "clang wasm32-wasi", command, True, "clang available; requires WASI sysroot")
        return WasmBuildPlan(str(source), str(output), "missing", [], False, "Install Emscripten or clang with WASI SDK")

    def build(self, plan: WasmBuildPlan, cwd: Path, timeout_seconds: int = 30) -> Dict[str, object]:
        if not plan.available:
            return {"ok": False, "plan": plan.to_dict(), "error": plan.note}
        result = subprocess.run(plan.command, cwd=cwd, text=True, capture_output=True, timeout=timeout_seconds, check=False)
        return {
            "ok": result.returncode == 0,
            "returncode": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "plan": plan.to_dict(),
        }
