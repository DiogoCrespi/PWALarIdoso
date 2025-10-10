import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@electron': resolve(__dirname, './electron')
    }
  },
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist'
  }
});


