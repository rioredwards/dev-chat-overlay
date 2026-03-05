import type { DevChatState } from "./useDevChat.js";
import type { ConnectionState } from "../types.js";
import { MessageThread } from "./MessageThread.js";
import { ChatComposer } from "./ChatComposer.js";
import { ActivityBar } from "./ActivityBar.js";
import { ConfirmBanner } from "./ConfirmBanner.js";

interface Props {
  state: DevChatState;
  isMobile: boolean;
  panelStyle?: React.CSSProperties;
  edge?: "left" | "right";
  onStartResize?: (e: React.PointerEvent, corner: "nw" | "ne") => void;
  isResizing?: boolean;
  onClose: () => void;
}

const STATUS_LABEL: Partial<Record<ConnectionState, string>> = {
  connecting: "connecting",
  authenticating: "auth\u2026",
  disconnected: "offline",
  error: "error",
};

const DOT_MOD: Record<ConnectionState, string> = {
  connecting: "--connecting",
  authenticating: "--connecting",
  connected: "",
  disconnected: "--off",
  error: "--error",
};

export function ChatPanel({
  state,
  isMobile,
  panelStyle,
  edge,
  onStartResize,
  isResizing,
  onClose,
}: Props) {
  const isConnected = state.connectionState === "connected";
  const hasRunningTask = state.messages.some((m) => m.status === "running");
  const resizeCorner = edge === "right" ? "nw" : "ne";

  return (
    <div
      className={`__dco-panel ${isMobile ? "__dco-panel--mobile" : ""}`}
      style={isMobile ? undefined : panelStyle}
    >
      {/* Mobile swipe handle */}
      {isMobile && <div className="__dco-panel__handle"><div className="__dco-panel__handle-bar" /></div>}

      {/* Desktop resize grip */}
      {!isMobile && onStartResize && (
        <div
          className={`__dco-resize __dco-resize--${resizeCorner}`}
          onPointerDown={(e) => onStartResize(e, resizeCorner)}
          style={isResizing ? { cursor: resizeCorner === "nw" ? "nw-resize" : "ne-resize" } : undefined}
        />
      )}

      {/* Header */}
      <div className="__dco-header">
        <span className="__dco-header__title">Dev Chat</span>
        <div className="__dco-header__right">
          <span className={`__dco-header__dot __dco-header__dot${DOT_MOD[state.connectionState]}`} />
          {!isConnected && (
            <span className="__dco-header__label">{STATUS_LABEL[state.connectionState]}</span>
          )}
          <button className="__dco-header__close" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <MessageThread messages={state.messages} onCancel={state.cancelTask} />

      {/* Activity */}
      <ActivityBar activities={state.activities} hasRunningTask={hasRunningTask} />

      {/* Confirm */}
      {state.pendingConfirm && (
        <ConfirmBanner confirm={state.pendingConfirm} onRespond={state.respondToConfirm} />
      )}

      {/* Input */}
      <ChatComposer onSend={state.sendMessage} disabled={!isConnected} />
    </div>
  );
}
