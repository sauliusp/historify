/**
 * Main overlay component that contains the dashboard.
 */
import React from 'react';
import {Dashboard} from './Dashboard';

/**
 * Overlay component that displays the visualization dashboard.
 */
export const Overlay: React.FC = () => {
  /**
   * Handles closing the overlay.
   */
  const handleClose = () => {
    // Send message that content script can intercept
    window.parent.postMessage({type: 'TOGGLE_OVERLAY'}, '*');
  };

  return (
    <div className="overlay">
      <div className="overlay-header">
        <h1>History Visualizer</h1>
        <button className="close-button" onClick={handleClose}>
          ×
        </button>
      </div>
      <div className="overlay-content">
        <Dashboard />
      </div>
    </div>
  );
};
