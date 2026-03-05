import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@rio/dev-chat-widget": path.resolve(__dirname, "../../packages/widget/src/index.ts"),
    },
  },
});
