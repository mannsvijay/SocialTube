import { defineConfig } from 'vite'
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