/**
 * CSS Extractor Utility Functions
 * Handles extraction and parsing of CSS styles from DOM elements
 */

class CSSExtractor {
  /**
   * Extract all computed styles from an element
   */
  static extractAllStyles(element) {
    const computedStyle = window.getComputedStyle(element);
    const styles = {};
    
    // Convert computed style to plain object
    for (let i = 0; i < computedStyle.length; i++) {
      const property = computedStyle[i];
      styles[property] = computedStyle.getPropertyValue(property);
    }
    
    return styles;
  }

  /**
   * Extract typography properties
   */
  static extractTypography(element) {
    const style = window.getComputedStyle(element);
    
    return {
      fontFamily: style.fontFamily.replace(/"/g, ''),
      fontSize: this.parseUnit(style.fontSize),
      fontWeight: style.fontWeight,
      fontStyle: style.fontStyle,
      lineHeight: this.parseUnit(style.lineHeight),
      letterSpacing: this.parseUnit(style.letterSpacing),
      textAlign: style.textAlign,
      textTransform: style.textTransform,
      textDecoration: style.textDecoration,
      color: this.rgbToHex(style.color)
    };
  }

  /**
   * Extract spacing properties (margin/padding)
   */
  static extractSpacing(element) {
    const style = window.getComputedStyle(element);
    
    return {
      margin: {
        top: this.parseUnit(style.marginTop),
        right: this.parseUnit(style.marginRight), 
        bottom: this.parseUnit(style.marginBottom),
        left: this.parseUnit(style.marginLeft)
      },
      padding: {
        top: this.parseUnit(style.paddingTop),
        right: this.parseUnit(style.paddingRight),
        bottom: this.parseUnit(style.paddingBottom),
        left: this.parseUnit(style.paddingLeft)
      }
    };
  }

  /**
   * Extract background properties
   */
  static extractBackground(element) {
    const style = window.getComputedStyle(element);
    
    return {
      backgroundColor: this.rgbToHex(style.backgroundColor),
      backgroundImage: style.backgroundImage !== 'none' ? style.backgroundImage : null,
      backgroundSize: style.backgroundSize,
      backgroundPosition: style.backgroundPosition,
      backgroundRepeat: style.backgroundRepeat,
      backgroundAttachment: style.backgroundAttachment
    };
  }

  /**
   * Extract border properties
   */
  static extractBorder(element) {
    const style = window.getComputedStyle(element);
    
    return {
      borderWidth: {
        top: this.parseUnit(style.borderTopWidth),
        right: this.parseUnit(style.borderRightWidth),
        bottom: this.parseUnit(style.borderBottomWidth),
        left: this.parseUnit(style.borderLeftWidth)
      },
      borderStyle: {
        top: style.borderTopStyle,
        right: style.borderRightStyle,
        bottom: style.borderBottomStyle,
        left: style.borderLeftStyle
      },
      borderColor: {
        top: this.rgbToHex(style.borderTopColor),
        right: this.rgbToHex(style.borderRightColor),
        bottom: this.rgbToHex(style.borderBottomColor),
        left: this.rgbToHex(style.borderLeftColor)
      },
      borderRadius: {
        topLeft: this.parseUnit(style.borderTopLeftRadius),
        topRight: this.parseUnit(style.borderTopRightRadius),
        bottomRight: this.parseUnit(style.borderBottomRightRadius),
        bottomLeft: this.parseUnit(style.borderBottomLeftRadius)
      }
    };
  }

  /**
   * Extract position and layout properties
   */
  static extractLayout(element) {
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    
    return {
      position: style.position,
      display: style.display,
      width: this.parseUnit(style.width),
      height: this.parseUnit(style.height),
      minWidth: this.parseUnit(style.minWidth),
      maxWidth: this.parseUnit(style.maxWidth),
      minHeight: this.parseUnit(style.minHeight),
      maxHeight: this.parseUnit(style.maxHeight),
      top: this.parseUnit(style.top),
      right: this.parseUnit(style.right),
      bottom: this.parseUnit(style.bottom),
      left: this.parseUnit(style.left),
      zIndex: style.zIndex,
      overflow: style.overflow,
      float: style.float,
      clear: style.clear,
      boundingRect: {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        top: Math.round(rect.top),
        left: Math.round(rect.left)
      }
    };
  }

  /**
   * Extract flexbox properties
   */
  static extractFlexbox(element) {
    const style = window.getComputedStyle(element);
    
    return {
      display: style.display,
      flexDirection: style.flexDirection,
      flexWrap: style.flexWrap,
      justifyContent: style.justifyContent,
      alignItems: style.alignItems,
      alignContent: style.alignContent,
      gap: this.parseUnit(style.gap),
      rowGap: this.parseUnit(style.rowGap),
      columnGap: this.parseUnit(style.columnGap),
      flex: style.flex,
      flexGrow: style.flexGrow,
      flexShrink: style.flexShrink,
      flexBasis: style.flexBasis,
      alignSelf: style.alignSelf
    };
  }

  /**
   * Extract responsive behavior by checking different screen sizes
   */
  static extractResponsiveData(element) {
    const breakpoints = {
      desktop: { min: 1025, max: Infinity },
      tablet: { min: 769, max: 1024 },
      mobile: { min: 0, max: 768 }
    };

    const responsiveData = {};
    const currentWidth = window.innerWidth;

    // Determine current breakpoint
    let currentBreakpoint = 'desktop';
    if (currentWidth <= 768) currentBreakpoint = 'mobile';
    else if (currentWidth <= 1024) currentBreakpoint = 'tablet';

    responsiveData[currentBreakpoint] = {
      typography: this.extractTypography(element),
      spacing: this.extractSpacing(element),
      layout: this.extractLayout(element)
    };

    return responsiveData;
  }

  /**
   * Parse CSS unit values (px, em, rem, %, etc.)
   */
  static parseUnit(value) {
    if (!value || value === 'auto' || value === 'none') {
      return { size: 0, unit: 'px' };
    }

    const match = value.match(/^(-?\d*\.?\d+)(\w+|%)$/);
    if (match) {
      return {
        size: parseFloat(match[1]),
        unit: match[2]
      };
    }

    // Handle numeric values without units (assume px)
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      return { size: numericValue, unit: 'px' };
    }

    return { size: 0, unit: 'px' };
  }

