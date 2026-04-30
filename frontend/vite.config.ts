// Workaround: declare module 'vite' to avoid "Cannot find module 'vite' or its corresponding type declarations"
// when the 'vite' types are not installed in the environment.
declare module 'vite';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
})
