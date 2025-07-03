import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    react()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    host: true
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable sourcemaps for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          vendor: ['vue', 'react', 'react-dom'],
          capacitor: ['@capacitor/core', '@capacitor/app'],
          database: ['@capacitor-community/sqlite'],
          ui: ['lucide-react', 'tailwindcss']
        }
      }
    },
    // Optimize for mobile
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096 // Inline small assets
  },
  optimizeDeps: {
    include: [
      'vue', 
      'react', 
      'react-dom',
      '@capacitor/core',
      '@capacitor/app',
      '@capacitor-community/sqlite',
      'lucide-react',
      'axios',
      'dayjs'
    ],
    exclude: ['@capacitor/android'] // Exclude native Android code
  },
  // Mobile-specific optimizations
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false
  }
})
