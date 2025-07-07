import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'extension/dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'content-script': resolve(__dirname, 'src/content-script.tsx'),
      },
      output: {
        entryFileNames: '[name].js', // 產生 content-script.js
      }
    },
    chunkSizeWarningLimit: 1000,
  },
});
