/** @type {import('tailwindcss').Config} */
module.exports = {
  /**
   * Dark mode configuration
   * - 'class': Use class-based dark mode
   * - Enables dark mode via 'dark' class on html element
   */
  darkMode: 'class',

  /**
   * Content configuration
   * - Specifies files to scan for class names
   * - Includes all TypeScript/React files in src
   * - Includes shadcn-ui component styles
   */
  content: [
    './src/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],

  /**
   * Theme configuration
   * - Extends default Tailwind theme
   * - Adds custom colors, fonts, and other design tokens
   */
  theme: {
    extend: {
      /**
       * Custom color palette
       * - Primary: Main brand colors
       * - Secondary: Supporting colors
       * - Accent: Highlight colors
       * - Background: Surface colors
       */
      colors: {
        primary: {
          DEFAULT: '#007bff',
          dark: '#0056b3',
          light: '#3395ff',
        },
        secondary: {
          DEFAULT: '#6c757d',
          dark: '#495057',
          light: '#868e96',
        },
        accent: {
          DEFAULT: '#28a745',
          dark: '#1e7e34',
          light: '#34ce57',
        },
        background: {
          DEFAULT: '#ffffff',
          dark: '#1a1a1a',
          light: '#f8f9fa',
        },
      },

      /**
       * Font configuration
       * - System font stack for optimal performance
       * - Fallback fonts for cross-platform consistency
       */
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },

      /**
       * Animation configuration
       * - Custom keyframes and durations
       */
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-in-out',
        'slide-in': 'slide-in 0.3s ease-in-out',
      },

      /**
       * Border radius configuration
       * - Consistent rounding across the application
       */
      borderRadius: {
        DEFAULT: '0.375rem',
        sm: '0.25rem',
        lg: '0.5rem',
        xl: '1rem',
      },

      /**
       * Shadow configuration
       * - Elevation levels for components
       */
      boxShadow: {
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
    },
  },

  /**
   * Plugin configuration
   * - Additional Tailwind plugins
   */
  plugins: [],
};
