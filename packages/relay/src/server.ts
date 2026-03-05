import { WebSocketServer } from "ws";
import { createServer } from "node:http";
import type { RelayConfig } from "./types.js";
import { validateOrigin, assertDevMode } from "./auth.js";
import { connectToOpenClaw } from "./openclaw.js";
import { Bridge } from "./bridge.js";

export function startRelay(config: RelayConfig): { close: () => void } {
  assertDevMode();

  const httpServer = createServer((_req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("dev-chat-relay is running");
  });

  const wss = new WebSocketServer({ server: httpServer });

  const openclaw = connectToOpenClaw(config.openclawUrl, () => {});

  const bridge = new Bridge(openclaw, config.secret);

  wss.on("connection", (ws, req) => {
    if (!validateOrigin(req, config.allowedOrigins)) {
      console.warn("[relay] Rejected connection from disallowed origin:", req.headers.origin);
      ws.close(4003, "Origin not allowed");
      return;
    }

    console.log("[relay] Widget connected");
    bridge.addClient(ws);
  });

  httpServer.listen(config.port, () => {
    console.log(`[relay] Listening on ws://localhost:${config.port}`);
    console.log(`[relay] OpenClaw target: ${config.openclawUrl}`);
    console.log(`[relay] Project dir: ${config.projectDir}`);
  });

  return {
    close() {
      openclaw.close();
      wss.close();
      httpServer.close();
    },
  };
}
