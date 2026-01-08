/**
 * Sidebar UI Component - Handles the right-side panel interface
 */

class ElementorSidebar {
  constructor() {
    this.isOpen = false;
    this.sidebarElement = null;
    this.originalBodyStyle = null;
    this.width = 400;
    this.currentViewMode = 'desktop';
    this.selectedElement = null;
  }

  /**
   * Create and inject the sidebar
   */
  create() {
    if (this.sidebarElement) return;
    
    // Store original body styles
    this.originalBodyStyle = {
      marginRight: document.body.style.marginRight,
      transition: document.body.style.transition
    };
    
    // Create sidebar container
    this.sidebarElement = document.createElement('div');
    this.sidebarElement.id = 'elementor-converter-sidebar';
    this.sidebarElement.className = 'elementor-extension-element';
    
    // Create sidebar content
    this.sidebarElement.innerHTML = this.createSidebarHTML();
    
    // Apply styles
    this.applySidebarStyles();
    
    // Append to body
    document.body.appendChild(this.sidebarElement);
    
    // Attach event listeners
    this.attachEventListeners();
    
    console.log('Sidebar created');
  }

  /**
   * Create sidebar HTML structure
   */
  createSidebarHTML() {
    return `
      <div class="elementor-sidebar-header">
        <div class="elementor-sidebar-title">
          <div class="elementor-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L22 12L12 22L2 12L12 2Z" fill="#4A90E2"/>
            </svg>
          </div>
          <h3>HTML to Elementor</h3>
        </div>
        <div class="elementor-sidebar-controls">
          <div class="elementor-view-modes">
            <button class="elementor-view-btn active" data-view="desktop" title="Desktop View">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 2H3c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h7l-2 2v1h8v-1l-2-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 13H3V4h18v11z"/>
              </svg>
            </button>
            <button class="elementor-view-btn" data-view="tablet" title="Tablet View">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H3V6h18v12z"/>
              </svg>
            </button>
            <button class="elementor-view-btn" data-view="mobile" title="Mobile View">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H7V4h10v16z"/>
              </svg>
            </button>
          </div>
          <button class="elementor-close-btn" title="Close Extension">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="elementor-sidebar-content">
        
        <!-- Selection Info Panel -->
        <div class="elementor-panel elementor-selection-info" id="elementor-selection-info">
          <div class="elementor-panel-header">
            <h4>Selected Element</h4>
          </div>
          <div class="elementor-panel-content" id="elementor-element-details">
            <div class="elementor-no-selection">
              <div class="elementor-empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
                  <path d="M8 21l4-7 4 7"/>
                </svg>
              </div>
              <p>Select an element on the page to see its properties</p>
            </div>
          </div>
        </div>

        <!-- Selected Elements Tree -->
        <div class="elementor-panel elementor-elements-tree" id="elementor-elements-tree">
          <div class="elementor-panel-header">
            <h4>Selected Elements (<span id="elementor-selection-count">0</span>)</h4>
            <button class="elementor-clear-all-btn" id="elementor-clear-all" title="Clear All Selections">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
          <div class="elementor-panel-content" id="elementor-elements-list">
            <div class="elementor-no-elements">
              <p>No elements selected yet</p>
            </div>
          </div>
        </div>

        <!-- Export Section -->
        <div class="elementor-panel elementor-export-section" id="elementor-export-section">
          <div class="elementor-panel-header">
            <h4>Export Options</h4>
          </div>
          <div class="elementor-panel-content">
            <div class="elementor-export-buttons">
              <button class="elementor-btn elementor-btn-primary" id="elementor-export-json" disabled>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                Export as Elementor JSON
              </button>
              <button class="elementor-btn elementor-btn-secondary" id="elementor-copy-json" disabled>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
                </svg>
                Copy JSON to Clipboard
              </button>
              <button class="elementor-btn elementor-btn-secondary" id="elementor-download-json" disabled>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
                </svg>
                Download JSON File
              </button>
              <button class="elementor-btn elementor-btn-secondary" id="elementor-manual-save" disabled>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M12,13L16,17H13V19H11V17H8L12,13Z"/>
                </svg>
                Manual Save (Backup)
              </button>
              <button class="elementor-btn elementor-btn-tertiary" id="elementor-export-html" disabled>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,17.56L16.07,16.43L16.62,10.33H9.38L9.2,8.3H16.8L17,6.31H7L7.56,12.32H14.45L14.22,14.9L12,15.5L9.78,14.9L9.64,13.24H7.64L7.93,16.43L12,17.56Z"/>
                </svg>
                Export as HTML
              </button>
              <button class="elementor-btn elementor-btn-secondary" id="elementor-test-download" style="margin-top: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
                </svg>
                Test Download (Debug)
              </button>
            </div>
            <div class="elementor-export-stats" id="elementor-export-stats"></div>
          </div>
        </div>

      </div>
      
      <!-- Resize Handle -->
      <div class="elementor-resize-handle" id="elementor-resize-handle"></div>
    `;
  }

