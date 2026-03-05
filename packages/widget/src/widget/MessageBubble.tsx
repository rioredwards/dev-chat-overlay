import type { ChatMessage } from "../types.js";

interface Props {
  message: ChatMessage;
  onCancel?: (taskId: string) => void;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function MessageBubble({ message, onCancel }: Props) {
  const isUser = message.role === "user";
  const isRunning = message.status === "running";

  return (
    <div
      className={[
        "__dco-bubble",
        isUser ? "__dco-bubble--user" : "__dco-bubble--assistant",
        message.streaming ? "__dco-bubble--streaming" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="__dco-bubble__text">{message.text}</div>

      {isUser && message.status && (
        <div className="__dco-bubble__meta">
          <span
            className={[
              "__dco-bubble__status",
              message.status === "running" && "__dco-bubble__status--running",
              message.status === "error" && "__dco-bubble__status--error",
              message.status === "done" && "__dco-bubble__status--done",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {message.status}
          </span>
          {isRunning && message.taskId && onCancel && (
            <button
              className="__dco-bubble__cancel"
              onClick={() => onCancel(message.taskId!)}
            >
              stop
            </button>
          )}
        </div>
      )}

      <span className="__dco-bubble__time">{formatTime(message.timestamp)}</span>
    </div>
  );
}
