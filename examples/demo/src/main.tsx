import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { DevChatOverlay } from "@rio/dev-chat-widget";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "demo-theme";

const themeVars: Record<Theme, Record<string, string>> = {
  light: {
    "--bg": "#0a2841",
    "--text": "#e7f7ff",
    "--muted": "#c2dce8",
    "--card": "rgba(8, 35, 56, 0.55)",
    "--card-border": "rgba(125, 210, 255, 0.28)",
    "--primary": "#77e8ff",
    "--primary-ink": "#093244",
    "--accent": "#80ffaa",
    "--button-green": "#46d987",
    "--button-green-ink": "#063b22",
    "--surface": "rgba(5, 25, 39, 0.62)",
  },
  dark: {
    "--bg": "#041827",
    "--text": "#dbf2ff",
    "--muted": "#9dc3d8",
    "--card": "rgba(2, 18, 31, 0.62)",
    "--card-border": "rgba(108, 186, 230, 0.26)",
    "--primary": "#6ccff6",
    "--primary-ink": "#032131",
    "--accent": "#6df2b6",
    "--button-green": "#37c876",
    "--button-green-ink": "#032e1a",
    "--surface": "rgba(2, 14, 24, 0.76)",
  },
};

const fishSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
  <defs>
    <linearGradient id="water" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#24bff2"/>
      <stop offset="100%" stop-color="#175bb6"/>
    </linearGradient>
  </defs>
  <rect width="640" height="360" fill="url(#water)" rx="24"/>
  <g>
    <animateTransform attributeName="transform" type="translate" values="0 0; 16 -6; 32 0; 16 6; 0 0" dur="3.2s" repeatCount="indefinite" />
    <g>
      <animateTransform attributeName="transform" type="rotate" values="0 300 180; 1.5 300 180; 0 300 180; -1.5 300 180; 0 300 180" dur="3.2s" repeatCount="indefinite" />
      <ellipse cx="300" cy="180" rx="140" ry="80" fill="#f97316"/>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="0 430 180; 7 430 180; 0 430 180; -7 430 180; 0 430 180" dur="0.8s" repeatCount="indefinite" />
        <polygon points="430,180 520,120 520,240" fill="#fb923c"/>
      </g>
      <circle cx="250" cy="165" r="10" fill="#111827"/>
      <path d="M210 210 C230 225 260 225 280 210" stroke="#111827" stroke-width="6" fill="none" stroke-linecap="round"/>
      <rect x="265" y="105" width="28" height="150" fill="#fff" opacity="0.92"/>
      <rect x="330" y="110" width="24" height="140" fill="#fff" opacity="0.92"/>
      <rect x="188" y="122" width="20" height="116" fill="#fff" opacity="0.92"/>
    </g>
  </g>
