import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    vuetify()
  ],
  server: {
    port: 8081,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    },
  },
  publicDir: 'public'
});
