/**
 * Style Extractor Engine
 * Extracts computed styles, responsive values, animations, and fonts
 */

class StyleExtractor {
  constructor() {
    this.unitConversions = {
      'px': 1,
      'em': 16, // Default base, will be calculated per element
      'rem': 16,
      'pt': 1.33,
      'vh': window.innerHeight / 100,
      'vw': window.innerWidth / 100
    };
  }

  /**
   * Extract all relevant styles from element
   */
  extractStyles(element, options = {}) {
    if (!element || element.nodeType !== 1) {
      return null;
    }

    const computedStyle = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    
    return {
      // Typography
      typography: this.extractTypography(computedStyle, element),
      
      // Colors
      colors: this.extractColors(computedStyle),
      
      // Spacing
      spacing: this.extractSpacing(computedStyle, rect),
      
      // Layout
      layout: this.extractLayout(computedStyle),
      
      // Background
      background: this.extractBackground(computedStyle, element),
      
      // Borders
      borders: this.extractBorders(computedStyle),
      
      // Effects
      effects: this.extractEffects(computedStyle),
      
      // Animations
      animations: this.extractAnimations(computedStyle, element),
      
      // Responsive (if media queries detected)
      responsive: options.includeResponsive ? this.extractResponsive(element) : null,
      
      // Custom fonts
      fonts: this.extractFonts(computedStyle, element)
    };
  }

  /**
   * Extract typography styles
   */
  extractTypography(computedStyle, element) {
    const fontSize = this.normalizeUnit(computedStyle.fontSize);
    const lineHeight = this.normalizeLineHeight(computedStyle.lineHeight, fontSize.value);
    
    return {
      fontFamily: computedStyle.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
      fontSize: fontSize,
      fontWeight: this.parseFontWeight(computedStyle.fontWeight),
      lineHeight: lineHeight,
      letterSpacing: this.normalizeUnit(computedStyle.letterSpacing),
      textAlign: computedStyle.textAlign,
      textTransform: computedStyle.textTransform,
      textDecoration: computedStyle.textDecoration,
      color: computedStyle.color
    };
  }

  /**
   * Extract color information
   */
  extractColors(computedStyle) {
    return {
      color: computedStyle.color,
      backgroundColor: computedStyle.backgroundColor,
      borderColor: computedStyle.borderColor,
      // Check for gradient
      backgroundImage: computedStyle.backgroundImage !== 'none' ? computedStyle.backgroundImage : null
    };
  }

  /**
   * Extract spacing (padding, margin)
   */
  extractSpacing(computedStyle, rect) {
    return {
      padding: {
        top: this.normalizeUnit(computedStyle.paddingTop),
        right: this.normalizeUnit(computedStyle.paddingRight),
        bottom: this.normalizeUnit(computedStyle.paddingBottom),
        left: this.normalizeUnit(computedStyle.paddingLeft)
      },
      margin: {
        top: this.normalizeUnit(computedStyle.marginTop),
        right: this.normalizeUnit(computedStyle.marginRight),
        bottom: this.normalizeUnit(computedStyle.marginBottom),
        left: this.normalizeUnit(computedStyle.marginLeft)
      }
    };
  }

  /**
   * Extract layout properties
   */
  extractLayout(computedStyle) {
    return {
      display: computedStyle.display,
      position: computedStyle.position,
      flexDirection: computedStyle.flexDirection,
      justifyContent: computedStyle.justifyContent,
      alignItems: computedStyle.alignItems,
      flexWrap: computedStyle.flexWrap,
      gap: this.normalizeUnit(computedStyle.gap),
      gridTemplateColumns: computedStyle.gridTemplateColumns,
      gridTemplateRows: computedStyle.gridTemplateRows,
      gridGap: this.normalizeUnit(computedStyle.gridGap),
      width: computedStyle.width,
      height: computedStyle.height,
      minWidth: computedStyle.minWidth,
      minHeight: computedStyle.minHeight,
      maxWidth: computedStyle.maxWidth,
      maxHeight: computedStyle.maxHeight
    };
  }

  /**
   * Extract background properties
   */
  extractBackground(computedStyle, element) {
    const bgImage = computedStyle.backgroundImage;
    const bgSize = computedStyle.backgroundSize;
    const bgPosition = computedStyle.backgroundPosition;
    const bgRepeat = computedStyle.backgroundRepeat;
    const bgAttachment = computedStyle.backgroundAttachment;
    
    // Check for gradient
    const isGradient = bgImage && (bgImage.includes('gradient') || bgImage.includes('linear-gradient') || bgImage.includes('radial-gradient'));
    
    // Check for image URL
    let imageUrl = null;
    if (bgImage && bgImage !== 'none' && !isGradient) {
      const urlMatch = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
      if (urlMatch) {
        imageUrl = urlMatch[1];
        // Convert relative URLs to absolute
        if (imageUrl.startsWith('/') || !imageUrl.startsWith('http')) {
          try {
            imageUrl = new URL(imageUrl, window.location.href).href;
          } catch (e) {
            // Keep original if URL construction fails
          }
        }
      }
    }
    
    return {
      backgroundColor: computedStyle.backgroundColor,
      backgroundImage: bgImage !== 'none' ? bgImage : null,
      backgroundSize: bgSize,
      backgroundPosition: bgPosition,
      backgroundRepeat: bgRepeat,
      backgroundAttachment: bgAttachment,
      isGradient: isGradient,
      imageUrl: imageUrl,
      overlay: this.detectOverlay(element)
    };
  }

