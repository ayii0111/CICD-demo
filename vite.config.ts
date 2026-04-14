import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  // 部署到 GitHub Pages 時，base 需設為 repo 名稱
  // 例如 repo 叫 cicd-demo，就設 '/cicd-demo/'
  // 本地開發時可改回 '/'
  base: process.env.NODE_ENV === 'production' ? '/ayii0111/' : '/',
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
