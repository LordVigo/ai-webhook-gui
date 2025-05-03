import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

/**
 * Application entry point
 * 
 * This file:
 * 1. Gets the root DOM element
 * 2. Creates a React root using createRoot
 * 3. Renders the App component in StrictMode
 * 
 * StrictMode enables additional development checks and warnings:
 * - Identifying components with unsafe lifecycles
 * - Warning about legacy string ref API usage
 * - Warning about deprecated findDOMNode usage
 * - Detecting unexpected side effects
 * - Detecting legacy context API
 * - Ensuring reusable state
 */

// Get the root element and ensure it exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find root element');
}

// Create React root and render the application
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
