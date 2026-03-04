import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  base: '/k-medians-demo/',
  server: {
    port: 5173,
    open: true
  }
});
