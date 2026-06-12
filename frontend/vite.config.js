import { defineConfig } from 'vite'
import react            from '@vitejs/plugin-react'
import tailwindcss      from '@tailwindcss/vite'
import path             from 'path'

export default defineConfig({
  plugins: [tailwindcss(), react()],

  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },

  build: {
    target:    'es2020',
    sourcemap: false,
    minify:    'esbuild',
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':  ['react', 'react-dom', 'react-router-dom'],
          'vendor-query':  ['@tanstack/react-query'],
          'vendor-ui':     ['lucide-react', 'sonner'],
          'vendor-forms':  ['react-hook-form', 'zod', '@hookform/resolvers'],
          'vendor-media':  ['react-player', 'react-dropzone'],
        },
      },
    },
  },

  server: { port: 5173 },
  preview: { port: 4173 },
})