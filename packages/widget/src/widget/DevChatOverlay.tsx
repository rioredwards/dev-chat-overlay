import { useCallback, useState } from "react";
import type { DevChatConfig } from "../types.js";
import { useDevChat } from "./useDevChat.js";
import { ChatDrawer } from "./ChatDrawer.js";
import { readDrawerOpenState, writeDrawerOpenState } from "./openStateStorage.js";
import "./styles.css";

export function DevChatOverlay(props: DevChatConfig) {
  const [open, setOpen] = useState(() => readDrawerOpenState(props.appId) ?? false);
  const state = useDevChat(props);
  const position = props.position ?? "bottom-right";
  const isLeft = position === "bottom-left";

  const toggleOpen = useCallback(() => {
    setOpen((current) => {
      const next = !current;
      writeDrawerOpenState(props.appId, next);
      return next;
    });
  }, [props.appId]);

  if (process.env.NODE_ENV !== "development") return null;

  const hasActivity =
    state.connectionState === "connected" &&
    state.activities.length > 0 &&
    state.messages.some((m) => m.status === "running");

  const dotClass =
    state.connectionState === "error"
      ? "__dco-trigger__dot--error"
      : state.connectionState === "disconnected"
        ? "__dco-trigger__dot--disconnected"
        : "";

  return (
    <>
      {open && <ChatDrawer state={state} position={position} />}
      <button
        className={`__dco-trigger ${isLeft ? "__dco-trigger--left" : ""}`}
        onClick={toggleOpen}
        aria-label={open ? "Close dev chat" : "Open dev chat"}
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
        {(hasActivity || state.connectionState !== "connected") && (
          <span className={`__dco-trigger__dot ${dotClass}`} />
        )}
      </button>
    </>
  );
}
