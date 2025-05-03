/// <reference types="vite/client" />

/**
 * Environment Variables Type Declarations
 * 
 * This file defines TypeScript types for environment variables used in the application.
 * It extends the ImportMetaEnv interface to provide type safety and autocompletion
 * for environment variables accessed through import.meta.env
 */

interface ImportMetaEnv {
  /**
   * Encryption key used for securing webhook passphrases
   * @type {string}
   */
  readonly VITE_ENCRYPTION_KEY: string;

  /**
   * Base URL for API requests (optional)
   * @type {string}
   * @default "https://automation.andipopp.de"
   */
  readonly VITE_API_BASE_URL?: string;

  /**
   * Debug mode flag (optional)
   * @type {boolean}
   * @default false
   */
  readonly VITE_DEBUG_MODE?: boolean;

  /**
   * Feature flags (optional)
   */
  readonly VITE_ENABLE_VOICE_INPUT?: boolean;
  readonly VITE_ENABLE_FILE_ATTACHMENTS?: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Global Window Interface Extensions
 * 
 * These declarations extend the Window interface to include
 * custom properties and methods used in the application
 */
interface Window {
  /**
   * IndexedDB instance for database operations
   */
  indexedDB: IDBFactory;

  /**
   * Web Crypto API for encryption operations
   */
  crypto: Crypto;

  /**
   * ResizeObserver for monitoring element size changes
   */
  ResizeObserver: typeof ResizeObserver;

  /**
   * IntersectionObserver for monitoring element visibility
   */
  IntersectionObserver: typeof IntersectionObserver;
}
