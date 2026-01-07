/**
 * Popup UI Controller - Simplified Version
 * Auto-activates inspect mode, single selection, clean UI
 */

class PopupController {
  constructor() {
    this.currentTab = null;
    this.selectedElement = null;
    this.init();
  }

  /**
   * Initialize popup - Auto-activate inspect mode
   */
  async init() {
    // Auto-activate inspect mode when popup opens
    await this.activateInspectMode();
    
    this.setupEventListeners();
    this.startListeningForSelection();
    
    // Update UI periodically
    setInterval(() => {
      this.updateSelectedElement();
    }, 500);
  }

  /**
   * Auto-activate inspect mode
   */
  async activateInspectMode() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tab;
      
      // Check if content script is ready
      const checkReady = () => {
        return new Promise((resolve) => {
          chrome.tabs.sendMessage(tab.id, { action: 'CHECK_CONTENT_SCRIPT' }, (response) => {
            resolve(response && response.ready);
          });
        });
      };
      
      // Wait for content script to be ready
      let retries = 0;
      while (retries < 10) {
        const ready = await checkReady();
        if (ready) {
          break;
        }
        retries++;
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Activate extension automatically
      chrome.runtime.sendMessage({
        action: 'TOGGLE_EXTENSION',
        data: { enabled: true }
      }, (response) => {
        if (response && response.success) {
          console.log('Inspect mode activated');
          // Show instruction
          this.showMessage('Click on any element to inspect it', 'info');
        }
      });
    } catch (error) {
      console.error('Error activating inspect mode:', error);
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Stop button
    document.getElementById('btn-stop').addEventListener('click', () => {
      this.stopInspectMode();
    });
    
    // Export button
    document.getElementById('btn-export').addEventListener('click', () => {
      this.exportElement();
    });
    
    // Analyze button
    document.getElementById('btn-analyze').addEventListener('click', () => {
      this.analyzeElement();
    });
    
    // Open sidebar button (if exists)
    const sidebarBtn = document.getElementById('btn-open-sidebar');
    if (sidebarBtn) {
      sidebarBtn.addEventListener('click', () => {
        this.openSidebar();
      });
    }
  }

  /**
   * Start listening for element selection
   */
  startListeningForSelection() {
    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'ELEMENT_SELECTED') {
        this.selectedElement = message.data;
        this.updateElementDisplay();
        sendResponse({ success: true });
      }
      
