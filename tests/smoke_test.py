#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SERVER_PATH = ROOT / "server" / "specforge_launch_studio.py"


def load_server():
    spec = importlib.util.spec_from_file_location("specforge_launch_studio", SERVER_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(module)
    return module


def test_sections() -> None:
    data = json.loads((ROOT / "data" / "spec_sections.json").read_text(encoding="utf-8"))
    sections = data.get("sections", [])
    assert len(sections) == 10
    assert all(section.get("required") for section in sections)


def test_export() -> None:
    module = load_server()
    state = module.SpecForgeState()
    status, export = state.export_spec(json.loads((ROOT / "examples" / "app-spec.json").read_text(encoding="utf-8")))
    assert status == 201
    assert export["status"] == "complete"
    assert export["export_hash"]
    assert "## Proof and Acceptance" in export["markdown"]


if __name__ == "__main__":
    test_sections()
    test_export()
    print("specforge smoke tests passed")
