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
    const classes = Array.from(element.classList);
    
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
    
    // Check for image containers
    if (element.querySelector('img')) {
      return 'image';
    }
    
    // Check if it's a flex/grid container with multiple children
    if ((computedStyle.display === 'flex' || computedStyle.display === 'grid') && 
        element.children.length > 1) {
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
   * Convert HTML element to Elementor widget settings
   */
  static mapElementToSettings(element, elementData) {
    const widgetType = this.getElementorWidgetType(element);
    
    switch (widgetType) {
      case 'heading':
        return this.mapHeadingSettings(element, elementData);
      case 'text-editor':
        return this.mapTextEditorSettings(element, elementData);
      case 'image':
        return this.mapImageSettings(element, elementData);
      case 'button':
        return this.mapButtonSettings(element, elementData);
      case 'icon':
        return this.mapIconSettings(element, elementData);
      case 'video':
        return this.mapVideoSettings(element, elementData);
      case 'form':
        return this.mapFormSettings(element, elementData);
      case 'icon-list':
        return this.mapListSettings(element, elementData);
      case 'container':
        return this.mapContainerSettings(element, elementData);
      default:
        return this.mapHtmlSettings(element, elementData);
    }
  }

  /**
   * Map heading element settings
   */
  static mapHeadingSettings(element, data) {
    const tagName = element.tagName.toLowerCase();
    
    return {
      title: element.textContent.trim(),
      header_size: tagName,
      color: data.typography.color,
      typography_typography: 'custom',
      typography_font_family: data.typography.fontFamily,
      typography_font_size: data.typography.fontSize,
      typography_font_weight: data.typography.fontWeight,
      typography_line_height: data.typography.lineHeight,
      typography_letter_spacing: data.typography.letterSpacing,
      align: data.typography.textAlign,
      text_shadow_text_shadow_type: '',
      ...this.mapSpacing(data.spacing),
      ...this.mapBackground(data.background),
      ...this.mapBorder(data.border)
    };
  }

  /**
   * Map text editor settings
   */
  static mapTextEditorSettings(element, data) {
    return {
      editor: element.innerHTML,
      color: data.typography.color,
      typography_typography: 'custom',
      typography_font_family: data.typography.fontFamily,
      typography_font_size: data.typography.fontSize,
      typography_font_weight: data.typography.fontWeight,
      typography_line_height: data.typography.lineHeight,
      align: data.typography.textAlign,
      ...this.mapSpacing(data.spacing),
      ...this.mapBackground(data.background),
      ...this.mapBorder(data.border)
    };
  }

  /**
   * Map image settings
   */
  static mapImageSettings(element, data) {
    const img = element.tagName === 'IMG' ? element : element.querySelector('img');
    
    return {
      image: img ? { url: img.src, id: '' } : { url: '', id: '' },
      image_size: 'full',
      alt: img ? img.alt : '',
      caption: '',
      link_to: 'none',
      width: data.layout.width,
      height: data.layout.height,
      object_fit: window.getComputedStyle(img || element).objectFit || 'cover',
      ...this.mapSpacing(data.spacing),
      ...this.mapBorder(data.border)
    };
  }

  /**
   * Map button settings
   */
  static mapButtonSettings(element, data) {
    const link = element.href || '#';
    
    return {
      text: element.textContent.trim(),
      link: { url: link, is_external: false, nofollow: false },
      size: 'md',
      typography_typography: 'custom',
      typography_font_family: data.typography.fontFamily,
      typography_font_size: data.typography.fontSize,
      typography_font_weight: data.typography.fontWeight,
      button_text_color: data.typography.color,
      background_color: data.background.backgroundColor,
      border_border: data.border.borderStyle.top !== 'none' ? 'solid' : '',
      border_width: data.border.borderWidth,
      border_color: data.border.borderColor.top,
      border_radius: data.border.borderRadius,
      button_box_shadow_box_shadow_type: '',
      ...this.mapSpacing(data.spacing)
    };
  }

  /**
   * Map icon settings
   */
  static mapIconSettings(element, data) {
    const classes = Array.from(element.classList);
    let iconName = 'fas fa-star'; // default icon
    
    // Try to extract Font Awesome icon
    const faClass = classes.find(cls => cls.includes('fa-'));
    if (faClass) {
      const prefix = classes.find(cls => cls.includes('fa') && !cls.includes('fa-')) || 'fas';
      iconName = `${prefix} ${faClass}`;
    }
    
    return {
      selected_icon: { value: iconName, library: 'fa-solid' },
      icon_color: data.typography.color,
      size: data.typography.fontSize,
      rotate: 0,
      border_border: data.border.borderStyle.top !== 'none' ? 'solid' : '',
      border_width: data.border.borderWidth,
      border_color: data.border.borderColor.top,
      border_radius: data.border.borderRadius,
      ...this.mapSpacing(data.spacing),
      ...this.mapBackground(data.background)
    };
  }

  /**
   * Map video settings
   */
  static mapVideoSettings(element, data) {
    const src = element.src || element.querySelector('source')?.src || '';
    
    return {
      video_type: 'hosted',
      hosted_url: { url: src },
      aspect_ratio: '169',
      autoplay: element.autoplay || false,
      mute: element.muted || false,
      loop: element.loop || false,
      controls: element.controls !== false,
      ...this.mapSpacing(data.spacing)
    };
  }

  /**
   * Map form settings
   */
  static mapFormSettings(element, data) {
    return {
      form_name: 'Contact Form',
      form_fields: this.extractFormFields(element),
      button_text: 'Send',
      ...this.mapSpacing(data.spacing),
      ...this.mapBackground(data.background)
    };
  }

  /**
   * Extract form fields from form element
   */
  static extractFormFields(formElement) {
    const fields = [];
    const inputs = formElement.querySelectorAll('input, textarea, select');
    
    inputs.forEach((input, index) => {
      fields.push({
        custom_id: `field_${index}`,
        field_type: this.getFieldType(input),
        field_label: input.placeholder || input.name || `Field ${index + 1}`,
        required: input.required || false,
        placeholder: input.placeholder || '',
        width: '100'
      });
    });
    
    return fields;
  }

  /**
   * Get form field type
   */
  static getFieldType(input) {
    const tagName = input.tagName.toLowerCase();
    const type = input.type;
    
    if (tagName === 'textarea') return 'textarea';
    if (tagName === 'select') return 'select';
    
    switch (type) {
      case 'email': return 'email';
      case 'tel': return 'tel';
      case 'url': return 'url';
      case 'number': return 'number';
      case 'date': return 'date';
      default: return 'text';
    }
  }

  /**
   * Map list settings
   */
  static mapListSettings(element, data) {
    const items = [];
    const listItems = element.querySelectorAll('li');
    
    listItems.forEach((li, index) => {
      items.push({
        text: li.textContent.trim(),
        selected_icon: { value: 'fas fa-check', library: 'fa-solid' },
        link: { url: '', is_external: false }
      });
    });
    
    return {
      icon_list: items,
      view: 'traditional',
      layout: 'vertical',
      ...this.mapSpacing(data.spacing),
      ...this.mapBackground(data.background)
    };
  }

  /**
   * Map container settings
   */
  static mapContainerSettings(element, data) {
    return {
      content_width: 'boxed',
      height: data.layout.height.size > 0 ? 'min-height' : 'default',
      min_height: data.layout.height,
      flex_direction: data.flexbox.flexDirection || 'row',
      flex_wrap: data.flexbox.flexWrap || 'nowrap',
      justify_content: data.flexbox.justifyContent || 'flex-start',
      align_items: data.flexbox.alignItems || 'stretch',
      gap: data.flexbox.gap || { size: 10, unit: 'px' },
      ...this.mapSpacing(data.spacing),
      ...this.mapBackground(data.background),
      ...this.mapBorder(data.border)
    };
  }

  /**
   * Map HTML widget settings (fallback)
   */
  static mapHtmlSettings(element, data) {
    return {
      html: element.outerHTML,
      ...this.mapSpacing(data.spacing)
    };
  }

  /**
   * Map spacing data to Elementor format
   */
  static mapSpacing(spacing) {
    return {
      margin: {
        top: spacing.margin.top.size,
        right: spacing.margin.right.size,
        bottom: spacing.margin.bottom.size,
        left: spacing.margin.left.size,
        unit: spacing.margin.top.unit
      },
      padding: {
        top: spacing.padding.top.size,
        right: spacing.padding.right.size,
        bottom: spacing.padding.bottom.size,
        left: spacing.padding.left.size,
        unit: spacing.padding.top.unit
      }
    };
  }

  /**
   * Map background data to Elementor format
   */
  static mapBackground(background) {
    const settings = {};
    
    if (background.backgroundColor !== '#000000') {
      settings.background_background = 'classic';
      settings.background_color = background.backgroundColor;
    }
    
    if (background.backgroundImage && background.backgroundImage !== 'none') {
      settings.background_background = 'classic';
      settings.background_image = { url: background.backgroundImage.replace(/url\(["']?|["']?\)/g, '') };
      settings.background_size = background.backgroundSize;
      settings.background_position = background.backgroundPosition;
      settings.background_repeat = background.backgroundRepeat;
    }
    
    return settings;
  }

  /**
   * Map border data to Elementor format
   */
  static mapBorder(border) {
    const settings = {};
    
    // Check if any border exists
    const hasBorder = border.borderWidth.top.size > 0 || 
                     border.borderWidth.right.size > 0 ||
                     border.borderWidth.bottom.size > 0 ||
                     border.borderWidth.left.size > 0;
    
    if (hasBorder) {
      settings.border_border = border.borderStyle.top;
      settings.border_width = {
        top: border.borderWidth.top.size,
        right: border.borderWidth.right.size,
        bottom: border.borderWidth.bottom.size,
        left: border.borderWidth.left.size,
        unit: border.borderWidth.top.unit
      };
      settings.border_color = border.borderColor.top;
    }
    
    // Border radius
    const hasRadius = border.borderRadius.topLeft.size > 0 ||
                     border.borderRadius.topRight.size > 0 ||
                     border.borderRadius.bottomRight.size > 0 ||
                     border.borderRadius.bottomLeft.size > 0;
    
    if (hasRadius) {
      settings.border_radius = {
        top: border.borderRadius.topLeft.size,
        right: border.borderRadius.topRight.size,
        bottom: border.borderRadius.bottomRight.size,
        left: border.borderRadius.bottomLeft.size,
        unit: border.borderRadius.topLeft.unit
      };
    }
    
    return settings;
  }

  /**
   * Convert single element to Elementor format
   */
  static convertElement(element, elementData) {
    const widgetType = this.getElementorWidgetType(element);
    const settings = this.mapElementToSettings(element, elementData);
    
    const elementorElement = {
      id: this.generateId(),
      elType: widgetType === 'container' ? 'container' : 'widget',
      settings: settings
    };

    if (elementorElement.elType === 'widget') {
      elementorElement.widgetType = widgetType;
    }

    // Add child elements for containers
    if (widgetType === 'container' && element.children.length > 0) {
      elementorElement.elements = [];
      
      Array.from(element.children).forEach(child => {
        try {
          const childData = window.CSSExtractor.extractElementData(child);
          if (childData) {
            const childElement = this.convertElement(child, childData);
            elementorElement.elements.push(childElement);
          }
        } catch (error) {
          console.warn('Failed to convert child element:', error);
        }
      });
    }

    return elementorElement;
  }

  /**
   * Convert array of selected elements to full Elementor JSON
   */
  static convertToElementor(selectedElements) {
    const elementorData = {
      version: "1.0",
      title: `Converted from ${window.location.hostname}`,
      type: "page",
      created: new Date().toISOString(),
      source_url: window.location.href,
      elements: []
    };

    selectedElements.forEach((elementInfo, index) => {
      try {
        const elementorElement = this.convertElement(elementInfo.element, elementInfo.data);
        elementorElement.settings._element_id = `element_${index}`;
        elementorData.elements.push(elementorElement);
      } catch (error) {
        console.error('Failed to convert element:', error);
      }
    });

    return elementorData;
  }

  /**
   * Create section wrapper for multiple elements
   */
  static wrapInSection(elements) {
    return {
      id: this.generateId(),
      elType: 'section',
      settings: {
        layout: 'boxed',
        content_width: 'boxed',
        gap: 'default'
      },
      elements: [{
        id: this.generateId(),
        elType: 'column',
        settings: {
          _column_size: 100,
          _inline_size: null
        },
        elements: elements
      }]
    };
  }

  /**
   * Validate and clean Elementor JSON
   */
  static validateElementorData(data) {
    // Basic validation
    if (!data.elements || !Array.isArray(data.elements)) {
      throw new Error('Invalid Elementor data: elements array missing');
    }

    // Clean up any invalid values
    const cleanData = JSON.parse(JSON.stringify(data));
    
    // Remove any undefined or null values
    this.removeInvalidValues(cleanData);
    
    return cleanData;
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