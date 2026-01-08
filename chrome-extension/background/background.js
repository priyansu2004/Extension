/**
 * Background Service Worker for HTML to Elementor Converter
 * Handles communication between extension action and content scripts
 */

// Listen for extension icon clicks
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Check if we can inject into this tab
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('moz-extension://')) {
      console.log('Cannot inject into browser pages');
      return;
    }

    // Inject and execute the content script to toggle sidebar
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: toggleElementorSidebar
    });

  } catch (error) {
    console.error('Failed to inject content script:', error);
  }
});

/**
 * Function that gets injected and executed in the webpage context
 * This toggles the sidebar visibility and activation state
 */
function toggleElementorSidebar() {
  if (window.elementorConverter) {
    // If extension is already active, close it
    window.elementorConverter.closeSidebar();
  } else {
    // If extension is not active, initialize and open sidebar
    if (window.ElementorConverterApp) {
      window.elementorConverter = new window.ElementorConverterApp();
      window.elementorConverter.initialize();
    }
  }
}

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_TAB_ID':
      sendResponse({ tabId: sender.tab?.id });
      break;
      
    case 'DOWNLOAD_FILE':
      // Handle file download using Chrome Downloads API
      handleFileDownload(message.url, message.filename)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Keep message channel open for async response
      
    case 'EXTENSION_ERROR':
      console.error('Extension error:', message.error);
      break;
      
    case 'LOG_DEBUG':
      console.log('Extension debug:', message.data);
      break;
      
    default:
      console.log('Unknown message type:', message.type);
  }
  
  return true; // Keep message channel open for async responses
});

/**
 * Handle file download using Chrome Downloads API
 */
async function handleFileDownload(url, filename) {
  try {
    console.log('Background: Starting download:', { filename, url: url.substring(0, 50) + '...' });
    
    const downloadId = await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: false // Set to true if you want to show save dialog
    });
    
    console.log('Background: Download started with ID:', downloadId);
    return { success: true, downloadId: downloadId };
    
  } catch (error) {
    console.error('Background: Download failed:', error);
    return { success: false, error: error.message };
  }
}

// Handle extension installation/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('HTML to Elementor Converter installed successfully');
  } else if (details.reason === 'update') {
    console.log('HTML to Elementor Converter updated to version', chrome.runtime.getManifest().version);
  }
});