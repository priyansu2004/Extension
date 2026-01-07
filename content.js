/**
 * Content Script - Main Orchestrator
 * Coordinates DOM analysis, style extraction, and Elementor mapping
 */

// Global state - Single selection mode
let extensionState = {
  isActive: false,
  selectionMode: false,
  selectedElement: null, // Single element only
  lastHoveredElement: null
};

// Initialize analyzers
const domAnalyzer = new DOMAnalyzer();
const styleExtractor = new StyleExtractor();
const elementorMapper = new ElementorMapper();
const exportHandler = new ExportHandler();

/**
 * Listen for messages from background script and popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { action, data } = message;

  switch (action) {
    case 'ACTIVATE_SELECTION_MODE':
      activateSelectionMode();
      sendResponse({ success: true });
      break;

    case 'DEACTIVATE_SELECTION_MODE':
      deactivateSelectionMode();
      sendResponse({ success: true });
      break;

    case 'ANALYZE_ELEMENT':
      analyzeElement(data.element).then(result => {
        sendResponse({ success: true, data: result });
      });
      return true; // Async response

    case 'ANALYZE_SELECTED':
      analyzeSelectedElements().then(result => {
        sendResponse({ success: true, data: result });
      });
      return true;

    case 'EXPORT_DATA':
      exportData(data.format, data.options).then(result => {
        sendResponse({ success: true, data: result });
      });
      return true;

    case 'EXPORT_SELECTED':
      exportSelectedElements(data.format).then(result => {
        sendResponse({ success: true, data: result });
      }).catch(error => {
        sendResponse({ success: false, error: error.message });
      });
      return true;

    case 'EXPORT_HOVERED':
      exportHoveredElement(data.format).then(result => {
        sendResponse({ success: true, data: result });
      }).catch(error => {
        sendResponse({ success: false, error: error.message });
      });
      return true;

    case 'GET_HOVERED_ELEMENT':
      const hovered = getHoveredElement();
      sendResponse({ success: true, data: hovered });
      break;

    case 'GET_PAGE_STRUCTURE':
      const structure = getPageStructure();
      sendResponse({ success: true, data: structure });
      break;

    case 'GET_SELECTED_ELEMENT':
      sendResponse({ 
        success: true, 
        data: extensionState.selectedElement 
      });
      break;

    case 'CLEAR_SELECTION':
      clearSelection();
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }

  return true;
});

/**
 * Activate selection mode - Clean mode (no overlay bars)
 */
function activateSelectionMode() {
  extensionState.isActive = true;
  extensionState.selectionMode = true;
  
  // Enable hover highlighting
  enableHoverHighlighting();
  
  // Add keyboard shortcuts
  addKeyboardShortcuts();
  
  // Add body class for styling
  document.body.classList.add('elementor-converter-active');
  
  console.log('Elementor Converter: Inspect mode activated - Clean mode');
}

// Removed notification - clean website experience

/**
 * Deactivate selection mode
 */
function deactivateSelectionMode() {
  extensionState.isActive = false;
  extensionState.selectionMode = false;
  
  // Clear selection
  clearSelection();
  
  // Disable hover highlighting
  disableHoverHighlighting();
  
  // Remove all event listeners
  document.removeEventListener('click', handleElementClick, true);
  document.removeEventListener('mouseover', handleElementHover);
  document.removeEventListener('mouseout', handleElementUnhover);
  
  // Remove all extension classes from elements
  const highlightedElements = document.querySelectorAll('.elementor-converter-highlight, .elementor-converter-selected, .elementor-converter-hover');
  highlightedElements.forEach(el => {
    el.classList.remove('elementor-converter-highlight', 'elementor-converter-selected', 'elementor-converter-hover');
  });
  
  // Remove tooltip
  const tooltip = document.getElementById('elementor-converter-tooltip');
  if (tooltip) {
    tooltip.remove();
  }
  
  // Remove body class
  document.body.classList.remove('elementor-converter-active');
  
  // Reset state
  extensionState.selectedElement = null;
  extensionState.lastHoveredElement = null;
  
  console.log('Elementor Converter: Inspect mode deactivated');
}

/**
 * Inject overlay system
 */
function injectOverlay() {
  // Overlay is injected via overlay.js file
  // This function ensures it's loaded
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('overlay.js');
  script.onload = () => {
    script.remove();
    // Initialize overlay
    if (window.ElementorOverlay) {
      window.ElementorOverlay.init();
    }
  };
  (document.head || document.documentElement).appendChild(script);
}

