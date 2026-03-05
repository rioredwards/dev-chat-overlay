import { useRef, useEffect, useState, useCallback } from "react";
import type { ChatMessage } from "../types.js";
import { MessageBubble } from "./MessageBubble.js";

interface Props {
  messages: ChatMessage[];
  onCancel?: (taskId: string) => void;
}

export function MessageThread({ messages, onCancel }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [showAnchor, setShowAnchor] = useState(false);
  const userScrolled = useRef(false);

  const scrollToBottom = useCallback((smooth = true) => {
    endRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "instant" });
    userScrolled.current = false;
    setShowAnchor(false);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function onScroll() {
      const gap = el!.scrollHeight - el!.scrollTop - el!.clientHeight;
      const atBottom = gap < 40;
      userScrolled.current = !atBottom;
      setShowAnchor(!atBottom);
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!userScrolled.current) scrollToBottom(true);
  }, [messages, scrollToBottom]);

  if (messages.length === 0) {
    return (
      <div className="__dco-thread" ref={scrollRef}>
        <div className="__dco-empty">
          <svg className="__dco-empty__icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <p className="__dco-empty__text">
            Describe what you want to change.
            <br />
            The AI will edit your code live.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="__dco-thread" ref={scrollRef}>
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} onCancel={onCancel} />
      ))}
      <div ref={endRef} />
      {showAnchor && (
        <button
          className="__dco-thread__anchor"
          onClick={() => scrollToBottom(true)}
          aria-label="Scroll to bottom"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}
    </div>
  );
}
