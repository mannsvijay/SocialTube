import { defineConfig } from 'vite'
import react            from '@vitejs/plugin-react'
import tailwindcss      from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

// vendor chunk name -> packages that go into it
const VENDOR_CHUNKS = {
  'vendor-react':  ['react', 'react-dom', 'react-router', 'react-router-dom', 'scheduler'],
  'vendor-query':  ['@tanstack/react-query', '@tanstack/query-core'],
  'vendor-ui':     ['lucide-react', 'sonner'],
  'vendor-forms':  ['react-hook-form', 'zod', '@hookform/resolvers'],
  'vendor-media':  ['react-player', 'react-dropzone'],
}

export default defineConfig({
  plugins: [tailwindcss(), react()],

  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },

  build: {
    target:    'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Vite 8 (Rolldown) only accepts manualChunks as a function
        manualChunks(id) {
          // normalise windows paths, then take the path after the last node_modules/
          const pkg = id.replace(/\\/g, '/').split('node_modules/').slice(1).pop()
          if (!pkg) return
          for (const [chunk, packages] of Object.entries(VENDOR_CHUNKS)) {
            if (packages.some(name => pkg.startsWith(name + '/'))) return chunk
          }
        },
      },
    },
  },

  server: { port: 5173 },
  preview: { port: 4173 },
})