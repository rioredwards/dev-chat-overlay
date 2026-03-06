import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { DevChatOverlay } from "@rio/dev-chat-widget";

type Theme = "light" | "dark";

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

const quickPrompts = [
  "Make a personal portfolio",
  "Create a bakery landing page",
  "Build a startup waitlist page",
];

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === "light" ? "light" : "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    const vars = themeVars[theme];
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));

    document.body.style.margin = "0";
    document.body.style.color = vars["--text"];
    document.body.style.background = `linear-gradient(165deg, ${vars["--bg-a"]} 0%, ${vars["--bg-b"]} 100%)`;

    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const nextTheme = useMemo<Theme>(() => (theme === "dark" ? "light" : "dark"), [theme]);

  return (
    <div className="page">
      <style>{`
        * { box-sizing: border-box; }

        .page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          font-family: "SF Pro Display", "Avenir Next", "Segoe UI", system-ui, sans-serif;
          color: var(--text);
          background:
            radial-gradient(circle at 12% 12%, var(--glow-1), transparent 36%),
            radial-gradient(circle at 86% 10%, var(--glow-2), transparent 38%),
            radial-gradient(circle at 72% 84%, var(--glow-3), transparent 44%),
            linear-gradient(165deg, var(--bg-a) 0%, var(--bg-b) 100%);
        }

        .ambient {
          position: absolute;
          inset: -22vmax;
          pointer-events: none;
          filter: blur(70px);
          opacity: 0.7;
          z-index: 0;
        }

        .blob {
          position: absolute;
          border-radius: 999px;
          mix-blend-mode: screen;
          animation: drift linear infinite;
        }

        .blob.one { width: 48vmax; height: 42vmax; top: 10%; left: 4%; background: var(--glow-1); animation-duration: 30s; }
        .blob.two { width: 44vmax; height: 44vmax; top: 6%; right: 2%; background: var(--glow-2); animation-duration: 36s; }
        .blob.three { width: 42vmax; height: 34vmax; bottom: -4%; left: 24%; background: var(--glow-3); animation-duration: 33s; }

        .shell {
          position: relative;
          z-index: 1;
          max-width: 760px;
          margin: 0 auto;
          padding: 1rem 0.9rem 5rem;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.65rem 0.75rem;
          border-radius: 0.95rem;
          border: 1px solid var(--glass-border);
          background: var(--glass);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 0.52rem;
          font-weight: 700;
          font-size: 0.94rem;
        }

        .dot {
          width: 0.62rem;
          height: 0.62rem;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--primary), var(--accent));
        }

        .icon-btn {
          width: 2.1rem;
          height: 2.1rem;
          border-radius: 0.7rem;
          border: 1px solid var(--secondary-border);
          background: var(--secondary);
          color: var(--text);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 1.02rem;
        }

        .hero {
          margin-top: 0.8rem;
          border-radius: 1.2rem;
          border: 1px solid var(--glass-border);
          background: linear-gradient(155deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01));
          background-color: var(--glass);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 6px 16px rgba(20, 24, 38, 0.08);
          padding: 1.05rem;
        }

        .chip {
          display: inline-block;
          font-size: 0.74rem;
          color: var(--muted);
          border: 1px solid var(--secondary-border);
          background: var(--chip);
          border-radius: 999px;
          padding: 0.28rem 0.52rem;
        }

        .title {
          margin: 0.72rem 0 0.3rem;
          font-size: clamp(1.62rem, 8vw, 2.26rem);
          line-height: 1.08;
          letter-spacing: -0.02em;
          max-width: 12ch;
        }

        .sub {
          margin: 0;
          color: var(--muted);
          font-size: 0.98rem;
        }

        .actions {
          margin-top: 0.88rem;
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.56rem;
        }

        .btn {
          border: 1px solid transparent;
          border-radius: 0.78rem;
          font-weight: 650;
          font-size: 0.96rem;
          padding: 0.72rem 0.9rem;
          cursor: pointer;
          text-align: center;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary), var(--accent));
          color: var(--primary-ink);
          border-color: rgba(255, 196, 164, 0.4);
          box-shadow: 0 3px 10px rgba(240, 170, 120, 0.2);
        }

        .btn-ghost {
          background: var(--secondary);
          color: var(--text);
          border-color: var(--secondary-border);
        }

        .more {
          margin-top: 0.8rem;
          border: 1px solid var(--secondary-border);
          border-radius: 0.8rem;
          background: var(--chip);
          padding: 0.6rem;
        }

        .more > summary {
          cursor: pointer;
          color: var(--muted);
          font-size: 0.86rem;
          list-style: none;
        }

        .more > summary::-webkit-details-marker { display: none; }

        .prompt-list {
          margin-top: 0.55rem;
          display: grid;
          gap: 0.38rem;
        }

        .prompt {
          border: 1px solid var(--secondary-border);
          border-radius: 0.65rem;
          background: rgba(255,255,255,0.03);
          padding: 0.48rem 0.55rem;
          font-size: 0.83rem;
          color: var(--text);
        }

        @keyframes drift {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          33% { transform: translate3d(2.2vmax, -1.4vmax, 0) scale(1.03); }
          66% { transform: translate3d(-1.7vmax, 1.9vmax, 0) scale(0.98); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
      `}</style>

      <div className="ambient" aria-hidden>
        <span className="blob one" />
        <span className="blob two" />
        <span className="blob three" />
      </div>

      <main className="shell">
        <header className="topbar">
          <div className="brand">
            <span className="dot" />
            OpenClaw
          </div>
          <button
            className="icon-btn"
            aria-label={`Switch to ${nextTheme} mode`}
            title={`Switch to ${nextTheme} mode`}
            onClick={() => setTheme(nextTheme)}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </header>

        <section className="hero">
          <span className="chip">Live website builder</span>
          <h1 className="title">Describe it. Watch it appear.</h1>
          <p className="sub">Open chat and start building your site in seconds.</p>

          <div className="actions">
            <button className="btn btn-primary">Open chat</button>
            <button className="btn btn-ghost">See demo flow</button>
          </div>

          <details className="more">
            <summary>Need ideas?</summary>
            <div className="prompt-list">
              {quickPrompts.map((idea) => (
                <div className="prompt" key={idea}>{idea}</div>
              ))}
            </div>
          </details>
        </section>
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