/**
 * Enable hover highlighting - Chrome DevTools style
 */
function enableHoverHighlighting() {
  // Use capture phase to catch events early (like Chrome DevTools)
  document.addEventListener('mouseover', handleElementHover, { capture: true, passive: false });
  document.addEventListener('mouseout', handleElementHoverOut, { capture: true, passive: true });
  document.addEventListener('click', handleElementClick, { capture: true, passive: false });
  
  // Change cursor to crosshair like DevTools
  document.body.style.cursor = 'crosshair';
  document.body.setAttribute('data-inspect-mode', 'true');
  
  console.log('Hover highlighting enabled - Chrome DevTools style');
}

/**
 * Disable hover highlighting
 */
function disableHoverHighlighting() {
  document.removeEventListener('mouseover', handleElementHover, { capture: true });
  document.removeEventListener('mouseout', handleElementHoverOut, { capture: true });
  document.removeEventListener('click', handleElementClick, { capture: true });
  
  // Remove all highlights
  document.querySelectorAll('.elementor-converter-highlight').forEach(el => {
    if (!el.classList.contains('elementor-converter-selected')) {
      el.classList.remove('elementor-converter-highlight');
    }
  });
  
  // Hide tooltip
  hideElementInfo();
  
  // Restore cursor
  document.body.style.cursor = '';
  document.body.removeAttribute('data-inspect-mode');
  
  console.log('Hover highlighting disabled');
}

/**
 * Handle element hover - Chrome DevTools style
 */
function handleElementHover(event) {
  if (!extensionState.selectionMode) return;
  
  // Stop propagation to prevent interference
  event.stopPropagation();
  
  const element = event.target;
  
  // Skip body and html
  if (element === document.body || element === document.documentElement || !element) {
    return;
  }
  
  // Skip if hovering over overlay elements
  if (element.closest('#elementor-converter-overlay') || 
      element.closest('#elementor-converter-tooltip')) {
    return;
  }
  
  // Remove previous highlight
  document.querySelectorAll('.elementor-converter-highlight').forEach(el => {
    el.classList.remove('elementor-converter-highlight');
  });
  
  // Store last hovered element
  extensionState.lastHoveredElement = element;
  
  // Add highlight class with Chrome DevTools style
  element.classList.add('elementor-converter-highlight');
  
  // Show element info
  showElementInfo(element, event);
  
  // Prevent default to avoid page interactions
  event.preventDefault();
}

/**
 * Handle element hover out
 */
function handleElementHoverOut(event) {
  if (!extensionState.selectionMode) return;
  
  const element = event.target;
  
  // Skip if moving to child element (bubbling)
  if (event.relatedTarget && element.contains(event.relatedTarget)) {
    return;
  }
  
  // Only remove if not selected
  if (!element.classList.contains('elementor-converter-selected')) {
    element.classList.remove('elementor-converter-highlight');
  }
  
  // Hide tooltip if moving away
  if (!element.contains(event.relatedTarget)) {
    hideElementInfo();
  }
}

/**
 * Handle element click - Chrome DevTools style
 */
function handleElementClick(event) {
  if (!extensionState.selectionMode) return;
  
  const element = event.target;
  
  // Skip if clicking on overlay elements
  if (element.closest('#elementor-converter-overlay') || 
      element.closest('#elementor-converter-tooltip')) {
    return;
  }
  
  // Stop all propagation
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  
  // Toggle selection
  toggleElementSelection(element);
  
  // Keep highlight on selected element
  element.classList.add('elementor-converter-highlight');
  
  return false;
}

/**
 * Toggle element selection - Single selection only
 */
function toggleElementSelection(element) {
  // Remove previous selection
  if (extensionState.selectedElement) {
    extensionState.selectedElement.element.classList.remove('elementor-converter-selected');
  }
  
  // Check if clicking the same element (deselect)
  if (extensionState.selectedElement && extensionState.selectedElement.element === element) {
    extensionState.selectedElement = null;
    hideElementInfo();
    
    // Notify popup
    chrome.runtime.sendMessage({
      action: 'ELEMENT_SELECTED',
      data: null
    });
    return;
  }
  
  // Select new element (single selection)
  element.classList.add('elementor-converter-selected');
  element.classList.add('elementor-converter-highlight');
  
  // Analyze element immediately
  const analysis = domAnalyzer.analyzeElement(element);
  const styles = styleExtractor.extractStyles(element, { includeResponsive: true });
  
  extensionState.selectedElement = {
    element: element,
    selector: generateSelector(element),
    analysis: analysis,
    styles: styles,
    timestamp: Date.now()
  };
  
  // Show element info
  showElementInfo(element, { pageX: 0, pageY: 0 });
  
  // Notify popup
  chrome.runtime.sendMessage({
    action: 'ELEMENT_SELECTED',
    data: extensionState.selectedElement
  });
}

