# Chrome Extension Setup Guide

## Step-by-Step Installation

### Prerequisites
- Google Chrome browser (version 88 or later)
- Basic understanding of Chrome extensions

### Installation Steps

#### 1. Prepare Extension Files

Ensure all files are in the extension directory:
```
Extension_elementer/
├── manifest.json
├── background.js
├── content.js
├── overlay.js
├── popup.html
├── popup.js
├── sidebar.html
├── sidebar.js
├── utils/ (all utility files)
├── styles/ (all CSS files)
└── icons/ (icon files)
```

#### 2. Create Icon Files (Required)

The extension needs icon files. Create or download:

**icons/icon16.png** - 16x16 pixels
**icons/icon48.png** - 48x48 pixels  
**icons/icon128.png** - 128x128 pixels

You can:
- Use any image editor to create simple icons
- Download free icons from icon libraries
- Use placeholder images for testing

**Quick Icon Creation:**
1. Create a simple colored square (e.g., purple gradient)
2. Add text "EC" or "⚡" symbol
3. Export at required sizes

#### 3. Load Extension in Chrome

1. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Or: Menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle "Developer mode" switch in top-right corner
   - This enables loading unpacked extensions

3. **Load Extension**
   - Click "Load unpacked" button
   - Select the `Extension_elementer` folder
   - Click "Select Folder"

4. **Verify Installation**
   - Extension should appear in the list
   - Check for any errors (red text)
   - Extension icon should appear in toolbar

#### 4. Pin Extension (Optional)

1. Click the puzzle piece icon in Chrome toolbar
2. Find "Elementor Pro Converter"
3. Click the pin icon to keep it visible

### First-Time Setup

#### 1. Test Extension

1. Navigate to any website (e.g., `https://example.com`)
2. Click the extension icon
3. Click "Start Converting"
4. You should see:
   - Overlay toolbar at top
   - Elements highlight on hover
   - Selection counter updates

#### 2. Configure Settings

1. Click extension icon
2. Click "Settings" button
3. Configure:
   - Auto-detect animations
   - Include responsive styles
   - Dark/light mode
4. Click "Save"

### Verification Checklist

- [ ] Extension loads without errors
- [ ] Icon appears in Chrome toolbar
- [ ] Popup opens when clicking icon
- [ ] "Start Converting" button works
- [ ] Overlay appears on page
- [ ] Elements highlight on hover
- [ ] Selection works on click
- [ ] Inspector panel opens
- [ ] Export functionality works

### Common Issues & Solutions

#### Issue: "Manifest file is missing or unreadable"

**Solution:**
- Verify `manifest.json` exists in root directory
- Check JSON syntax is valid
- Ensure no trailing commas

#### Issue: "Service worker registration failed"

**Solution:**
- Check `background.js` exists
- Verify no syntax errors
- Check Chrome console for details

#### Issue: "Content script failed to inject"

**Solution:**
- Verify `content.js` exists
- Check file paths in manifest.json
- Ensure all utility files are present

#### Issue: "Icons not loading"

**Solution:**
- Create icon files in `icons/` folder
- Verify file names match manifest.json
- Check file formats are PNG

#### Issue: "Extension not working on website"

**Solution:**
- Check if website blocks extensions
- Verify page is fully loaded
- Check browser console for errors
- Try on different website

### Testing on Different Sites

Test the extension on:

1. **Simple HTML Sites**
   - Example: `https://example.com`
   - Should work perfectly

2. **Complex Sites**
   - Example: `https://github.com`
   - May have some limitations

3. **Local Development**
   - `http://localhost:3000`
   - Works great for testing

4. **WordPress Sites**
   - Any WordPress site
   - Perfect for Elementor conversion

### Updating Extension

When you make changes:

1. Go to `chrome://extensions/`
2. Find "Elementor Pro Converter"
3. Click refresh icon (🔄)
4. Reload the page you're testing on

### Uninstalling Extension

1. Go to `chrome://extensions/`
2. Find "Elementor Pro Converter"
3. Click "Remove"
4. Confirm removal

### Advanced Setup

#### Enable Sidebar API (Chrome 114+)

The sidebar panel requires Chrome 114+. If using older Chrome:

1. Update Chrome to latest version, OR
2. Modify `sidebar.html` to open in new tab instead

#### Permissions Explained

The extension requests:
- `activeTab`: Access current tab
- `storage`: Save projects locally
- `scripting`: Inject content scripts
- `<all_urls>`: Work on any website

These are standard permissions for this type of extension.

### Next Steps

After installation:

1. Read the [README.md](README.md) for usage instructions
2. Try converting a simple website
3. Explore the Inspector panel
4. Test export functionality
5. Review Elementor JSON output

### Getting Help

If you encounter issues:

1. Check browser console (F12)
2. Review error messages
3. Verify all files are present
4. Check Chrome version compatibility
5. Review known limitations in README

---

**Setup complete! Start converting websites to Elementor Pro format.**
