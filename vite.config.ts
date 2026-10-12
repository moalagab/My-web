import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
  },
  plugins: [reactRouter()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
