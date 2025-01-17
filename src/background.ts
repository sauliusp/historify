/**
 * Background script for the Chrome extension.
 */
chrome.action.onClicked.addListener((tab) => {
  console.log('onClicked');

  if (tab.id) {
    chrome.scripting.executeScript({
      target: {tabId: tab.id},
      func: () => {
        document.dispatchEvent(new CustomEvent('TOGGLE_OVERLAY'));
      },
    });
  }
});
