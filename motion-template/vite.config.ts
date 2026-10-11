import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // relative base so the build works from any folder (e.g. GitHub Pages project sites)
  base: "./",
  plugins: [react()],
  server: { port: 5183 },
});
