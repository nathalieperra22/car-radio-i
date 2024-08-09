import { defineConfig } from 'vite';

export default defineConfig({
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