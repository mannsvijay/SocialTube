import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import postcss from './postcss.config.js'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: postcss,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})