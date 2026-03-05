import WebSocket from "ws";
import type { DownstreamMessage, UpstreamMessage } from "./types.js";

export interface OpenClawConnection {
  send(msg: UpstreamMessage): void;
  onMessage(handler: (msg: DownstreamMessage) => void): void;
  close(): void;
  readonly connected: boolean;
}

export function connectToOpenClaw(
  url: string,
  onDownstream: (msg: DownstreamMessage) => void,
  onDisconnect?: () => void,
): OpenClawConnection {
  let ws: WebSocket | null = null;
  let isConnected = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let messageHandler = onDownstream;

  function connect() {
    ws = new WebSocket(url);

    ws.on("open", () => {
      isConnected = true;
      console.log(`[relay] Connected to OpenClaw at ${url}`);
    });

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString()) as DownstreamMessage;
        messageHandler(msg);
      } catch {
        console.warn("[relay] Failed to parse OpenClaw message:", data.toString().slice(0, 200));
      }
    });

    ws.on("close", () => {
      isConnected = false;
      console.log("[relay] OpenClaw connection closed. Reconnecting in 3s...");
      onDisconnect?.();
      scheduleReconnect();
    });

    ws.on("error", (err) => {
      console.error("[relay] OpenClaw WebSocket error:", err.message);
    });
  }

  function scheduleReconnect() {
    if (reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, 3000);
  }

  connect();

  return {
    send(msg) {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(msg));
      } else {
        console.warn("[relay] Cannot send to OpenClaw -- not connected");
      }
    },
    onMessage(handler) {
      messageHandler = handler;
    },
    close() {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    },
    get connected() {
      return isConnected;
    },
  };
}
