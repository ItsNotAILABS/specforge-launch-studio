# Human and AI Workflows

## Human Operator Flow

1. Validate sections: `python tools/specforgectl.py validate-sections`.
2. Review the 10-section model: `python tools/specforgectl.py sections`.
3. Validate a project: `python tools/specforgectl.py validate-project examples/app-spec.json`.
4. Run the API server: `python server/specforge_launch_studio.py --port 8790`.
5. Submit `examples/app-spec.json` to `POST /exports`.
6. Review the Markdown export, missing sections, and Mercatus handoff.
7. Send complete specs to Mercatus for pricing and go-live packaging.

## AI Worker Flow

1. Read `specforge-launch-studio.manifest.json`.
2. Read `data/spec_sections.json`.
3. Fill all 10 required sections.
4. Validate before export.
5. Return Markdown plus Mercatus handoff object.
6. Do not generate code until the spec boundary is complete.

## Proof Outputs

- Validation status
- Missing-section list
- Markdown export
- Export hash
- Mercatus handoff

## Live Test Commands

```bash
python tools/specforgectl.py validate-sections
python tools/specforgectl.py validate-project examples/app-spec.json
python tests/smoke_test.py
python benchmarks/benchmark_exports.py
python server/specforge_launch_studio.py --port 8790
```
