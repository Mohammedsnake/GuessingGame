import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname, './'),
  publicDir: resolve(__dirname, './public'),
  base: '/NexiQ/',  // Changed from '/NexiQ.com/'
  build: {
    outDir: resolve(__dirname, './dist'),  // Changed from './src'
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    strictPort: true  // Added to prevent automatic port switching
  }
});