/// <reference path="./vite.config.env.d.ts" />
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
