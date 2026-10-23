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
    // react-player's hls.js / dash.js chunks (~500-800kB) are only downloaded when such a stream plays
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      // dashjs (pulled in by react-player, only loaded for DASH streams) triggers a harmless warning
      // that prints its whole minified source and floods the build log
      onwarn(warning, warn) {
        const file = String(warning.id ?? warning.loc?.file ?? '')
        if (warning.code === 'COMMONJS_VARIABLE_IN_ESM' && file.includes('dashjs')) return
        warn(warning)
      },
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