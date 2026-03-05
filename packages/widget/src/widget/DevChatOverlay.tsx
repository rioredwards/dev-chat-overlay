import { useCallback, useEffect, useMemo, useState } from "react";
import type { DevChatConfig } from "../types.js";
import { useDevChat } from "./useDevChat.js";
import { useDrag } from "./useDrag.js";
import { useResize } from "./useResize.js";
import { ChatPanel } from "./ChatPanel.js";
import { DragTrigger } from "./DragTrigger.js";
import { readDrawerOpenState, writeDrawerOpenState } from "./openStateStorage.js";
import "./styles.css";

function scopeId(appId?: string): string {
  const id = appId?.trim();
  if (id) return id;
  if (typeof window !== "undefined") return window.location.hostname;
  return "default";
}

function useIsMobile() {
  const [mobile, setMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= 640,
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const h = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return mobile;
}

const TRIGGER_SIZE = 48;

export function DevChatOverlay(props: DevChatConfig) {
  const scope = scopeId(props.appId);
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(() => readDrawerOpenState(props.appId) ?? false);
  const state = useDevChat(props);

  const drag = useDrag({
    storageKey: `__dco:trigger-pos:${scope}`,
    size: TRIGGER_SIZE,
  });

  const resize = useResize({
    storageKey: `__dco:panel-size:${scope}`,
    defaultSize: { width: 400, height: 520 },
    minSize: { width: 320, height: 380 },
    maxSize: { width: 600, height: 800 },
  });

  const toggleOpen = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      writeDrawerOpenState(props.appId, next);
      return next;
    });
  }, [props.appId]);

  const hasRunningTask = state.messages.some((m) => m.status === "running");

  const panelStyle = useMemo<React.CSSProperties | undefined>(() => {
    if (isMobile) return undefined;
    const { x, y, edge } = drag.position;
    const gap = 12;
    const vpH = typeof window !== "undefined" ? window.innerHeight : 800;
    const vpW = typeof window !== "undefined" ? window.innerWidth : 1024;

    const spaceAbove = y;
    const spaceBelow = vpH - y - TRIGGER_SIZE;
    const openAbove = spaceAbove > spaceBelow;

    const style: React.CSSProperties = {
      position: "fixed",
      width: resize.size.width,
      height: resize.size.height,
      zIndex: 99998,
    };

    if (openAbove) {
      style.bottom = vpH - y + gap;
      style.maxHeight = spaceAbove - gap - 16;
    } else {
      style.top = y + TRIGGER_SIZE + gap;
      style.maxHeight = spaceBelow - gap - 16;
    }

    if (edge === "right") {
      style.right = vpW - x - TRIGGER_SIZE;
    } else {
      style.left = x;
    }

    return style;
  }, [isMobile, drag.position, resize.size]);

  if (process.env.NODE_ENV !== "development") return null;

  const showTrigger = !open || !isMobile;

  return (
    <div className="__dco-root">
      {open && (
        <ChatPanel
          state={state}
          isMobile={isMobile}
          panelStyle={panelStyle}
          edge={drag.position.edge}
          onStartResize={!isMobile ? resize.startResize : undefined}
          isResizing={resize.isResizing}
          onClose={toggleOpen}
        />
      )}
      {showTrigger && (
        <DragTrigger
          drag={drag}
          connectionState={state.connectionState}
          isOpen={open}
          onToggle={toggleOpen}
          hasRunningTask={hasRunningTask}
        />
      )}
    </div>
  );
}
