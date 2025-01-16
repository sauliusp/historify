/**
 * Main entry point for the React application.
 */
import React from 'react';
import {createRoot} from 'react-dom/client';
import {Overlay} from './components/Overlay';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Overlay />
    </React.StrictMode>,
  );
} 