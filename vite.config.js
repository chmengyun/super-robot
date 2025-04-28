import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    minify: false,
    terserOptions: {
      compress: {
        drop_console: false,
      }
    }
  },
  server: {
    port: 5000,
    host: '0.0.0.0',
  }
})
