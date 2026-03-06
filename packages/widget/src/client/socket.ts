import type {
  UpstreamMessage,
  DownstreamMessage,
  ConnectionState,
  AgentType,
  DevChatContext,
} from "../types.js";

export type MessageListener = (msg: DownstreamMessage) => void;
export type StateListener = (state: ConnectionState) => void;

export interface DevChatSocket {
  connect(): void;
  disconnect(): void;
  sendMessage(text: string, agent?: AgentType): string;
  cancelTask(taskId: string): void;
  confirmResponse(taskId: string, approved: boolean): void;
  onMessage(listener: MessageListener): () => void;
  onStateChange(listener: StateListener): () => void;
  readonly state: ConnectionState;
}

let idCounter = 0;
function nextId(): string {
  return `msg_${Date.now()}_${++idCounter}`;
}

function detectClientContext(appId?: string): DevChatContext | undefined {
  if (typeof window === "undefined") return undefined;
  const configuredAppId = appId?.trim();

  return {
    source: "devchat-web",
    appId: configuredAppId || window.location.hostname,
    activeUrl: window.location.href,
    pageTitle: document?.title,
  };
}

export function createSocket(
  url: string,
  auth: { secret?: string; token?: string },
  appId?: string,
): DevChatSocket {
  let ws: WebSocket | null = null;
  let state: ConnectionState = "disconnected";
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectDelay = 1000;
  const maxReconnectDelay = 16000;
  const messageListeners = new Set<MessageListener>();
  const stateListeners = new Set<StateListener>();

  function setState(next: ConnectionState) {
    state = next;
    stateListeners.forEach((fn) => fn(next));
  }

  function send(msg: UpstreamMessage) {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }

  function connect() {
    if (ws?.readyState === WebSocket.OPEN || ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    setState("connecting");
    ws = new WebSocket(url);

    ws.addEventListener("open", () => {
      setState("authenticating");
      reconnectDelay = 1000;
      send({ type: "auth", secret: auth.secret, token: auth.token });
    });

    ws.addEventListener("message", (event) => {
      try {
        const msg = JSON.parse(event.data as string) as DownstreamMessage;

        if (msg.type === "authenticated") {
          setState(msg.ok ? "connected" : "error");
          if (!msg.ok) ws?.close();
          return;
        }

        messageListeners.forEach((fn) => fn(msg));
      } catch {
        // ignore malformed messages
      }
    });

    ws.addEventListener("close", () => {
      setState("disconnected");
      scheduleReconnect();
    });

    ws.addEventListener("error", () => {
      setState("error");
    });
  }

  function scheduleReconnect() {
    if (reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      reconnectDelay = Math.min(reconnectDelay * 2, maxReconnectDelay);
      connect();
    }, reconnectDelay);
  }

  function disconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    ws?.close();
    ws = null;
    setState("disconnected");
  }

  return {
    connect,
    disconnect,

    sendMessage(text: string, agent?: AgentType): string {
      const id = nextId();
      send({ type: "message", id, text, agent, context: detectClientContext(appId) });
      return id;
    },

    cancelTask(taskId: string) {
      send({ type: "cancel", taskId });
    },

    confirmResponse(taskId: string, approved: boolean) {
      send({ type: "confirm_response", taskId, approved });
    },

    onMessage(listener: MessageListener): () => void {
      messageListeners.add(listener);
      return () => messageListeners.delete(listener);
    },

    onStateChange(listener: StateListener): () => void {
      stateListeners.add(listener);
      return () => stateListeners.delete(listener);
    },

    get state() {
      return state;
    },
  };
}
