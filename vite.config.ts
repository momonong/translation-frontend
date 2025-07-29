import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        // 複製 manifest 和 icon
        {
          src: 'extension/manifest.json',
          dest: '.'
        },
        {
          src: 'extension/icon.png',
          dest: '.'
        },
        {
          src: 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs',
          dest: 'assets'
        }
      ]
    })
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // **關鍵**：HTML 指向根目錄
        index: resolve(__dirname, 'index.html'),
        pdf: resolve(__dirname, 'pdf.html'),
        
        // **關鍵**：JS 指向 extension/ 目錄
        background: resolve(__dirname, 'extension/background.js'),
        'content-script': resolve(__dirname, 'extension/content-script.js'),
        config: resolve(__dirname, 'extension/config.js')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (['background', 'content-script', 'config'].includes(chunkInfo.name)) {
            return `assets/[name].js`;
          }
          return `assets/[name]-[hash].js`;
        }
      }
    }
  }
})