  /**
   * Apply sidebar styles
   */
  applySidebarStyles() {
    this.sidebarElement.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: ${this.width}px;
      height: 100vh;
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #e9ecef 100%);
      color: #2c3e50;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      z-index: 999999;
      box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1), -2px 0 10px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-left: 3px solid #3498db;
    `;
  }

  /**
   * Open the sidebar
   */
  open() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    
    // Show sidebar
    this.sidebarElement.style.transform = 'translateX(0)';
    
    // Adjust body margin
    document.body.style.transition = 'margin-right 0.3s ease-in-out';
    document.body.style.marginRight = `${this.width}px`;
    
    console.log('Sidebar opened');
  }

  /**
   * Close the sidebar
   */
  close() {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    
    // Hide sidebar
    this.sidebarElement.style.transform = 'translateX(100%)';
    
    // Restore body margin
    document.body.style.marginRight = this.originalBodyStyle.marginRight;
    
    // Remove sidebar after transition
    setTimeout(() => {
      this.destroy();
    }, 300);
    
    console.log('Sidebar closed');
  }

  /**
   * Destroy the sidebar
   */
  destroy() {
    if (this.sidebarElement) {
      this.removeEventListeners();
      this.sidebarElement.remove();
      this.sidebarElement = null;
    }
    
    // Restore original body styles
    if (this.originalBodyStyle) {
      document.body.style.marginRight = this.originalBodyStyle.marginRight;
      document.body.style.transition = this.originalBodyStyle.transition;
    }
    
    console.log('Sidebar destroyed');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Close button
    const closeBtn = this.sidebarElement.querySelector('.elementor-close-btn');
    closeBtn.addEventListener('click', () => {
      if (window.elementorConverter) {
        window.elementorConverter.closeSidebar();
      }
    });

    // View mode buttons
    const viewButtons = this.sidebarElement.querySelectorAll('.elementor-view-btn');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setViewMode(e.target.dataset.view);
      });
    });

    // Clear all button
    const clearAllBtn = this.sidebarElement.querySelector('#elementor-clear-all');
    clearAllBtn.addEventListener('click', () => {
      if (window.elementorSelector) {
        window.elementorSelector.clearSelections();
      }
    });

    // Export buttons
    this.attachExportListeners();

    // Resize handle
    this.attachResizeListeners();
  }

  /**
   * Attach export button listeners
   */
  attachExportListeners() {
    const exportJsonBtn = this.sidebarElement.querySelector('#elementor-export-json');
    const copyJsonBtn = this.sidebarElement.querySelector('#elementor-copy-json');
    const downloadJsonBtn = this.sidebarElement.querySelector('#elementor-download-json');
    const manualSaveBtn = this.sidebarElement.querySelector('#elementor-manual-save');
    const exportHtmlBtn = this.sidebarElement.querySelector('#elementor-export-html');
    const testDownloadBtn = this.sidebarElement.querySelector('#elementor-test-download');

    console.log('Attaching export listeners:', {
      exportJsonBtn: !!exportJsonBtn,
      copyJsonBtn: !!copyJsonBtn,
      downloadJsonBtn: !!downloadJsonBtn,
      manualSaveBtn: !!manualSaveBtn,
      exportHtmlBtn: !!exportHtmlBtn,
      testDownloadBtn: !!testDownloadBtn
    });

    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => {
        console.log('Export JSON button clicked');
        this.exportAsElementorJSON();
      });
    }
    
    if (copyJsonBtn) {
      copyJsonBtn.addEventListener('click', () => {
        console.log('Copy JSON button clicked');
        this.copyJSONToClipboard();
      });
    }
    
    if (downloadJsonBtn) {
      downloadJsonBtn.addEventListener('click', (e) => {
        console.log('Download JSON button clicked', { 
          disabled: downloadJsonBtn.disabled,
          selectedCount: window.elementorSelector?.getSelectedElements()?.length || 0
        });
        
        // Force execution even if disabled for debugging
        if (downloadJsonBtn.disabled) {
          console.log('Button is disabled but executing anyway for debugging');
        }
        
        this.downloadJSONFile();
      });
    }
    
    if (manualSaveBtn) {
      manualSaveBtn.addEventListener('click', () => {
        console.log('Manual save button clicked');
        this.manualSaveJSON();
      });
    }
    
    if (exportHtmlBtn) {
      exportHtmlBtn.addEventListener('click', () => {
        console.log('Export HTML button clicked');
        this.exportAsHTML();
      });
    }
    
    // Test download button (always enabled)
    if (testDownloadBtn) {
      testDownloadBtn.addEventListener('click', () => {
        console.log('Test download button clicked');
        this.testDownload();
      });
    }
  }

  /**
   * Attach resize handle listeners
   */
  attachResizeListeners() {
    const resizeHandle = this.sidebarElement.querySelector('#elementor-resize-handle');
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    resizeHandle.addEventListener('mousedown', (e) => {
      isResizing = true;
      startX = e.clientX;
      startWidth = this.width;
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'ew-resize';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      
      const deltaX = startX - e.clientX;
      const newWidth = Math.max(300, Math.min(600, startWidth + deltaX));
      
      this.width = newWidth;
      this.sidebarElement.style.width = `${newWidth}px`;
      document.body.style.marginRight = `${newWidth}px`;
    });

    document.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
    });
  }

  /**
   * Remove event listeners
   */
  removeEventListeners() {
    // Event listeners are automatically removed when element is removed
  }

  /**
   * Set view mode (desktop/tablet/mobile)
   */
  setViewMode(mode) {
    this.currentViewMode = mode;
    
    // Update active button
    const viewButtons = this.sidebarElement.querySelectorAll('.elementor-view-btn');
    viewButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === mode);
    });

    // Update viewport meta tag for responsive simulation
    this.simulateViewport(mode);
  }

  /**
   * Simulate different viewport sizes
   */
  simulateViewport(mode) {
    let viewport = 'width=device-width, initial-scale=1';
    
    switch (mode) {
      case 'tablet':
        viewport = 'width=768, initial-scale=1';
        break;
      case 'mobile':
        viewport = 'width=375, initial-scale=1';
        break;
    }

    let metaTag = document.querySelector('meta[name="viewport"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = 'viewport';
      document.head.appendChild(metaTag);
    }
    
    metaTag.content = viewport;
  }

  /**
   * Update selection info panel
   */
  updateSelectionInfo(selectedElements) {
    console.log('Updating selection info:', { count: selectedElements.length, elements: selectedElements });
    
    const infoPanel = this.sidebarElement.querySelector('#elementor-element-details');
    const countSpan = this.sidebarElement.querySelector('#elementor-selection-count');
    const elementsList = this.sidebarElement.querySelector('#elementor-elements-list');
    
    // Update count
    if (countSpan) {
      countSpan.textContent = selectedElements.length;
    }

    // Update export buttons state
    this.updateExportButtons(selectedElements);

    // Update selection info
    if (selectedElements.length === 0) {
      infoPanel.innerHTML = `
        <div class="elementor-no-selection">
          <div class="elementor-empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
              <path d="M8 21l4-7 4 7"/>
            </svg>
          </div>
          <p>Select an element on the page to see its properties</p>
        </div>
      `;
      
      elementsList.innerHTML = `
        <div class="elementor-no-elements">
          <p>No elements selected yet</p>
        </div>
      `;
    } else {
      // Show details for last selected element
      const lastSelected = selectedElements[selectedElements.length - 1];
      this.displayElementDetails(lastSelected);
      this.displayElementsList(selectedElements);
    }

    // Update export stats
    this.updateExportStats(selectedElements);
  }

  /**
   * Display details for a selected element
   */
  displayElementDetails(selectionInfo) {
    const { element, data } = selectionInfo;
    const infoPanel = this.sidebarElement.querySelector('#elementor-element-details');
    
    const textContent = element.textContent.trim().substring(0, 100);
    const displayText = textContent ? textContent : '[No text content]';
    
    infoPanel.innerHTML = `
      <div class="elementor-element-info">
        <div class="elementor-info-group">
          <label>Element Type</label>
          <span class="elementor-tag">${element.tagName.toLowerCase()}</span>
        </div>
        
