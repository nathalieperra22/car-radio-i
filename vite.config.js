import { defineConfig } from 'vite';

export default defineConfig({
  base: '/car-radio-i/',
  server: {
    proxy: {
      '/stream': {
        target: 'https://securestreams4.autopo.st:1643/stream', 
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/stream/, ''),
      },
    },
  },
});