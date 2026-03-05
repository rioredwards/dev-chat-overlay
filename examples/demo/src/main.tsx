import React from "react";
import { createRoot } from "react-dom/client";
import { DevChatOverlay } from "@rio/dev-chat-widget";

function App() {
  return (
    <>
      <h1>Dev Chat Overlay Demo</h1>
      <p>
        This is a placeholder app. The chat widget is the floating button in the
        bottom-right corner. Click it to open the overlay and talk to OpenClaw.
      </p>
      <p style={{ marginTop: "0.75rem", fontSize: "0.85rem" }}>
        Try: <code>Make the heading bigger</code> or{" "}
        <code>Add a dark mode toggle</code>
      </p>
      <DevChatOverlay url="ws://localhost:18790" secret="demo-secret" />
    </>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
