import type { DevChatConfig } from "./types.js";

export function mountDevChat(config: DevChatConfig): () => void {
  if (process.env.NODE_ENV !== "development") {
    return () => {};
  }

  const container = document.createElement("div");
  container.id = "__dco-root";
  document.body.appendChild(container);

  let rootRef: import("react-dom/client").Root | null = null;

  Promise.all([
    import("react"),
    import("react-dom/client"),
    import("./widget/DevChatOverlay.js"),
  ]).then(([React, { createRoot }, { DevChatOverlay }]) => {
    rootRef = createRoot(container);
    rootRef.render(React.createElement(DevChatOverlay, config));
  });

  return () => {
    rootRef?.unmount();
    container.remove();
  };
}
