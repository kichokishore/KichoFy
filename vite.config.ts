import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
    server: {
    port: 5175,
    host: true, // Add this
    cors: true, // Add this
  },
  define: {
    global: 'globalThis', // Add this for Supabase compatibility
  },
  base: '/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
