export type CapsuleRuntime = {
  id: string;
  name: string;
  purpose: string;
  languages: string[];
  target: "web-worker" | "wasm" | "wasi" | "node" | "native" | "hybrid";
  deployAs: "agent" | "app" | "worker" | "service";
  status: "ready" | "planned" | "toolchain-required";
};

export type CapsuleWorker = {
  name: string;
  type: "persistent" | "session" | "build" | "preview" | "deploy" | "research";
  input: string;
  output: string;
  status: "online" | "standby" | "planned";
};

export type CapsuleDeployTarget = {
  name: string;
  route: string;
  purpose: string;
  status: "ready" | "planned";
};

export type CapsuleDivision = {
  name: string;
  role: string;
  workers: string[];
};

export const capsuleRuntimes: CapsuleRuntime[] = [
  {
    id: "python-orchestrator",
    name: "Python Orchestrator Capsule",
    purpose: "Coordinates scripts, reports, artifact generation, local services, and AI tool calls.",
    languages: ["Python", "Shell", "JSON", "Markdown"],
    target: "wasi",
    deployAs: "agent",
    status: "ready"
  },
  {
    id: "julia-sciml",
    name: "Julia SciML Capsule",
    purpose: "Runs scientific modeling, numerical workloads, neural ODE planning, and research calculations.",
    languages: ["Julia", "Python"],
    target: "native",
    deployAs: "service",
    status: "toolchain-required"
  },
  {
    id: "cpp-wasm-core",
    name: "C/C++ WASM Core Capsule",
    purpose: "Compiles performance-critical scoring, export, simulation, and runtime kernels into WebAssembly.",
    languages: ["C", "C++", "WAT"],
    target: "wasm",
    deployAs: "worker",
    status: "ready"
  },
  {
    id: "react-app-capsule",
    name: "React App Capsule",
    purpose: "Packages full front-end apps with preview, project workspace, marketplace, and deploy flow.",
    languages: ["TypeScript", "React", "CSS", "HTML"],
    target: "web-worker",
    deployAs: "app",
    status: "ready"
  },
  {
    id: "node-service-capsule",
    name: "Node Service Capsule",
    purpose: "Runs API adapters, MCP bridges, preview routing, GitHub publishing, and background daemons.",
    languages: ["Node.js", "TypeScript", "JSON-RPC"],
    target: "node",
    deployAs: "service",
    status: "planned"
  },
  {
    id: "java-agent-capsule",
    name: "Java Agent Capsule",
    purpose: "Packages JVM services and agent runtimes into managed capsule builds.",
    languages: ["Java", "Kotlin"],
    target: "wasm",
    deployAs: "agent",
    status: "planned"
  }
];

export const capsuleWorkers: CapsuleWorker[] = [
  { name: "Capsule Session Worker", type: "session", input: "selected language + source files", output: "live session manifest", status: "online" },
  { name: "Preview Worker", type: "preview", input: "web app, API, terminal, notebook, or artifact", output: "clickable preview surface", status: "online" },
  { name: "WASM Build Worker", type: "build", input: "C, C++, Rust, Go, Java targets", output: "wasm or wasi capsule module", status: "standby" },
  { name: "Agent Deploy Worker", type: "deploy", input: "capsule manifest + artifacts", output: "agent, worker, service, or app deployment", status: "standby" },
  { name: "Research Report Worker", type: "research", input: "capsule run logs + model outputs", output: "launch, R&D, architecture, and verification reports", status: "online" },
  { name: "GitHub Publisher Worker", type: "deploy", input: "generated source tree", output: "repo commit / handoff", status: "online" },
  { name: "Persistent Background Daemon", type: "persistent", input: "workspace events", output: "auto-refresh, indexing, and status updates", status: "planned" }
];

export const capsuleDeployTargets: CapsuleDeployTarget[] = [
  { name: "Web Worker Agent", route: "workers/<capsule>.worker.ts", purpose: "Run capsule logic inside the browser without blocking the UI.", status: "ready" },
  { name: "Whole Web App", route: "apps/<capsule>/", purpose: "Deploy a full HTML/React/Vite app capsule with preview and publish metadata.", status: "ready" },
  { name: "WASM Kernel", route: "wasm/<capsule>.wasm", purpose: "Ship compiled kernels for scoring, simulation, parsing, and model support.", status: "ready" },
  { name: "MCP Service", route: "mcp/<capsule>/server", purpose: "Expose capsule tools to AI clients through tool protocols.", status: "planned" },
  { name: "GitHub Release", route: "github://ItsNotAILABS/specforge-launch-studio", purpose: "Commit source, docs, manifests, reports, and deployment instructions.", status: "ready" }
];

export const capsuleDivisions: CapsuleDivision[] = [
  { name: "Chief Orchestration", role: "Coordinates Python, Julia, Node, WASM, GitHub, and worker deployment lanes.", workers: ["Capsule Session Worker", "Agent Deploy Worker", "GitHub Publisher Worker"] },
  { name: "Chief Research", role: "Generates R&D reports, architecture briefs, model plans, and verification packages.", workers: ["Research Report Worker", "Persistent Background Daemon"] },
  { name: "Runtime Engineering", role: "Builds web workers, WASM kernels, preview routes, and capsule manifests.", workers: ["WASM Build Worker", "Preview Worker"] },
  { name: "Launch Operations", role: "Turns capsules into marketable apps, services, or deployable agents.", workers: ["Agent Deploy Worker", "GitHub Publisher Worker"] }
];
