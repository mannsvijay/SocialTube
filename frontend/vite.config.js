import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'
import { dirname }       from 'path'
const __dirname = dirname(fileURLToPath(import.meta.url))
import react            from '@vitejs/plugin-react'
import tailwindcss      from '@tailwindcss/vite'
import path             from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),   // Tailwind v4 — PostCSS nahi chahiye ab
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})