/**
 * Element Selector - Handles visual selection, highlighting, and interaction with webpage elements
 */

class ElementSelector {
  constructor() {
    this.selectedElements = [];
    this.hoveredElement = null;
    this.isActive = false;
    this.overlay = null;
    this.highlightOverlay = null;
    this.selectionCallbacks = [];
    
    // Bind methods to preserve context
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  /**
   * Initialize and activate selection mode
   */
  activate() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.createOverlays();
    this.attachEventListeners();
    console.log('Element selector activated');
  }

  /**
   * Deactivate selection mode and cleanup
   */
  deactivate() {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.removeEventListeners();
    this.removeOverlays();
    this.clearSelections();
    console.log('Element selector deactivated');
  }

  /**
   * Create overlay elements for highlighting
   */
  createOverlays() {
    // Remove existing overlays
    this.removeOverlays();
    
    // Hover highlight overlay
    this.highlightOverlay = document.createElement('div');
    this.highlightOverlay.id = 'elementor-hover-overlay';
    this.highlightOverlay.style.cssText = `
      position: absolute;
      pointer-events: none;
      border: 2px solid #4A90E2;
      background: rgba(74, 144, 226, 0.1);
      z-index: 999998;
      display: none;
      transition: all 0.15s ease;
      box-sizing: border-box;
    `;
    document.body.appendChild(this.highlightOverlay);

    // Selection overlay (for selected elements)
    this.selectionOverlay = document.createElement('div');
    this.selectionOverlay.id = 'elementor-selection-overlay';
    this.selectionOverlay.style.cssText = `
      position: absolute;
      pointer-events: none;
      z-index: 999997;
    `;
    document.body.appendChild(this.selectionOverlay);
  }

  /**
   * Remove overlay elements
   */
  removeOverlays() {
    if (this.highlightOverlay) {
      this.highlightOverlay.remove();
      this.highlightOverlay = null;
    }
    if (this.selectionOverlay) {
      this.selectionOverlay.remove();
      this.selectionOverlay = null;
    }
  }

  /**
   * Attach event listeners for selection
   */
  attachEventListeners() {
    document.addEventListener('mouseover', this.handleMouseOver, true);
    document.addEventListener('mouseout', this.handleMouseOut, true);
    document.addEventListener('click', this.handleClick, true);
    document.addEventListener('keydown', this.handleKeyDown, true);
  }

  /**
   * Remove event listeners
   */
  removeEventListeners() {
    document.removeEventListener('mouseover', this.handleMouseOver, true);
    document.removeEventListener('mouseout', this.handleMouseOut, true);
    document.removeEventListener('click', this.handleClick, true);
    document.removeEventListener('keydown', this.handleKeyDown, true);
  }

  /**
   * Handle mouse over event
   */
  handleMouseOver(event) {
    if (!this.isActive) return;
    
    const element = event.target;
    
    // Skip if element is part of extension UI
    if (this.isExtensionElement(element)) return;
    
    this.hoveredElement = element;
    this.highlightElement(element);
  }

  /**
   * Handle mouse out event
   */
  handleMouseOut(event) {
    if (!this.isActive) return;
    
    // Only hide if we're not moving to a child element
    if (!event.relatedTarget || !this.hoveredElement?.contains(event.relatedTarget)) {
      this.hideHighlight();
      this.hoveredElement = null;
    }
  }

  /**
   * Handle click event
   */
  handleClick(event) {
    if (!this.isActive) return;
    
    const element = event.target;
    
    // Skip if element is part of extension UI
    if (this.isExtensionElement(element)) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    // Check if Ctrl/Cmd is pressed for multi-select
    const isMultiSelect = event.ctrlKey || event.metaKey;
    
    if (this.isElementSelected(element)) {
      // Deselect if already selected
      this.deselectElement(element);
    } else {
      // Select element
      this.selectElement(element, !isMultiSelect);
    }
  }

  /**
   * Handle keyboard events
   */
  handleKeyDown(event) {
    if (!this.isActive) return;
    
    switch (event.key) {
      case 'Escape':
        this.clearSelections();
        break;
      case 'Delete':
      case 'Backspace':
        if (this.selectedElements.length > 0) {
          this.clearSelections();
        }
        break;
    }
  }

  /**
   * Check if element is part of extension UI
   */
  isExtensionElement(element) {
    return element.closest('#elementor-converter-sidebar') ||
           element.closest('#elementor-hover-overlay') ||
           element.closest('#elementor-selection-overlay') ||
           element.id === 'elementor-converter-sidebar' ||
           element.classList.contains('elementor-extension-element');
  }

