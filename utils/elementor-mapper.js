/**
 * Elementor Mapper Engine
 * Converts HTML/CSS to Elementor Pro JSON schema
 */

class ElementorMapper {
  constructor() {
    this.widgetMap = this.initializeWidgetMap();
    this.defaultSettings = this.getDefaultSettings();
  }

  /**
   * Initialize widget mapping rules
   */
  initializeWidgetMap() {
    return {
      // Text widgets
      'h1': 'heading',
      'h2': 'heading',
      'h3': 'heading',
      'h4': 'heading',
      'h5': 'heading',
      'h6': 'heading',
      'p': 'text-editor',
      'span': 'text-editor',
      'strong': 'text-editor',
      'em': 'text-editor',
      'a': 'button', // Links can be buttons
      
      // Media widgets
      'img': 'image',
      'video': 'video',
      'iframe': 'html',
      'svg': 'icon',
      
      // Form widgets
      'form': 'form',
      'input': 'form',
      'button': 'button',
      'textarea': 'form',
      'select': 'form',
      
      // Layout widgets
      'div': 'html', // Default fallback
      'section': 'section',
      'header': 'section',
      'footer': 'section',
      'nav': 'nav-menu',
      'ul': 'icon-list',
      'ol': 'icon-list',
      'li': 'icon-list-item',
      
      // Special widgets
      'icon': 'icon',
      'svg': 'icon'
    };
  }

  /**
   * Map element to Elementor widget
   */
  mapToElementorWidget(elementAnalysis, styleData) {
    const tagName = elementAnalysis.tagName;
    const widgetType = this.determineWidgetType(elementAnalysis, styleData);
    
    const widget = {
      elType: 'widget',
      widgetType: widgetType,
      id: this.generateElementId(),
      settings: this.buildWidgetSettings(elementAnalysis, styleData, widgetType),
      elements: []
    };
    
    // Add children if container widget
    if (this.isContainerWidget(widgetType)) {
      widget.elements = this.mapChildren(elementAnalysis, styleData);
    }
    
    return widget;
  }

  /**
   * Determine widget type from element
   */
  determineWidgetType(elementAnalysis, styleData) {
    const tagName = elementAnalysis.tagName;
    
    // Check widget map first
    if (this.widgetMap[tagName]) {
      return this.widgetMap[tagName];
    }
    
    // Check semantic role
    if (elementAnalysis.semanticRole === 'header') {
      return 'section';
    }
    if (elementAnalysis.semanticRole === 'footer') {
      return 'section';
    }
    if (elementAnalysis.semanticRole === 'nav') {
      return 'nav-menu';
    }
    
    // Check layout type
    if (elementAnalysis.layoutType === 'flexbox' || elementAnalysis.layoutType === 'grid') {
      return 'container'; // Elementor Pro container
    }
    
    // Check if has children (container)
    if (elementAnalysis.childCount > 0) {
      return 'section';
    }
    
    // Default to HTML widget
    return 'html';
  }

  /**
   * Check if widget is a container
   */
  isContainerWidget(widgetType) {
    const containerWidgets = ['section', 'container', 'column', 'inner-section'];
    return containerWidgets.includes(widgetType);
  }

