import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
  },
  // Vercel sets VERCEL=1 at build time; Speed Insights only exists there.
  define: {
    __ON_VERCEL__: JSON.stringify(Boolean(process.env.VERCEL)),
  },
  plugins: [reactRouter()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
