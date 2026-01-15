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
      '@context': resolve('src/screens/output-render/context'),
      '@outputStyles': resolve('src/screens/output-render/styles-hook'),
      '@outputRegressionCommon': resolve('src/screens/output-render/analyze/regression/common'),
      '@outputPrintReport': resolve('src/screens/output-render/print-report'),
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
      ignored: ['**/src-tauri/**', '**/stat-pro-logs/**'],
    },
  },
}));
