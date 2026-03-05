import type { ConnectionState } from "../types.js";
import type { UseDragResult } from "./useDrag.js";

interface Props {
  drag: UseDragResult;
  connectionState: ConnectionState;
  isOpen: boolean;
  onToggle: () => void;
  hasRunningTask: boolean;
}

export function DragTrigger({ drag, connectionState, isOpen, onToggle, hasRunningTask }: Props) {
  function handleClick() {
    if (drag.wasDragged.current) {
      drag.wasDragged.current = false;
      return;
    }
    onToggle();
  }

  const showDot = connectionState !== "connected" || hasRunningTask;
  const dotMod =
    connectionState === "error"
      ? "--error"
      : connectionState === "disconnected"
        ? "--off"
        : connectionState !== "connected"
          ? "--connecting"
          : "--active";

  return (
    <button
      className={`__dco-trigger ${drag.isDragging ? "__dco-trigger--dragging" : ""}`}
      onClick={handleClick}
      aria-label={isOpen ? "Close dev chat" : "Open dev chat"}
      {...drag.bind}
    >
      {isOpen ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )}
      {showDot && <span className={`__dco-trigger__dot __dco-trigger__dot${dotMod}`} />}
    </button>
  );
}
