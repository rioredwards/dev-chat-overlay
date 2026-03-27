import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { DevChatOverlay } from "@rio/dev-chat-widget";
import "./demo.css";

type Theme = "light" | "dark";
type View = "landing" | "dashboard";

const THEME_STORAGE_KEY = "demo-theme";

const themeVars: Record<Theme, Record<string, string>> = {
  light: {
    "--bg-a": "#ffffff",
    "--bg-b": "#fffdf8",
    "--text": "#122033",
    "--muted": "#5a6c7f",
    "--glass": "rgba(255, 255, 255, 0.74)",
    "--glass-border": "rgba(255, 177, 216, 0.38)",
    "--primary": "#ffd85f",
    "--accent": "#ffb7d8",
    "--primary-ink": "#3c2b00",
    "--secondary": "rgba(255, 214, 92, 0.12)",
    "--secondary-border": "rgba(255, 177, 216, 0.32)",
    "--chip": "rgba(255, 210, 234, 0.18)",
    "--glow-1": "rgba(255, 183, 217, 0.32)",
    "--glow-2": "rgba(255, 227, 138, 0.28)",
    "--glow-3": "rgba(255, 183, 217, 0.22)",
  },
  dark: {
    "--bg-a": "#051e32",
    "--bg-b": "#010d17",
    "--text": "#dff3ff",
    "--muted": "#90b9cf",
    "--glass": "rgba(4, 16, 28, 0.62)",
    "--glass-border": "rgba(108, 184, 230, 0.3)",
    "--primary": "#6dd7ff",
    "--accent": "#ff9dcf",
    "--primary-ink": "#032336",
    "--secondary": "rgba(88, 170, 216, 0.12)",
    "--secondary-border": "rgba(119, 188, 231, 0.28)",
    "--chip": "rgba(100, 173, 219, 0.1)",
    "--glow-1": "rgba(122, 222, 255, 0.22)",
    "--glow-2": "rgba(85, 255, 192, 0.14)",
    "--glow-3": "rgba(116, 188, 255, 0.14)",
  },
};

const projects = [
  { name: "Rio Portfolio", status: "Live", updated: "2m ago" },
  { name: "Bakery Site", status: "Draft", updated: "14m ago" },
  { name: "Waitlist Page", status: "Live", updated: "1h ago" },
];

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === "light" ? "light" : "dark";
  });
  const [view, setView] = useState<View>("landing");

  useEffect(() => {
    const root = document.documentElement;
    const vars = themeVars[theme];
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));

    document.body.style.color = vars["--text"];
    document.body.style.background = `linear-gradient(165deg, ${vars["--bg-a"]} 0%, ${vars["--bg-b"]} 100%)`;

    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const nextTheme = useMemo<Theme>(() => (theme === "dark" ? "light" : "dark"), [theme]);

  return (
    <div className="page">
      <div className="ambient" aria-hidden>
        <span className="blob one" />
        <span className="blob two" />
        <span className="blob three" />
      </div>

      <main className="shell">
        <header className="topbar">
          <div className="brand"><span className="dot" />OpenClaw</div>
          <button className="icon-btn" aria-label={`Switch to ${nextTheme} mode`} onClick={() => setTheme(nextTheme)}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </header>

        {view === "landing" ? (
          <section className="hero">
            <span className="chip">Live website builder</span>
            <h1 className="title">Describe it. Watch it appear.</h1>
            <p className="sub">Open chat and start building your site in seconds.</p>
            <div className="actions">
              <button className="btn btn-primary" onClick={() => setView("dashboard")}>Open dashboard</button>
              <button className="btn btn-ghost">Open chat</button>
            </div>
          </section>
        ) : (
          <section className="dash">
            <div className="dash-head">
              <div>
                <p className="chip">Workspace</p>
                <h2 className="dash-title">Your projects</h2>
              </div>
              <button className="btn btn-ghost" onClick={() => setView("landing")}>Back</button>
            </div>

            <div className="stats">
              <div className="stat"><div className="k">3</div><div className="l">Projects</div></div>
              <div className="stat"><div className="k">2</div><div className="l">Live</div></div>
              <div className="stat"><div className="k">12</div><div className="l">Prompts today</div></div>
            </div>

            <div className="project-list">
              {projects.map((p) => (
                <div className="project" key={p.name}>
                  <div>
                    <div className="project-name">{p.name}</div>
                    <div className="project-meta">Updated {p.updated}</div>
                  </div>
                  <span className="chip">{p.status}</span>
                </div>
              ))}
              <button className="btn btn-primary">+ New project</button>
            </div>
          </section>
        )}
      </main>

      <DevChatOverlay
        url={`${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}/relay-ws`}
        secret={import.meta.env.VITE_DEVCHAT_SECRET}
        token={new URLSearchParams(window.location.search).get("devchatToken") ?? undefined}
      />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
