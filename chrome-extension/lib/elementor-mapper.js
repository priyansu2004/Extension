/**
 * Elementor Mapper - Converts HTML elements to Elementor JSON format
 * Maps HTML structure to Elementor widgets and containers
 */

class ElementorMapper {
  
  /**
   * Generate unique ID for Elementor elements
   */
  static generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Map HTML element to appropriate Elementor widget type
   */
  static getElementorWidgetType(element) {
    const tagName = element.tagName.toLowerCase();
    
    // Widget type mapping
    const mapping = {
      'h1': 'heading',
      'h2': 'heading', 
      'h3': 'heading',
      'h4': 'heading',
      'h5': 'heading',
      'h6': 'heading',
      'p': 'text-editor',
      'span': 'text-editor',
      'div': this.inferDivWidget(element),
      'img': 'image',
      'a': this.inferLinkWidget(element),
      'button': 'button',
      'input': 'form',
      'textarea': 'form',
      'select': 'form',
      'form': 'form',
      'ul': 'icon-list',
      'ol': 'icon-list',
      'video': 'video',
      'iframe': 'video',
      'i': this.inferIconWidget(element),
      'svg': 'icon'
    };

    return mapping[tagName] || 'html';
  }

  /**
   * Infer widget type for div elements based on content and styling
   */
  static inferDivWidget(element) {
    const computedStyle = window.getComputedStyle(element);
    const classes = Array.from(element.classList);
    
    // Check for button-like divs
    if (classes.some(cls => cls.includes('btn') || cls.includes('button')) ||
        computedStyle.cursor === 'pointer') {
      return 'button';
    }
    
    // Check if it has multiple children - prioritize container over single image
    if (element.children.length > 1) {
      return 'container';
    }
    
    // Check for image containers (only if single child)
    if (element.children.length === 1 && element.querySelector('img')) {
      return 'image';
    }
    
    // Check if it's a flex/grid container
    if ((computedStyle.display === 'flex' || computedStyle.display === 'grid')) {
      return 'container';
    }
    
    // Default to container for layout divs
    return 'container';
  }

  /**
   * Infer widget type for link elements
   */
  static inferLinkWidget(element) {
    const computedStyle = window.getComputedStyle(element);
    const classes = Array.from(element.classList);
    
    // Check if styled as button
    if (classes.some(cls => cls.includes('btn') || cls.includes('button')) ||
        computedStyle.display === 'inline-block' && 
        computedStyle.padding !== '0px') {
      return 'button';
    }
    
    return 'button'; // Default links to button widget
  }

  /**
   * Infer icon widget for i/svg elements
   */
  static inferIconWidget(element) {
    const classes = Array.from(element.classList);
    
    // Check for Font Awesome, Material Icons, etc.
    if (classes.some(cls => 
        cls.includes('fa') || 
        cls.includes('icon') || 
        cls.includes('material'))) {
      return 'icon';
    }
    
    return 'icon';
  }

  /**
   * Convert single element to Elementor format
   */
  static convertElement(element, elementData) {
    try {
      const widgetType = this.getElementorWidgetType(element);
      
      // Special handling for complex HTML structures
      if (widgetType === 'container' && this.isComplexElement(element)) {
        return this.parseComplexElement(element, elementData);
      }
      
      const settings = this.mapElementToSettings(element, elementData);
      const isContainer = widgetType === 'container';
      
      const elementorElement = {
        id: this.generateId(),
        elType: isContainer ? 'container' : 'widget',
        settings: settings || {},
        elements: [],
        isInner: isContainer && element.children.length > 0
      };

      if (elementorElement.elType === 'widget') {
        elementorElement.widgetType = widgetType;
      }

      // Add child elements for containers
      if (isContainer && element.children.length > 0) {
        Array.from(element.children).forEach(child => {
          try {
            const childData = window.CSSExtractor ? window.CSSExtractor.extractElementData(child) : {};
            if (child.nodeType === 1) { // Element node
              const childElement = this.convertElement(child, childData);
              if (childElement) {
                elementorElement.elements.push(childElement);
              }
            }
          } catch (error) {
            console.warn('Failed to convert child element:', error);
          }
        });
      }

      return elementorElement;
    } catch (error) {
      console.error('Error converting element:', error);
      return this.createFallbackElement(element);
    }
  }

