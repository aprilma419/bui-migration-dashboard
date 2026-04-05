import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** GitHub project Pages is served under /<repo>/; Actions sets GITHUB_REPOSITORY=owner/repo. */
function viteBase() {
  if (process.env.GITHUB_ACTIONS === 'true') {
    const repo = process.env.GITHUB_REPOSITORY?.split('/')?.[1];
    if (repo) return `/${repo}/`;
  }
  // Local dev / file:// friendly builds
  return './';
}

export default defineConfig({
  base: viteBase(),
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
});
