/**
 * Overlay System
 * Provides visual selection interface similar to Elementor
 */

class ElementorOverlay {
  constructor() {
    this.overlay = null;
    this.isInitialized = false;
  }

  /**
   * Initialize overlay system
   */
  init() {
    if (this.isInitialized) return;
    
    this.createOverlay();
    this.isInitialized = true;
  }

  /**
   * Create overlay container
   */
  createOverlay() {
    // Remove existing overlay if any
    const existing = document.getElementById('elementor-converter-overlay');
    if (existing) {
      existing.remove();
    }
    
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.id = 'elementor-converter-overlay';
    this.overlay.className = 'elementor-converter-overlay';
    
    this.overlay.innerHTML = `
      <div class="overlay-toolbar">
        <div class="toolbar-left">
          <div class="toolbar-logo">
            <span class="logo-icon">⚡</span>
            <span class="logo-text">Elementor Converter</span>
          </div>
          <div class="selection-counter">0 selected</div>
        </div>
        <div class="toolbar-right">
          <button class="toolbar-btn" id="btn-analyze" title="Analyze Selected">
            <span>🔍</span> Analyze
          </button>
          <button class="toolbar-btn" id="btn-clear" title="Clear Selection">
            <span>🗑️</span> Clear
          </button>
          <button class="toolbar-btn" id="btn-export" title="Export Selected">
            <span>📥</span> Export JSON
          </button>
          <button class="toolbar-btn" id="btn-export-hovered" title="Export Hovered Element">
            <span>⚡</span> Export Hovered
          </button>
          <button class="toolbar-btn" id="btn-close" title="Close">
            <span>✕</span>
          </button>
        </div>
      </div>
      <div class="overlay-sidebar" id="overlay-sidebar">
        <div class="sidebar-header">
          <h3>Selected Elements</h3>
          <button class="sidebar-toggle" id="sidebar-toggle">−</button>
        </div>
        <div class="sidebar-content" id="sidebar-content">
          <div class="empty-state">
            <p>No elements selected</p>
            <p class="hint">Hover over elements and click to select</p>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.overlay);
    
    // Attach event listeners
    this.attachEventListeners();
    
    // Load overlay styles
    this.loadStyles();
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Analyze button
    const btnAnalyze = this.overlay.querySelector('#btn-analyze');
    if (btnAnalyze) {
      btnAnalyze.addEventListener('click', () => {
        chrome.runtime.sendMessage({
          action: 'ANALYZE_SELECTED',
          data: {}
        }, (response) => {
          if (response && response.success) {
            this.showAnalysisResults(response.data);
          }
        });
      });
    }
    
    // Clear button
    const btnClear = this.overlay.querySelector('#btn-clear');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        chrome.runtime.sendMessage({
          action: 'CLEAR_SELECTION',
          data: {}
        });
        this.updateSidebar([]);
      });
    }
    
    // Export button
    const btnExport = this.overlay.querySelector('#btn-export');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        this.exportSelectedElements();
      });
    }
    
    // Export hovered element button
    const btnExportHovered = this.overlay.querySelector('#btn-export-hovered');
    if (btnExportHovered) {
      btnExportHovered.addEventListener('click', () => {
        this.exportHoveredElement();
      });
    }
    
    // Close button
    const btnClose = this.overlay.querySelector('#btn-close');
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        chrome.runtime.sendMessage({
          action: 'TOGGLE_EXTENSION',
          data: { enabled: false }
        });
      });
    }
    
    // Sidebar toggle
    const sidebarToggle = this.overlay.querySelector('#sidebar-toggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        this.toggleSidebar();
      });
    }
    
    // Listen for selection updates
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === 'UPDATE_SELECTED_ELEMENTS') {
        this.updateSidebar(message.data.elements || []);
      }
    });
  }

  /**
   * Update sidebar with selected elements
   */
  updateSidebar(elements) {
    const sidebarContent = this.overlay.querySelector('#sidebar-content');
    if (!sidebarContent) return;
    
    if (elements.length === 0) {
      sidebarContent.innerHTML = `
        <div class="empty-state">
          <p>No elements selected</p>
          <p class="hint">Hover over elements and click to select</p>
        </div>
      `;
      return;
    }
    
    const elementsHTML = elements.map((selected, index) => {
      const element = selected.element;
      const tagName = element.tagName.toLowerCase();
      const id = element.id ? `#${element.id}` : '';
      const classes = Array.from(element.classList)
        .filter(c => !c.includes('elementor-converter'))
        .slice(0, 2)
        .join('.');
      
      return `
        <div class="sidebar-item" data-index="${index}">
          <div class="item-header">
            <span class="item-tag">${tagName}</span>
            ${id ? `<span class="item-id">${id}</span>` : ''}
            ${classes ? `<span class="item-class">.${classes}</span>` : ''}
            <button class="item-remove" data-index="${index}">×</button>
          </div>
          <div class="item-preview">
            ${element.textContent.substring(0, 50)}${element.textContent.length > 50 ? '...' : ''}
          </div>
        </div>
      `;
    }).join('');
    
    sidebarContent.innerHTML = elementsHTML;
    
    // Attach remove handlers
    sidebarContent.querySelectorAll('.item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.removeElement(index);
      });
    });
  }

  /**
   * Remove element from selection
   */
  removeElement(index) {
    chrome.runtime.sendMessage({
      action: 'SELECT_ELEMENT',
      data: { index, remove: true }
    });
  }

  /**
   * Show analysis results
   */
  showAnalysisResults(results) {
    const sidebarContent = this.overlay.querySelector('#sidebar-content');
    if (!sidebarContent) return;
    
    if (results.length === 0) {
      sidebarContent.innerHTML = `
        <div class="empty-state">
          <p>No analysis results</p>
        </div>
      `;
      return;
    }
    
    const resultsHTML = results.map((result, index) => {
      const analysis = result.analysis;
      const widget = result.elementorWidget;
      
      return `
        <div class="analysis-item" data-index="${index}">
          <div class="analysis-header">
            <span class="widget-type">${widget.widgetType}</span>
            <span class="layout-type">${analysis.layoutType}</span>
          </div>
          <div class="analysis-details">
            <div class="detail-row">
              <span class="detail-label">Tag:</span>
              <span class="detail-value">${analysis.tagName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Role:</span>
              <span class="detail-value">${analysis.semanticRole}</span>
            </div>
            ${analysis.dimensions ? `
              <div class="detail-row">
                <span class="detail-label">Size:</span>
                <span class="detail-value">${Math.round(analysis.dimensions.width)} × ${Math.round(analysis.dimensions.height)}px</span>
              </div>
            ` : ''}
          </div>
          <div class="analysis-actions">
            <button class="action-btn" data-action="copy-selector" data-index="${index}">
              Copy Selector
            </button>
            <button class="action-btn" data-action="view-settings" data-index="${index}">
              View Settings
            </button>
          </div>
        </div>
      `;
    }).join('');
    
    sidebarContent.innerHTML = resultsHTML;
    
    // Attach action handlers
    sidebarContent.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        const index = parseInt(e.target.dataset.index);
        this.handleAnalysisAction(action, index, results[index]);
      });
    });
  }

  /**
   * Handle analysis action
   */
  handleAnalysisAction(action, index, result) {
    switch (action) {
      case 'copy-selector':
        navigator.clipboard.writeText(result.selector).then(() => {
          this.showNotification('Selector copied to clipboard');
        });
        break;
      case 'view-settings':
        this.showSettingsModal(result);
        break;
    }
  }

  /**
   * Show settings modal
   */
  showSettingsModal(result) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'settings-modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>Elementor Settings</h3>
          <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <pre>${JSON.stringify(result.elementorWidget.settings, null, 2)}</pre>
        </div>
        <div class="modal-footer">
          <button class="btn-copy-settings">Copy Settings</button>
          <button class="btn-close-modal">Close</button>
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
    modal.querySelector('.btn-close-modal').addEventListener('click', () => {
      modal.remove();
    });
    
    // Copy settings
    modal.querySelector('.btn-copy-settings').addEventListener('click', () => {
      navigator.clipboard.writeText(JSON.stringify(result.elementorWidget.settings, null, 2))
        .then(() => {
          this.showNotification('Settings copied to clipboard');
        });
    });
  }

  /**
   * Show export menu
   */
  showExportMenu() {
    const menu = document.createElement('div');
    menu.className = 'export-menu';
    menu.innerHTML = `
      <div class="menu-item" data-format="json">
        <span class="menu-icon">📄</span>
        <span class="menu-text">Elementor JSON</span>
      </div>
      <div class="menu-item" data-format="html">
        <span class="menu-icon">🌐</span>
        <span class="menu-text">HTML Scaffold</span>
      </div>
      <div class="menu-item" data-format="reference">
        <span class="menu-icon">📋</span>
        <span class="menu-text">Design Reference</span>
      </div>
    `;
    
    document.body.appendChild(menu);
    
    // Position menu
    const btnExport = this.overlay.querySelector('#btn-export');
    const rect = btnExport.getBoundingClientRect();
    menu.style.left = `${rect.left}px`;
    menu.style.top = `${rect.bottom + 5}px`;
    
    // Handle clicks
    menu.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', () => {
        const format = item.dataset.format;
        this.exportData(format);
        menu.remove();
      });
    });
    
    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target) && e.target !== btnExport) {
          menu.remove();
          document.removeEventListener('click', closeMenu);
        }
      });
    }, 0);
  }

  /**
   * Export selected elements
   */
  exportSelectedElements() {
    // Send message to content script to analyze and export
    chrome.runtime.sendMessage({
      action: 'EXPORT_SELECTED',
      data: { format: 'json' }
    }, (response) => {
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
        
        this.showNotification(`Exported ${exportData.filename}`);
      } else {
        this.showNotification('No elements selected. Please select elements first.');
      }
    });
  }

  /**
   * Export hovered element
   */
  exportHoveredElement() {
    // Get currently hovered element from content script
    chrome.runtime.sendMessage({
      action: 'EXPORT_HOVERED',
      data: { format: 'json' }
    }, (response) => {
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
        
        this.showNotification(`Exported hovered element as ${exportData.filename}`);
      } else {
        this.showNotification('No element hovered. Hover over an element first.');
      }
    });
  }

  /**
   * Export data
   */
  exportData(format) {
    chrome.runtime.sendMessage({
      action: 'EXPORT_DATA',
      data: { format, options: {} }
    }, (response) => {
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
        
        this.showNotification(`Exported as ${exportData.filename}`);
      }
    });
  }

  /**
   * Toggle sidebar
   */
  toggleSidebar() {
    const sidebar = this.overlay.querySelector('#overlay-sidebar');
    const toggle = this.overlay.querySelector('#sidebar-toggle');
    
    if (sidebar.classList.contains('collapsed')) {
      sidebar.classList.remove('collapsed');
      toggle.textContent = '−';
    } else {
      sidebar.classList.add('collapsed');
      toggle.textContent = '+';
    }
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
   * Load overlay styles
   */
  loadStyles() {
    // Styles are loaded via content.css
    // This is just a placeholder for any dynamic styles
  }

  /**
   * Update selection counter
   */
  updateCounter(count) {
    const counter = this.overlay.querySelector('.selection-counter');
    if (counter) {
      counter.textContent = `${count} selected`;
    }
  }
}

// Initialize overlay
if (typeof window !== 'undefined') {
  window.ElementorOverlay = new ElementorOverlay();
  
  // Auto-init if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.ElementorOverlay.init();
    });
  } else {
    window.ElementorOverlay.init();
  }
}
