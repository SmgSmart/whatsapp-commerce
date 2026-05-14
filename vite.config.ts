import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
        configure: (proxy, _options) => {
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            // Log when cookies are being sent back from the server
            const sc = proxyRes.headers['set-cookie'];
            if (sc) {
              console.log('Backend sent cookies:', sc);
            }
          });
        },
      },
    },
  },
  optimizeDeps: {
    include: ['lucide-react'],
  },
});
