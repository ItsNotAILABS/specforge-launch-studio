export type PreviewWorkerMessage = {
  type: "prepare-preview" | "prepare-deploy";
  source?: string;
  language?: string;
  route?: string;
};

self.onmessage = (event: MessageEvent<PreviewWorkerMessage>) => {
  const message = event.data;
  if (message.type === "prepare-preview") {
    self.postMessage({
      type: "preview-ready",
      payload: {
        route: message.route ?? "http://127.0.0.1:5190/preview/session",
        language: message.language ?? "html",
        mode: message.language === "html" || message.language === "typescript" ? "web" : "terminal-or-artifact",
        preparedAt: new Date().toISOString()
      }
    });
    return;
  }

  if (message.type === "prepare-deploy") {
    self.postMessage({
      type: "deploy-ready",
      payload: {
        target: "GitHub",
        files: ["source", "manifest", "preview", "reports"],
        preparedAt: new Date().toISOString()
      }
    });
    return;
  }

  self.postMessage({ type: "preview-error", payload: { message: "Unknown preview worker message" } });
};

export {};
