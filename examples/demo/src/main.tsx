import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { DevChatOverlay } from "@rio/dev-chat-widget";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "demo-theme";

const themeVars: Record<Theme, Record<string, string>> = {
  light: {
    "--bg-a": "#0a3554",
    "--bg-b": "#031a2a",
    "--text": "#e8f6ff",
    "--muted": "#b8d5e8",
    "--glass": "rgba(6, 24, 40, 0.55)",
    "--glass-border": "rgba(154, 221, 255, 0.35)",
    "--primary": "#7ce6ff",
    "--primary-ink": "#08344a",
    "--secondary": "rgba(126, 213, 255, 0.18)",
    "--secondary-border": "rgba(149, 220, 255, 0.38)",
    "--chip": "rgba(117, 203, 250, 0.16)",
    "--chip-border": "rgba(161, 226, 255, 0.38)",
  },
  dark: {
    "--bg-a": "#051e32",
    "--bg-b": "#010d17",
    "--text": "#dff3ff",
    "--muted": "#90b9cf",
    "--glass": "rgba(4, 16, 28, 0.62)",
    "--glass-border": "rgba(108, 184, 230, 0.3)",
    "--primary": "#6dd7ff",
    "--primary-ink": "#032336",
    "--secondary": "rgba(88, 170, 216, 0.14)",
    "--secondary-border": "rgba(119, 188, 231, 0.28)",
    "--chip": "rgba(100, 173, 219, 0.14)",
    "--chip-border": "rgba(118, 190, 233, 0.3)",
  },
};

