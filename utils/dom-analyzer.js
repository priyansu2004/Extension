/**
 * DOM Analyzer Engine
 * Detects semantic structure, layout types, and element relationships
 */

class DOMAnalyzer {
  constructor() {
    this.semanticTags = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer'];
    this.layoutPatterns = {
      flexbox: /display\s*:\s*flex|display\s*:\s*inline-flex/,
      grid: /display\s*:\s*grid|display\s*:\s*inline-grid/,
      absolute: /position\s*:\s*absolute|position\s*:\s*fixed/
    };
  }

  /**
   * Analyze element structure and return comprehensive data
   */
  analyzeElement(element) {
    if (!element || !element.nodeType || element.nodeType !== 1) {
      return null;
    }

    const computedStyle = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    return {
      // Basic info
      tagName: element.tagName.toLowerCase(),
      id: element.id || null,
      classes: Array.from(element.classList),
      textContent: this.extractTextContent(element),
      
      // Semantic structure
      semanticRole: this.detectSemanticRole(element),
      isSemantic: this.semanticTags.includes(element.tagName.toLowerCase()),
      
      // Layout detection
      layoutType: this.detectLayoutType(computedStyle),
      displayType: computedStyle.display,
      positionType: computedStyle.position,
      
      // Dimensions
      dimensions: {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom
      },
      
      // Z-index and stacking
      zIndex: this.parseZIndex(computedStyle.zIndex),
      stackingContext: this.isStackingContext(computedStyle),
      
      // Container properties
      containerType: this.detectContainerType(element, computedStyle),
      isBoxed: this.isBoxedContainer(element, computedStyle),
      maxWidth: this.parseMaxWidth(computedStyle.maxWidth),
      
      // Children analysis
      children: this.analyzeChildren(element),
      childCount: element.children.length,
      
      // Relationships
      parent: element.parentElement ? this.getParentInfo(element.parentElement) : null,
      siblings: this.analyzeSiblings(element),
      
      // Element reference (for later use)
      elementRef: element
    };
  }

  /**
   * Detect semantic role of element
   */
  detectSemanticRole(element) {
    const tag = element.tagName.toLowerCase();
    
    // Check semantic HTML5 tags
    if (this.semanticTags.includes(tag)) {
      return tag;
    }
    
    // Check ARIA roles
    const ariaRole = element.getAttribute('role');
    if (ariaRole) {
      return ariaRole;
    }
    
    // Check common patterns
    const classes = Array.from(element.classList);
    const id = element.id?.toLowerCase() || '';
    
    if (classes.some(c => /header|head|top/.test(c)) || /header|head|top/.test(id)) {
      return 'header';
    }
    if (classes.some(c => /footer|foot|bottom/.test(c)) || /footer|foot|bottom/.test(id)) {
      return 'footer';
    }
    if (classes.some(c => /nav|navigation|menu/.test(c)) || /nav|navigation|menu/.test(id)) {
      return 'nav';
    }
    if (classes.some(c => /main|content|body/.test(c)) || /main|content|body/.test(id)) {
      return 'main';
    }
    if (classes.some(c => /section|block|area/.test(c))) {
      return 'section';
    }
    
    return 'div';
  }

  /**
   * Detect layout type (flexbox, grid, absolute, etc.)
   */
  detectLayoutType(computedStyle) {
    const display = computedStyle.display;
    const position = computedStyle.position;
    
    if (this.layoutPatterns.flexbox.test(display)) {
      return 'flexbox';
    }
    if (this.layoutPatterns.grid.test(display)) {
      return 'grid';
    }
    if (position === 'absolute' || position === 'fixed') {
      return 'absolute';
    }
    if (position === 'relative') {
      return 'relative';
    }
    
    return 'block';
  }

  /**
   * Detect container type and constraints
   */
  detectContainerType(element, computedStyle) {
    const maxWidth = computedStyle.maxWidth;
    const width = computedStyle.width;
    const marginLeft = computedStyle.marginLeft;
    const marginRight = computedStyle.marginRight;
    
    // Full width container
    if (maxWidth === 'none' && width === '100%') {
      return 'full-width';
    }
    
    // Boxed container (has max-width)
    if (maxWidth !== 'none' && maxWidth !== 'auto') {
      return 'boxed';
    }
    
    // Centered container (auto margins)
    if (marginLeft === 'auto' && marginRight === 'auto') {
      return 'centered';
    }
    
    return 'default';
  }

