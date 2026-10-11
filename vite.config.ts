import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths, so the built files work from any folder on the Cloudways server.
  base: './',
  plugins: [react()],
})
