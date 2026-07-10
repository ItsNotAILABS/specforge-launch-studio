export type CapsuleWorkerMessage = {
  type: "score" | "manifest" | "ping";
  payload?: Record<string, unknown>;
};

export type CapsuleWorkerResponse = {
  type: "score-result" | "manifest-result" | "pong" | "error";
  payload: Record<string, unknown>;
};

function respond(message: CapsuleWorkerResponse) {
  self.postMessage(message);
}

function scoreCapsule(payload: Record<string, unknown> = {}) {
  const languages = Array.isArray(payload.languages) ? payload.languages.length : 1;
  const workers = Array.isArray(payload.workers) ? payload.workers.length : 1;
  const target = typeof payload.target === "string" ? payload.target : "web-worker";
  const targetBonus = target === "wasm" || target === "web-worker" ? 24 : 12;
  return Math.min(99, 42 + languages * 5 + workers * 4 + targetBonus);
}

self.onmessage = (event: MessageEvent<CapsuleWorkerMessage>) => {
  try {
    const { type, payload = {} } = event.data;
    if (type === "ping") {
      respond({ type: "pong", payload: { ok: true, worker: "capsule.worker" } });
      return;
    }
    if (type === "score") {
      respond({ type: "score-result", payload: { score: scoreCapsule(payload), target: payload.target ?? "web-worker" } });
      return;
    }
    if (type === "manifest") {
      respond({ type: "manifest-result", payload: { ok: true, capsule: payload, generatedAt: new Date().toISOString() } });
      return;
    }
    respond({ type: "error", payload: { message: `Unknown capsule worker message: ${type}` } });
  } catch (error) {
    respond({ type: "error", payload: { message: error instanceof Error ? error.message : "unknown worker error" } });
  }
};

export {};
