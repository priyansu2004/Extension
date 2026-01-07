/**
 * Export Handler
 * Handles exporting to Elementor JSON, HTML scaffold, and design reference
 */

class ExportHandler {
  constructor() {
    this.formats = {
      json: 'Elementor JSON',
      html: 'Elementor HTML Scaffold',
      reference: 'Design Reference'
    };
  }

  /**
   * Export data in specified format
   */
  export(elements, format = 'json', options = {}) {
    switch (format) {
      case 'json':
        return this.exportElementorJSON(elements, options);
      case 'html':
        return this.exportHTMLScaffold(elements, options);
      case 'reference':
        return this.exportDesignReference(elements, options);
      default:
        throw new Error(`Unknown export format: ${format}`);
    }
  }

  /**
   * Export as Elementor JSON
   */
  exportElementorJSON(elements, options = {}) {
    const mapper = new ElementorMapper();
    const pageSettings = {
      title: options.title || 'Converted Page',
      post_status: 'publish'
    };
    
    const elementorJSON = mapper.convertToElementorJSON(elements, pageSettings);
    
    return {
      format: 'json',
      filename: `${options.filename || 'elementor-export'}.json`,
      content: JSON.stringify(elementorJSON, null, 2),
      mimeType: 'application/json'
    };
  }

  /**
   * Export as HTML scaffold
   */
  exportHTMLScaffold(elements, options = {}) {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${options.title || 'Elementor Scaffold'}</title>
    <style>
        /* Elementor-compatible styles */
        .elementor-section {
            position: relative;
            display: block;
        }
        .elementor-container {
            display: flex;
            flex-wrap: wrap;
            width: 100%;
        }
        .elementor-column {
            position: relative;
            min-height: 1px;
        }
    </style>
</head>
<body>
`;

    elements.forEach((element, index) => {
      html += this.generateElementHTML(element, index);
    });

    html += `</body>
</html>`;

    return {
      format: 'html',
      filename: `${options.filename || 'elementor-scaffold'}.html`,
      content: html,
      mimeType: 'text/html'
    };
  }

  /**
   * Generate HTML for a single element
   */
  generateElementHTML(element, index) {
    const analysis = element.analysis;
    const styles = element.styles;
    
    let html = `    <!-- Section ${index + 1}: ${analysis.semanticRole || analysis.tagName} -->\n`;
    html += `    <section class="elementor-section elementor-top-section" data-id="${analysis.id || `section-${index}`}">\n`;
    html += `        <div class="elementor-container">\n`;
    
    // Add content
    if (analysis.textContent) {
      html += `            <div class="elementor-column">\n`;
      html += `                <div class="elementor-widget-wrap">\n`;
      html += `                    <div class="elementor-widget">\n`;
      html += `                        ${this.escapeHTML(analysis.textContent)}\n`;
      html += `                    </div>\n`;
      html += `                </div>\n`;
      html += `            </div>\n`;
    }
    
    html += `        </div>\n`;
    html += `    </section>\n\n`;
    
    return html;
  }

  /**
   * Export design reference (snapshot with styles)
   */
  exportDesignReference(elements, options = {}) {
    const reference = {
      exportedAt: new Date().toISOString(),
      sourceUrl: window.location.href,
      elements: elements.map((element, index) => ({
        index: index,
        id: element.analysis.id || `element-${index}`,
        tagName: element.analysis.tagName,
        semanticRole: element.analysis.semanticRole,
        layoutType: element.analysis.layoutType,
        dimensions: element.analysis.dimensions,
        styles: {
          typography: element.styles.typography,
          colors: element.styles.colors,
          spacing: element.styles.spacing,
          layout: element.styles.layout,
          background: element.styles.background,
          borders: element.styles.borders,
          effects: element.styles.effects
        },
        elementorMapping: {
          widgetType: this.determineWidgetType(element.analysis),
          recommendedSettings: this.getRecommendedSettings(element)
        },
        screenshot: null // Would need canvas API for actual screenshots
      })),
      summary: {
        totalElements: elements.length,
        layoutTypes: this.countLayoutTypes(elements),
        hasAnimations: this.hasAnimations(elements),
        responsiveBreakpoints: this.detectResponsiveBreakpoints(elements)
      }
    };
    
    return {
      format: 'reference',
      filename: `${options.filename || 'design-reference'}.json`,
      content: JSON.stringify(reference, null, 2),
      mimeType: 'application/json'
    };
  }

  /**
   * Determine widget type for reference
   */
  determineWidgetType(analysis) {
    const mapper = new ElementorMapper();
    return mapper.determineWidgetType(analysis, {});
  }

  /**
   * Get recommended Elementor settings
   */
  getRecommendedSettings(element) {
    const mapper = new ElementorMapper();
    return mapper.buildWidgetSettings(
      element.analysis,
      element.styles,
      mapper.determineWidgetType(element.analysis, element.styles)
    );
  }

  /**
   * Count layout types
   */
  countLayoutTypes(elements) {
    const counts = {};
    elements.forEach(element => {
      const layoutType = element.analysis.layoutType;
      counts[layoutType] = (counts[layoutType] || 0) + 1;
    });
    return counts;
  }

  /**
   * Check if elements have animations
   */
  hasAnimations(elements) {
    return elements.some(element => 
      element.styles.animations &&
      (element.styles.animations.transitions.length > 0 ||
       element.styles.animations.animations.length > 0 ||
       element.styles.animations.hasGSAP ||
       element.styles.animations.hasAOS ||
       element.styles.animations.hasScrollAnimations)
    );
  }

  /**
   * Detect responsive breakpoints
   */
  detectResponsiveBreakpoints(elements) {
    // Simplified detection
    return {
      mobile: '< 768px',
      tablet: '768px - 1024px',
      desktop: '> 1024px'
    };
  }

  /**
   * Escape HTML for safe output
   */
  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Copy to clipboard
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return { success: true };
      } catch (err) {
        document.body.removeChild(textArea);
        return { success: false, error: err.message };
      }
    }
  }

  /**
   * Download file
   */
  downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { success: true };
  }

  /**
   * Export and download
   */
  async exportAndDownload(elements, format, options = {}) {
    const exportData = this.export(elements, format, options);
    this.downloadFile(exportData.filename, exportData.content, exportData.mimeType);
    return exportData;
  }

  /**
   * Export and copy to clipboard
   */
  async exportAndCopy(elements, format, options = {}) {
    const exportData = this.export(elements, format, options);
    const result = await this.copyToClipboard(exportData.content);
    return { ...exportData, ...result };
  }
}

// Export for use in content script
if (typeof window !== 'undefined') {
  window.ExportHandler = ExportHandler;
}