  /**
   * Highlight element with overlay
   */
  highlightElement(element) {
    if (!this.highlightOverlay) return;
    
    const rect = element.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    this.highlightOverlay.style.cssText = `
      position: absolute;
      pointer-events: none;
      border: 2px solid #4A90E2;
      background: rgba(74, 144, 226, 0.1);
      z-index: 999998;
      display: block;
      transition: all 0.15s ease;
      box-sizing: border-box;
      left: ${rect.left + scrollLeft}px;
      top: ${rect.top + scrollTop}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
    `;

    // Add element label
    this.showElementLabel(element, rect, scrollLeft, scrollTop);
  }

  /**
   * Show element type label
   */
  showElementLabel(element, rect, scrollLeft, scrollTop) {
    // Remove existing label
    const existingLabel = document.getElementById('elementor-element-label');
    if (existingLabel) existingLabel.remove();
    
    const label = document.createElement('div');
    label.id = 'elementor-element-label';
    label.textContent = element.tagName.toLowerCase();
    label.style.cssText = `
      position: absolute;
      background: #4A90E2;
      color: white;
      padding: 2px 8px;
      font-size: 12px;
      font-family: Arial, sans-serif;
      font-weight: bold;
      z-index: 999999;
      border-radius: 2px;
      white-space: nowrap;
      left: ${rect.left + scrollLeft}px;
      top: ${Math.max(0, rect.top + scrollTop - 25)}px;
      pointer-events: none;
    `;
    
    document.body.appendChild(label);
  }

  /**
   * Hide highlight overlay
   */
  hideHighlight() {
    if (this.highlightOverlay) {
      this.highlightOverlay.style.display = 'none';
    }
    
    // Remove element label
    const label = document.getElementById('elementor-element-label');
    if (label) label.remove();
  }

  /**
   * Select an element and capture all its children
   */
  selectElement(element, clearOthers = false) {
    console.log('Selecting element:', { tagName: element.tagName, clearOthers, currentCount: this.selectedElements.length });
    
    if (clearOthers) {
      this.clearSelections();
    }
    
    // Don't select if already selected
    if (this.isElementSelected(element)) {
      console.log('Element already selected');
      return;
    }
    
    // Check if this is a complex parent element that should capture children
    const shouldCaptureChildren = this.shouldCaptureChildElements(element);
    
    if (shouldCaptureChildren) {
      console.log('Capturing complex parent element with all children');
      this.selectComplexElement(element);
    } else {
      // Standard single element selection
      this.selectSingleElement(element);
    }
  }

  /**
   * Determine if element should capture all children
   */
  shouldCaptureChildElements(element) {
    const classes = Array.from(element.classList);
    const tagName = element.tagName.toLowerCase();
    
    // Check for Elementor containers
    if (classes.some(cls => cls.includes('elementor-element') || cls.includes('elementor-container'))) {
      return true;
    }
    
    // Check for common parent containers
    if (classes.some(cls => 
        cls.includes('header') || 
        cls.includes('nav') || 
        cls.includes('menu') || 
        cls.includes('container') ||
        cls.includes('wrapper') ||
        cls.includes('section')
    )) {
      return true;
    }
    
    // Check if it has multiple different child element types
    const childTypes = new Set();
    Array.from(element.children).forEach(child => {
      childTypes.add(child.tagName.toLowerCase());
    });
    
    // If it has diverse child types and more than 2 children
    return childTypes.size >= 2 && element.children.length >= 2;
  }

  /**
   * Select complex element with all its children
   */
  selectComplexElement(parentElement) {
    // Extract data for the parent element
    const parentData = window.CSSExtractor ? window.CSSExtractor.extractElementData(parentElement) : {};
    
    // Create a structured selection that includes the parent and all meaningful children
    const complexSelection = {
      id: this.generateSelectionId(),
      element: parentElement,
      data: parentData,
      children: this.extractChildElements(parentElement),
      isComplex: true,
      timestamp: Date.now()
    };
    
    this.selectedElements.push(complexSelection);
    this.addSelectionOverlay(parentElement);
    this.notifySelectionChange();
    
    console.log('Complex element selected:', { 
      tagName: parentElement.tagName, 
      id: complexSelection.id,
      childrenCount: complexSelection.children.length,
      totalSelected: this.selectedElements.length 
    });
  }

