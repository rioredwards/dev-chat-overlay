import { useRef, useEffect, useState } from "react";
import type { ActivityEntry } from "../types.js";

interface Props {
  activities: ActivityEntry[];
  hasRunningTask: boolean;
}

export function ActivityBar({ activities, hasRunningTask }: Props) {
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (hasRunningTask) {
      if (collapseTimer.current) clearTimeout(collapseTimer.current);
      setExpanded(true);
    } else if (expanded) {
      collapseTimer.current = setTimeout(() => setExpanded(false), 2500);
    }
    return () => {
      if (collapseTimer.current) clearTimeout(collapseTimer.current);
    };
  }, [hasRunningTask]);  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (expanded) listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [activities, expanded]);

  if (activities.length === 0) return null;

  const latest = activities[activities.length - 1];
  const visible = activities.slice(-20);

  return (
    <div className={`__dco-activity ${expanded ? "__dco-activity--expanded" : ""}`}>
      <button
        className="__dco-activity__toggle"
        onClick={() => setExpanded((v) => !v)}
        title={expanded ? "Collapse activity" : "Expand activity"}
      >
        <svg
          className="__dco-activity__chevron"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        <span className="__dco-activity__summary">{latest.text}</span>
      </button>

      {expanded && (
        <div className="__dco-activity__list" ref={listRef}>
          {visible.map((entry) => (
            <div key={entry.id} className="__dco-activity__line" title={entry.text}>
              {entry.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
