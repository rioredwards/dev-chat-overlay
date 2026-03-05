import type { DownstreamMessage, UpstreamMessage, DevChatContext } from "./types.js";
import { buildOpenClawMessages } from "./prompt-context.js";

export interface OpenClawConnection {
  send(msg: UpstreamMessage): void;
  onMessage(handler: (msg: DownstreamMessage) => void): void;
  close(): void;
  readonly connected: boolean;
}

export function createOpenClawHTTP(
  baseUrl: string,
  token: string,
  projectDir: string,
): OpenClawConnection {
  let handler: ((msg: DownstreamMessage) => void) | null = null;
  const inflight = new Map<string, AbortController>();
  const userId = `devchat:relay-${Date.now()}`;
  let closed = false;

  function emit(msg: DownstreamMessage) {
    handler?.(msg);
  }

  async function handleMessage(taskId: string, text: string, context?: DevChatContext) {
    const controller = new AbortController();
    inflight.set(taskId, controller);

    emit({ type: "status", taskId, status: "queued" });

    try {
      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          model: "openclaw:main",
          messages: buildOpenClawMessages(text, projectDir, context),
          stream: true,
          user: userId,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`OpenClaw HTTP ${res.status}: ${body.slice(0, 200)}`);
      }

      emit({ type: "status", taskId, status: "running" });

      let finished = false;
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop()!;

        for (const line of lines) {
          if (finished) break;
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(":")) continue;

          if (trimmed === "data: [DONE]") {
            finished = true;
            break;
          }

          if (trimmed.startsWith("data: ")) {
            try {
              const chunk = JSON.parse(trimmed.slice(6));
              const choice = chunk.choices?.[0];
              const content = choice?.delta?.content;
              const finishReason = choice?.finish_reason;

              if (content) {
                emit({ type: "assistant", taskId, text: content, done: false });
              }
              if (finishReason === "stop") {
                finished = true;
              }
            } catch {
              // skip malformed SSE data
            }
          }
        }
      }

      emit({ type: "assistant", taskId, text: "", done: true });
      emit({ type: "status", taskId, status: "done" });
    } catch (err: any) {
      if (err.name === "AbortError") {
        emit({ type: "status", taskId, status: "error" });
        emit({ type: "error", taskId, message: "Cancelled" });
      } else {
        console.error("[relay] OpenClaw HTTP error:", err.message);
        emit({ type: "status", taskId, status: "error" });
        emit({ type: "error", taskId, message: err.message ?? "Unknown error" });
      }
    } finally {
      inflight.delete(taskId);
    }
  }

  return {
    send(msg) {
      if (closed) return;
      if (msg.type === "message") {
        handleMessage(msg.id, msg.text, msg.context);
      } else if (msg.type === "cancel") {
        const controller = inflight.get(msg.taskId);
        if (controller) controller.abort();
      }
    },

    onMessage(h) {
      handler = h;
    },

    close() {
      closed = true;
      for (const c of inflight.values()) c.abort();
      inflight.clear();
    },

    get connected() {
      return !closed;
    },
  };
}
