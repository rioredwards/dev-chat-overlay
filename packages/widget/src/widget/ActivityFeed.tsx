import { useRef, useEffect } from "react";
import type { ActivityEntry } from "../types.js";

interface Props {
  activities: ActivityEntry[];
}

export function ActivityFeed({ activities }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activities]);

  if (activities.length === 0) return null;

  // Show last 20 entries
  const visible = activities.slice(-20);

  return (
    <div className="__dco-activity">
      {visible.map((entry) => (
        <div key={entry.id} className="__dco-activity__line" title={entry.text}>
          {entry.text}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
