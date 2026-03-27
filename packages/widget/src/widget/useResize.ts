import { useCallback, useEffect, useRef, useState } from "react";
import { clamp, loadJson, saveJson } from "./storage.js";

export interface PanelSize {
  width: number;
  height: number;
}

export interface UseResizeResult {
  size: PanelSize;
  isResizing: boolean;
  startResize: (e: React.PointerEvent, corner: "nw" | "ne") => void;
}

export function useResize(opts: {
  storageKey?: string;
  defaultSize: PanelSize;
  minSize?: PanelSize;
  maxSize?: PanelSize;
}): UseResizeResult {
  const min = opts.minSize ?? { width: 320, height: 380 };
  const max = opts.maxSize ?? { width: 600, height: 800 };

  const [size, setSize] = useState<PanelSize>(() => {
    if (opts.storageKey) {
      const saved = loadJson<PanelSize>(opts.storageKey);
      if (saved) return saved;
    }
    return opts.defaultSize;
  });

  const [isResizing, setIsResizing] = useState(false);
  const sizeRef = useRef(size);
  sizeRef.current = size;

  const info = useRef<{
    sx: number;
    sy: number;
    sw: number;
    sh: number;
    corner: "nw" | "ne";
  } | null>(null);

  const startResize = useCallback((e: React.PointerEvent, corner: "nw" | "ne") => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    info.current = {
      sx: e.clientX,
      sy: e.clientY,
      sw: sizeRef.current.width,
      sh: sizeRef.current.height,
      corner,
    };
  }, []);

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const d = info.current;
      if (!d) return;
      const dx = e.clientX - d.sx;
      const dy = e.clientY - d.sy;

      const maxH = Math.min(max.height, window.innerHeight - 120);
      const maxW = Math.min(max.width, window.innerWidth - 40);

      const w = clamp(
        d.corner === "nw" ? d.sw - dx : d.sw + dx,
        min.width,
        maxW,
      );
      const h = clamp(d.sh - dy, min.height, maxH);
      setSize({ width: w, height: h });
    }

    function onUp() {
      if (!info.current) return;
      info.current = null;
      setIsResizing(false);
      if (opts.storageKey) saveJson(opts.storageKey, sizeRef.current);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [min.width, min.height, max.width, max.height, opts.storageKey]);

  return { size, isResizing, startResize };
}
