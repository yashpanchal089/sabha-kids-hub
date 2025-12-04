import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Use short root path in dev, GitHub Pages project path in production
  base: mode === "production" ? "/sabha-kids-hub/" : "/",
  server: {
    host: "::",
    port: 8081,
    strictPort: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
