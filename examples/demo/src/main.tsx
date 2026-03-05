import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { DevChatOverlay } from "@rio/dev-chat-widget";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "demo-theme";

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
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.fontFamily =
      'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    document.body.style.backgroundColor = themeStyles[theme].backgroundColor as string;
    document.body.style.color = themeStyles[theme].color as string;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
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
      <button
        style={{
          marginBottom: "1rem",
          padding: "0.5rem 0.9rem",
          borderRadius: "0.5rem",
          border: "1px solid #15803d",
          background: "#22c55e",
          color: "#052e16",
          cursor: "pointer",
        }}
      >
        I'm a button
      </button>
      <p>
        This is a placeholder app. The chat widget is the floating button in the
        bottom-right corner. Click it to open the overlay and talk to OpenClaw.
      </p>
      <p style={{ marginTop: "0.75rem", fontSize: "0.85rem" }}>
        Try: <code>Make the heading bigger</code> or{" "}
        <code>Add a dark mode toggle</code>
      </p>

      <img
        src={"data:image/svg+xml;utf8," + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
            <defs>
              <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#0ea5e9"/>
                <stop offset="100%" stop-color="#1d4ed8"/>
              </linearGradient>
            </defs>
            <rect width="640" height="360" fill="url(#bg)" rx="24"/>
            <ellipse cx="300" cy="180" rx="140" ry="80" fill="#f97316"/>
            <polygon points="430,180 520,120 520,240" fill="#fb923c"/>
            <circle cx="250" cy="165" r="10" fill="#111827"/>
            <path d="M210 210 C230 225 260 225 280 210" stroke="#111827" stroke-width="6" fill="none" stroke-linecap="round"/>
            <rect x="265" y="105" width="28" height="150" fill="#fff" opacity="0.92"/>
            <rect x="330" y="110" width="24" height="140" fill="#fff" opacity="0.92"/>
            <rect x="188" y="122" width="20" height="116" fill="#fff" opacity="0.92"/>
          </svg>
        `)}
        alt="A fish illustration"
        style={{
          display: "block",
          marginTop: "1rem",
          width: "min(100%, 360px)",
          borderRadius: "0.75rem",
          border: "1px solid",
          borderColor: theme === "light" ? "#cbd5e1" : "#334155",
        }}
      />

      <DevChatOverlay
        url={`${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}/relay-ws`}
        secret={import.meta.env.VITE_DEVCHAT_SECRET}
      />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
