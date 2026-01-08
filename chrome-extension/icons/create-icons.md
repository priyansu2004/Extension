# Create simple icon placeholders

To create proper icons, you can:

1. **Use online tools**:
   - Canva.com (free)
   - favicon.io (free favicon generator)
   - Icons8.com (icon generator)

2. **Quick temporary icons**:
   - Download any 16x16, 48x48, and 128x128 PNG images
   - Name them icon16.png, icon48.png, icon128.png
   - Place in the icons/ folder

3. **PowerShell command to create basic colored squares**:
```powershell
# This creates basic colored square icons for testing
Add-Type -AssemblyName System.Drawing

# 16x16 icon
$bitmap16 = New-Object System.Drawing.Bitmap 16,16
$graphics16 = [System.Drawing.Graphics]::FromImage($bitmap16)
$graphics16.Clear([System.Drawing.Color]::Blue)
$bitmap16.Save("$pwd\icons\icon16.png", [System.Drawing.Imaging.ImageFormat]::Png)

# 48x48 icon  
$bitmap48 = New-Object System.Drawing.Bitmap 48,48
$graphics48 = [System.Drawing.Graphics]::FromImage($bitmap48)
$graphics48.Clear([System.Drawing.Color]::Blue)
$bitmap48.Save("$pwd\icons\icon48.png", [System.Drawing.Imaging.ImageFormat]::Png)

# 128x128 icon
$bitmap128 = New-Object System.Drawing.Bitmap 128,128
$graphics128 = [System.Drawing.Graphics]::FromImage($bitmap128) 
$graphics128.Clear([System.Drawing.Color]::Blue)
$bitmap128.Save("$pwd\icons\icon128.png", [System.Drawing.Imaging.ImageFormat]::Png)

Write-Host "Icons created successfully!"
```

For now, the extension will work without icons (Chrome will show default icons).