  /**
   * Convert RGB/RGBA colors to HEX format
   */
  static rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent') return '#000000';
    
    // Check if already hex
    if (rgb.startsWith('#')) return rgb;
    
    // Parse rgb() or rgba() values
    const match = rgb.match(/rgba?\(([^)]+)\)/);
    if (!match) return '#000000';
    
    const values = match[1].split(',').map(v => parseInt(v.trim()));
    if (values.length < 3) return '#000000';
    
    const [r, g, b] = values;
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  /**
   * Get element's unique identifier (ID, class, or tag)
   */
  static getElementIdentifier(element) {
    if (element.id) return `#${element.id}`;
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.trim());
      if (classes.length > 0) return `.${classes[0]}`;
    }
    return element.tagName.toLowerCase();
  }

  /**
   * Extract all relevant CSS data for an element
   */
  static extractElementData(element) {
    try {
      return {
        tagName: element.tagName.toLowerCase(),
        id: element.id,
        classes: Array.from(element.classList),
        textContent: element.textContent ? element.textContent.trim().substring(0, 200) : '',
        innerHTML: element.innerHTML.length > 500 ? element.innerHTML.substring(0, 500) + '...' : element.innerHTML,
        attributes: this.getElementAttributes(element),
        typography: this.extractTypography(element),
        spacing: this.extractSpacing(element),
        background: this.extractBackground(element),
        border: this.extractBorder(element),
        layout: this.extractLayout(element),
        flexbox: this.extractFlexbox(element),
        responsive: this.extractResponsiveData(element),
        computedStyles: this.extractAllStyles(element)
      };
    } catch (error) {
      console.error('Error extracting element data:', error);
      return null;
    }
  }

  /**
   * Get all attributes of an element
   */
  static getElementAttributes(element) {
    const attributes = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attributes[attr.name] = attr.value;
    }
    return attributes;
  }

  /**
   * Check if element has specific CSS property
   */
  static hasProperty(element, property) {
    const style = window.getComputedStyle(element);
    return style.getPropertyValue(property) !== '';
  }

  /**
   * Get the most specific selector for an element
   */
  static getElementSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }

    const classes = Array.from(element.classList);
    if (classes.length > 0) {
      return `.${classes.join('.')}`;
    }

    // Create path-based selector
    const path = [];
    let current = element;
    
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      
      if (current.id) {
        selector += `#${current.id}`;
        path.unshift(selector);
        break;
      }
      
      if (current.className) {
        const classes = Array.from(current.classList);
        if (classes.length > 0) {
          selector += `.${classes[0]}`;
        }
      }
      
      // Add nth-child if needed to make selector unique
      const siblings = Array.from(current.parentElement?.children || []);
      const sameTag = siblings.filter(el => el.tagName === current.tagName);
      if (sameTag.length > 1) {
        const index = sameTag.indexOf(current) + 1;
        selector += `:nth-child(${index})`;
      }
      
      path.unshift(selector);
      current = current.parentElement;
    }

    return path.join(' > ');
  }
}

// Make CSSExtractor available globally
window.CSSExtractor = CSSExtractor;