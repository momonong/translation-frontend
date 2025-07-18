import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',   // ← ★這行必加！讓所有引用變成相對路徑
  plugins: [react()],
  build: {
    outDir: 'extension/dist',
    emptyOutDir: true
  }
});
