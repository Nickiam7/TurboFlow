import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'TurboFlow',
      formats: ['es', 'umd'],
      fileName: (format) => `turboflow.${format}.js`
    },
    rollupOptions: {
      external: ['@hotwired/turbo'],
      output: {
        globals: {
          '@hotwired/turbo': 'Turbo'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'turboflow.css'
          }
          return assetInfo.name
        }
      }
    },
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.js'
  }
})
