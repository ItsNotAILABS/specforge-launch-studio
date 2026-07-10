import { sandboxLanguages, type SandboxLanguage } from "../data/sandboxModel";

export type SandboxSession = {
  id: string;
  language: SandboxLanguage;
  serverState: "offline" | "starting" | "online";
  previewUrl: string;
  capsuleMode: string;
  deployTarget: string;
  manifest: string[];
};

export function createSandboxSession(languageId: string): SandboxSession {
  const language = sandboxLanguages.find((item) => item.id === languageId) ?? sandboxLanguages[0];
  const id = `session-${language.id}-${Date.now().toString(36)}`;
  const previewUrl = language.preview === "web" ? "http://127.0.0.1:5190/preview/session" : `session://${language.preview}/${language.id}`;
  return {
    id,
    language,
    serverState: language.preview === "web" || language.preview === "notebook" ? "online" : "starting",
    previewUrl,
    capsuleMode: language.capsuleTarget,
    deployTarget: "GitHub repository handoff",
    manifest: [
      `language=${language.label}`,
      `runtime=${language.runtime}`,
      `capsule=${language.capsuleTarget}`,
      `preview=${language.preview}`,
      "server=session-server",
      "publisher=github"
    ]
  };
}

export function capsuleDescription(language: SandboxLanguage): string {
  if (language.capsuleTarget === "wasm") return "Compiled into a WebAssembly capsule when the local toolchain is available.";
  if (language.capsuleTarget === "wasi") return "Packaged for WASI-style execution and artifact handoff.";
  if (language.capsuleTarget === "transpiled") return "Transpiled or served into the browser preview lane.";
  if (language.capsuleTarget === "interpreted") return "Executed through a session runner and captured as artifacts.";
  return "Executed through the local native runtime and wrapped into the capsule manifest.";
}

export function sandboxReadiness(language: SandboxLanguage): number {
  if (language.status === "ready") return 92;
  if (language.status === "requires-toolchain") return 68;
  return 44;
}
