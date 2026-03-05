// ─── Task Status ────────────────────────────────────────────────────────────

export type TaskStatus = "queued" | "running" | "done" | "error";

export type AgentType = "codex" | "claude-code";

// ─── Upstream (Client -> Relay) ─────────────────────────────────────────────

export type UpstreamMessage =
  | { type: "auth"; secret: string }
  | { type: "message"; id: string; text: string; agent?: AgentType }
  | { type: "cancel"; taskId: string }
  | { type: "confirm_response"; taskId: string; approved: boolean };

// ─── Downstream (Relay -> Client) ───────────────────────────────────────────

export type DownstreamMessage =
  | { type: "authenticated"; ok: boolean }
  | { type: "status"; taskId: string; status: TaskStatus }
  | { type: "activity"; taskId: string; text: string }
  | { type: "assistant"; taskId: string; text: string; done: boolean }
  | { type: "files"; taskId: string; changed: string[] }
  | { type: "confirm"; taskId: string; action: string; description: string }
  | { type: "error"; taskId: string; message: string };

// ─── UI-level types ─────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
  taskId?: string;
  status?: TaskStatus;
  streaming?: boolean;
}

export interface ActivityEntry {
  id: string;
  taskId: string;
  text: string;
  timestamp: number;
}

export interface ConfirmRequest {
  taskId: string;
  action: string;
  description: string;
}

export interface FileChange {
  taskId: string;
  changed: string[];
}

// ─── Config ─────────────────────────────────────────────────────────────────

export interface DevChatConfig {
  url: string;
  secret: string;
  agent?: AgentType;
  position?: "bottom-right" | "bottom-left";
}

// ─── Connection State ───────────────────────────────────────────────────────

export type ConnectionState = "connecting" | "authenticating" | "connected" | "disconnected" | "error";
