# HTML to Elementor Converter - Chrome Extension

A powerful Chrome extension that extracts sections from any HTML website and converts them into Elementor-compatible layout data.

## 🚀 Features

- **Visual Element Selection**: Click and select any element on any website
- **Live CSS Extraction**: Automatically extract fonts, colors, spacing, and layout properties  
- **Elementor JSON Export**: Convert HTML elements to Elementor-compatible JSON format
- **Multi-format Export**: Export as Elementor JSON or clean HTML/CSS
- **Responsive Analysis**: Detect and extract responsive behavior
- **Real-time Sidebar**: Non-intrusive right-side panel with element details
- **Multi-select Mode**: Select multiple elements with Ctrl/Cmd + click
- **Copy to Clipboard**: One-click copy of exported JSON
- **File Download**: Download exported data as files

## 📦 Installation

### Option 1: Load Unpacked Extension (Recommended)

1. **Download or clone this repository** to your computer
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer mode** (toggle in top-right corner)
4. **Click "Load unpacked"** and select the `chrome-extension` folder
5. **Pin the extension** to your toolbar for easy access

### Option 2: Manual Installation

1. Download the extension files
2. Extract to a folder named `html-to-elementor-converter`
3. Follow steps 2-5 from Option 1

## 🎯 Quick Start Guide

### Step 1: Activate Extension
- Click the extension icon in your Chrome toolbar
- The sidebar will automatically open on the right side
- The webpage will resize to accommodate the sidebar

### Step 2: Select Elements  
- **Hover** over any element to see blue highlight
- **Click** to select elements (green highlight appears)
- **Ctrl/Cmd + Click** to select multiple elements
- **ESC** to clear all selections

### Step 3: View Element Details
- Selected element details appear in the sidebar
- View typography, spacing, colors, and layout properties
- See all selected elements in the tree view

### Step 4: Export
- Click **"Export as Elementor JSON"** for Elementor format
- Click **"Copy JSON to Clipboard"** for quick copying
- Click **"Download JSON File"** to save locally
- Click **"Export as HTML"** for clean HTML/CSS

### Step 5: Close Extension
- Click the **X button** in the sidebar header
- Extension deactivates and website returns to normal

## 🛠️ Usage Examples

### Converting a Hero Section
1. Visit any website (e.g., Apple.com)
2. Activate the extension 
3. Click on the main hero heading
4. Click on the hero description text
5. Click on the call-to-action button
6. Export as Elementor JSON
7. Import into Elementor using the JSON

### Extracting Navigation Menu
1. Navigate to a website with an interesting menu
2. Click on the navigation container
3. The extension automatically detects flex/grid layout
4. Export and recreate in Elementor

### Copying Typography Styles
1. Find text with appealing typography
2. Select the text element
3. View extracted font family, size, weight, colors
4. Copy values to use in your Elementor designs

## 📋 Supported Elements

| HTML Element | Elementor Widget | Extracted Data |
|--------------|------------------|----------------|
| `<div>` | Container/Section | Layout, spacing, background, flexbox |
| `<h1>-<h6>` | Heading Widget | Text, typography, colors |
| `<p>`, `<span>` | Text Editor | Content, typography, spacing |
| `<img>` | Image Widget | Source, dimensions, styling |
| `<button>`, `<a>` | Button Widget | Text, link, colors, spacing |
| `<ul>`, `<ol>` | Icon List Widget | List items, styling |
| `<form>`, inputs | Form Widget | Field types, validation |
| `<video>` | Video Widget | Source, controls, autoplay |
| Icons (FA, SVG) | Icon Widget | Icon name, size, color |

## ⚙️ Advanced Features

### Responsive Detection
- Automatically detects current viewport size
- Extracts responsive values for different breakpoints
- Toggle between Desktop/Tablet/Mobile view modes

### CSS Property Extraction
- Font families, sizes, weights, line heights
- Colors (text, background, borders) in HEX format  
- Spacing (margins, padding) with units
- Border styles, widths, colors, radius
- Flexbox/Grid layout properties
- Position, display, overflow properties

### Export Formats

**Elementor JSON Structure:**
```json
{
  "version": "1.0",
  "title": "Converted from example.com", 
  "elements": [
    {
      "id": "unique-123",
      "elType": "widget",
      "widgetType": "heading",
      "settings": {
        "title": "Welcome",
        "color": "#333333",
        "typography_font_family": "Roboto",
        "typography_font_size": {"size": 32, "unit": "px"}
      }
    }
  ]
}
```

**Clean HTML Export:**
- Sanitized HTML structure
- Inline critical CSS  
- Elementor-friendly markup
- Removed scripts and framework classes

## 🔧 Technical Details

### Browser Compatibility
- ✅ Chrome 88+
- ✅ Microsoft Edge 88+ 
- ✅ Brave Browser
- ✅ Any Chromium-based browser

### Permissions Used
- `activeTab`: Access current webpage for element extraction
- `scripting`: Inject content scripts for functionality
- `storage`: Save user preferences (optional)

### Privacy & Security  
- ✅ **No external API calls** - all processing is local
- ✅ **No data collection** - extension doesn't send data anywhere
- ✅ **No persistent storage** - selections cleared on close
- ✅ **Sandboxed execution** - extension runs in isolated context

## 🐛 Troubleshooting

### Extension Not Working
1. **Check permissions**: Ensure extension has access to current site
2. **Reload page**: Refresh the webpage and try again  
3. **Check console**: Open DevTools Console for error messages
4. **Disable other extensions**: Test with other extensions disabled

### Cannot Select Elements
1. **Check overlay**: Make sure hover highlights are visible
2. **Avoid extension UI**: Don't click on the sidebar itself
3. **Scroll position**: Try scrolling to bring elements into view
4. **Frame issues**: Extension may not work in iframes

### Export Issues  
1. **Select elements first**: Ensure you have elements selected
2. **Browser permissions**: Allow downloads in browser settings
3. **Popup blockers**: Disable popup blockers for the site
4. **Large selections**: Try exporting smaller sets of elements

### Common Error Messages

**"No elements selected for export"**
- Solution: Select at least one element before exporting

**"Failed to extract element data"** 
- Solution: Try selecting a different element or refresh page

**"Copy to clipboard failed"**
- Solution: Use HTTPS sites or try download option instead

## 🔄 Updating the Extension

1. Download latest version files
2. Replace existing extension folder contents  
3. Go to `chrome://extensions/`
4. Click **refresh icon** next to the extension
5. Extension will update with new features

## 🤝 Support & Feedback

### Reporting Issues
1. Open Chrome DevTools (`F12`)
2. Go to Console tab
3. Copy any error messages
4. Include website URL where issue occurred
5. Describe exact steps to reproduce

### Feature Requests
- Request new Elementor widget mappings
- Suggest export format improvements  
- Propose UI/UX enhancements

## 📄 Changelog

### Version 1.0.0
- ✅ Initial release
- ✅ Visual element selection
- ✅ CSS extraction and parsing
- ✅ Elementor JSON export  
- ✅ Multi-format export options
- ✅ Responsive design detection
- ✅ Real-time sidebar interface

## 🔗 Related Resources

- [Elementor Documentation](https://developers.elementor.com/)
- [Chrome Extension APIs](https://developer.chrome.com/docs/extensions/)
- [CSS Selectors Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)

## 📜 License

This extension is provided as-is for educational and development purposes. Use responsibly and respect website terms of service.

---

**Made with ❤️ for the Elementor community**