  /**
   * Create fallback element when conversion fails
   */
  static createFallbackElement(element) {
    return {
      id: this.generateId(),
      elType: 'widget',
      widgetType: 'text-editor',
      settings: {
        editor: element.textContent || 'Content',
        _title: 'Fallback Element'
      },
      elements: [],
      isInner: false
    };
  }

  /**
   * Check if element is a complex structure that needs special parsing
   */
  static isComplexElement(element) {
    // Check if element has multiple different types of children
    const childTypes = new Set();
    Array.from(element.children).forEach(child => {
      childTypes.add(child.tagName.toLowerCase());
    });
    
    // If it has diverse child types and more than 2 children, treat as complex
    return childTypes.size >= 2 && element.children.length >= 2;
  }

  /**
   * Parse complex HTML elements into individual Elementor widgets
   */
  static parseComplexElement(element, elementData) {
    const container = {
      id: this.generateId(),
      elType: 'container',
      settings: {
        flex_direction: 'row',
        flex_justify_content: 'space-between',
        flex_align_items: 'center',
        flex_wrap: 'wrap',
        content_width: 'full',
        background_background: 'classic',
        _title: 'Complex Container'
      },
      elements: [],
      isInner: false
    };

    // Parse each child element individually
    Array.from(element.children).forEach(child => {
      try {
        const widget = this.parseElementToWidget(child);
        if (widget) {
          container.elements.push(widget);
        }
      } catch (error) {
        console.warn('Failed to parse child element:', error);
      }
    });

    return container;
  }

  /**
   * Parse individual HTML elements into specific Elementor widgets
   */
  static parseElementToWidget(element) {
    try {
      const tagName = element.tagName.toLowerCase();
      const classes = Array.from(element.classList);
      
      // Logo/Image
      if (element.querySelector('img')) {
        const img = element.querySelector('img');
        return {
          id: this.generateId(),
          elType: 'widget',
          widgetType: 'image',
          settings: {
            image: {
              url: img.src,
              id: Math.floor(Math.random() * 100) + 30
            },
            image_size: 'full',
            align: 'left',
            _title: `Logo - ${img.alt || 'Image'}`
          },
          elements: [],
          isInner: false
        };
      }

      // Buttons
      if (tagName === 'button' || (tagName === 'a' && classes.some(cls => cls.includes('btn') || cls.includes('button')))) {
        return {
          id: this.generateId(),
          elType: 'widget',
          widgetType: 'button',
          settings: {
            text: element.textContent.trim(),
            link: element.href ? { url: element.href, is_external: element.href.startsWith('http') } : undefined,
            align: 'right',
            background_color: '#ff6900',
            button_text_color: '#ffffff',
            _title: `Button - ${element.textContent.trim()}`
          },
          elements: [],
          isInner: false
        };
      }

      // Navigation Menu
      if (element.querySelector('nav, .menu, ul.nav, .navbar')) {
        const menuItems = element.querySelectorAll('a[href]');
        const menuList = [];
        
        menuItems.forEach(item => {
          menuList.push({
            item_text: item.textContent.trim(),
            item_url: { url: item.href, is_external: false }
          });
        });

        return {
          id: this.generateId(),
          elType: 'widget',
          widgetType: 'nav-menu',
          settings: {
            menu: menuList,
            layout: 'horizontal',
            align: 'center',
            _title: 'Navigation Menu'
          },
          elements: [],
          isInner: false
        };
      }

      // Social Icons
      if (classes.some(cls => cls.includes('social')) || element.querySelector('a[href*="facebook"], a[href*="instagram"]')) {
        const socialLinks = element.querySelectorAll('a[href*="facebook"], a[href*="instagram"], a[href*="twitter"], a[href*="linkedin"]');
        const socialIcons = [];
        
        socialLinks.forEach(link => {
          let social = 'facebook';
          if (link.href.includes('instagram')) social = 'instagram';
          else if (link.href.includes('twitter')) social = 'twitter';
          else if (link.href.includes('linkedin')) social = 'linkedin';
          
          socialIcons.push({
            social: social,
            link: { url: link.href, is_external: true }
          });
        });

        return {
          id: this.generateId(),
          elType: 'widget',
          widgetType: 'social-icons',
          settings: {
            social_icon_list: socialIcons,
            shape: 'square',
            align: 'right',
            _title: 'Social Icons'
          },
          elements: [],
          isInner: false
        };
      }

      // Contact Information (Icon Box)
      if (element.querySelector('i[class*="phone"], i[class*="email"], .icon-phone, .icon-email') || 
          element.textContent.includes('phone') || element.textContent.includes('email') ||
          element.textContent.includes('Contact')) {
        const title = element.querySelector('h1, h2, h3, h4, h5, h6')?.textContent?.trim() || 
                     element.textContent.split('\n')[0].trim() || 'Contact';
        const description = element.textContent.split('\n').slice(1).join(' ').trim() || '';
        const link = element.querySelector('a')?.href || '';
        
        let iconClass = 'fas fa-phone';
        if (element.innerHTML.includes('email') || element.innerHTML.includes('mail')) {
          iconClass = 'fas fa-envelope';
        }

        return {
          id: this.generateId(),
          elType: 'widget',
          widgetType: 'icon-box',
          settings: {
            selected_icon: { value: iconClass, library: 'fa-solid' },
            title_text: title,
            description_text: description,
            link: link ? { url: link, is_external: false } : undefined,
            position: 'left',
            _title: `Icon Box - ${title}`
          },
          elements: [],
          isInner: false
        };
      }

      // Headings
      if (tagName.match(/h[1-6]/)) {
        return {
          id: this.generateId(),
          elType: 'widget',
          widgetType: 'heading',
          settings: {
            title: element.textContent.trim(),
            size: tagName,
            header_size: tagName,
            align: 'left',
            _title: `Heading - ${element.textContent.trim().substring(0, 20)}`
          },
          elements: [],
          isInner: false
        };
      }

      // Default text widget for any remaining elements with text content
      if (element.textContent.trim()) {
        return {
          id: this.generateId(),
          elType: 'widget',
          widgetType: 'text-editor',
          settings: {
            editor: element.innerHTML || element.textContent,
            align: 'left',
            _title: `Text - ${element.textContent.trim().substring(0, 20)}`
          },
          elements: [],
          isInner: false
        };
      }

      return null;
    } catch (error) {
      console.warn('Error parsing element to widget:', error);
      return null;
    }
  }

