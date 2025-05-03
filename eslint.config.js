/**
 * ESLint Configuration
 * 
 * This configuration sets up linting rules for:
 * - TypeScript
 * - React
 * - React Hooks
 * - JSX Accessibility
 * - Import/Export syntax
 * - Code style and formatting
 */

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y';
import eslintPluginImport from 'eslint-plugin-import';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    /**
     * Project settings
     */
    settings: {
      react: {
        version: 'detect', // Auto-detect React version
      },
    },

    /**
     * Linting rules configuration
     */
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/explicit-function-return-type': ['error', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],

      // React rules
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/prop-types': 'off', // We use TypeScript for props validation
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/jsx-filename-extension': ['error', {
        extensions: ['.tsx'],
      }],

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Accessibility rules
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',

      // Import/Export rules
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/default': 'error',
      'import/namespace': 'error',
      'import/order': ['error', {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      }],

      // Code style rules
      'no-console': ['warn', {
        allow: ['warn', 'error'],
      }],
      'no-debugger': 'warn',
      'no-alert': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
    },

    /**
     * Parser configuration
     */
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },

    /**
     * Plugin configuration
     */
    plugins: [
      '@typescript-eslint',
      'react',
      'react-hooks',
      'jsx-a11y',
      'import',
    ],

    /**
     * Environment configuration
     */
    env: {
      browser: true,
      es2022: true,
      node: true,
    },

    /**
     * Files to ignore
     */
    ignorePatterns: [
      'dist/',
      'node_modules/',
      'coverage/',
      '*.config.js',
      '*.config.ts',
      'vite.config.ts',
      'vitest.config.ts',
    ],
  },
);
