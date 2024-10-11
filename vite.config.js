import { defineConfig } from 'vite';

export default defineConfig({
  base: '/car-radio-i/',
  server: {
    proxy: {
      '/stream': {
        target: 'http://www.ednixon.com:8120/stream', 
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/stream/, ''),
      },
    },
  },
});