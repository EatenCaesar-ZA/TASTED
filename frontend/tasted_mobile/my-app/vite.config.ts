/**
 * Vite config — Dev server and React SWC plugin
 *
 * Notes:
 * - Proxy /api to Django during development to avoid CORS headaches
 * - In production, set VITE_API_URL and let frontend call backend directly
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