  /**
   * Detect overlay (pseudo-elements with backgrounds)
   */
  detectOverlay(element) {
    const before = window.getComputedStyle(element, '::before');
    const after = window.getComputedStyle(element, '::after');
    
    const hasBeforeOverlay = before.content !== 'none' && 
      (before.backgroundColor !== 'rgba(0, 0, 0, 0)' || before.backgroundImage !== 'none');
    const hasAfterOverlay = after.content !== 'none' && 
      (after.backgroundColor !== 'rgba(0, 0, 0, 0)' || after.backgroundImage !== 'none');
    
    if (hasBeforeOverlay || hasAfterOverlay) {
      return {
        hasOverlay: true,
        position: before.position || after.position,
        opacity: parseFloat(before.opacity || after.opacity || '1'),
        backgroundColor: before.backgroundColor !== 'rgba(0, 0, 0, 0)' ? before.backgroundColor : after.backgroundColor
      };
    }
    
    return { hasOverlay: false };
  }

  /**
   * Extract border properties
   */
  extractBorders(computedStyle) {
    return {
      borderWidth: {
        top: this.normalizeUnit(computedStyle.borderTopWidth),
        right: this.normalizeUnit(computedStyle.borderRightWidth),
        bottom: this.normalizeUnit(computedStyle.borderBottomWidth),
        left: this.normalizeUnit(computedStyle.borderLeftWidth)
      },
      borderStyle: {
        top: computedStyle.borderTopStyle,
        right: computedStyle.borderRightStyle,
        bottom: computedStyle.borderBottomStyle,
        left: computedStyle.borderLeftStyle
      },
      borderColor: {
        top: computedStyle.borderTopColor,
        right: computedStyle.borderRightColor,
        bottom: computedStyle.borderBottomColor,
        left: computedStyle.borderLeftColor
      },
      borderRadius: {
        topLeft: this.normalizeUnit(computedStyle.borderTopLeftRadius),
        topRight: this.normalizeUnit(computedStyle.borderTopRightRadius),
        bottomRight: this.normalizeUnit(computedStyle.borderBottomRightRadius),
        bottomLeft: this.normalizeUnit(computedStyle.borderBottomLeftRadius)
      }
    };
  }

  /**
   * Extract visual effects
   */
  extractEffects(computedStyle) {
    return {
      boxShadow: computedStyle.boxShadow !== 'none' ? this.parseBoxShadow(computedStyle.boxShadow) : null,
      opacity: parseFloat(computedStyle.opacity),
      transform: computedStyle.transform !== 'none' ? computedStyle.transform : null,
      filter: computedStyle.filter !== 'none' ? computedStyle.filter : null,
      backdropFilter: computedStyle.backdropFilter !== 'none' ? computedStyle.backdropFilter : null
    };
  }

  /**
   * Extract animations and transitions
   */
  extractAnimations(computedStyle, element) {
    const transitions = this.parseTransitions(computedStyle.transition);
    const animations = this.parseAnimations(computedStyle.animation);
    
    // Check for GSAP
    const hasGSAP = window.gsap || element.__gsap || document.querySelector('script[src*="gsap"]');
    
    // Check for AOS
    const hasAOS = element.hasAttribute('data-aos') || document.querySelector('script[src*="aos"]');
    
    // Check for Scroll animations
    const hasScrollAnimations = element.hasAttribute('data-scroll') || 
      element.classList.toString().includes('scroll') ||
      window.ScrollMagic;
    
    return {
      transitions: transitions,
      animations: animations,
      hasGSAP: !!hasGSAP,
      hasAOS: !!hasAOS,
      hasScrollAnimations: !!hasScrollAnimations,
      hoverStates: this.detectHoverStates(element)
    };
  }

