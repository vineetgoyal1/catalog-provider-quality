import leanix from '@sap/vite-plugin-leanix-custom-report';
import react from '@vitejs/plugin-react';
// @ts-check
import { defineConfig } from 'vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), leanix()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
