import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { spawn } from 'child_process';
import http from 'http';

function backendPlugin(): Plugin {
  return {
    name: 'backend-starter',
    configureServer() {
      const req = http.get('http://127.0.0.1:8001/api/health', () => {
        console.log('[backend] Backend API is already running on 127.0.0.1:8001');
      });
      req.on('error', () => {
        console.log('[backend] Spawning Python SQLite REST backend on 127.0.0.1:8001...');
        const pyServer = spawn('python3', ['backend/server.py', '8001'], {
          stdio: 'inherit',
          detached: false,
        });
        pyServer.on('error', (err) => {
          console.error('[backend] Failed to spawn Python backend process:', err);
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), backendPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8001',
          changeOrigin: true,
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
