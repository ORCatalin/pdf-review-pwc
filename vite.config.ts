import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/pdf-review-pwc/', // Replace 'pdf-review-pwc' with your actual repository name
})
