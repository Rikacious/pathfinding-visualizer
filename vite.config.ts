import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'   // <-- add this

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwind()],          // <-- and this
})