  /**
   * Build widget settings from analysis
   */
  buildWidgetSettings(elementAnalysis, styleData, widgetType) {
    const settings = {
      // Common settings
      _element_width: 'initial',
      _column_size: 100
    };
    
    // Add typography settings
    if (styleData.typography) {
      Object.assign(settings, this.mapTypography(styleData.typography));
    }
    
    // Add spacing settings
    if (styleData.spacing) {
      Object.assign(settings, this.mapSpacing(styleData.spacing));
    }
    
    // Add colors
    if (styleData.colors) {
      Object.assign(settings, this.mapColors(styleData.colors));
    }
    
    // Add background
    if (styleData.background) {
      Object.assign(settings, this.mapBackground(styleData.background));
    }
    
    // Add borders
    if (styleData.borders) {
      Object.assign(settings, this.mapBorders(styleData.borders));
    }
    
    // Add layout settings
    if (styleData.layout) {
      Object.assign(settings, this.mapLayout(styleData.layout, elementAnalysis));
    }
    
    // Add effects
    if (styleData.effects) {
      Object.assign(settings, this.mapEffects(styleData.effects));
    }
    
    // Widget-specific settings
    switch (widgetType) {
      case 'heading':
        Object.assign(settings, this.mapHeadingSettings(elementAnalysis, styleData));
        break;
      case 'text-editor':
        Object.assign(settings, this.mapTextEditorSettings(elementAnalysis, styleData));
        break;
      case 'button':
        Object.assign(settings, this.mapButtonSettings(elementAnalysis, styleData));
        break;
      case 'image':
        Object.assign(settings, this.mapImageSettings(elementAnalysis, styleData));
        break;
      case 'section':
        Object.assign(settings, this.mapSectionSettings(elementAnalysis, styleData));
        break;
      case 'container':
        Object.assign(settings, this.mapContainerSettings(elementAnalysis, styleData));
        break;
    }
    
    return settings;
  }

  /**
   * Map typography to Elementor controls
   */
  mapTypography(typography) {
    return {
      typography_typography: 'custom',
      typography_font_family: typography.fontFamily,
      typography_font_size: {
        unit: typography.fontSize.unit,
        size: typography.fontSize.value,
        sizes: {}
      },
      typography_font_weight: typography.fontWeight,
      typography_text_transform: typography.textTransform,
      typography_font_style: typography.fontStyle || 'normal',
      typography_text_decoration: typography.textDecoration,
      typography_line_height: {
        unit: typography.lineHeight.unit === 'ratio' ? '' : typography.lineHeight.unit,
        size: typography.lineHeight.value,
        sizes: {}
      },
      typography_letter_spacing: {
        unit: typography.letterSpacing.unit,
        size: typography.letterSpacing.value,
        sizes: {}
      },
      typography_text_align: typography.textAlign,
      typography_color: typography.color
    };
  }

  /**
   * Map spacing to Elementor controls
   */
  mapSpacing(spacing) {
    const mapPadding = (padding) => ({
      unit: padding.unit,
      top: padding.top?.value || 0,
      right: padding.right?.value || 0,
      bottom: padding.bottom?.value || 0,
      left: padding.left?.value || 0,
      isLinked: false
    });
    
    const mapMargin = (margin) => ({
      unit: margin.unit,
      top: margin.top?.value || 0,
      right: margin.right?.value || 0,
      bottom: margin.bottom?.value || 0,
      left: margin.left?.value || 0,
      isLinked: false
    });
    
    return {
      padding: mapPadding(spacing.padding),
      margin: mapMargin(spacing.margin),
      // Responsive padding
      padding_tablet: mapPadding(spacing.padding),
      padding_mobile: mapPadding(spacing.padding),
      // Responsive margin
      margin_tablet: mapMargin(spacing.margin),
      margin_mobile: mapMargin(spacing.margin)
    };
  }

  /**
   * Map colors to Elementor controls
   */
  mapColors(colors) {
    return {
      text_color: colors.color,
      background_color: colors.backgroundColor
    };
  }

  /**
   * Map background to Elementor controls
   */
  mapBackground(background) {
    const settings = {
      background_background_type: 'classic'
    };
    
    if (background.isGradient) {
      settings.background_background_type = 'gradient';
      settings.background_gradient = this.parseGradient(background.backgroundImage);
    } else if (background.imageUrl) {
      settings.background_background_type = 'classic';
      settings.background_image = {
        url: background.imageUrl,
        id: '',
        size: background.backgroundSize || 'cover',
        position: this.parseBackgroundPosition(background.backgroundPosition)
      };
    } else if (background.backgroundColor && background.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      settings.background_color = background.backgroundColor;
    }
    
    // Background overlay
    if (background.overlay && background.overlay.hasOverlay) {
      settings.background_overlay_background_type = 'classic';
      settings.background_overlay_color = background.overlay.backgroundColor;
      settings.background_overlay_opacity = background.overlay.opacity;
    }
    
    return settings;
  }

