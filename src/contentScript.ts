/**
 * Content script for injecting the visualization overlay.
 */
document.addEventListener('TOGGLE_OVERLAY', () => {
  const existingIframe = document.getElementById('history-visualizer-overlay');

  if (existingIframe) {
    existingIframe.remove();
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'history-visualizer-overlay';
  iframe.src = chrome.runtime.getURL('index.html');

  Object.assign(iframe.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    border: 'none',
    zIndex: '2147483647',
  });

  document.body.appendChild(iframe);
});

// Add message event listener to handle iframe communication
window.addEventListener('message', (event) => {
  if (event.data.type === 'TOGGLE_OVERLAY') {
    document.dispatchEvent(new CustomEvent('TOGGLE_OVERLAY'));
  }
});
