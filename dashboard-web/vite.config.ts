import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api/sales': {
          target: 'http://localhost:3003',
          rewrite: (path) => path.replace('/api', ''),
          changeOrigin: true,
        },
        '/api/branches': {
          target: 'http://localhost:3001',
          rewrite: (path) => path.replace('/api', ''),
          changeOrigin: true,
        },
      },
    },
  };
});
