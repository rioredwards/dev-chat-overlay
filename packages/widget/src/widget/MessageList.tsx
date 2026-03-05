import { useRef, useEffect } from "react";
import type { ChatMessage } from "../types.js";
import { MessageBubble } from "./MessageBubble.js";

interface Props {
  messages: ChatMessage[];
  onCancel?: (taskId: string) => void;
}

export function MessageList({ messages, onCancel }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="__dco-messages">
        <div className="__dco-empty">
          <div className="__dco-empty__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <div className="__dco-empty__text">
            Describe what you want to change.
            <br />
            The AI agent will edit your code live.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="__dco-messages">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} onCancel={onCancel} />
      ))}
      <div ref={endRef} />
    </div>
  );
}