        <div class="elementor-info-group">
          <label>Text Content</label>
          <span class="elementor-text-content">${displayText}</span>
        </div>
        
        <div class="elementor-info-group">
          <label>Dimensions</label>
          <span>${Math.round(data.layout.boundingRect.width)} × ${Math.round(data.layout.boundingRect.height)} px</span>
        </div>
        
        <div class="elementor-info-group">
          <label>Typography</label>
          <div class="elementor-typography-info">
            <div>Font: ${data.typography.fontFamily}</div>
            <div>Size: ${data.typography.fontSize.size}${data.typography.fontSize.unit}</div>
            <div>Weight: ${data.typography.fontWeight}</div>
            <div>Color: ${data.typography.color}</div>
          </div>
        </div>
        
        <div class="elementor-info-group">
          <label>Spacing</label>
          <div class="elementor-spacing-info">
            <div>Margin: ${data.spacing.margin.top.size}px ${data.spacing.margin.right.size}px ${data.spacing.margin.bottom.size}px ${data.spacing.margin.left.size}px</div>
            <div>Padding: ${data.spacing.padding.top.size}px ${data.spacing.padding.right.size}px ${data.spacing.padding.bottom.size}px ${data.spacing.padding.left.size}px</div>
          </div>
        </div>
        
        <div class="elementor-info-group">
          <label>Background</label>
          <div class="elementor-background-info">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="elementor-color-preview" style="background: ${data.background.backgroundColor}; width: 24px; height: 24px; border: 2px solid #e2e8f0; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"></div>
              <span>${data.background.backgroundColor}</span>
            </div>
          </div>
        </div>
        