      if (message.action === 'ELEMENT_HOVERED') {
        // Update hover info if needed
        sendResponse({ success: true });
      }
    });
  }

  /**
   * Update selected element from content script
   */
  async updateSelectedElement() {
    if (!this.currentTab) return;
    
    try {
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'GET_SELECTED_ELEMENT'
      });
      
      if (response && response.success && response.data) {
        this.selectedElement = response.data;
        this.updateElementDisplay();
      } else {
        // No element selected
        if (this.selectedElement) {
          this.selectedElement = null;
          this.updateElementDisplay();
        }
      }
    } catch (error) {
      // Content script not ready or no selection
    }
  }

  /**
   * Update element display in popup
   */
  updateElementDisplay() {
    const emptyState = document.getElementById('empty-state');
    const elementInfo = document.getElementById('element-info');
    const exportSection = document.getElementById('export-section');
    
    if (!this.selectedElement) {
      // Show empty state
      emptyState.style.display = 'block';
      elementInfo.style.display = 'none';
      exportSection.style.display = 'none';
      return;
    }
    
    // Hide empty state, show element info
    emptyState.style.display = 'none';
    elementInfo.style.display = 'block';
    exportSection.style.display = 'block';
    
    // Update element info
    const analysis = this.selectedElement.analysis || {};
    const styles = this.selectedElement.styles || {};
    
    // Tag
    document.getElementById('element-tag').textContent = analysis.tagName?.toUpperCase() || 'DIV';
    document.getElementById('detail-tag').textContent = analysis.tagName || '-';
    
    // ID
    const elementId = document.getElementById('element-id');
    if (analysis.id) {
      elementId.textContent = `#${analysis.id}`;
      elementId.style.display = 'inline-block';
    } else {
      elementId.style.display = 'none';
    }
    
    // Classes
    const elementClasses = document.getElementById('element-classes');
    if (analysis.classes && analysis.classes.length > 0) {
      elementClasses.textContent = `.${analysis.classes.slice(0, 2).join('.')}`;
      elementClasses.style.display = 'inline-block';
    } else {
      elementClasses.style.display = 'none';
    }
    
    // Layout
    document.getElementById('detail-layout').textContent = analysis.layoutType || '-';
    
    // Size
    if (analysis.dimensions) {
      const width = Math.round(analysis.dimensions.width);
      const height = Math.round(analysis.dimensions.height);
      document.getElementById('detail-size').textContent = `${width} × ${height}px`;
    } else {
      document.getElementById('detail-size').textContent = '-';
    }
    
    // Role
    document.getElementById('detail-role').textContent = analysis.semanticRole || 'div';
    
    // Preview text
    const previewText = document.querySelector('#element-preview .preview-text');
    if (analysis.textContent) {
      previewText.textContent = analysis.textContent.substring(0, 100) + 
        (analysis.textContent.length > 100 ? '...' : '');
    } else {
      previewText.textContent = 'No text content';
    }
  }

  /**
   * Export selected element
   */
  async exportElement() {
    if (!this.selectedElement || !this.currentTab) {
      this.showMessage('Please select an element first', 'error');
      return;
    }
    
    const format = document.querySelector('input[name="export-format"]:checked').value;
    
    try {
      this.showMessage('Exporting...', 'info');
      
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'EXPORT_SELECTED',
        data: { format }
      });
      
      if (response && response.success) {
        const exportData = response.data;
        
        // Download file
        const blob = new Blob([exportData.content], { type: exportData.mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = exportData.filename;
        link.click();
        URL.revokeObjectURL(url);
        
        this.showMessage(`Exported: ${exportData.filename}`, 'success');
      } else {
        this.showMessage('Export failed', 'error');
      }
    } catch (error) {
      console.error('Export error:', error);
      this.showMessage('Error exporting element', 'error');
    }
  }

  /**
   * Analyze selected element
   */
  async analyzeElement() {
    if (!this.selectedElement || !this.currentTab) {
      this.showMessage('Please select an element first', 'error');
      return;
    }
    
    try {
      this.showMessage('Analyzing...', 'info');
      
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'ANALYZE_ELEMENT',
        data: { element: this.selectedElement.selector }
      });
      
      if (response && response.success) {
        // Update with analyzed data
        this.selectedElement = response.data;
        this.updateElementDisplay();
        this.showMessage('Analysis complete!', 'success');
      } else {
        this.showMessage('Analysis failed', 'error');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      this.showMessage('Error analyzing element', 'error');
    }
  }

  /**
   * Stop inspect mode
   */
  async stopInspectMode() {
    if (!this.currentTab) return;
    
    try {
      this.showMessage('Stopping inspect mode...', 'info');
      
      chrome.runtime.sendMessage({
        action: 'TOGGLE_EXTENSION',
        data: { enabled: false }
      }, (response) => {
        if (response && response.success) {
          this.showMessage('Inspect mode stopped', 'success');
          // Clear selected element
          this.selectedElement = null;
          this.updateElementDisplay();
          
          // Update stop button to show stopped state
          const stopBtn = document.getElementById('btn-stop');
          stopBtn.textContent = 'Start Inspecting';
          stopBtn.onclick = () => {
            stopBtn.textContent = 'Stop Inspecting';
            stopBtn.onclick = () => this.stopInspectMode();
            this.activateInspectMode();
          };
          
          // Suggest opening sidebar for persistent UI
          this.showMessage('💡 Open sidebar for persistent UI that stays open', 'info');
        }
      });
    } catch (error) {
      console.error('Error stopping inspect mode:', error);
      this.showMessage('Error stopping inspect mode', 'error');
    }
  }

  /**
   * Open sidebar for persistent inspection
   */
  async openSidebar() {
    try {
      // Open the side panel
      await chrome.sidePanel.open({ tabId: this.currentTab.id });
      this.showMessage('Sidebar opened for persistent inspection', 'success');
    } catch (error) {
      console.error('Error opening sidebar:', error);
      this.showMessage('Error opening sidebar', 'error');
    }
  }

  /**
   * Show message notification
   */
  showMessage(message, type = 'info') {
    // Remove existing message
    const existing = document.querySelector('.popup-message');
    if (existing) {
      existing.remove();
    }
    
    const messageEl = document.createElement('div');
    messageEl.className = `popup-message popup-message-${type}`;
    messageEl.textContent = message;
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
      messageEl.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      messageEl.classList.remove('show');
      setTimeout(() => {
        messageEl.remove();
      }, 300);
    }, 3000);
  }
}

// Initialize popup when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PopupController();
  });
} else {
  new PopupController();
}