  /**
   * Detect hover states
   */
  detectHoverStates(element) {
    // Check if element has :hover styles
    const stylesheets = Array.from(document.styleSheets);
    const hoverRules = [];
    
    try {
      stylesheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          rules.forEach(rule => {
            if (rule.selectorText && rule.selectorText.includes(':hover')) {
              // Check if selector matches this element
              try {
                if (element.matches(rule.selectorText.replace(':hover', ''))) {
                  hoverRules.push({
                    selector: rule.selectorText,
                    styles: rule.style.cssText
                  });
                }
              } catch (e) {
                // Ignore invalid selectors
              }
            }
          });
        } catch (e) {
          // Cross-origin stylesheet, skip
        }
      });
    } catch (e) {
      // Error accessing stylesheets
    }
    
    return hoverRules.length > 0 ? hoverRules : null;
  }

  /**
   * Extract responsive breakpoints
   */
  extractResponsive(element) {
    // This would require parsing stylesheets for media queries
    // For now, return a simplified version
    return {
      mobile: this.getMediaQueryStyles(element, '(max-width: 768px)'),
      tablet: this.getMediaQueryStyles(element, '(min-width: 769px) and (max-width: 1024px)'),
      desktop: this.getMediaQueryStyles(element, '(min-width: 1025px)')
    };
  }

  /**
   * Get styles for specific media query
   */
  getMediaQueryStyles(element, mediaQuery) {
    // Simplified - would need full stylesheet parsing
    return null;
  }

  /**
   * Extract font information
   */
  extractFonts(computedStyle, element) {
    const fontFamily = computedStyle.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
    
    // Check if it's a Google Font
    const isGoogleFont = this.isGoogleFont(fontFamily);
    
    // Check if font is loaded
    const isLoaded = document.fonts.check(`1em "${fontFamily}"`);
    
    return {
      fontFamily: fontFamily,
      isGoogleFont: isGoogleFont,
      isLoaded: isLoaded,
      fontWeight: computedStyle.fontWeight,
      fontStyle: computedStyle.fontStyle
    };
  }

  /**
   * Check if font is a Google Font
   */
  isGoogleFont(fontFamily) {
    // Common Google Fonts list (simplified)
    const googleFonts = [
      'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Source Sans Pro',
      'Raleway', 'PT Sans', 'Ubuntu', 'Playfair Display', 'Merriweather'
    ];
    
    return googleFonts.some(font => fontFamily.includes(font));
  }

  /**
   * Normalize CSS unit to pixels
   */
  normalizeUnit(value) {
    if (!value || value === 'auto' || value === 'none' || value === '0') {
      return { value: 0, unit: 'px', original: value };
    }
    
    const match = value.match(/([-+]?\d*\.?\d+)(px|em|rem|pt|vh|vw|%)/);
    if (match) {
      return {
        value: parseFloat(match[1]),
        unit: match[2],
        original: value
      };
    }
    
    // Try to parse as number
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      return { value: numValue, unit: 'px', original: value };
    }
    
    return { value: 0, unit: 'px', original: value };
  }

  /**
   * Normalize line-height
   */
  normalizeLineHeight(lineHeight, fontSize) {
    if (!lineHeight || lineHeight === 'normal') {
      return { value: 1.5, unit: 'ratio', original: lineHeight };
    }
    
    // If it's a number (unitless), return as ratio
    const numValue = parseFloat(lineHeight);
    if (!isNaN(numValue) && lineHeight === numValue.toString()) {
      return { value: numValue, unit: 'ratio', original: lineHeight };
    }
    
    // Otherwise normalize as unit
    return this.normalizeUnit(lineHeight);
  }

  /**
   * Parse font weight
   */
  parseFontWeight(fontWeight) {
    const weightMap = {
      'normal': 400,
      'bold': 700,
      'lighter': 300,
      'bolder': 700
    };
    
    if (weightMap[fontWeight]) {
      return weightMap[fontWeight];
    }
    
    const numValue = parseInt(fontWeight, 10);
    return isNaN(numValue) ? 400 : numValue;
  }

  /**
   * Parse box shadow
   */
  parseBoxShadow(boxShadow) {
    // Simplified parser - returns array of shadow objects
    const shadows = boxShadow.split(',').map(shadow => {
      const parts = shadow.trim().split(/\s+/);
      return {
        offsetX: parts[0] || '0px',
        offsetY: parts[1] || '0px',
        blur: parts[2] || '0px',
        spread: parts[3] || '0px',
        color: parts[4] || 'rgba(0,0,0,0.3)',
        inset: shadow.includes('inset')
      };
    });
    
    return shadows;
  }

  /**
   * Parse transitions
   */
  parseTransitions(transitionValue) {
    if (!transitionValue || transitionValue === 'none' || transitionValue === 'all 0s ease 0s') {
      return [];
    }
    
    const transitions = transitionValue.split(',').map(trans => {
      const parts = trans.trim().split(/\s+/);
      return {
        property: parts[0] || 'all',
        duration: parts[1] || '0s',
        timingFunction: parts[2] || 'ease',
        delay: parts[3] || '0s'
      };
    });
    
    return transitions;
  }

  /**
   * Parse animations
   */
  parseAnimations(animationValue) {
    if (!animationValue || animationValue === 'none') {
      return [];
    }
    
    const animations = animationValue.split(',').map(anim => {
      const parts = anim.trim().split(/\s+/);
      return {
        name: parts[0] || 'none',
        duration: parts[1] || '0s',
        timingFunction: parts[2] || 'ease',
        delay: parts[3] || '0s',
        iterationCount: parts[4] || '1',
        direction: parts[5] || 'normal',
        fillMode: parts[6] || 'none',
        playState: parts[7] || 'running'
      };
    });
    
    return animations;
  }
}

// Export for use in content script
if (typeof window !== 'undefined') {
  window.StyleExtractor = StyleExtractor;
}
