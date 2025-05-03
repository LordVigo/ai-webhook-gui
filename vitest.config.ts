import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vitest Configuration
 * 
 * This configuration sets up the testing environment with:
 * - React support for testing components
 * - Path aliases matching the main application
 * - Global test setup and teardown
 * - Coverage reporting
 * - Environment configuration
 * 
 * @see {@link https://vitest.dev/config/}
 */
export default defineConfig({
  plugins: [react()],

  /**
   * Test configuration
   */
  test: {
    /**
     * Global setup files
     * - vitest.setup.ts: Sets up testing environment and global mocks
     */
    setupFiles: ['./vitest.setup.ts'],

    /**
     * Environment configuration
     * - Use jsdom for browser-like environment
     * - Enables DOM manipulation and browser APIs
     */
    environment: 'jsdom',

    /**
     * Coverage configuration
     * - Uses v8 for coverage collection
     * - Includes all source files
     * - Excludes test and configuration files
     */
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/vite-env.d.ts',
        'src/main.tsx'
      ]
    },

    /**
     * Include source maps for better error reporting
     */
    includeSource: ['src/**/*.{ts,tsx}'],

    /**
     * Global test configuration
     */
    globals: true,
    
    /**
     * Timeout for individual tests (5 seconds)
     */
    testTimeout: 5000,
    
    /**
     * Maximum number of concurrent tests
     */
    maxConcurrency: 10
  },

  /**
   * Path resolution configuration
   * - Matches the application's path aliases
   */
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
