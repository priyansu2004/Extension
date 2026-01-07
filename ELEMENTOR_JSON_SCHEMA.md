# Elementor JSON Schema Documentation

## Overview

This document explains the Elementor JSON schema used by the extension for exporting converted websites.

## Schema Structure

### Root Object

```json
{
  "version": "0.4",
  "title": "Page Title",
  "type": "page",
  "settings": {},
  "elements": []
}
```

### Properties

- **version** (string): Elementor format version (currently "0.4")
- **title** (string): Page title
- **type** (string): Content type ("page", "post", etc.)
- **settings** (object): Page-level settings
- **elements** (array): Array of element objects

## Element Structure

### Basic Element

```json
{
  "elType": "widget",
  "widgetType": "heading",
  "id": "element_abc123",
  "settings": {},
  "elements": []
}
```

### Element Properties

- **elType** (string): Element type ("widget", "section", "column", "container")
- **widgetType** (string): Widget type (only for widgets)
- **id** (string): Unique element ID
- **settings** (object): Element settings
- **elements** (array): Child elements (for containers)

## Widget Types

### Heading Widget

```json
{
  "elType": "widget",
  "widgetType": "heading",
  "id": "element_xxx",
  "settings": {
    "title": "Heading Text",
    "size": "h2",
    "link": {
      "url": "https://example.com",
      "is_external": false
    },
    "typography_typography": "custom",
    "typography_font_family": "Roboto",
    "typography_font_size": {
      "unit": "px",
      "size": 24,
      "sizes": {}
    },
    "typography_font_weight": 600,
    "typography_text_align": "left",
    "typography_color": "#333333"
  }
}
```

### Text Editor Widget

```json
{
  "elType": "widget",
  "widgetType": "text-editor",
  "id": "element_xxx",
  "settings": {
    "editor": "<p>Text content here</p>",
    "typography_typography": "custom",
    "typography_font_family": "Roboto",
    "typography_font_size": {
      "unit": "px",
      "size": 16
    }
  }
}
```

### Button Widget

```json
{
  "elType": "widget",
  "widgetType": "button",
  "id": "element_xxx",
  "settings": {
    "text": "Click Me",
    "link": {
      "url": "https://example.com",
      "is_external": true
    },
    "size": "md",
    "icon": "fa fa-arrow-right",
    "background_color": "#667eea",
    "text_color": "#ffffff"
  }
}
```

### Image Widget

```json
{
  "elType": "widget",
  "widgetType": "image",
  "id": "element_xxx",
  "settings": {
    "image": {
      "url": "https://example.com/image.jpg",
      "id": ""
    },
    "image_size": "full",
    "caption": "Image description"
  }
}
```

### Section Widget

```json
{
  "elType": "section",
  "id": "element_xxx",
  "settings": {
    "layout": "boxed",
    "content_width": "boxed",
    "height": "default",
    "column_gap": "default",
    "padding": {
      "unit": "px",
      "top": 0,
      "right": 0,
      "bottom": 0,
      "left": 0,
      "isLinked": false
    },
    "margin": {
      "unit": "px",
      "top": 0,
      "right": 0,
      "bottom": 0,
      "left": 0,
      "isLinked": false
    },
    "background_background_type": "classic",
    "background_color": "#ffffff"
  },
  "elements": []
}
```

### Container Widget (Elementor Pro)

```json
{
  "elType": "container",
  "id": "element_xxx",
  "settings": {
    "content_width": "full",
    "flex_direction": "row",
    "justify_content": "flex-start",
    "align_items": "stretch",
    "flex_wrap": "nowrap",
    "gap": {
      "unit": "px",
      "column": 20,
      "row": 20
    }
  },
  "elements": []
}
```

## Typography Settings

### Typography Object

```json
{
  "typography_typography": "custom",
  "typography_font_family": "Roboto",
  "typography_font_size": {
    "unit": "px",
    "size": 16,
    "sizes": {}
  },
  "typography_font_weight": 400,
  "typography_font_style": "normal",
  "typography_text_transform": "none",
  "typography_text_decoration": "none",
  "typography_line_height": {
    "unit": "",
    "size": 1.5,
    "sizes": {}
  },
  "typography_letter_spacing": {
    "unit": "px",
    "size": 0,
    "sizes": {}
  },
  "typography_text_align": "left",
  "typography_color": "#333333"
}
```

