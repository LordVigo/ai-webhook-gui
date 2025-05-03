import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vite configuration
 * 
 * This configuration:
 * 1. Sets up React plugin for JSX/TSX support
 * 2. Configures path aliases for cleaner imports
 * 3. Configures server to listen on all network interfaces
 * 
 * @see {@link https://vitejs.dev/config/}
 */
export default defineConfig({
  /**
   * Vite plugins
   * - react: Enables React Fast Refresh and JSX support
   */
  plugins: [react()],

  /**
   * Path resolution configuration
   * - Aliases '@' to './src' for cleaner imports
   * 
   * @example
   * ```ts
   * // Instead of
   * import { something } from '../../components/Something'
   * 
   * // You can use
   * import { something } from '@/components/Something'
   * ```
   */
  resolve: {
    alias: {
      '@': path.resolve('./src'),
    },
  },

  /**
   * Development server configuration
   * - Proxies API requests to the backend server
   */
  server: {
    port: 5173,
    host: true, // Listen on all network interfaces
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        configure: (_, options) => {
          // Force IPv4
          options.agent = new (require('http').Agent)({ family: 4 });
        }
      }
    }
  }
});
