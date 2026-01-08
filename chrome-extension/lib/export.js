/**
 * Export Utility Functions
 * Handles JSON generation, clipboard operations, and file downloads
 */

class ExportManager {
  
  /**
   * Export selected elements as Elementor JSON
   */
  static async exportAsElementorJSON(selectedElements) {
    try {
      if (!selectedElements || selectedElements.length === 0) {
        throw new Error('No elements selected for export');
      }

      // Convert to Elementor format
      const elementorData = window.ElementorMapper.convertToElementor(selectedElements);
      
      // Validate the data
      const validatedData = window.ElementorMapper.validateElementorData(elementorData);
      
      // Pretty format the JSON
      const jsonString = JSON.stringify(validatedData, null, 2);
      
      return {
        success: true,
        data: validatedData,
        json: jsonString,
        filename: this.generateFilename('json')
      };
      
    } catch (error) {
      console.error('Export failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Export as clean HTML with CSS
   */
  static async exportAsHTML(selectedElements) {
    try {
      const htmlContent = this.generateCleanHTML(selectedElements);
      const cssContent = this.generateCleanCSS(selectedElements);
      
      const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported from ${window.location.hostname}</title>
    <style>
${cssContent}
    </style>
</head>
<body>
${htmlContent}
</body>
</html>`;

      return {
        success: true,
        data: fullHTML,
        filename: this.generateFilename('html')
      };
      
    } catch (error) {
      console.error('HTML export failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate clean HTML from selected elements
   */
  static generateCleanHTML(selectedElements) {
    let html = '';
    
    selectedElements.forEach((elementInfo, index) => {
      const element = elementInfo.element;
      const cleanElement = this.cleanElement(element.cloneNode(true));
      cleanElement.setAttribute('data-exported-element', index);
      html += cleanElement.outerHTML + '\n\n';
    });
    
    return html;
  }

  /**
   * Generate clean CSS for exported elements
   */
  static generateCleanCSS(selectedElements) {
    let css = `/* Exported CSS from ${window.location.href} */\n\n`;
    
    selectedElements.forEach((elementInfo, index) => {
      const data = elementInfo.data;
      const selector = `[data-exported-element="${index}"]`;
      
      css += `${selector} {\n`;
      css += `    color: ${data.typography.color};\n`;
      css += `    font-family: ${data.typography.fontFamily};\n`;
      css += `    font-size: ${data.typography.fontSize.size}${data.typography.fontSize.unit};\n`;
      css += `    font-weight: ${data.typography.fontWeight};\n`;
      css += `    line-height: ${data.typography.lineHeight.size}${data.typography.lineHeight.unit};\n`;
      css += `    text-align: ${data.typography.textAlign};\n`;
      
      if (data.background.backgroundColor !== '#000000') {
        css += `    background-color: ${data.background.backgroundColor};\n`;
      }
      
      css += `    margin: ${data.spacing.margin.top.size}${data.spacing.margin.top.unit} `;
      css += `${data.spacing.margin.right.size}${data.spacing.margin.right.unit} `;
      css += `${data.spacing.margin.bottom.size}${data.spacing.margin.bottom.unit} `;
      css += `${data.spacing.margin.left.size}${data.spacing.margin.left.unit};\n`;
      
      css += `    padding: ${data.spacing.padding.top.size}${data.spacing.padding.top.unit} `;
      css += `${data.spacing.padding.right.size}${data.spacing.padding.right.unit} `;
      css += `${data.spacing.padding.bottom.size}${data.spacing.padding.bottom.unit} `;
      css += `${data.spacing.padding.left.size}${data.spacing.padding.left.unit};\n`;
      
      css += `}\n\n`;
    });
    
    return css;
  }

  /**
   * Clean element by removing unnecessary attributes and scripts
   */
  static cleanElement(element) {
    // Remove potentially problematic attributes
    const attributesToRemove = ['onclick', 'onmouseover', 'onmouseout', 'style'];
    attributesToRemove.forEach(attr => {
      element.removeAttribute(attr);
    });
    
    // Remove script tags
    const scripts = element.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // Clean up classes (remove framework-specific ones)
    if (element.className) {
      const classes = Array.from(element.classList);
      const cleanClasses = classes.filter(cls => 
        !cls.includes('elementor') && 
        !cls.includes('wp-') && 
        !cls.includes('js-')
      );
      element.className = cleanClasses.join(' ');
    }
    
    return element;
  }

  /**
   * Copy text to clipboard
   */
  static async copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return { success: true };
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        textArea.remove();
        
        if (successful) {
          return { success: true };
        } else {
          throw new Error('Copy command failed');
        }
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Download content as file using Chrome Downloads API with blob fallback
   */
  static async downloadAsFile(content, filename, mimeType = 'application/json') {
    try {
      console.log('Starting download:', { filename, mimeType, contentLength: content.length });
      
      // Method 1: Try Chrome Downloads API (most reliable)
      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        try {
          console.log('Attempting Chrome Downloads API...');
          
          const blob = new Blob([content], { type: mimeType });
          const url = URL.createObjectURL(blob);
          
          // Ensure filename has correct extension for Chrome Downloads API
          let downloadFilename = filename;
          if (!downloadFilename.endsWith('.json') && mimeType === 'application/json') {
            downloadFilename = filename.replace(/\.[^.]*$/, '') + '.json';
          }
          
          const response = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
              type: 'DOWNLOAD_FILE',
              url: url,
              filename: downloadFilename
            }, (response) => {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
              } else {
                resolve(response);
              }
            });
          });
          
          URL.revokeObjectURL(url);
          
          if (response && response.success) {
            console.log('Chrome Downloads API succeeded');
            return { success: true, method: 'chrome-api' };
          } else {
            console.log('Chrome Downloads API failed, trying blob method');
          }
        } catch (chromeError) {
          console.log('Chrome Downloads API error:', chromeError);
        }
      }
      
      // Method 2: Blob download with improved implementation
      console.log('Using blob download method...');
      
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      console.log('Blob created:', { size: blob.size, type: blob.type });
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Ensure filename has correct extension
      if (!link.download.endsWith('.json') && mimeType === 'application/json') {
        link.download = filename.replace(/\.[^.]*$/, '') + '.json';
      }
      
      link.style.cssText = 'display: none !important; position: absolute !important; left: -9999px !important;';
      
      // Add to body and force click
      document.body.appendChild(link);
      console.log('Download link added to DOM, filename:', link.download);
      
      // Immediate click - don't use setTimeout
      link.click();
      console.log('Download link clicked');
      
      // Clean up immediately
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
          console.log('Download link removed from DOM');
        }
        URL.revokeObjectURL(url);
        console.log('Object URL revoked');
      }, 100);
      
      return { success: true, method: 'blob' };
      
    } catch (error) {
      console.error('Download failed:', error);
      
      // Method 3: Last resort - copy to clipboard with notification
      try {
        console.log('Trying clipboard fallback...');
        await navigator.clipboard.writeText(content);
        
        return { 
          success: true, 
          method: 'clipboard',
          message: 'Download failed - content copied to clipboard instead. Please paste into a text editor and save manually.' 
        };
      } catch (clipboardError) {
        console.error('Clipboard fallback failed:', clipboardError);
        return { 
          success: false, 
          error: `All download methods failed. Original error: ${error.message}. Clipboard error: ${clipboardError.message}` 
        };
      }
    }
  }

  /**
   * Generate filename with timestamp
   */
  static generateFilename(type) {
    const now = new Date();
    const timestamp = now.getFullYear() + 
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') + '_' +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0');
    
    const hostname = window.location.hostname.replace(/[^a-z0-9]/gi, '_');
    
    // Ensure proper file extension
    const extension = type === 'json' ? 'json' : type;
    const prefix = type === 'json' ? 'elementor_export' : 'elementor_export';
    
    return `${prefix}_${hostname}_${timestamp}.${extension}`;
  }

  /**
   * Show notification to user
   */
  static showNotification(message, type = 'success', duration = 3000) {
    // Remove any existing notifications
    this.removeNotification();
    
    const notification = document.createElement('div');
    notification.id = 'elementor-export-notification';
    notification.className = `elementor-notification elementor-notification-${type}`;
    notification.textContent = message;
    
    // Styles
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: type === 'success' ? '#4CAF50' : '#f44336',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '4px',
      fontSize: '14px',
      zIndex: '10000000',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      animation: 'slideInRight 0.3s ease-out',
      maxWidth: '300px',
      wordWrap: 'break-word'
    });
    
    document.body.appendChild(notification);
    
    // Auto remove after duration
    setTimeout(() => {
      this.removeNotification();
    }, duration);
  }

  /**
   * Remove notification
   */
  static removeNotification() {
    const existing = document.getElementById('elementor-export-notification');
    if (existing) {
      existing.remove();
    }
  }

  /**
   * Get export statistics
   */
  static getExportStats(selectedElements) {
    const stats = {
      totalElements: selectedElements.length,
      elementTypes: {},
      totalSize: 0
    };
    
    selectedElements.forEach(elementInfo => {
      const tagName = elementInfo.element.tagName.toLowerCase();
      stats.elementTypes[tagName] = (stats.elementTypes[tagName] || 0) + 1;
      
      // Estimate size
      stats.totalSize += elementInfo.element.outerHTML.length;
    });
    
    return stats;
  }

  /**
   * Validate export data before processing
   */
  static validateExportData(selectedElements) {
    const errors = [];
    
    if (!selectedElements || selectedElements.length === 0) {
      errors.push('No elements selected for export');
    }
    
    selectedElements.forEach((elementInfo, index) => {
      if (!elementInfo.element) {
        errors.push(`Element ${index} is missing DOM element`);
      }
      if (!elementInfo.data) {
        errors.push(`Element ${index} is missing extracted data`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Create export preview
   */
  static createExportPreview(elementorData) {
    const preview = {
      version: elementorData.version,
      title: elementorData.title,
      elementCount: elementorData.elements.length,
      widgets: {},
      estimatedSize: JSON.stringify(elementorData).length
    };
    
    // Count widget types
    const countWidgets = (elements) => {
      elements.forEach(element => {
        if (element.elType === 'widget') {
          preview.widgets[element.widgetType] = (preview.widgets[element.widgetType] || 0) + 1;
        } else if (element.elType === 'container') {
          preview.widgets.container = (preview.widgets.container || 0) + 1;
        }
        
        if (element.elements) {
          countWidgets(element.elements);
        }
      });
    };
    
    countWidgets(elementorData.elements);
    
    return preview;
  }

  /**
   * Copy text to clipboard
   */
  static async copyToClipboard(text) {
    try {
      console.log('Attempting to copy to clipboard...');
      
      // Method 1: Modern Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        console.log('Clipboard API copy successful');
        return { success: true, method: 'clipboard-api' };
      }
      
      // Method 2: Legacy execCommand fallback
      console.log('Falling back to execCommand method...');
      
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.cssText = 'position: fixed; left: -9999px; top: -9999px; opacity: 0;';
      
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, 99999);
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (successful) {
        console.log('execCommand copy successful');
        return { success: true, method: 'execCommand' };
      } else {
        throw new Error('execCommand copy failed');
      }
      
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
}

// Add CSS animation for notifications
if (!document.getElementById('elementor-export-styles')) {
  const style = document.createElement('style');
  style.id = 'elementor-export-styles';
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
}

// Make ExportManager available globally
window.ExportManager = ExportManager;