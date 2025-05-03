/**
 * PostCSS Configuration
 * 
 * This configuration sets up the PostCSS plugins used in the project:
 * 
 * 1. tailwindcss: A utility-first CSS framework
 *    - Processes Tailwind CSS directives
 *    - Generates utility classes
 *    - Handles responsive design utilities
 *    - Manages custom theme configuration
 * 
 * 2. autoprefixer: Automatically adds vendor prefixes to CSS rules
 *    - Ensures cross-browser compatibility
 *    - Adds necessary prefixes based on browserslist config
 *    - Handles modern CSS features
 * 
 * @type {import('postcss').Config}
 */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