/**
 * Generate CSS selector for element
 */
function generateSelector(element) {
  if (element.id) {
    return `#${element.id}`;
  }
  
  const path = [];
  while (element && element.nodeType === Node.ELEMENT_NODE) {
    let selector = element.nodeName.toLowerCase();
    
    if (element.className) {
      const classes = Array.from(element.classList)
        .filter(c => !c.includes('elementor-converter'))
        .slice(0, 2)
        .join('.');
      if (classes) {
        selector += '.' + classes;
      }
    }
    
    path.unshift(selector);
    element = element.parentElement;
    
    // Limit path length
    if (path.length > 5) break;
  }
  
  return path.join(' > ');
}

/**
 * Show element info tooltip - Minimal tooltip (only when hovering)
 */
function showElementInfo(element, event) {
  // Only show tooltip when hovering (not when selected)
  if (element.classList.contains('elementor-converter-selected')) {
    return;
  }
  
  const analysis = domAnalyzer.analyzeElement(element);
  if (!analysis) return;
  
  const rect = element.getBoundingClientRect();
  
  // Create or update info tooltip
  let tooltip = document.getElementById('elementor-converter-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'elementor-converter-tooltip';
    tooltip.className = 'elementor-converter-tooltip';
    document.body.appendChild(tooltip);
  }
  
  // Build tag info
  let tagInfo = analysis.tagName.toUpperCase();
  if (analysis.id) {
    tagInfo += `#${analysis.id}`;
  }
  if (analysis.classes.length > 0) {
    tagInfo += `.${analysis.classes.slice(0, 2).join('.')}`;
  }
  
  tooltip.innerHTML = `
    <div class="tooltip-header">${tagInfo}</div>
    <div class="tooltip-content">
      <div class="tooltip-dimensions">
        <span>${Math.round(rect.width)} × ${Math.round(rect.height)}px</span>
      </div>
      <div class="tooltip-hint">Click to select</div>
    </div>
  `;
  
  // Position tooltip above element
  const tooltipRect = tooltip.getBoundingClientRect();
  let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
  let top = rect.top - tooltipRect.height - 10;
  
  // Adjust if tooltip goes off screen
  if (left < 10) left = 10;
  if (left + tooltipRect.width > window.innerWidth - 10) {
    left = window.innerWidth - tooltipRect.width - 10;
  }
  if (top < 10) {
    top = rect.bottom + 10;
  }
  
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
  tooltip.style.display = 'block';
}

/**
 * Hide element info tooltip
 */
function hideElementInfo() {
  const tooltip = document.getElementById('elementor-converter-tooltip');
  if (tooltip) {
    tooltip.style.display = 'none';
  }
}

/**
 * Clear selection
 */
function clearSelection() {
  if (extensionState.selectedElement) {
    extensionState.selectedElement.element.classList.remove('elementor-converter-selected');
    extensionState.selectedElement.element.classList.remove('elementor-converter-highlight');
    extensionState.selectedElement = null;
    hideElementInfo();
  }
}

/**
 * Analyze a single element
 */
async function analyzeElement(elementOrSelector) {
  let element;
  
  if (typeof elementOrSelector === 'string') {
    element = document.querySelector(elementOrSelector);
  } else {
    element = elementOrSelector;
  }
  
  if (!element) {
    throw new Error('Element not found');
  }
  
  // Analyze DOM structure
  const analysis = domAnalyzer.analyzeElement(element);
  
  // Extract styles
  const styles = styleExtractor.extractStyles(element, {
    includeResponsive: true
  });
  
  // Map to Elementor
  const elementorWidget = elementorMapper.mapToElementorWidget(analysis, styles);
  
  return {
    analysis,
    styles,
    elementorWidget,
    selector: generateSelector(element)
  };
}

/**
 * Analyze all selected elements
 */