  /**
   * Extract and analyze child elements
   */
  extractChildElements(parentElement) {
    const children = [];
    
    // Recursively process all child elements
    const processElement = (element, depth = 0) => {
      if (depth > 5) return; // Prevent infinite recursion
      
      // Skip text nodes and comments
      if (element.nodeType !== 1) return;
      
      // Skip elements that are too small or hidden
      if (this.isElementTooSmall(element) || this.isElementHidden(element)) {
        return;
      }
      
      const elementData = window.CSSExtractor ? window.CSSExtractor.extractElementData(element) : {};
      
      const childInfo = {
        element: element,
        data: elementData,
        tagName: element.tagName.toLowerCase(),
        classes: Array.from(element.classList),
        depth: depth,
        hasChildren: element.children.length > 0,
        textContent: element.textContent ? element.textContent.trim().substring(0, 100) : '',
        elementType: this.detectElementType(element)
      };
      
      children.push(childInfo);
      
      // Process grandchildren for important container elements
      if (this.shouldProcessGrandchildren(element)) {
        Array.from(element.children).forEach(child => {
          processElement(child, depth + 1);
        });
      }
    };
    
    // Process all direct children
    Array.from(parentElement.children).forEach(child => {
      processElement(child, 0);
    });
    
    return children;
  }

  /**
   * Detect the type of element for better widget mapping
   */
  detectElementType(element) {
    const tagName = element.tagName.toLowerCase();
    const classes = Array.from(element.classList);
    const hasImage = element.querySelector('img') || tagName === 'img';
    const hasIcon = element.querySelector('i, .icon, svg') || classes.some(cls => cls.includes('icon'));
    const isButton = tagName === 'button' || tagName === 'a' && classes.some(cls => cls.includes('btn'));
    const isNav = element.querySelector('nav, .menu, ul.nav') || classes.some(cls => cls.includes('nav') || cls.includes('menu'));
    const isSocial = classes.some(cls => cls.includes('social')) || element.querySelector('a[href*="facebook"], a[href*="instagram"]');
    
    if (hasImage && !hasIcon) return 'logo';
    if (isSocial) return 'social-icons';
    if (isNav) return 'navigation';
    if (isButton) return 'button';
    if (hasIcon && element.textContent.trim()) return 'icon-box';
    if (tagName.match(/h[1-6]/)) return 'heading';
    if (tagName === 'p' || element.textContent.trim().length > 20) return 'text';
    if (element.children.length > 1) return 'container';
    
    return 'generic';
  }

  /**
   * Check if element is too small to be meaningful
   */
  isElementTooSmall(element) {
    const rect = element.getBoundingClientRect();
    return rect.width < 10 || rect.height < 10;
  }

  /**
   * Check if element is hidden
   */
  isElementHidden(element) {
    const style = window.getComputedStyle(element);
    return style.display === 'none' || 
           style.visibility === 'hidden' || 
           style.opacity === '0' ||
           element.hidden;
  }

  /**
   * Determine if we should process grandchildren
   */
  shouldProcessGrandchildren(element) {
    const classes = Array.from(element.classList);
    
    // Process grandchildren for navigation menus and complex containers
    return classes.some(cls => 
      cls.includes('menu') || 
      cls.includes('nav') || 
      cls.includes('container') ||
      cls.includes('elementor-widget')
    ) && element.children.length > 0;
  }

  /**
   * Select single element (original logic)
   */
  selectSingleElement(element) {
    // Extract element data
    const elementData = window.CSSExtractor ? window.CSSExtractor.extractElementData(element) : {};
    if (!elementData) {
      console.error('Failed to extract element data');
      return;
    }
    
    const selectionInfo = {
      id: this.generateSelectionId(),
      element: element,
      data: elementData,
      isComplex: false,
      timestamp: Date.now()
    };
    
    this.selectedElements.push(selectionInfo);
    this.addSelectionOverlay(element);
    this.notifySelectionChange();
    
    console.log('Single element selected:', { 
      tagName: element.tagName, 
      id: selectionInfo.id, 
      totalSelected: this.selectedElements.length 
    });
  }

  /**
   * Deselect an element
   */
  deselectElement(element) {
    const index = this.selectedElements.findIndex(sel => sel.element === element);
    if (index === -1) return;
    
    this.selectedElements.splice(index, 1);
    this.removeSelectionOverlay(element);
    this.notifySelectionChange();
    
    console.log('Element deselected:', element.tagName);
  }

  /**
   * Check if element is selected
   */
  isElementSelected(element) {
    return this.selectedElements.some(sel => sel.element === element);
  }

  /**
   * Clear all selections
   */
  clearSelections() {
    this.selectedElements = [];
    this.clearSelectionOverlays();
    this.notifySelectionChange();
    console.log('All selections cleared');
  }

