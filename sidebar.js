/**
 * Sidebar Inspector Panel - Persistent UI
 * Provides detailed inspection and export capabilities with auto-open on selection
 */

class SidebarInspector {
  constructor() {
    this.currentTab = 'elements';
    this.selectedElement = null;
    this.currentTabId = null;
    this.init();
  }

  /**
   * Initialize sidebar
   */
  async init() {
    this.setupEventListeners();
    await this.getCurrentTab();
    this.startListeningForSelection();
    this.updateStatus('Ready - Click elements on the page to inspect');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });
    
    // Activate inspect mode button
    const activateBtn = document.getElementById('btn-activate-inspect');
    if (activateBtn) {
      activateBtn.addEventListener('click', () => {
        this.activateInspectMode();
      });
    }
    
    // Stop inspect mode button  
    const stopBtn = document.getElementById('btn-stop-inspect');
    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        this.stopInspectMode();
      });
    }
    
    // Export buttons
    document.getElementById('btn-export-json').addEventListener('click', () => {
      this.exportElement('json');
    });
    
    document.getElementById('btn-export-html').addEventListener('click', () => {
      this.exportElement('html');
    });
    });
    
    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'UPDATE_SELECTED_ELEMENTS') {
        this.selectedElements = message.data.elements || [];
        this.updateElementsList();
      }
      
      if (message.action === 'ANALYSIS_COMPLETE') {
        this.analyzedElements = message.data.elements || [];
        this.updateStylesViewer();
        this.updateElementorViewer();
      }
    });
  }

  /**
   * Switch tabs
   */
  switchTab(tabName) {
    this.currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Update tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `tab-${tabName}`);
    });
  }

  /**
   * Update elements list
   */
  updateElementsList() {
    const list = document.getElementById('elements-list');
    
    if (this.selectedElements.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <p>No elements selected</p>
          <p class="hint">Use the overlay to select elements from the page</p>
        </div>
      `;
      return;
    }
    
    const elementsHTML = this.selectedElements.map((selected, index) => {
      const element = selected.element;
      const tagName = element.tagName.toLowerCase();
      const id = element.id ? `#${element.id}` : '';
      const classes = Array.from(element.classList)
        .filter(c => !c.includes('elementor-converter'))
        .slice(0, 3);
      
      return `
        <div class="element-item" data-index="${index}">
          <div class="element-header">
            <span class="element-tag">${tagName}</span>
            ${id ? `<span class="element-id">${id}</span>` : ''}
            ${classes.length > 0 ? `<span class="element-classes">.${classes.join('.')}</span>` : ''}
          </div>
          <div class="element-preview">
            ${this.truncateText(element.textContent, 60)}
          </div>
          <div class="element-actions">
            <button class="btn-small" data-action="analyze" data-index="${index}">
              Analyze
            </button>
            <button class="btn-small" data-action="highlight" data-index="${index}">
              Highlight
            </button>
            <button class="btn-small" data-action="remove" data-index="${index}">
              Remove
            </button>
          </div>
        </div>
      `;
    }).join('');
    
    list.innerHTML = elementsHTML;
    
    // Attach action handlers
    list.querySelectorAll('.btn-small').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.dataset.action;
        const index = parseInt(btn.dataset.index);
        this.handleElementAction(action, index);
      });
    });
  }

  /**
   * Handle element action
   */
  handleElementAction(action, index) {
    const selected = this.selectedElements[index];
    if (!selected) return;
    
    switch (action) {
      case 'analyze':
        this.analyzeElement(selected.element);
        break;
      case 'highlight':
        this.highlightElement(selected.element);
        break;
      case 'remove':
        this.removeElement(index);
        break;
    }
  }

  /**
   * Analyze element
   */
  analyzeElement(element) {
    this.updateStatus('Analyzing...');
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'ANALYZE_ELEMENT',
        data: { element: this.getElementSelector(element) }
      }, (response) => {
        if (response && response.success) {
          this.analyzedElements.push(response.data);
          this.updateStylesViewer();
          this.updateElementorViewer();
          this.updateStatus('Analysis complete');
        } else {
          this.updateStatus('Analysis failed', 'error');
        }
      });
    });
  }

  /**
   * Highlight element
   */
  highlightElement(element) {
    // Send message to content script to highlight
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'HIGHLIGHT_ELEMENT',
        data: { selector: this.getElementSelector(element) }
      });
    });
  }

  /**
   * Remove element
   */
  removeElement(index) {
    this.selectedElements.splice(index, 1);
    this.updateElementsList();
    
    // Notify content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'REMOVE_ELEMENT',
        data: { index }
      });
    });
  }

  /**
   * Get element selector
   */
  getElementSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }
    
    const path = [];
    let current = element;
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      if (current.className) {
        const classes = Array.from(current.classList)
          .filter(c => !c.includes('elementor-converter'))
          .slice(0, 1)
          .join('.');
        if (classes) {
          selector += '.' + classes;
        }
      }
      path.unshift(selector);
      current = current.parentElement;
      if (path.length > 5) break;
    }
    
    return path.join(' > ');
  }

  /**
   * Update styles viewer
   */
  updateStylesViewer() {
    const viewer = document.getElementById('styles-viewer');
    
    if (this.analyzedElements.length === 0) {
      viewer.innerHTML = `
        <div class="empty-state">
          <p>No styles extracted</p>
          <p class="hint">Analyze elements to see their styles</p>
        </div>
      `;
      return;
    }
    
    const stylesHTML = this.analyzedElements.map((result, index) => {
      const styles = result.styles;
      
      return `
        <div class="style-group">
          <h4>Element ${index + 1}</h4>
          <div class="style-section">
            <h5>Typography</h5>
            <pre>${JSON.stringify(styles.typography, null, 2)}</pre>
          </div>
          <div class="style-section">
            <h5>Colors</h5>
            <pre>${JSON.stringify(styles.colors, null, 2)}</pre>
          </div>
          <div class="style-section">
            <h5>Spacing</h5>
            <pre>${JSON.stringify(styles.spacing, null, 2)}</pre>
          </div>
          <div class="style-section">
            <h5>Layout</h5>
            <pre>${JSON.stringify(styles.layout, null, 2)}</pre>
          </div>
        </div>
      `;
    }).join('');
    
    viewer.innerHTML = stylesHTML;
  }

  /**
   * Update Elementor viewer
   */
  updateElementorViewer() {
    const viewer = document.getElementById('elementor-viewer');
    
    if (this.analyzedElements.length === 0) {
      viewer.innerHTML = `
        <div class="empty-state">
          <p>No Elementor data</p>
          <p class="hint">Analyze elements to see Elementor widget mappings</p>
        </div>
      `;
      return;
    }
    
    const elementorHTML = this.analyzedElements.map((result, index) => {
      const widget = result.elementorWidget;
      
      return `
        <div class="elementor-widget-card">
          <div class="widget-header">
            <span class="widget-type">${widget.widgetType}</span>
            <span class="widget-id">${widget.id}</span>
          </div>
          <div class="widget-settings">
            <h5>Settings</h5>
            <pre>${JSON.stringify(widget.settings, null, 2)}</pre>
          </div>
          <div class="widget-actions">
            <button class="btn-small" data-action="copy-settings" data-index="${index}">
              Copy Settings
            </button>
            <button class="btn-small" data-action="view-json" data-index="${index}">
              View JSON
            </button>
          </div>
        </div>
      `;
    }).join('');
    
    viewer.innerHTML = elementorHTML;
    
    // Attach action handlers
    viewer.querySelectorAll('.btn-small').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.dataset.action;
        const index = parseInt(btn.dataset.index);
        this.handleElementorAction(action, index);
      });
    });
  }

  /**
   * Handle Elementor action
   */
  handleElementorAction(action, index) {
    const result = this.analyzedElements[index];
    if (!result) return;
    
    switch (action) {
      case 'copy-settings':
        navigator.clipboard.writeText(
          JSON.stringify(result.elementorWidget.settings, null, 2)
        ).then(() => {
          this.showNotification('Settings copied to clipboard');
        });
        break;
      case 'view-json':
        this.showJSONModal(result.elementorWidget);
        break;
    }
  }

  /**
   * Show JSON modal
   */
  showJSONModal(widget) {
    const modal = document.createElement('div');
    modal.className = 'json-modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>Elementor Widget JSON</h3>
          <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <pre>${JSON.stringify(widget, null, 2)}</pre>
        </div>
        <div class="modal-footer">
          <button class="btn-primary" id="btn-copy-json">Copy JSON</button>
          <button class="btn-secondary" id="btn-close-json">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close handlers
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.remove();
    });
    modal.querySelector('.modal-overlay').addEventListener('click', () => {
      modal.remove();
    });
    modal.querySelector('#btn-close-json').addEventListener('click', () => {
      modal.remove();
    });
    
    // Copy JSON
    modal.querySelector('#btn-copy-json').addEventListener('click', () => {
      navigator.clipboard.writeText(JSON.stringify(widget, null, 2))
        .then(() => {
          this.showNotification('JSON copied to clipboard');
        });
    });
  }

  /**
   * Export data
   */
  exportData(method) {
    const format = document.getElementById('export-format').value;
    const includeResponsive = document.getElementById('include-responsive').checked;
    const includeAnimations = document.getElementById('include-animations').checked;
    const minify = document.getElementById('minify-output').checked;
    
    this.updateStatus('Exporting...');
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'EXPORT_DATA',
        data: {
          format,
          options: {
            includeResponsive,
            includeAnimations,
            minify
          }
        }
      }, (response) => {
        if (response && response.success) {
          const exportData = response.data;
          
          if (method === 'download') {
            this.downloadFile(exportData.filename, exportData.content, exportData.mimeType);
            this.updateStatus('Export downloaded');
          } else if (method === 'copy') {
            navigator.clipboard.writeText(exportData.content).then(() => {
              this.updateStatus('Copied to clipboard');
              this.showNotification('Exported data copied to clipboard');
            });
          }
          
          this.addToHistory(exportData);
        } else {
          this.updateStatus('Export failed', 'error');
        }
      });
    });
  }

  /**
   * Download file
   */
  downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Add to export history
   */
  addToHistory(exportData) {
    const historyList = document.getElementById('history-list');
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
      <div class="history-info">
        <span class="history-filename">${exportData.filename}</span>
        <span class="history-time">${new Date().toLocaleTimeString()}</span>
      </div>
      <button class="btn-icon-small" data-action="download-again">📥</button>
    `;
    
    if (historyList.querySelector('.empty-state')) {
      historyList.innerHTML = '';
    }
    
    historyList.insertBefore(historyItem, historyList.firstChild);
    
    // Limit history to 10 items
    while (historyList.children.length > 10) {
      historyList.removeChild(historyList.lastChild);
    }
  }

  /**
   * Refresh elements
   */
  refreshElements() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'GET_SELECTED_ELEMENTS'
      }, (response) => {
        if (response && response.success) {
          this.selectedElements = response.data.elements || [];
          this.updateElementsList();
        }
      });
    });
  }

  /**
   * Update status
   */
  updateStatus(message, type = 'info') {
    const indicator = document.getElementById('status-indicator');
    const statusText = indicator.querySelector('.status-text');
    const statusDot = indicator.querySelector('.status-dot');
    
    statusText.textContent = message;
    statusDot.className = `status-dot ${type}`;
  }

  /**
   * Show notification
   */
  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 2000);
  }

  /**
   * Close sidebar
   */
  closeSidebar() {
    chrome.sidePanel.close();
  }

  /**
   * Load state
   */
  loadState() {
    chrome.storage.local.get(['selectedElements', 'analyzedElements'], (result) => {
      if (result.selectedElements) {
        this.selectedElements = result.selectedElements;
        this.updateElementsList();
      }
      
      if (result.analyzedElements) {
        this.analyzedElements = result.analyzedElements;
        this.updateStylesViewer();
        this.updateElementorViewer();
      }
    });
  }

  /**
   * Truncate text
   */
  truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}

// Initialize sidebar when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new SidebarInspector();
  });
} else {
  new SidebarInspector();
}