## Spacing Settings

### Padding/Margin Object

```json
{
  "unit": "px",
  "top": 20,
  "right": 20,
  "bottom": 20,
  "left": 20,
  "isLinked": false
}
```

### Responsive Spacing

```json
{
  "padding": { /* desktop */ },
  "padding_tablet": { /* tablet */ },
  "padding_mobile": { /* mobile */ },
  "margin": { /* desktop */ },
  "margin_tablet": { /* tablet */ },
  "margin_mobile": { /* mobile */ }
}
```

## Background Settings

### Classic Background

```json
{
  "background_background_type": "classic",
  "background_color": "#ffffff",
  "background_image": {
    "url": "https://example.com/bg.jpg",
    "id": "",
    "size": "cover",
    "position": {
      "x": 0.5,
      "y": 0.5
    }
  }
}
```

### Gradient Background

```json
{
  "background_background_type": "gradient",
  "background_gradient": {
    "type": "linear",
    "angle": 90,
    "colors": [
      {
        "color": "#667eea",
        "position": 0
      },
      {
        "color": "#764ba2",
        "position": 100
      }
    ]
  }
}
```

### Background Overlay

```json
{
  "background_overlay_background_type": "classic",
  "background_overlay_color": "rgba(0, 0, 0, 0.5)",
  "background_overlay_opacity": 0.5
}
```

## Border Settings

```json
{
  "border_border": "solid",
  "border_width": {
    "unit": "px",
    "top": 1,
    "right": 1,
    "bottom": 1,
    "left": 1,
    "isLinked": true
  },
  "border_color": "#e0e0e0",
  "borderRadius": {
    "unit": "px",
    "top": 4,
    "right": 4,
    "bottom": 4,
    "left": 4,
    "isLinked": true
  }
}
```

## Effects Settings

### Box Shadow

```json
{
  "box_shadow_box_shadow_type": "yes",
  "box_shadow_box_shadow": {
    "horizontal": 0,
    "vertical": 2,
    "blur": 8,
    "spread": 0,
    "color": "rgba(0, 0, 0, 0.1)"
  }
}
```

### Opacity

```json
{
  "_opacity": 0.9
}
```

## Importing to Elementor

### Method 1: Import JSON

1. Open Elementor editor
2. Go to Templates → Import Templates
3. Select "Import JSON"
4. Paste or upload the JSON file
5. Click "Import Now"

### Method 2: Manual Import

1. Copy JSON content
2. In Elementor, use "Import Template" feature
3. Paste JSON in the import field
4. Verify elements appear correctly

### Method 3: Elementor API

For programmatic import, use Elementor's REST API:

```javascript
// Example API call
fetch('/wp-json/elementor/v1/templates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-WP-Nonce': nonce
  },
  body: JSON.stringify(elementorJSON)
});
```

## Validation

### Required Fields

- `version`: Must be "0.4"
- `title`: Must be a string
- `type`: Must be "page"
- `elements`: Must be an array

### Element Validation

- `elType`: Required, must be valid type
- `id`: Required, must be unique
- `settings`: Required, must be object
- `widgetType`: Required for widgets

## Common Issues

### Issue: Import Fails

**Solution:**
- Verify JSON is valid (use JSON validator)
- Check Elementor version compatibility
- Ensure all required fields are present

### Issue: Styles Not Applied

**Solution:**
- Check typography settings format
- Verify color values are valid
- Ensure spacing units are correct

### Issue: Layout Broken

**Solution:**
- Verify container settings
- Check flex/grid properties
- Review responsive settings

## Best Practices

1. **Validate JSON** before importing
2. **Test on staging** before production
3. **Review settings** after import
4. **Adjust responsive** values manually
5. **Optimize images** before import

## Schema Version History

- **v0.4**: Current version (Elementor 3.x)
- **v0.3**: Legacy version (Elementor 2.x)

---

**For Elementor-specific documentation, visit: https://developers.elementor.com/**