  /**
   * Check if element is a boxed container
   */
  isBoxedContainer(element, computedStyle) {
    const maxWidth = computedStyle.maxWidth;
    return maxWidth !== 'none' && maxWidth !== 'auto' && maxWidth !== '';
  }

  /**
   * Parse max-width value
   */
  parseMaxWidth(maxWidthValue) {
    if (!maxWidthValue || maxWidthValue === 'none' || maxWidthValue === 'auto') {
      return null;
    }
    
    const match = maxWidthValue.match(/(\d+(?:\.\d+)?)(px|em|rem|%)/);
    if (match) {
      return {
        value: parseFloat(match[1]),
        unit: match[2]
      };
    }
    
    return null;
  }

  /**
   * Check if element creates stacking context
   */
  isStackingContext(computedStyle) {
    const zIndex = computedStyle.zIndex;
    const position = computedStyle.position;
    const opacity = parseFloat(computedStyle.opacity);
    const transform = computedStyle.transform;
    
    return (
      (zIndex !== 'auto' && (position === 'absolute' || position === 'relative' || position === 'fixed' || position === 'sticky')) ||
      opacity < 1 ||
      transform !== 'none'
    );
  }

  /**
   * Parse z-index value
   */
  parseZIndex(zIndexValue) {
    if (zIndexValue === 'auto') {
      return 0;
    }
    const parsed = parseInt(zIndexValue, 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Analyze children elements
   */
  analyzeChildren(element) {
    const children = Array.from(element.children);
    return children.map(child => ({
      tagName: child.tagName.toLowerCase(),
      id: child.id || null,
      classes: Array.from(child.classList),
      display: window.getComputedStyle(child).display
    }));
  }

  /**
   * Get parent element info
   */
  getParentInfo(parent) {
    if (!parent || parent === document.body || parent === document.documentElement) {
      return null;
    }
    
    return {
      tagName: parent.tagName.toLowerCase(),
      id: parent.id || null,
      classes: Array.from(parent.classList).slice(0, 5) // Limit to first 5 classes
    };
  }

  /**
   * Analyze sibling elements
   */
  analyzeSiblings(element) {
    if (!element.parentElement) {
      return [];
    }
    
    const siblings = Array.from(element.parentElement.children);
    return siblings
      .filter(sibling => sibling !== element)
      .map(sibling => ({
        tagName: sibling.tagName.toLowerCase(),
        id: sibling.id || null,
        classes: Array.from(sibling.classList).slice(0, 3)
      }));
  }

  /**
   * Extract meaningful text content
   */
  extractTextContent(element) {
    // Get direct text nodes
    const textNodes = Array.from(element.childNodes)
      .filter(node => node.nodeType === 3) // Text node
      .map(node => node.textContent.trim())
      .filter(text => text.length > 0);
    
    return textNodes.join(' ').substring(0, 200); // Limit to 200 chars
  }

  /**
   * Analyze entire page structure
   */
  analyzePageStructure() {
    const structure = {
      header: this.findSemanticElement('header'),
      nav: this.findSemanticElement('nav'),
      main: this.findSemanticElement('main'),
      sections: this.findAllSections(),
      footer: this.findSemanticElement('footer'),
      rootLayout: this.analyzeElement(document.body)
    };
    
    return structure;
  }

  /**
   * Find semantic element by tag
   */
  findSemanticElement(tagName) {
    const element = document.querySelector(tagName);
    return element ? this.analyzeElement(element) : null;
  }

  /**
   * Find all section elements
   */
  findAllSections() {
    const sections = document.querySelectorAll('section, [role="region"], .section, [class*="section"]');
    return Array.from(sections)
      .slice(0, 20) // Limit to first 20 sections
      .map(section => this.analyzeElement(section));
  }

  /**
   * Build element tree hierarchy
   */
  buildElementTree(rootElement, maxDepth = 5, currentDepth = 0) {
    if (currentDepth >= maxDepth || !rootElement) {
      return null;
    }
    
    const analysis = this.analyzeElement(rootElement);
    if (!analysis) {
      return null;
    }
    
    const children = Array.from(rootElement.children)
      .map(child => this.buildElementTree(child, maxDepth, currentDepth + 1))
      .filter(child => child !== null);
    
    return {
      ...analysis,
      children,
      depth: currentDepth
    };
  }
}

// Export for use in content script
if (typeof window !== 'undefined') {
  window.DOMAnalyzer = DOMAnalyzer;
}
