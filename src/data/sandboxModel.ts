export type SandboxLanguage = {
  id: string;
  label: string;
  family: "scripting" | "systems" | "jvm" | "scientific" | "frontend" | "data" | "other";
  runtime: string;
  capsuleTarget: "wasm" | "wasi" | "native" | "interpreted" | "transpiled";
  preview: "terminal" | "web" | "notebook" | "artifact";
  status: "ready" | "planned" | "requires-toolchain";
};

export type SandboxDaemon = {
  name: string;
  purpose: string;
  status: "online" | "standby" | "planned";
};

export type CapsuleRoute = {
  stage: string;
  owner: string;
  output: string;
};

export type PreviewTarget = {
  label: string;
  route: string;
  type: "web" | "api" | "artifact" | "terminal";
};

export const sandboxLanguages: SandboxLanguage[] = [
  { id: "python", label: "Python", family: "scripting", runtime: "CPython / Pyodide path", capsuleTarget: "wasi", preview: "notebook", status: "ready" },
  { id: "matlab", label: "MATLAB / Octave", family: "scientific", runtime: "Octave-compatible scientific runner", capsuleTarget: "interpreted", preview: "artifact", status: "planned" },
  { id: "julia", label: "Julia", family: "scientific", runtime: "Julia orchestration lane", capsuleTarget: "native", preview: "notebook", status: "requires-toolchain" },
  { id: "java", label: "Java", family: "jvm", runtime: "JDK compile-run lane", capsuleTarget: "wasm", preview: "terminal", status: "planned" },
  { id: "cpp", label: "C++", family: "systems", runtime: "C++17 native and wasm lane", capsuleTarget: "wasm", preview: "terminal", status: "ready" },
  { id: "c", label: "C", family: "systems", runtime: "C native and wasm lane", capsuleTarget: "wasm", preview: "terminal", status: "ready" },
  { id: "rust", label: "Rust", family: "systems", runtime: "Rust wasm-bindgen lane", capsuleTarget: "wasm", preview: "terminal", status: "planned" },
  { id: "typescript", label: "TypeScript", family: "frontend", runtime: "Vite browser runtime", capsuleTarget: "transpiled", preview: "web", status: "ready" },
  { id: "html", label: "HTML / CSS / JS", family: "frontend", runtime: "Browser preview server", capsuleTarget: "transpiled", preview: "web", status: "ready" },
  { id: "r", label: "R", family: "data", runtime: "Statistical runner", capsuleTarget: "interpreted", preview: "artifact", status: "planned" },
  { id: "go", label: "Go", family: "systems", runtime: "Go WASM target", capsuleTarget: "wasm", preview: "terminal", status: "planned" },
  { id: "shell", label: "Shell", family: "other", runtime: "Session command runner", capsuleTarget: "native", preview: "terminal", status: "ready" }
];

export const sandboxDaemons: SandboxDaemon[] = [
  { name: "Session Server", purpose: "Turns on a live local server when a coding session starts.", status: "online" },
  { name: "Preview Router", purpose: "Routes web previews, API previews, terminal logs, and generated artifacts.", status: "online" },
  { name: "Capsule Builder", purpose: "Packages code, manifest, runtime, and outputs into a portable capsule.", status: "standby" },
  { name: "WASM Bridge", purpose: "Compiles supported languages into browser-safe wasm or wasi modules where toolchains exist.", status: "standby" },
  { name: "GitHub Publisher", purpose: "Stages generated files and publishes the session back into the repository.", status: "online" },
  { name: "Background Worker Pool", purpose: "Runs report generation, static checks, build tasks, and deploy preparation.", status: "planned" }
];

export const capsuleRoutes: CapsuleRoute[] = [
  { stage: "Code", owner: "Sandbox Editor", output: "Language-aware source files" },
  { stage: "Compile", owner: "Capsule Builder", output: "Native, interpreted, transpiled, wasm, or wasi output" },
  { stage: "Serve", owner: "Session Server", output: "Live preview URL and API route" },
  { stage: "Preview", owner: "Preview Router", output: "Web frame, terminal output, notebook artifact, or file preview" },
  { stage: "Deploy", owner: "GitHub Publisher", output: "Repository commit and deploy handoff" }
];

export const previewTargets: PreviewTarget[] = [
  { label: "Web App Preview", route: "http://127.0.0.1:5190/preview/session", type: "web" },
  { label: "API Health", route: "/api/session/health", type: "api" },
  { label: "Terminal Output", route: "session://terminal", type: "terminal" },
  { label: "Capsule Artifact", route: "artifacts/capsules/latest", type: "artifact" }
];
