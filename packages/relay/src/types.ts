// Protocol types duplicated from @rio/dev-chat-widget to avoid cross-package dep.
// Keep in sync with packages/widget/src/types.ts.

export type TaskStatus = "queued" | "running" | "done" | "error";

export type AgentType = "codex" | "claude-code";

// ─── Upstream (Client -> Relay) ─────────────────────────────────────────────

export interface DevChatContext {
  source?: string;
  appId?: string;
  activeUrl?: string;
  pageTitle?: string;
}

export type UpstreamMessage =
  | { type: "auth"; secret: string }
  | { type: "message"; id: string; text: string; agent?: AgentType; context?: DevChatContext }
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

// ─── Relay Config ───────────────────────────────────────────────────────────

export interface RelayConfig {
  port: number;
  secret: string;
  projectDir: string;
  openclawUrl: string;
  openclawToken: string;
  allowedOrigins?: string[];
}
