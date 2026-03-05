import type WebSocket from "ws";
import type { UpstreamMessage, DownstreamMessage } from "./types.js";
import type { OpenClawConnection } from "./openclaw.js";
import { validateSecret } from "./auth.js";

interface BridgedClient {
  ws: WebSocket;
  authenticated: boolean;
}

export class Bridge {
  private clients = new Map<WebSocket, BridgedClient>();

  constructor(
    private openclaw: OpenClawConnection,
    private secret: string,
  ) {
    this.openclaw.onMessage((msg) => this.broadcastDownstream(msg));
  }

  addClient(ws: WebSocket): void {
    this.clients.set(ws, { ws, authenticated: false });

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString()) as UpstreamMessage;
        this.handleUpstream(ws, msg);
      } catch {
        this.sendTo(ws, {
          type: "error",
          taskId: "",
          message: "Invalid JSON",
        });
      }
    });

    ws.on("close", () => {
      this.clients.delete(ws);
    });
  }

  private handleUpstream(ws: WebSocket, msg: UpstreamMessage): void {
    const client = this.clients.get(ws);
    if (!client) return;

    if (msg.type === "auth") {
      const ok = validateSecret(msg.secret, this.secret);
      client.authenticated = ok;
      this.sendTo(ws, { type: "authenticated", ok });
      if (!ok) {
        ws.close(4001, "Invalid secret");
      }
      return;
    }

    if (!client.authenticated) {
      this.sendTo(ws, {
        type: "error",
        taskId: "",
        message: "Not authenticated. Send auth message first.",
      });
      ws.close(4002, "Not authenticated");
      return;
    }

    // Forward all other messages to OpenClaw
    this.openclaw.send(msg);
  }

  private broadcastDownstream(msg: DownstreamMessage): void {
    const payload = JSON.stringify(msg);
    for (const [, client] of this.clients) {
      if (client.authenticated && client.ws.readyState === client.ws.OPEN) {
        client.ws.send(payload);
      }
    }
  }

  private sendTo(ws: WebSocket, msg: DownstreamMessage): void {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }
}
