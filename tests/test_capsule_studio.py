from pathlib import Path

from capsule_studio import CapsuleOrchestrator
from capsule_studio.storage import CapsuleStorage
from capsule_studio.wasm import WasmCapsuleBuilder


def test_create_python_session_and_manifest(tmp_path: Path) -> None:
    orchestrator = CapsuleOrchestrator(CapsuleStorage(tmp_path / "studio"))
    session = orchestrator.create_session("python", "test-python")
    assert session.id == "test-python"
    assert session.runtime.key == "python"
    assert (session.root / "main.py").exists()

    result = orchestrator.run_session(session.id)
    assert result["ok"] is True

    manifest = orchestrator.build_manifest(session.id)
    assert manifest.id == "capsule-test-python"
    assert manifest.entrypoint == "main.py"
    assert "github" in manifest.targets
    assert (session.root / "capsule.manifest.json").exists()


def test_html_session_preview_manifest(tmp_path: Path) -> None:
    orchestrator = CapsuleOrchestrator(CapsuleStorage(tmp_path / "studio"))
    session = orchestrator.create_session("html", "web-test")
    assert session.preview_url == "http://127.0.0.1:8765/preview/web-test/"
    result = orchestrator.run_session(session.id)
    assert result["ok"] is True
    assert result["mode"] == "preview"


def test_wasm_plan_is_honest(tmp_path: Path) -> None:
    source = tmp_path / "main.cpp"
    source.write_text("int main(){return 0;}\n", encoding="utf-8")
    plan = WasmCapsuleBuilder().plan_cpp(source)
    assert plan.source.endswith("main.cpp")
    assert plan.output.endswith("main.wasm")
    assert isinstance(plan.available, bool)
