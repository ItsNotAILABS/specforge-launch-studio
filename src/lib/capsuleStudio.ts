import { capsuleDeployTargets, capsuleRuntimes, capsuleWorkers, type CapsuleRuntime } from "../data/capsuleStudio";

export type CapsuleManifest = {
  id: string;
  name: string;
  runtime: string;
  target: string;
  deployAs: string;
  languages: string[];
  workers: string[];
  deployTargets: string[];
  readiness: number;
  notes: string[];
};

export function capsuleReadiness(runtime: CapsuleRuntime): number {
  const base = runtime.status === "ready" ? 72 : runtime.status === "toolchain-required" ? 48 : 34;
  const targetBonus = runtime.target === "web-worker" || runtime.target === "wasm" ? 14 : 8;
  const deployBonus = runtime.deployAs === "app" || runtime.deployAs === "worker" ? 9 : 6;
  const languageBonus = Math.min(10, runtime.languages.length * 2);
  return Math.min(99, base + targetBonus + deployBonus + languageBonus);
}

export function createCapsuleManifest(runtimeId: string): CapsuleManifest {
  const runtime = capsuleRuntimes.find((item) => item.id === runtimeId) ?? capsuleRuntimes[0];
  const workers = capsuleWorkers
    .filter((worker) => worker.status !== "planned")
    .map((worker) => worker.name);
  const deployTargets = capsuleDeployTargets
    .filter((target) => target.status === "ready")
    .map((target) => target.name);

  return {
    id: `capsule-${runtime.id}`,
    name: runtime.name,
    runtime: runtime.purpose,
    target: runtime.target,
    deployAs: runtime.deployAs,
    languages: runtime.languages,
    workers,
    deployTargets,
    readiness: capsuleReadiness(runtime),
    notes: [
      "Capsule Studio packages source, manifest, preview route, reports, and deploy metadata together.",
      "Web workers keep long-running capsule logic off the main UI thread.",
      "WASM/WASI targets are used when the local compiler toolchain exists.",
      "GitHub is the first publishing target for generated source and deployment handoff."
    ]
  };
}

export function capsuleExport(manifest: CapsuleManifest): string {
  return [
    `# Capsule Studio Manifest — ${manifest.name}`,
    "",
    `ID: ${manifest.id}`,
    `Target: ${manifest.target}`,
    `Deploy as: ${manifest.deployAs}`,
    `Readiness: ${manifest.readiness}%`,
    "",
    "## Languages",
    ...manifest.languages.map((item) => `- ${item}`),
    "",
    "## Workers",
    ...manifest.workers.map((item) => `- ${item}`),
    "",
    "## Deploy targets",
    ...manifest.deployTargets.map((item) => `- ${item}`),
    "",
    "## Notes",
    ...manifest.notes.map((item) => `- ${item}`)
  ].join("\n");
}
