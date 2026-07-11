#!/usr/bin/env python3
"""specforgectl: local CLI for SpecForge Launch Studio."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
SECTIONS_PATH = ROOT / "data" / "spec_sections.json"


def load_sections() -> dict[str, Any]:
    return json.loads(SECTIONS_PATH.read_text(encoding="utf-8"))


def validate_sections() -> int:
    data = load_sections()
    sections = data.get("sections", [])
    errors: list[str] = []
    if len(sections) != 10:
        errors.append(f"expected 10 sections, found {len(sections)}")
    for index, section in enumerate(sections):
        for field in ("id", "name", "required"):
            if field not in section:
                errors.append(f"sections[{index}] missing {field}")
    if errors:
        print("specforgectl validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1
    print("specforgectl validation passed: 10 sections")
    return 0


def list_sections() -> int:
    for section in load_sections().get("sections", []):
        marker = "required" if section.get("required") else "optional"
        print(f"{section['id']}\t{marker}\t{section['name']}")
    return 0


def validate_project(path: Path) -> int:
    data = json.loads(path.read_text(encoding="utf-8"))
    answers = data.get("answers", {})
    required = [item["id"] for item in load_sections().get("sections", []) if item.get("required")]
    missing = [section for section in required if not answers.get(section)]
    print(json.dumps({"status": "complete" if not missing else "incomplete", "missing_sections": missing}, indent=2))
    return 0 if not missing else 1


def main() -> int:
    parser = argparse.ArgumentParser(description="SpecForge launch studio CLI")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("validate-sections")
    sub.add_parser("sections")
    validate_parser = sub.add_parser("validate-project")
    validate_parser.add_argument("path", type=Path)
    args = parser.parse_args()
    if args.command == "validate-sections":
        return validate_sections()
    if args.command == "sections":
        return list_sections()
    if args.command == "validate-project":
        return validate_project(args.path)
    return 1


if __name__ == "__main__":
    sys.exit(main())
