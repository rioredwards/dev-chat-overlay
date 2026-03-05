import type { ChatMessage } from "../types.js";

interface Props {
  message: ChatMessage;
  onCancel?: (taskId: string) => void;
}

export function MessageBubble({ message, onCancel }: Props) {
  const isUser = message.role === "user";
  const isRunning = message.status === "running";

  const bubbleClass = [
    "__dco-bubble",
    isUser ? "__dco-bubble--user" : "__dco-bubble--assistant",
    message.streaming ? "__dco-bubble--streaming" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={bubbleClass}>
      <div>{message.text}</div>
      {message.status && isUser && (
        <div className="__dco-bubble__footer">
          <span
            className={`__dco-bubble__status ${
              message.status === "running"
                ? "__dco-bubble__status--running"
                : message.status === "error"
                  ? "__dco-bubble__status--error"
                  : ""
            }`}
          >
            {message.status}
          </span>
          {isRunning && message.taskId && onCancel && (
            <button
              className="__dco-bubble__cancel"
              onClick={() => onCancel(message.taskId!)}
            >
              cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}
