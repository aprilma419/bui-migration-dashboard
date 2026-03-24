import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative asset paths so `dist/index.html` works when opened via file://
  base: './',
  plugins: [react()],
});