  /**
   * Convert HTML element to Elementor widget settings
   */
  static mapElementToSettings(element, elementData) {
    try {
      const widgetType = this.getElementorWidgetType(element);
      
      switch (widgetType) {
        case 'heading':
          return {
            title: element.textContent.trim(),
            size: element.tagName.toLowerCase(),
            align: 'left',
            _title: `Heading - ${element.textContent.trim().substring(0, 20)}`
          };
          
        case 'text-editor':
          return {
            editor: element.innerHTML || element.textContent,
            align: 'left',
            _title: `Text - ${element.textContent.trim().substring(0, 20)}`
          };
          
        case 'image':
          const img = element.tagName === 'IMG' ? element : element.querySelector('img');
          return {
            image: img ? { url: img.src, id: Math.floor(Math.random() * 100) + 30 } : { url: '', id: '' },
            image_size: 'full',
            _title: `Image - ${img?.alt || 'Image'}`
          };
          
        case 'button':
          return {
            text: element.textContent.trim(),
            link: element.href ? { url: element.href, is_external: false } : undefined,
            align: 'center',
            _title: `Button - ${element.textContent.trim()}`
          };
          
        case 'container':
          return {
            content_width: "full",
            flex_direction: "row",
            flex_justify_content: "space-between",
            flex_align_items: "center",
            background_background: "classic",
            _title: `Container - ${element.className ? element.className.split(' ')[0] : 'Wrapper'}`
          };
          
        default:
          return {
            html: element.innerHTML || element.textContent,
            _title: `HTML - ${element.tagName.toLowerCase()}`
          };
      }
    } catch (error) {
      console.warn('Error mapping element settings:', error);
      return {
        html: element.textContent || 'Error',
        _title: 'Error Element'
      };
    }
  }

