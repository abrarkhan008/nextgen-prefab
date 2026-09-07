import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './', // relative paths needed for Capacitor's file:// webview
  plugins: [react()],
})
