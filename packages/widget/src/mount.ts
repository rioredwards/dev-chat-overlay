import type { DevChatConfig } from "./types.js";

export function mountDevChat(config: DevChatConfig): () => void {
  if (process.env.NODE_ENV !== "development") {
    return () => {};
  }

  const container = document.createElement("div");
  container.id = "__dco-root";
  document.body.appendChild(container);

  Promise.all([
    import("react"),
    import("react-dom/client"),
    import("./widget/DevChatOverlay.js"),
  ]).then(([React, { createRoot }, { DevChatOverlay }]) => {
    const root = createRoot(container);
    root.render(React.createElement(DevChatOverlay, config));
  });

  return () => {
    container.remove();
  };
}
