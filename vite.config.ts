import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "extension/dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "src/popup.tsx"),
        app: resolve(__dirname, "src/app.tsx"), // 👈 加這行
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
});