async function analyzeSelectedElements() {
  const results = [];
  
  for (const selected of extensionState.selectedElements) {
    try {
      const result = await analyzeElement(selected.element);
      results.push(result);
    } catch (error) {
      console.error('Error analyzing element:', error);
    }
  }
  
  extensionState.analyzedElements = results;
  return results;
}

/**
 * Get page structure
 */
function getPageStructure() {
  return domAnalyzer.analyzePageStructure();
}

/**
 * Select element by selector
 */
function selectElement(selector) {
  const element = document.querySelector(selector);
  if (element) {
    toggleElementSelection(element);
  }
}

/**
 * Clear all selections
 */
function clearSelection() {
  extensionState.selectedElements.forEach(selected => {
    selected.element.classList.remove('elementor-converter-selected');
  });
  extensionState.selectedElements = [];
  updateSelectionCount();
}

/**
 * Export data
 */
async function exportData(format, options = {}) {
  // Ensure elements are analyzed
  if (extensionState.analyzedElements.length === 0) {
    await analyzeSelectedElements();
  }
  
  // Prepare elements for export
  const elements = extensionState.analyzedElements.map(result => ({
    analysis: result.analysis,
    styles: result.styles
  }));
  
  // Export
  const exportData = exportHandler.export(elements, format, {
    title: document.title,
    filename: options.filename || `elementor-export-${Date.now()}`,
    ...options
  });
  
  return exportData;
}

/**
 * Export selected element (single selection)
 */
async function exportSelectedElements(format = 'json') {
  if (!extensionState.selectedElement) {
    throw new Error('No element selected');
  }
  
  // Use already analyzed element or analyze now
  let result;
  if (extensionState.selectedElement.analysis && extensionState.selectedElement.styles) {
    result = {
      analysis: extensionState.selectedElement.analysis,
      styles: extensionState.selectedElement.styles
    };
  } else {
    result = await analyzeElement(extensionState.selectedElement.element);
  }
  
  // Prepare for export
  const elements = [{
    analysis: result.analysis,
    styles: result.styles
  }];
  
  // Export
  const exportData = exportHandler.export(elements, format, {
    title: document.title,
    filename: `elementor-${extensionState.selectedElement.analysis.tagName || 'element'}-${Date.now()}.${format === 'json' ? 'json' : format === 'html' ? 'html' : 'json'}`
  });
  
  return exportData;
}

/**
 * Export hovered element
 */
async function exportHoveredElement(format = 'json') {
  const element = extensionState.lastHoveredElement;
  
  if (!element) {
    throw new Error('No element hovered');
  }
  
  // Analyze hovered element
  const result = await analyzeElement(element);
  
  // Prepare for export
  const elements = [{
    analysis: result.analysis,
    styles: result.styles
  }];
  
  // Export
  const exportData = exportHandler.export(elements, format, {
    title: document.title,
    filename: `elementor-hovered-${Date.now()}.json`
  });
  
  return exportData;
}

/**
 * Get hovered element
 */
function getHoveredElement() {
  return extensionState.lastHoveredElement ? {
    element: extensionState.lastHoveredElement,
    selector: generateSelector(extensionState.lastHoveredElement)
  } : null;
}

/**
 * Add keyboard shortcuts
 */
function addKeyboardShortcuts() {
  document.addEventListener('keydown', (event) => {
    // Escape to exit selection mode
    if (event.key === 'Escape' && extensionState.selectionMode) {
      deactivateSelectionMode();
      chrome.runtime.sendMessage({
        action: 'TOGGLE_EXTENSION',
        data: { enabled: false }
      });
    }
    
    // Ctrl/Cmd + S to save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      // Trigger save
      chrome.runtime.sendMessage({
        action: 'SAVE_PROJECT',
        data: {
          id: extensionState.currentProject?.id || `project_${Date.now()}`,
          elements: extensionState.analyzedElements,
          selectedElements: extensionState.selectedElements
        }
      });
    }
  });
}

// Track if already initialized to prevent double initialization
let isInitialized = false;

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

function initialize() {
  if (isInitialized) {
    return; // Prevent double initialization
  }
  isInitialized = true;
  
  console.log('Elementor Pro Converter: Content script loaded');
  
  // Check if extension should be active
  chrome.storage.local.get(['extensionActive'], (result) => {
    if (result.extensionActive) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        activateSelectionMode();
      }, 100);
    }
  });
}

// Listen for extension disable/enable from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'CHECK_CONTENT_SCRIPT') {
    sendResponse({ ready: true, initialized: isInitialized });
    return;
  }
});