  /**
   * Add visual overlay for selected element
   */
  addSelectionOverlay(element) {
    // Remove existing overlay for this element
    this.removeSelectionOverlay(element);
    
    const rect = element.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    const overlay = document.createElement('div');
    overlay.className = 'elementor-selected-element-overlay';
    overlay.setAttribute('data-element-id', this.getElementId(element));
    overlay.style.cssText = `
      position: absolute;
      pointer-events: none;
      border: 2px solid #00D084;
      background: rgba(0, 208, 132, 0.1);
      z-index: 999996;
      box-sizing: border-box;
      left: ${rect.left + scrollLeft}px;
      top: ${rect.top + scrollTop}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
    `;
    
    this.selectionOverlay.appendChild(overlay);
  }

  /**
   * Remove selection overlay for element
   */
  removeSelectionOverlay(element) {
    const elementId = this.getElementId(element);
    const overlay = this.selectionOverlay.querySelector(`[data-element-id="${elementId}"]`);
    if (overlay) {
      overlay.remove();
    }
  }

  /**
   * Clear all selection overlays
   */
  clearSelectionOverlays() {
    if (this.selectionOverlay) {
      this.selectionOverlay.innerHTML = '';
    }
  }

  /**
   * Update selection overlays position (for scroll events)
   */
  updateSelectionOverlays() {
    if (!this.selectionOverlay) return;
    
    this.selectedElements.forEach(selectionInfo => {
      this.addSelectionOverlay(selectionInfo.element);
    });
  }

  /**
   * Get unique ID for element
   */
  getElementId(element) {
    if (element.id) return element.id;
    
    // Generate hash based on element position and content
    let hash = 0;
    const str = element.tagName + element.className + element.textContent.substring(0, 50);
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString();
  }

  /**
   * Generate unique selection ID
   */
  generateSelectionId() {
    return 'sel_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  /**
   * Add selection change callback
   */
  onSelectionChange(callback) {
    this.selectionCallbacks.push(callback);
  }

  /**
   * Notify about selection changes
   */
  notifySelectionChange() {
    console.log('Notifying selection change:', { 
      callbackCount: this.selectionCallbacks.length,
      selectedCount: this.selectedElements.length 
    });
    
    this.selectionCallbacks.forEach((callback, index) => {
      try {
        console.log(`Calling selection callback ${index}`);
        callback(this.selectedElements);
      } catch (error) {
        console.error(`Selection callback ${index} error:`, error);
      }
    });
  }

  /**
   * Get selected elements
   */
  getSelectedElements() {
    return this.selectedElements;
  }

  /**
   * Get selection statistics
   */
  getSelectionStats() {
    const stats = {
      count: this.selectedElements.length,
      types: {},
      totalSize: 0
    };
    
    this.selectedElements.forEach(sel => {
      const tagName = sel.element.tagName.toLowerCase();
      stats.types[tagName] = (stats.types[tagName] || 0) + 1;
      stats.totalSize += sel.element.outerHTML.length;
    });
    
    return stats;
  }

  /**
   * Select element by CSS selector
   */
  selectBySelector(selector) {
    const elements = document.querySelectorAll(selector);
    let selectedCount = 0;
    
    elements.forEach(element => {
      if (!this.isExtensionElement(element) && !this.isElementSelected(element)) {
        this.selectElement(element);
        selectedCount++;
      }
    });
    
    return selectedCount;
  }

  /**
   * Select all elements of specific type
   */
  selectByType(tagName) {
    return this.selectBySelector(tagName.toLowerCase());
  }

  /**
   * Highlight element without selecting it
   */
  highlightElementById(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      this.highlightElement(element);
      
      // Scroll element into view
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }

  /**
   * Remove element from selection by ID
   */
  removeSelectionById(selectionId) {
    const index = this.selectedElements.findIndex(sel => sel.id === selectionId);
    if (index !== -1) {
      const selectionInfo = this.selectedElements[index];
      this.selectedElements.splice(index, 1);
      this.removeSelectionOverlay(selectionInfo.element);
      this.notifySelectionChange();
      return true;
    }
    return false;
  }
}

// Handle window scroll to update overlays
let scrollTimeout;
window.addEventListener('scroll', () => {
  if (scrollTimeout) clearTimeout(scrollTimeout);
  
  scrollTimeout = setTimeout(() => {
    if (window.elementorSelector) {
      window.elementorSelector.updateSelectionOverlays();
    }
  }, 16); // ~60fps
}, { passive: true });

// Handle window resize
window.addEventListener('resize', () => {
  if (window.elementorSelector) {
    window.elementorSelector.updateSelectionOverlays();
  }
});

// Make ElementSelector available globally
window.ElementSelector = ElementSelector;