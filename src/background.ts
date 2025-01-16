/**
 * Background script for the Chrome extension.
 */
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.scripting.executeScript({
      target: {tabId: tab.id},
      func: () => {
        if (!document.getElementById('history-visualizer-overlay')) {
          const event = new CustomEvent('SHOW_HISTORY_VISUALIZER');
          document.dispatchEvent(event);
        }
      },
    });
  }
});
