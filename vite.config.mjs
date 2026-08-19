import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Относительные пути работают как в корне домена, так и в
  // https://имя.github.io/имя-репозитория/
  base: "./",
  plugins: [react()],
  build: {
    // GitHub Pages умеет публиковать эту папку прямо из ветки main.
    outDir: "docs",
    emptyOutDir: true,
  },
});
