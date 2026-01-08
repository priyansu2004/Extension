/**
 * Main Content Script - HTML to Elementor Converter Application
 * Coordinates all extension components and manages application lifecycle
 */

class ElementorConverterApp {
  constructor() {
    this.isActive = false;
    this.sidebar = null;
    this.selector = null;
    this.originalPageStyles = null;
    
    console.log('Elementor Converter App initialized');
  }

  /**
   * Initialize the extension and open sidebar
   */
  initialize() {
    if (this.isActive) {
      console.log('Extension already active');
      return;
    }

    try {
      // Store original page state
      this.storeOriginalPageState();
      
      // Create and initialize components
      this.sidebar = new window.ElementorSidebar();
      this.selector = new window.ElementSelector();
      
      // Store references globally for access from other components
      window.elementorSidebar = this.sidebar;
      window.elementorSelector = this.selector;
      
      // Set up selection change callback
      this.selector.onSelectionChange((selectedElements) => {
        console.log('Selection change received in main app:', selectedElements.length);
        this.sidebar.updateSelectionInfo(selectedElements);
      });
      
      // Create and open sidebar
      this.sidebar.create();
      this.sidebar.open();
      
      // Activate element selection
      this.selector.activate();
      
      // Mark as active
      this.isActive = true;
      
      console.log('Elementor Converter extension activated');
      
      // Show welcome message
      if (window.ExportManager) {
        setTimeout(() => {
          window.ExportManager.showNotification('Extension activated! Click elements to select them.', 'success', 4000);
        }, 1000);
      }
      
    } catch (error) {
      console.error('Failed to initialize extension:', error);
      this.cleanup();
    }
  }

  /**
   * Store original page state for restoration
   */
  storeOriginalPageState() {
    this.originalPageStyles = {
      marginRight: document.body.style.marginRight,
      transition: document.body.style.transition,
      overflow: document.body.style.overflow
    };
  }

  /**
   * Restore original page state
   */
  restoreOriginalPageState() {
    if (this.originalPageStyles) {
      Object.assign(document.body.style, this.originalPageStyles);
      this.originalPageStyles = null;
    }
  }

  /**
   * Close sidebar and deactivate extension
   */
  closeSidebar() {
    if (!this.isActive) {
      console.log('Extension not active');
      return;
    }

    try {
      console.log('Closing Elementor Converter extension');
      
      // Show closing message
      if (window.ExportManager) {
        window.ExportManager.showNotification('Extension deactivated', 'success', 2000);
      }
      
      // Deactivate components
      if (this.selector) {
        this.selector.deactivate();
      }
      
      if (this.sidebar) {
        this.sidebar.close();
      }
      
      // Clean up after short delay to allow animations
      setTimeout(() => {
        this.cleanup();
      }, 500);
      
    } catch (error) {
      console.error('Error closing sidebar:', error);
      this.cleanup();
    }
  }

  /**
   * Complete cleanup of extension
   */
  cleanup() {
    console.log('Cleaning up Elementor Converter extension');
    
    try {
      // Deactivate selector
      if (this.selector) {
        this.selector.deactivate();
        this.selector = null;
      }
      
      // Destroy sidebar
      if (this.sidebar) {
        this.sidebar.destroy();
        this.sidebar = null;
      }
      
      // Restore page state
      this.restoreOriginalPageState();
      
      // Remove global references
      delete window.elementorSidebar;
      delete window.elementorSelector;
      delete window.elementorConverter;
      
      // Mark as inactive
      this.isActive = false;
      
      console.log('Extension cleanup completed');
      
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  /**
   * Get extension status
   */
  getStatus() {
    return {
      isActive: this.isActive,
      selectedElementsCount: this.selector ? this.selector.getSelectedElements().length : 0,
      sidebarOpen: this.sidebar ? this.sidebar.isOpen : false
    };
  }

  /**
   * Toggle extension state
   */
  toggle() {
    if (this.isActive) {
      this.closeSidebar();
    } else {
      this.initialize();
    }
  }
}

// Utility function to check if extension dependencies are loaded
function checkDependencies() {
  const required = [
    'CSSExtractor',
    'ElementorMapper', 
    'ExportManager',
    'ElementSelector',
    'ElementorSidebar'
  ];
  
  const missing = required.filter(dep => !window[dep]);
  
  if (missing.length > 0) {
    console.error('Missing dependencies:', missing);
    return false;
  }
  
  return true;
}

// Function to safely initialize the extension
function initializeExtensionSafely() {
  // Check if we're in a valid context
  if (!document.body) {
    console.log('Document body not ready, retrying...');
    setTimeout(initializeExtensionSafely, 100);
    return;
  }
  
  // Check for extension conflicts
  if (document.getElementById('elementor-converter-sidebar')) {
    console.log('Extension already running');
    return;
  }
  
  // Check dependencies
  if (!checkDependencies()) {
    console.error('Extension dependencies not loaded');
    return;
  }
  
  try {
    // Create app instance
    window.elementorConverter = new ElementorConverterApp();
    window.elementorConverter.initialize();
  } catch (error) {
    console.error('Failed to initialize extension:', error);
  }
}

// Error handling for the entire extension
window.addEventListener('error', (event) => {
  if (event.error && event.error.stack && event.error.stack.includes('elementor')) {
    console.error('Extension error:', event.error);
    
    // Try to cleanup on critical errors
    if (window.elementorConverter) {
      window.elementorConverter.cleanup();
    }
  }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
  if (window.elementorConverter) {
    window.elementorConverter.cleanup();
  }
});

// Handle visibility change (tab switching)
document.addEventListener('visibilitychange', () => {
  if (document.hidden && window.elementorConverter && window.elementorConverter.isActive) {
    // Temporarily deactivate selection mode when tab is hidden
    if (window.elementorSelector) {
      window.elementorSelector.deactivate();
    }
  } else if (!document.hidden && window.elementorConverter && window.elementorConverter.isActive) {
    // Reactivate when tab becomes visible
    if (window.elementorSelector) {
      window.elementorSelector.activate();
    }
  }
});

// Message handling for communication with background script
chrome.runtime.onMessage?.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'TOGGLE_EXTENSION':
      if (window.elementorConverter) {
        window.elementorConverter.toggle();
      } else {
        initializeExtensionSafely();
      }
      sendResponse({ success: true });
      break;
      
    case 'GET_STATUS':
      const status = window.elementorConverter ? window.elementorConverter.getStatus() : { isActive: false };
      sendResponse(status);
      break;
      
    case 'CLOSE_EXTENSION':
      if (window.elementorConverter) {
        window.elementorConverter.closeSidebar();
      }
      sendResponse({ success: true });
      break;
      
    default:
      console.log('Unknown message:', message);
  }
  
  return true; // Keep channel open for async responses
});

// Development helpers (only in development mode)
if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
  // Add global debug helpers
  window.debugElementorConverter = {
    getApp: () => window.elementorConverter,
    getSelector: () => window.elementorSelector,
    getSidebar: () => window.elementorSidebar,
    getSelectedElements: () => window.elementorSelector?.getSelectedElements() || [],
    clearSelections: () => window.elementorSelector?.clearSelections(),
    exportJSON: async () => {
      const elements = window.elementorSelector?.getSelectedElements() || [];
      return await window.ExportManager?.exportAsElementorJSON(elements);
    }
  };
  
  console.log('Elementor Converter debug helpers available at window.debugElementorConverter');
}

// Make app class available globally
window.ElementorConverterApp = ElementorConverterApp;

console.log('Elementor Converter content script loaded');

// Auto-initialize if triggered by extension action (background script will call toggleElementorSidebar)
// This is handled by the background script injection