        <div class="elementor-info-group">
          <label>Classes & IDs</label>
          <div class="elementor-attributes">
            ${element.id ? `<span class="elementor-id">#${element.id}</span>` : ''}
            ${Array.from(element.classList).map(cls => `<span class="elementor-class">.${cls}</span>`).join(' ')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Display list of selected elements
   */
  displayElementsList(selectedElements) {
    const elementsList = this.sidebarElement.querySelector('#elementor-elements-list');
    
    const listHTML = selectedElements.map((selectionInfo, index) => {
      const { element, id } = selectionInfo;
      const textContent = element.textContent.trim().substring(0, 30);
      const displayText = textContent ? textContent : '[No text]';
      
      return `
        <div class="elementor-element-item" data-selection-id="${id}">
          <div class="elementor-element-info-brief">
            <span class="elementor-element-tag">${element.tagName.toLowerCase()}</span>
            <span class="elementor-element-text">${displayText}</span>
          </div>
          <div class="elementor-element-actions">
            <button class="elementor-highlight-btn" title="Highlight Element" data-element-id="${element.id || index}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
            </button>
            <button class="elementor-remove-btn" title="Remove from Selection" data-selection-id="${id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
    
    elementsList.innerHTML = listHTML;

    // Attach event listeners for list items
    elementsList.querySelectorAll('.elementor-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selectionId = e.target.closest('.elementor-remove-btn').dataset.selectionId;
        if (window.elementorSelector) {
          window.elementorSelector.removeSelectionById(selectionId);
        }
      });
    });

    elementsList.querySelectorAll('.elementor-highlight-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const elementId = e.target.closest('.elementor-highlight-btn').dataset.elementId;
        if (window.elementorSelector) {
          window.elementorSelector.highlightElementById(elementId);
        }
      });
    });
  }

  /**
   * Update export buttons state
   */
  updateExportButtons(selectedElements) {
    const buttons = this.sidebarElement.querySelectorAll('#elementor-export-json, #elementor-copy-json, #elementor-download-json, #elementor-manual-save, #elementor-export-html');
    const hasElements = selectedElements.length > 0;
    
    console.log('Updating export buttons:', { hasElements, buttonCount: buttons.length });
    
    buttons.forEach((btn, index) => {
      if (btn) {
        btn.disabled = !hasElements;
        btn.style.opacity = hasElements ? '1' : '0.5';
        btn.style.cursor = hasElements ? 'pointer' : 'not-allowed';
        console.log(`Button ${index} (${btn.id}):`, { disabled: btn.disabled, hasElements });
      }
    });
  }

  /**
   * Update export statistics
   */
  updateExportStats(selectedElements) {
    const statsContainer = this.sidebarElement.querySelector('#elementor-export-stats');
    
    if (selectedElements.length === 0) {
      statsContainer.innerHTML = '';
      return;
    }

    const stats = window.ExportManager.getExportStats(selectedElements);
    const typesList = Object.entries(stats.elementTypes)
      .map(([type, count]) => `${type} (${count})`)
      .join(', ');

    statsContainer.innerHTML = `
      <div class="elementor-stats">
        <div class="elementor-stat-item">
          <label>Elements:</label> ${stats.totalElements}
        </div>
        <div class="elementor-stat-item">
          <label>Types:</label> ${typesList}
        </div>
        <div class="elementor-stat-item">
          <label>Est. Size:</label> ${Math.round(stats.totalSize / 1024)}KB
        </div>
      </div>
    `;
  }

  /**
   * Export as Elementor JSON
   */
  async exportAsElementorJSON() {
    const selectedElements = window.elementorSelector?.getSelectedElements() || [];
    const result = await window.ExportManager.exportAsElementorJSON(selectedElements);
    
    if (result.success) {
      window.ExportManager.showNotification('Elementor JSON exported successfully!', 'success');
      console.log('Exported Elementor data:', result.data);
    } else {
      window.ExportManager.showNotification(`Export failed: ${result.error}`, 'error');
    }
  }

  /**
   * Copy JSON to clipboard
   */
  async copyJSONToClipboard() {
    const selectedElements = window.elementorSelector?.getSelectedElements() || [];
    const result = await window.ExportManager.exportAsElementorJSON(selectedElements);
    
    if (result.success) {
      const copyResult = await window.ExportManager.copyToClipboard(result.json);
      if (copyResult.success) {
        window.ExportManager.showNotification('JSON copied to clipboard!', 'success');
      } else {
        window.ExportManager.showNotification(`Copy failed: ${copyResult.error}`, 'error');
      }
    } else {
      window.ExportManager.showNotification(`Export failed: ${result.error}`, 'error');
    }
  }

  /**
   * Download JSON file
   */
  async downloadJSONFile() {
    try {
      console.log('Starting JSON download process...');
      
      // Check dependencies
      if (!window.elementorSelector) {
        console.error('elementorSelector not found');
        window.ExportManager?.showNotification('Extension not properly initialized', 'error');
        return;
      }
      
      if (!window.ExportManager) {
        console.error('ExportManager not found');
        alert('Export manager not available');
        return;
      }
      
      const selectedElements = window.elementorSelector.getSelectedElements() || [];
      console.log('Selected elements for download:', selectedElements.length);
      
      if (selectedElements.length === 0) {
        console.log('No elements selected');
        window.ExportManager.showNotification('No elements selected for export', 'error');
        return;
      }

      console.log('Calling exportAsElementorJSON...');
      const result = await window.ExportManager.exportAsElementorJSON(selectedElements);
      console.log('Export result:', result);
      
      if (result.success) {
        console.log('Export successful, calling downloadAsFile...');
        const downloadResult = await window.ExportManager.downloadAsFile(result.json, result.filename, 'application/json');
        console.log('Download result:', downloadResult);
        
        if (downloadResult.success) {
          let message = 'JSON file downloaded!';
          if (downloadResult.method === 'clipboard') {
            message = downloadResult.message;
          } else if (downloadResult.method === 'chrome-api') {
            message = 'JSON file downloading via Chrome Downloads API...';
          }
          window.ExportManager.showNotification(message, 'success', downloadResult.method === 'clipboard' ? 8000 : 3000);
        } else {
          window.ExportManager.showNotification(`Download failed: ${downloadResult.error}`, 'error');
        }
      } else {
        window.ExportManager.showNotification(`Export failed: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Download error:', error);
      window.ExportManager?.showNotification('Download failed: ' + error.message, 'error');
    }
  }

  /**
   * Export as HTML
   */
  async exportAsHTML() {
    try {
      const selectedElements = window.elementorSelector?.getSelectedElements() || [];
      if (selectedElements.length === 0) {
        window.ExportManager.showNotification('No elements selected for export', 'error');
        return;
      }

      const result = await window.ExportManager.exportAsHTML(selectedElements);
      
      if (result.success) {
        const downloadResult = await window.ExportManager.downloadAsFile(result.data, result.filename, 'text/html');
        if (downloadResult.success) {
          let message = 'HTML file downloaded!';
          if (downloadResult.method === 'clipboard') {
            message = downloadResult.message;
          } else if (downloadResult.method === 'chrome-api') {
            message = 'HTML file downloading via Chrome Downloads API...';
          }
          window.ExportManager.showNotification(message, 'success', downloadResult.method === 'clipboard' ? 8000 : 3000);
        } else {
          window.ExportManager.showNotification(`Download failed: ${downloadResult.error}`, 'error');
        }
      } else {
        window.ExportManager.showNotification(`Export failed: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('HTML export error:', error);
      window.ExportManager.showNotification('Export failed: ' + error.message, 'error');
    }
  }  
  /**
   * Test download function to verify basic functionality
   */
  async testDownload() {
    try {
      console.log('Testing basic download functionality...');
      
      const testData = {
        version: "1.0",
        title: "Test Export",
        created: new Date().toISOString(),
        elements: [
          {
            id: "test-123",
            elType: "widget",
            widgetType: "heading",
            settings: {
              title: "Test Heading",
              color: "#333333"
            }
          }
        ]
      };
      
      const jsonString = JSON.stringify(testData, null, 2);
      const filename = `test-download-${Date.now()}.json`;
      
      console.log('Creating test download:', { filename, dataLength: jsonString.length });
      
      if (window.ExportManager) {
        const result = await window.ExportManager.downloadAsFile(jsonString, filename, 'application/json');
        console.log('Test download result:', result);
        
        if (result.success) {
          let message = `Test download successful! (Method: ${result.method})`;
          if (result.method === 'clipboard') {
            message = `Test download - ${result.message}`;
          }
          window.ExportManager.showNotification(message, 'success', result.method === 'clipboard' ? 6000 : 3000);
        } else {
          window.ExportManager.showNotification(`Test download failed: ${result.error}`, 'error');
        }
      } else {
        // Fallback direct download test
        console.log('Using direct download fallback...');
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert('Direct download test executed - check downloads folder');
      }
    } catch (error) {
      console.error('Test download failed:', error);
      alert('Test download failed: ' + error.message);
    }
  }

  /**
   * Manual save - opens JSON in new tab for manual save
   */
  async manualSaveJSON() {
    try {
      console.log('Starting manual save process...');
      
      if (!window.elementorSelector) {
        window.ExportManager?.showNotification('Extension not properly initialized', 'error');
        return;
      }
      
      const selectedElements = window.elementorSelector.getSelectedElements() || [];
      if (selectedElements.length === 0) {
        window.ExportManager?.showNotification('No elements selected for export', 'error');
        return;
      }

      const result = await window.ExportManager.exportAsElementorJSON(selectedElements);
      
      if (result.success) {
        // Create a formatted display in a new window
        const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
        
        if (newWindow) {
          // Escape HTML characters in JSON for safe injection
          const escapedJson = result.json
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
          
          const escapedFilename = result.filename
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
          
          newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Elementor Export - ${escapedFilename}</title>
              <style>
                body { font-family: 'Courier New', monospace; margin: 20px; background: #f5f5f5; }
                .header { background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .content { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                pre { white-space: pre-wrap; word-wrap: break-word; background: #f8f9fa; padding: 15px; border-radius: 4px; border: 1px solid #e9ecef; }
                .btn { background: #0073aa; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
                .btn:hover { background: #005177; }
                .filename { font-size: 14px; color: #666; margin-bottom: 10px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h2>Elementor Export Data</h2>
                <div class="filename">Suggested filename: ${escapedFilename}</div>
                <button class="btn" onclick="selectAndCopy()">Select All & Copy</button>
                <button class="btn" onclick="downloadFile()">Download as File</button>
                <p style="font-size: 14px; margin-top: 15px; color: #666;">
                  <strong>Instructions:</strong><br>
                  1. Click "Select All & Copy" to copy the JSON data<br>
                  2. Open a text editor (Notepad, VS Code, etc.)<br>
                  3. Paste the content (Ctrl+V)<br>
                  4. Save as "${escapedFilename}" or any .json file
                </p>
              </div>
              <div class="content">
                <pre id="jsonContent">${escapedJson}</pre>
              </div>
              <script>
                function selectAndCopy() {
                  const content = document.getElementById('jsonContent');
                  const range = document.createRange();
                  range.selectNode(content);
                  window.getSelection().removeAllRanges();
                  window.getSelection().addRange(range);
                  try {
                    document.execCommand('copy');
                    alert('JSON content copied to clipboard!');
                  } catch (err) {
                    alert('Copy failed. Please select the text manually and copy with Ctrl+C');
                  }
                }
                function downloadFile() {
                  const content = document.getElementById('jsonContent').textContent;
                  const blob = new Blob([content], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = '${escapedFilename}';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }
              </script>
            </body>
            </html>
          `);
          
          newWindow.document.close();
          window.ExportManager?.showNotification('Manual save window opened. Follow instructions to save manually.', 'success', 5000);
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(result.json);
          window.ExportManager?.showNotification('Popup blocked. JSON copied to clipboard - paste into text editor and save as .json file', 'success', 8000);
        }
      } else {
        window.ExportManager?.showNotification(`Export failed: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Manual save error:', error);
      window.ExportManager?.showNotification('Manual save failed: ' + error.message, 'error');
    }
  }
}

// Make ElementorSidebar available globally
window.ElementorSidebar = ElementorSidebar;