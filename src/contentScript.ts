/**
 * Content script for injecting the visualization overlay.
 */
document.addEventListener('SHOW_HISTORY_VISUALIZER', () => {
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

window.addEventListener('message', (event) => {
  if (event.data === 'CLOSE_HISTORY_VISUALIZER') {
    const iframe = document.getElementById('history-visualizer-overlay');
    if (iframe) {
      iframe.remove();
    }
  }
});
