import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: '../public'
  },
  plugins: [vue({
    template: {
      compilerOptions: {
        // i am ignorning my custom '<container>' tag
        isCustomElement: (tag) => ['viz-filter', 'tableau-viz'].includes(tag)
      }
    }
  })],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "./src/scss/_prepend.scss";
        `
      }
    }
  }
})