const promptIdeas = [
  "Build me a modern portfolio homepage",
  "Create a local bakery landing page with online order CTA",
  "Make a startup waitlist page with pricing section",
  "Design a clean docs page with dark mode",
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
        :root {
          color-scheme: dark;
        }

        * {
          box-sizing: border-box;
        }

        .page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          font-family: "SF Pro Display", "Avenir Next", "Segoe UI", system-ui, sans-serif;
          color: var(--text);
          background:
            radial-gradient(circle at 14% 12%, rgba(122, 222, 255, 0.22), transparent 36%),
            radial-gradient(circle at 84% 8%, rgba(85, 255, 192, 0.14), transparent 38%),
            radial-gradient(circle at 72% 84%, rgba(116, 188, 255, 0.14), transparent 44%),
            linear-gradient(165deg, var(--bg-a) 0%, var(--bg-b) 100%);
        }

        .ambient {
          position: absolute;
          inset: -24vmax;
          pointer-events: none;
          filter: blur(72px);
          opacity: 0.7;
          z-index: 0;
        }

        .blob {
          position: absolute;
          border-radius: 999px;
          mix-blend-mode: screen;
          animation: drift linear infinite;
        }

        .blob.one {
          width: 48vmax;
          height: 42vmax;
          top: 10%;
          left: 4%;
          background: rgba(58, 180, 255, 0.35);
          animation-duration: 30s;
        }

        .blob.two {
          width: 44vmax;
          height: 44vmax;
          top: 6%;
          right: 2%;
          background: rgba(83, 239, 196, 0.24);
          animation-duration: 36s;
        }

        .blob.three {
          width: 42vmax;
          height: 34vmax;
          bottom: -4%;
          left: 24%;
          background: rgba(102, 157, 255, 0.26);
          animation-duration: 33s;
        }

        .shell {
          position: relative;
          z-index: 1;
          max-width: 1080px;
          margin: 0 auto;
          padding: 1.25rem 1rem 5rem;
        }

        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.75rem 0.9rem;
          border: 1px solid var(--glass-border);
          border-radius: 1rem;
          background: var(--glass);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.01em;
        }

        .brand-dot {
          width: 0.7rem;
          height: 0.7rem;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--primary), #80ffd9);
          box-shadow: 0 0 0.7rem rgba(127, 230, 255, 0.8);
        }

        .nav-actions {
          display: flex;
          gap: 0.6rem;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .btn {
          border: 1px solid transparent;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 0.9rem;
          padding: 0.52rem 0.84rem;
          cursor: pointer;
          transition: transform 140ms ease, box-shadow 180ms ease, filter 180ms ease;
        }

        .btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.04);
        }

        .btn:active {
          transform: translateY(0px) scale(0.985);
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary), #9df7ff);
          color: var(--primary-ink);
          border-color: rgba(210, 245, 255, 0.58);
          box-shadow: 0 8px 24px rgba(95, 201, 255, 0.34);
        }

        .btn-secondary {
          background: var(--secondary);
          color: var(--text);
          border-color: var(--secondary-border);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .hero {
          margin-top: 1rem;
          border: 1px solid var(--glass-border);
          border-radius: 1.4rem;
          background: linear-gradient(155deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01));
          background-color: var(--glass);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow: 0 26px 48px rgba(2, 12, 22, 0.36);
          padding: clamp(1rem, 2.5vw, 2.2rem);
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.76rem;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          padding: 0.36rem 0.62rem;
          border-radius: 999px;
          border: 1px solid var(--chip-border);
          background: var(--chip);
          color: var(--muted);
        }

        .title {
          margin: 0.9rem 0 0.6rem;
          font-size: clamp(1.8rem, 4.6vw, 3.15rem);
          line-height: 1.06;
          letter-spacing: -0.02em;
          max-width: 14ch;
        }

        .desc {
          margin: 0;
          color: var(--muted);
          font-size: clamp(1rem, 2.05vw, 1.16rem);
          max-width: 62ch;
          line-height: 1.56;
        }

        .cta-row {
          margin-top: 1.2rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.65rem;
        }

        .grid {
          margin-top: 1.15rem;
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 0.85rem;
        }

        .card {
          border: 1px solid var(--glass-border);
          border-radius: 1rem;
          background: linear-gradient(165deg, rgba(255,255,255,0.045), rgba(255,255,255,0.012));
          background-color: rgba(3, 20, 34, 0.36);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          padding: 0.9rem;
        }

        .card h3 {
          margin: 0;
          font-size: 1rem;
          letter-spacing: 0.01em;
        }

        .card p {
          margin: 0.44rem 0 0;
          color: var(--muted);
          font-size: 0.92rem;
          line-height: 1.5;
        }

        .prompt-list {
          margin-top: 0.72rem;
          display: grid;
          gap: 0.48rem;
        }

        .prompt-chip {
          border: 1px solid var(--chip-border);
          background: var(--chip);
          color: var(--text);
          border-radius: 0.72rem;
          padding: 0.48rem 0.62rem;
          font-size: 0.84rem;
        }

        .mini-note {
          margin-top: 0.7rem;
          font-size: 0.78rem;
          color: var(--muted);
        }

        @media (max-width: 860px) {
          .grid {
            grid-template-columns: 1fr;
          }
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

      <div className="shell">
        <header className="nav">
          <div className="brand">
            <span className="brand-dot" />
            OpenClaw Playground
          </div>
          <div className="nav-actions">
            <button className="btn btn-secondary" onClick={() => setTheme(nextTheme)}>
              {nextTheme === "light" ? "Light mode" : "Dark mode"}
            </button>
            <button className="btn btn-primary">Start building</button>
          </div>
        </header>

        <section className="hero">
          <span className="eyebrow">No setup • From phone or desktop • Live preview</span>
          <h1 className="title">Build a full website by chatting.</h1>
          <p className="desc">
            This is a blank-slate builder powered by Dev Chat. Describe what you want,
            and watch your site update in real time. No coding required to get started.
            Great for non-programmers, fast prototypes, and instant idea testing.
          </p>

          <div className="cta-row">
            <button className="btn btn-primary">Open chat & begin</button>
            <button className="btn btn-secondary">See how it works</button>
          </div>

          <div className="grid">
            <article className="card">
              <h3>Your workflow</h3>
              <p>
                Chat your intent → watch visual updates live → iterate until it feels right.
                It’s the easiest on-ramp to creating a personal site, business page, or idea demo.
              </p>
              <div className="mini-note">Future direction: multi-project workspaces and hosted app instances.</div>
            </article>

            <article className="card">
              <h3>Try a prompt</h3>
              <div className="prompt-list">
                {promptIdeas.map((idea) => (
                  <div className="prompt-chip" key={idea}>{idea}</div>
                ))}
              </div>
            </article>
          </div>
        </section>
      </div>

      <DevChatOverlay
        url={`${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}/relay-ws`}
        secret={import.meta.env.VITE_DEVCHAT_SECRET}
      />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
