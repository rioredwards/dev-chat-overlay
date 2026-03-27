import { useCallback, useEffect, useRef, useState } from "react";
import { clamp, loadJson, saveJson } from "./storage.js";

export type Edge = "left" | "right";

export interface DragPosition {
  x: number;
  y: number;
  edge: Edge;
}

export interface UseDragResult {
  position: DragPosition;
  isDragging: boolean;
  wasDragged: React.RefObject<boolean>;
  bind: {
    onPointerDown: (e: React.PointerEvent) => void;
    style: React.CSSProperties;
  };
}

const DRAG_THRESHOLD = 5;

function vp() {
  return { w: window.innerWidth, h: window.innerHeight };
}

function snap(x: number, y: number, size: number, pad: number): DragPosition {
  const { w, h } = vp();
  const edge: Edge = x + size / 2 < w / 2 ? "left" : "right";
  return {
    x: edge === "left" ? pad : w - size - pad,
    y: clamp(y, pad, h - size - pad),
    edge,
  };
}

export function useDrag(opts: {
  storageKey?: string;
  size?: number;
  padding?: number;
}): UseDragResult {
  const size = opts.size ?? 48;
  const pad = opts.padding ?? 16;
  const key = opts.storageKey;

  const [position, setPosition] = useState<DragPosition>(() => {
    if (key) {
      const saved = loadJson<DragPosition>(key);
      if (saved) return saved;
    }
    if (typeof window === "undefined") return { x: 0, y: 0, edge: "right" as Edge };
    const { w, h } = vp();
    return { x: w - size - pad, y: h - size - pad - 40, edge: "right" };
  });

  const [isDragging, setIsDragging] = useState(false);
  const wasDragged = useRef(false);
  const posRef = useRef(position);
  posRef.current = position;

  const info = useRef<{
    sx: number;
    sy: number;
    ox: number;
    oy: number;
    moved: boolean;
  } | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    info.current = {
      sx: e.clientX,
      sy: e.clientY,
      ox: posRef.current.x,
      oy: posRef.current.y,
      moved: false,
    };
  }, []);

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const d = info.current;
      if (!d) return;
      const dx = e.clientX - d.sx;
      const dy = e.clientY - d.sy;
      if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      d.moved = true;
      setIsDragging(true);
      const { w, h } = vp();
      setPosition({
        x: clamp(d.ox + dx, pad, w - size - pad),
        y: clamp(d.oy + dy, pad, h - size - pad),
        edge: posRef.current.edge,
      });
    }

    function onUp(e: PointerEvent) {
      const d = info.current;
      if (!d) return;
      info.current = null;
      setIsDragging(false);
      if (d.moved) {
        wasDragged.current = true;
        const { w, h } = vp();
        const snapped = snap(
          clamp(d.ox + (e.clientX - d.sx), pad, w - size - pad),
          clamp(d.oy + (e.clientY - d.sy), pad, h - size - pad),
          size,
          pad,
        );
        setPosition(snapped);
        if (key) saveJson(key, snapped);
      }
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [size, pad, key]);

  useEffect(() => {
    function onResize() {
      setPosition((prev) => {
        const s = snap(prev.x, prev.y, size, pad);
        if (key) save(key, s);
        return s;
      });
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [size, pad, key]);

  return {
    position,
    isDragging,
    wasDragged,
    bind: {
      onPointerDown,
      style: {
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 99999,
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        transition: isDragging
          ? "none"
          : "left 0.35s cubic-bezier(0.22, 1, 0.36, 1), top 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
      } as React.CSSProperties,
    },
  };
}
