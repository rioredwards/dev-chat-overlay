import type { ConnectionState } from "../types.js";
import type { DevChatState } from "./useDevChat.js";
import { MessageList } from "./MessageList.js";
import { ChatInput } from "./ChatInput.js";
import { ActivityFeed } from "./ActivityFeed.js";
import { ConfirmDialog } from "./ConfirmDialog.js";

interface Props {
  state: DevChatState;
  position: "bottom-right" | "bottom-left";
}

const statusLabel: Record<ConnectionState, string> = {
  connecting: "connecting",
  authenticating: "auth...",
  connected: "connected",
  disconnected: "offline",
  error: "error",
};

const statusDotClass: Record<ConnectionState, string> = {
  connecting: "__dco-header__dot--connecting",
  authenticating: "__dco-header__dot--connecting",
  connected: "",
  disconnected: "__dco-header__dot--disconnected",
  error: "__dco-header__dot--error",
};

export function ChatDrawer({ state, position }: Props) {
  const isConnected = state.connectionState === "connected";

  return (
    <div className={`__dco-drawer ${position === "bottom-left" ? "__dco-drawer--left" : ""}`}>
      <div className="__dco-header">
        <span className="__dco-header__title">Dev Chat</span>
        <span className="__dco-header__status">
          <span className={`__dco-header__dot ${statusDotClass[state.connectionState]}`} />
          {statusLabel[state.connectionState]}
        </span>
      </div>

      <MessageList messages={state.messages} onCancel={state.cancelTask} />

      <ActivityFeed activities={state.activities} />

      {state.pendingConfirm && (
        <ConfirmDialog
          confirm={state.pendingConfirm}
          onRespond={state.respondToConfirm}
        />
      )}

      <ChatInput onSend={state.sendMessage} disabled={!isConnected} />
    </div>
  );
}
