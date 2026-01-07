/**
 * Background Service Worker
 * Manages extension lifecycle, message routing, and state management
 */

// Extension state
let extensionState = {
  isActive: false,
  currentTabId: null,
  selectedElements: [],
  projectData: null,
  enabledTabs: new Set() // Track which tabs have extension enabled
};

/**
 * Initialize extension on install
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Elementor Pro Converter installed');
    // Initialize default settings
    chrome.storage.local.set({
      settings: {
        theme: 'light',
        exportFormat: 'json',
        autoDetectAnimations: true,
        responsiveMode: true
      }
    });
  }
});

/**
 * Handle messages from content scripts and popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { action, data } = message;

  switch (action) {
    case 'TOGGLE_EXTENSION':
      // Get active tab if sender.tab is not available (popup context)
      if (sender.tab && sender.tab.id) {
        handleToggleExtension(sender.tab.id, data.enabled).then(() => {
          sendResponse({ success: true });
        });
      } else {
        // Get active tab from popup
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            handleToggleExtension(tabs[0].id, data.enabled).then(() => {
              sendResponse({ success: true });
            });
          } else {
            sendResponse({ success: false, error: 'No active tab' });
          }
        });
        return true; // Async response
      }
      return true; // Async response
      break;

    case 'GET_STATE':
      sendResponse({ state: extensionState });
      break;

    case 'SAVE_PROJECT':
      saveProject(data);
      sendResponse({ success: true });
      break;

    case 'LOAD_PROJECT':
      loadProject(data.projectId).then(project => {
        sendResponse({ success: true, project });
      });
      return true; // Async response

    case 'EXPORT_DATA':
      handleExport(data);
      sendResponse({ success: true });
      break;

    case 'UPDATE_SELECTED_ELEMENTS':
      extensionState.selectedElements = data.elements;
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }

  return true; // Keep message channel open for async responses
});

/**
 * Toggle extension on/off for a tab
 */
async function handleToggleExtension(tabId, enabled) {
  extensionState.isActive = enabled;
  extensionState.currentTabId = tabId;

  if (enabled) {
    extensionState.enabledTabs.add(tabId);
    
    // Store state in storage for persistence
    await chrome.storage.local.set({ 
      extensionActive: true,
      currentTabId: tabId 
    });

    // Ensure content scripts are injected
    try {
      // Inject content scripts if not already present
      await chrome.scripting.executeScript({
        target: { tabId },
        files: [
          'utils/dom-analyzer.js',
          'utils/style-extractor.js', 
          'utils/elementor-mapper.js',
          'utils/export-handler.js'
        ]
      }).catch(() => {
        // Scripts might already be injected, ignore error
      });
      
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      }).catch(() => {
        // Content script might already be injected
      });

      // Inject CSS
      await chrome.scripting.insertCSS({
        target: { tabId },
        files: ['styles/content.css']
      }).catch(() => {
        // CSS might already be injected
      });

      // Wait a bit then activate
      setTimeout(() => {
        chrome.tabs.sendMessage(tabId, {
          action: 'ACTIVATE_SELECTION_MODE'
        }).catch(err => {
          console.error('Error sending activate message:', err);
        });
      }, 100);
      
    } catch (error) {
      console.error('Error activating extension:', error);
    }
  } else {
    extensionState.enabledTabs.delete(tabId);
    
    // Update storage
    await chrome.storage.local.set({ 
      extensionActive: false
    });

    // Deactivate selection mode
    try {
      chrome.tabs.sendMessage(tabId, {
        action: 'DEACTIVATE_SELECTION_MODE'
      }).catch(err => {
        console.error('Error sending deactivate message:', err);
      });
    } catch (error) {
      console.error('Error deactivating extension:', error);
    }
  }
}

/**
 * Save project to IndexedDB via storage API
 */
async function saveProject(projectData) {
  const projectId = projectData.id || `project_${Date.now()}`;
  const project = {
    id: projectId,
    ...projectData,
    savedAt: new Date().toISOString()
  };

  try {
    const { projects = [] } = await chrome.storage.local.get('projects');
    const existingIndex = projects.findIndex(p => p.id === projectId);
    
    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.push(project);
    }

    await chrome.storage.local.set({ projects });
    extensionState.projectData = project;
    console.log('Project saved:', projectId);
  } catch (error) {
    console.error('Error saving project:', error);
  }
}

/**
 * Load project from storage
 */
async function loadProject(projectId) {
  try {
    const { projects = [] } = await chrome.storage.local.get('projects');
    const project = projects.find(p => p.id === projectId);
    return project || null;
  } catch (error) {
    console.error('Error loading project:', error);
    return null;
  }
}

/**
 * Handle export requests
 */
function handleExport(data) {
  // Export is handled by content script, this is just for logging
  console.log('Export requested:', data.format);
}

/**
 * Handle tab updates
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && extensionState.enabledTabs.has(tabId)) {
    // Re-inject if page reloaded and extension was enabled on this tab
    await handleToggleExtension(tabId, true);
  }
});

/**
 * Clean up when tabs are removed
 */
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  extensionState.enabledTabs.delete(tabId);
  if (extensionState.currentTabId === tabId) {
    extensionState.isActive = false;
    extensionState.currentTabId = null;
  }
});

/**
 * Check extension state when tab becomes active
 */
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const { extensionActive } = await chrome.storage.local.get(['extensionActive']);
  if (extensionActive && extensionState.enabledTabs.has(activeInfo.tabId)) {
    extensionState.isActive = true;
    extensionState.currentTabId = activeInfo.tabId;
  } else {
    extensionState.isActive = false;
  }
});
