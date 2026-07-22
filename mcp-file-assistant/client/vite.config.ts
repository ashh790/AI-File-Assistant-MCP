import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxy the MCP endpoints to the server so the browser stays same-origin (no CORS).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/sse": { target: "http://localhost:3001", changeOrigin: true },
      "/messages": { target: "http://localhost:3001", changeOrigin: true },
    },
  },
});
