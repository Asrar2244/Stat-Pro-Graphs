import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { comlink } from 'vite-plugin-comlink';
// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react(), comlink()],
  worker: {
    plugins: () => [comlink()],
  },
  resolve: {
    alias: {
      '@libs': resolve('src/libs'),
      '@hooks': resolve('src/hooks'),
      '@constants': resolve('src/constants'),
      '@backend': resolve('src/backend'),
      '@utils': resolve('src/utils'),
      '@store': resolve('src/store'),
      '@workers': resolve('src/workers'),
    },
  },
  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**', '**/start-pro-logs/**'],
    },
    // 4. Add proxy to handle CORS issues
    proxy: {
      '/api': {
        target: 'http://100.111.65.109:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/sample_size': {
        target: 'http://100.111.65.109:5000',
        changeOrigin: true,
        secure: false,
      },
      // Add proxy for 127.0.0.1 as well
      '/api-127': {
        target: 'http://100.111.65.109:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-127/, '/api'),
      },
      '/sample_size-127': {
        target: 'http://100.111.65.109:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/sample_size-127/, '/sample_size'),
      },
    },
  },
}));
