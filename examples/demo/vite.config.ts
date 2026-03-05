import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      "/relay-ws": {
        target: "ws://127.0.0.1:18790",
        ws: true,
        rewriteWsOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@rio/dev-chat-widget": path.resolve(__dirname, "../../packages/widget/src/index.ts"),
    },
  },
});
