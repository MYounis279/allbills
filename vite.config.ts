import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/lesco': {
        target: 'http://www.lesco.gov.pk:36247',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/lesco/, ''),
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Content-Type', 'application/x-www-form-urlencoded');
            proxyReq.setHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7');
            proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.9');
            proxyReq.setHeader('Cache-Control', 'max-age=0');
            proxyReq.setHeader('Connection', 'keep-alive');
            proxyReq.setHeader('Origin', 'null');
            proxyReq.setHeader('Upgrade-Insecure-Requests', '1');
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
          });
        }
      },
      '/api/dha': {
        target: 'https://eservices.dhalahore.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/dha/, ''),
        secure: false
      },
      '/api/parse-dha-bill': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    },
  },
});