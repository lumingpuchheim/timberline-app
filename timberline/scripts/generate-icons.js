const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sourceIcon = path.join(__dirname, '../assets/images/icon.png');
const assetsDir = path.join(__dirname, '../assets/images');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

async function generateIcons() {
  try {
    console.log('Generating icons from:', sourceIcon);

    // Read the source icon to get its dimensions and extract colors
    const metadata = await sharp(sourceIcon).metadata();
    console.log(`Source icon: ${metadata.width}x${metadata.height}`);

    // 1. Android Adaptive Icon - Foreground (1024x1024)
    // This should be the icon centered on transparent background
    // For adaptive icons, the important content should be in the center 66% (safe zone)
    await sharp(sourceIcon)
      .resize(1024, 1024, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
      })
      .ensureAlpha() // Ensure transparency is preserved
      .toFile(path.join(assetsDir, 'android-icon-foreground.png'));
    console.log('✓ Generated android-icon-foreground.png (1024x1024)');

    // 2. Android Adaptive Icon - Background (1024x1024)
    // Solid color background matching your app theme (#E6F4FE from app.json)
    await sharp({
      create: {
        width: 1024,
        height: 1024,
        channels: 4,
        background: { r: 230, g: 244, b: 254 }, // #E6F4FE
      },
    })
      .png()
      .toFile(path.join(assetsDir, 'android-icon-background.png'));
    console.log('✓ Generated android-icon-background.png (1024x1024)');

    // 3. Android Adaptive Icon - Monochrome (1024x1024)
    // White version for monochrome icon
    await sharp(sourceIcon)
      .resize(1024, 1024, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .greyscale()
      .threshold(128) // Convert to black and white
      .toFile(path.join(assetsDir, 'android-icon-monochrome.png'));
    console.log('✓ Generated android-icon-monochrome.png (1024x1024)');

    // 4. Favicon (32x32 for web)
    await sharp(sourceIcon)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toFile(path.join(assetsDir, 'favicon.png'));
    console.log('✓ Generated favicon.png (32x32)');

    // 5. Splash Icon (200x200 based on app.json imageWidth)
    await sharp(sourceIcon)
      .resize(200, 200, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toFile(path.join(assetsDir, 'splash-icon.png'));
    console.log('✓ Generated splash-icon.png (200x200)');

    console.log('\n✅ All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();