  /**
   * Parse gradient string
   */
  parseGradient(gradientString) {
    // Simplified gradient parser
    const linearMatch = gradientString.match(/linear-gradient\(([^)]+)\)/);
    if (linearMatch) {
      const parts = linearMatch[1].split(',');
      return {
        type: 'linear',
        angle: 90,
        colors: parts.map((part, index) => ({
          color: part.trim(),
          position: index === 0 ? 0 : 100
        }))
      };
    }
    
    return null;
  }

  /**
   * Parse background position
   */
  parseBackgroundPosition(position) {
    const positionMap = {
      'center center': { x: 0.5, y: 0.5 },
      'center top': { x: 0.5, y: 0 },
      'center bottom': { x: 0.5, y: 1 },
      'left center': { x: 0, y: 0.5 },
      'right center': { x: 1, y: 0.5 }
    };
    
    return positionMap[position] || { x: 0.5, y: 0.5 };
  }

  /**
   * Map borders to Elementor controls
   */
  mapBorders(borders) {
    return {
      border_border: 'solid',
      border_width: {
        unit: 'px',
        top: borders.borderWidth.top.value,
        right: borders.borderWidth.right.value,
        bottom: borders.borderWidth.bottom.value,
        left: borders.borderWidth.left.value,
        isLinked: false
      },
      border_color: borders.borderColor.top,
      borderRadius: {
        unit: 'px',
        top: borders.borderRadius.topLeft.value,
        right: borders.borderRadius.topRight.value,
        bottom: borders.borderRadius.bottomRight.value,
        left: borders.borderRadius.bottomLeft.value,
        isLinked: false
      }
    };
  }

  /**
   * Map layout to Elementor controls
   */
  mapLayout(layout, elementAnalysis) {
    const settings = {};
    
    if (layout.display === 'flex' || layout.display === 'inline-flex') {
      settings.flex_direction = layout.flexDirection || 'row';
      settings.justify_content = layout.justifyContent || 'flex-start';
      settings.align_items = layout.alignItems || 'stretch';
      settings.flex_wrap = layout.flexWrap || 'nowrap';
      
      if (layout.gap && layout.gap.value > 0) {
        settings.gap = {
          unit: layout.gap.unit,
          column: layout.gap.value,
          row: layout.gap.value
        };
      }
    }
    
    if (layout.display === 'grid' || layout.display === 'inline-grid') {
      settings.content_width = 'full';
      // Grid would need custom CSS in Elementor
      settings._css_classes = 'elementor-grid-layout';
    }
    
    // Width settings
    if (layout.width && layout.width !== 'auto') {
      settings.width = {
        unit: 'px',
        size: parseFloat(layout.width) || 100
      };
    }
    
    // Max width for boxed containers
    if (elementAnalysis.isBoxed && elementAnalysis.maxWidth) {
      settings.content_width = 'boxed';
      settings.width = {
        unit: elementAnalysis.maxWidth.unit,
        size: elementAnalysis.maxWidth.value
      };
    }
    
    return settings;
  }

  /**
   * Map effects to Elementor controls
   */
  mapEffects(effects) {
    const settings = {};
    
    if (effects.boxShadow) {
      settings.box_shadow_box_shadow_type = 'yes';
      const shadow = effects.boxShadow[0];
      settings.box_shadow_box_shadow = {
        horizontal: this.parseUnit(shadow.offsetX),
        vertical: this.parseUnit(shadow.offsetY),
        blur: this.parseUnit(shadow.blur),
        spread: this.parseUnit(shadow.spread),
        color: shadow.color
      };
    }
    
    if (effects.opacity < 1) {
      settings._opacity = effects.opacity;
    }
    
    return settings;
  }

  /**
   * Map heading-specific settings
   */
  mapHeadingSettings(elementAnalysis, styleData) {
    return {
      title: elementAnalysis.textContent || '',
      size: elementAnalysis.tagName.replace('h', ''),
      link: elementAnalysis.elementRef?.querySelector('a')?.href || ''
    };
  }

  /**
   * Map text editor settings
   */
  mapTextEditorSettings(elementAnalysis, styleData) {
    return {
      editor: elementAnalysis.textContent || elementAnalysis.elementRef?.innerHTML || ''
    };
  }

  /**
   * Map button settings
   */
  mapButtonSettings(elementAnalysis, styleData) {
    const linkElement = elementAnalysis.elementRef?.closest('a') || elementAnalysis.elementRef;
    return {
      text: elementAnalysis.textContent || 'Button',
      link: {
        url: linkElement?.href || '#',
        is_external: linkElement?.target === '_blank'
      },
      size: this.determineButtonSize(styleData),
      icon: this.detectIcon(elementAnalysis.elementRef)
    };
  }

  /**
   * Map image settings
   */
  mapImageSettings(elementAnalysis, styleData) {
    const imgElement = elementAnalysis.elementRef;
    return {
      image: {
        url: imgElement?.src || imgElement?.getAttribute('data-src') || '',
        id: ''
      },
      image_size: 'full',
      caption: imgElement?.alt || ''
    };
  }

  /**
   * Map section settings
   */
  mapSectionSettings(elementAnalysis, styleData) {
    return {
      layout: 'boxed',
      content_width: elementAnalysis.isBoxed ? 'boxed' : 'full',
      height: 'default',
      column_gap: 'default'
    };
  }

  /**
   * Map container settings
   */
  mapContainerSettings(elementAnalysis, styleData) {
    return {
      content_width: elementAnalysis.isBoxed ? 'boxed' : 'full',
      flex_direction: styleData.layout?.flexDirection || 'row',
      content_width_tablet: elementAnalysis.isBoxed ? 'boxed' : 'full',
      content_width_mobile: elementAnalysis.isBoxed ? 'boxed' : 'full'
    };
  }

  /**
   * Map children elements
   */
  mapChildren(elementAnalysis, styleData) {
    if (!elementAnalysis.children || elementAnalysis.children.length === 0) {
      return [];
    }
    
    // This would recursively map children
    // For now, return empty array - will be handled by recursive mapping
    return [];
  }

  /**
   * Determine button size
   */
  determineButtonSize(styleData) {
    const fontSize = styleData.typography?.fontSize?.value || 14;
    if (fontSize >= 18) return 'lg';
    if (fontSize >= 16) return 'md';
    return 'sm';
  }

  /**
   * Detect icon in element
   */
  detectIcon(element) {
    if (!element) return '';
    
    const iconElement = element.querySelector('i, svg, [class*="icon"]');
    if (iconElement) {
      const iconClass = Array.from(iconElement.classList).find(c => c.includes('icon') || c.includes('fa-'));
      return iconClass || '';
    }
    
    return '';
  }

  /**
   * Parse unit value
   */
  parseUnit(value) {
    if (typeof value === 'string') {
      const match = value.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    }
    return value || 0;
  }

  /**
   * Generate unique element ID
   */
  generateElementId() {
    return 'element_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get default Elementor settings
   */
  getDefaultSettings() {
    return {
      _element_width: 'initial',
      _column_size: 100,
      _inline_size: 100
    };
  }

  /**
   * Convert full element tree to Elementor JSON
   */
  convertToElementorJSON(elements, pageSettings = {}) {
    return {
      version: '0.4',
      title: pageSettings.title || 'Converted Page',
      type: 'page',
      settings: {
        ...this.getDefaultSettings(),
        ...pageSettings
      },
      elements: elements.map(el => this.mapToElementorWidget(el.analysis, el.styles))
    };
  }
}

// Export for use in content script
if (typeof window !== 'undefined') {
  window.ElementorMapper = ElementorMapper;
}
