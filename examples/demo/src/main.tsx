import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { DevChatOverlay } from "@rio/dev-chat-widget";

type Theme = "light" | "dark";

const themeStyles: Record<Theme, React.CSSProperties> = {
  light: {
    backgroundColor: "#f8fafc",
    color: "#0f172a",
  },
  dark: {
    backgroundColor: "#0f172a",
    color: "#e2e8f0",
  },
};

function App() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.fontFamily =
      'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    document.body.style.backgroundColor = themeStyles[theme].backgroundColor as string;
    document.body.style.color = themeStyles[theme].color as string;
  }, [theme]);

  const nextTheme = useMemo<Theme>(() => (theme === "light" ? "dark" : "light"), [theme]);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem",
        boxSizing: "border-box",
        transition: "background-color 200ms ease, color 200ms ease",
        ...themeStyles[theme],
      }}
    >
      <button
        onClick={() => setTheme(nextTheme)}
        style={{
          marginBottom: "1rem",
          padding: "0.5rem 0.9rem",
          borderRadius: "0.5rem",
          border: "1px solid",
          borderColor: theme === "light" ? "#cbd5e1" : "#334155",
          background: theme === "light" ? "#ffffff" : "#1e293b",
          color: "inherit",
          cursor: "pointer",
        }}
      >
        Switch to {nextTheme} mode
      </button>

      <h1>Dev Chat Overlay Demo</h1>
      <p>
        This is a placeholder app. The chat widget is the floating button in the
        bottom-right corner. Click it to open the overlay and talk to OpenClaw.
      </p>
      <p style={{ marginTop: "0.75rem", fontSize: "0.85rem" }}>
        Try: <code>Make the heading bigger</code> or{" "}
        <code>Add a dark mode toggle</code>
      </p>

      <DevChatOverlay
        url="ws://localhost:18790"
        secret={import.meta.env.VITE_DEVCHAT_SECRET}
      />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
