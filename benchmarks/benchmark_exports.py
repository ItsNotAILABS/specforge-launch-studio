#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SERVER_PATH = ROOT / "server" / "specforge_launch_studio.py"

spec = importlib.util.spec_from_file_location("specforge_launch_studio", SERVER_PATH)
module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(module)

state = module.SpecForgeState()
payload = json.loads((ROOT / "examples" / "app-spec.json").read_text(encoding="utf-8"))
iterations = 500
start = time.perf_counter()
for _ in range(iterations):
    state.export_spec(payload)
elapsed = time.perf_counter() - start
print({
    "benchmark": "specforge_markdown_export",
    "iterations": iterations,
    "elapsed_seconds": round(elapsed, 6),
    "exports_per_second": round(iterations / elapsed, 2),
})
