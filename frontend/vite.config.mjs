import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    vue()
  ],
  server: { port: 8081 }
});