  /**
   * Convert array of selected elements to full Elementor JSON
   */
  static convertToElementor(selectedElements) {
    try {
      const elementorData = {
        content: [],
        page_settings: [],
        version: "0.4",
        title: `Converted from ${window.location.hostname}`,
        type: "container"
      };

      // Create main container to wrap all elements
      const mainContainer = {
        id: this.generateId(),
        settings: {
          flex_direction: "column",
          boxed_width: {
            unit: "px",
            size: 1200,
            sizes: []
          },
          flex_align_items: "stretch",
          flex_gap: {
            column: "20",
            row: "20",
            isLinked: true,
            unit: "px",
            size: 20
          },
          flex_wrap: "nowrap",
          background_background: "classic",
          padding: {
            unit: "px",
            top: "20",
            right: "20",
            bottom: "20",
            left: "20",
            isLinked: false
          },
          _title: "Converted Content"
        },
        elements: [],
        isInner: false,
        elType: "container"
      };

      selectedElements.forEach((selectionInfo, index) => {
        try {
          let elementorElement;
          
          // Handle complex elements with children
          if (selectionInfo.isComplex && selectionInfo.children) {
            elementorElement = this.convertComplexSelection(selectionInfo);
          } else {
            // Handle single elements
            elementorElement = this.convertElement(selectionInfo.element, selectionInfo.data);
          }
          
          if (elementorElement) {
            mainContainer.elements.push(elementorElement);
          }
        } catch (error) {
          console.error('Failed to convert element:', error);
          // Add fallback element
          mainContainer.elements.push(this.createFallbackElement(selectionInfo.element));
        }
      });

      elementorData.content.push(mainContainer);
      return this.validateElementorData(elementorData);
    } catch (error) {
      console.error('Error in convertToElementor:', error);
      throw new Error('Failed to convert elements to Elementor format: ' + error.message);
    }
  }

  /**
   * Convert complex selection with all its children
   */
  static convertComplexSelection(selectionInfo) {
    try {
      const parentElement = selectionInfo.element;
      
      // Create main container for the complex element
      const container = {
        id: this.generateId(),
        elType: 'container',
        settings: {
          flex_direction: 'row',
          flex_justify_content: 'space-between',
          flex_align_items: 'center',
          flex_wrap: 'wrap',
          content_width: 'full',
          background_background: 'classic',
          _title: `${parentElement.tagName} Container`
        },
        elements: [],
        isInner: false
      };

      // Process children
      if (selectionInfo.children && selectionInfo.children.length > 0) {
        selectionInfo.children.forEach(childInfo => {
          try {
            const widget = this.parseElementToWidget(childInfo.element);
            if (widget) {
              container.elements.push(widget);
            }
          } catch (error) {
            console.warn('Failed to convert complex child:', error);
          }
        });
      }

      return container;
    } catch (error) {
      console.error('Error converting complex selection:', error);
      return this.createFallbackElement(selectionInfo.element);
    }
  }

  /**
   * Validate and clean Elementor JSON
   */
  static validateElementorData(data) {
    try {
      // Basic validation for new Elementor format
      if (!data.content || !Array.isArray(data.content)) {
        throw new Error('Invalid Elementor data: content array missing');
      }

      // Validate required fields
      if (!data.version) {
        data.version = "0.4";
      }
      if (!data.type) {
        data.type = "container";
      }
      if (!data.title) {
        data.title = "Converted Content";
      }
      if (!data.page_settings) {
        data.page_settings = [];
      }

      // Clean up any invalid values
      const cleanData = JSON.parse(JSON.stringify(data));
      
      // Remove any undefined or null values
      this.removeInvalidValues(cleanData);
      
      return cleanData;
    } catch (error) {
      console.error('Error validating Elementor data:', error);
      throw new Error('Failed to validate Elementor data: ' + error.message);
    }
  }

  /**
   * Remove undefined/null values recursively
   */
  static removeInvalidValues(obj) {
    if (Array.isArray(obj)) {
      obj.forEach(item => this.removeInvalidValues(item));
    } else if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        if (obj[key] === undefined || obj[key] === null) {
          delete obj[key];
        } else {
          this.removeInvalidValues(obj[key]);
        }
      });
    }
  }
}

// Make ElementorMapper available globally
window.ElementorMapper = ElementorMapper;

// Log successful loading
console.log('ElementorMapper loaded successfully');