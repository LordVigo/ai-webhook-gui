import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';

/**
 * Vitest Global Setup
 * 
 * This file configures the global test environment by:
 * 1. Adding jest-dom matchers for DOM testing
 * 2. Setting up global mocks for browser APIs
 * 3. Configuring test environment variables
 */

/**
 * Mock IndexedDB for database testing
 */
const indexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn()
};

/**
 * Mock Web Crypto API for encryption
 */
const crypto = {
  subtle: {
    encrypt: vi.fn(),
    decrypt: vi.fn(),
    generateKey: vi.fn()
  },
  getRandomValues: vi.fn()
};

/**
 * Mock environment variables
 */
const env = {
  VITE_ENCRYPTION_KEY: 'test-encryption-key',
  MODE: 'test'
};

/**
 * Configure global test environment
 */
Object.defineProperty(window, 'indexedDB', {
  value: indexedDB,
  writable: true
});

Object.defineProperty(window, 'crypto', {
  value: crypto,
  writable: true
});

Object.defineProperty(import.meta, 'env', {
  value: env,
  writable: true
});

/**
 * Mock console methods to prevent noise in test output
 * while still allowing important messages
 */
const originalConsole = Object.assign({}, console);
console.warn = vi.fn((...args) => {
  if (args[0]?.includes('IMPORTANT:')) {
    originalConsole.warn(...args);
  }
});

console.error = vi.fn((...args) => {
  if (args[0]?.includes('CRITICAL:')) {
    originalConsole.error(...args);
  }
});

/**
 * Mock ResizeObserver
 */
class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

window.ResizeObserver = ResizeObserver as unknown as typeof window.ResizeObserver;

/**
 * Mock IntersectionObserver
 */
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '0px';
  readonly thresholds: ReadonlyArray<number> = [0];
  
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
}

window.IntersectionObserver = MockIntersectionObserver as unknown as typeof window.IntersectionObserver;

/**
 * Mock fetch API
 */
global.fetch = vi.fn();

/**
 * Clean up after each test
 */
afterEach(() => {
  vi.clearAllMocks();
  indexedDB.open.mockReset();
  indexedDB.deleteDatabase.mockReset();
  crypto.subtle.encrypt.mockReset();
  crypto.subtle.decrypt.mockReset();
  crypto.subtle.generateKey.mockReset();
  crypto.getRandomValues.mockReset();
  (global.fetch as any).mockReset();
});