</svg>
`;

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.background = themeVars[theme]["--bg"];
    document.body.style.color = themeVars[theme]["--text"];
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const vars = themeVars[theme];
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const nextTheme = useMemo<Theme>(() => (theme === "light" ? "dark" : "light"), [theme]);

  return (
    <div className="ocean-app">
      <style>{`
        :root {
          color-scheme: dark;
          --bg: #041827;
          --text: #dbf2ff;
          --muted: #9dc3d8;
          --card: rgba(2, 18, 31, 0.62);
          --card-border: rgba(108, 186, 230, 0.26);
          --primary: #6ccff6;
          --primary-ink: #032131;
          --accent: #6df2b6;
          --button-green: #37c876;
          --button-green-ink: #032e1a;
          --surface: rgba(2, 14, 24, 0.76);
        }

        .ocean-app {
          position: relative;
          min-height: 100vh;
          padding: 2rem;
          box-sizing: border-box;
          overflow: hidden;
          font-family: "Trebuchet MS", "Avenir Next", "Segoe UI", sans-serif;
          color: var(--text);
          background: radial-gradient(circle at 20% 10%, rgba(136, 220, 255, 0.2), transparent 40%),
                      radial-gradient(circle at 80% 20%, rgba(102, 255, 211, 0.12), transparent 45%),
                      linear-gradient(165deg, #041827 0%, #06253a 50%, #021520 100%);
        }

        .water-blobs {
          position: absolute;
          inset: -18vmax;
          pointer-events: none;
          filter: blur(64px);
          opacity: 0.65;
          z-index: 0;
        }

        .blob {
          position: absolute;
          border-radius: 999px;
          mix-blend-mode: screen;
          animation: drift linear infinite;
        }

        .blob.one {
          width: 44vmax;
          height: 44vmax;
          left: 6%;
          top: 12%;
          background: rgba(70, 201, 255, 0.4);
          animation-duration: 28s;
        }

        .blob.two {
          width: 52vmax;
          height: 40vmax;
          right: 4%;
          top: 8%;
          background: rgba(60, 129, 255, 0.35);
          animation-duration: 34s;
          animation-direction: reverse;
        }

        .blob.three {
          width: 40vmax;
          height: 36vmax;
          left: 34%;
          bottom: 0%;
          background: rgba(109, 242, 182, 0.25);
          animation-duration: 42s;
        }

        .sunbeams {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          background:
            linear-gradient(115deg, rgba(189, 241, 255, 0.12) 0%, rgba(189, 241, 255, 0.02) 35%, transparent 60%),
            linear-gradient(110deg, rgba(157, 230, 255, 0.08) 5%, transparent 45%);
          mix-blend-mode: screen;
          opacity: 0.75;
          animation: beamPulse 11s ease-in-out infinite;
        }

        .content-shell {
          position: relative;
          z-index: 2;
          max-width: 840px;
          margin: 0 auto;
          padding: 1.6rem;
          border-radius: 1.4rem;
          background: var(--card);
          border: 1px solid var(--card-border);
          box-shadow: 0 20px 50px rgba(0, 14, 22, 0.45), inset 0 1px 0 rgba(220, 247, 255, 0.15);
          backdrop-filter: blur(16px) saturate(125%);
        }

        .title {
          margin: 0 0 0.6rem;
          font-size: clamp(2rem, 4.3vw, 3.2rem);
          letter-spacing: 0.02em;
          text-shadow: 0 0 20px rgba(111, 223, 255, 0.38);
        }

        .desc {
          margin: 0.5rem 0 0;
          color: var(--muted);
          line-height: 1.55;
        }

        .toolbar {
          display: flex;
          gap: 0.8rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }

        .btn {
          padding: 0.58rem 0.95rem;
          border-radius: 999px;
          border: 1px solid transparent;
          font-weight: 700;
          cursor: pointer;
          transition: transform 150ms ease, box-shadow 150ms ease, filter 150ms ease;
        }

        .btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.04);
        }

        .btn:active {
          transform: translateY(0px) scale(0.985);
        }

        .btn-theme {
          background: linear-gradient(135deg, var(--primary), #9ef3ff);
          color: var(--primary-ink);
          border-color: rgba(207, 246, 255, 0.55);
          box-shadow: 0 8px 24px rgba(89, 190, 245, 0.35);
        }

        .btn-green {
          background: linear-gradient(135deg, var(--button-green), #86f9b8);
          color: var(--button-green-ink);
          border-color: rgba(192, 255, 220, 0.6);
          box-shadow: 0 8px 24px rgba(44, 197, 119, 0.3);
        }

        .helper {
          margin-top: 0.9rem;
          font-size: 0.88rem;
          color: var(--muted);
        }

        .helper code {
          padding: 0.16rem 0.34rem;
          border-radius: 0.45rem;
          background: var(--surface);
          border: 1px solid rgba(136, 214, 245, 0.25);
          color: var(--text);
        }

        .fish {
          display: block;
          margin-top: 1.15rem;
          width: min(100%, 410px);
          border-radius: 0.9rem;
          border: 1px solid rgba(147, 225, 255, 0.35);
          box-shadow: 0 20px 40px rgba(2, 13, 22, 0.45);
        }

        @keyframes drift {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          33% { transform: translate3d(2.5vmax, -1.7vmax, 0) scale(1.04); }
          66% { transform: translate3d(-1.8vmax, 2.1vmax, 0) scale(0.97); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }

        @keyframes beamPulse {
          0%, 100% { opacity: 0.6; transform: translateX(0px); }
          50% { opacity: 0.85; transform: translateX(-10px); }
        }
      `}</style>

      <div className="water-blobs" aria-hidden>
        <span className="blob one" />
        <span className="blob two" />
        <span className="blob three" />
      </div>
      <div className="sunbeams" aria-hidden />

      <main className="content-shell">
        <div className="toolbar">
          <button className="btn btn-theme" onClick={() => setTheme(nextTheme)}>
            Switch to {nextTheme} mode
          </button>
          <button className="btn btn-green">I'm a button</button>
        </div>

        <h1 className="title">Clawdbot’s Underwater Lounge</h1>
        <p className="desc">
          This is a cozy submerged control room for crustaceans and curious humans.
          The chat widget is floating bottom-right, ready to help with site edits.
        </p>
        <p className="helper">
          Try: <code>Make the heading bigger</code> or <code>Add a dark mode toggle</code>
        </p>

        <img
          src={`data:image/svg+xml;utf8,${encodeURIComponent(fishSvg)}`}
          alt="A fish illustration"
          className="fish"
        />
      </main>

      <DevChatOverlay
        url={`${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}/relay-ws`}
        secret={import.meta.env.VITE_DEVCHAT_SECRET}
      />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
