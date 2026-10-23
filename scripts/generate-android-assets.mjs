import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const RES_DIR = path.join(ROOT_DIR, 'android', 'app', 'src', 'main', 'res');
const MAIN_LOGO = path.join(ROOT_DIR, 'public', 'main-logo.jpg');
const TRANSPARENT_LOGO = path.join(ROOT_DIR, 'public', 'logo-transparent.png');
const OUTPUT_DIR = path.join(ROOT_DIR, 'android-branding');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateAssets() {
  console.log('Generating Android icons and splash assets from official NEED ELECTRO brand images...');

  // 1. Play Store 512x512 High-Res Icon
  await sharp(MAIN_LOGO)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(ROOT_DIR, 'android', 'app', 'src', 'main', 'ic_launcher-playstore.png'));
  
  await sharp(MAIN_LOGO)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(OUTPUT_DIR, 'playstore-icon-512x512.png'));

  console.log('✓ Play Store 512x512 icon generated');

  // 2. Standard Launcher Icons (ic_launcher.png & ic_launcher_round.png)
  const iconDensities = [
    { folder: 'mipmap-mdpi', size: 48 },
    { folder: 'mipmap-hdpi', size: 72 },
    { folder: 'mipmap-xhdpi', size: 96 },
    { folder: 'mipmap-xxhdpi', size: 144 },
    { folder: 'mipmap-xxxhdpi', size: 192 },
  ];

  for (const { folder, size } of iconDensities) {
    const targetDir = path.join(RES_DIR, folder);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // Square icon
    await sharp(MAIN_LOGO)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // Round icon (circle mask)
    const circleBuffer = Buffer.from(
      `<svg><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff" /></svg>`
    );
    await sharp(MAIN_LOGO)
      .resize(size, size, { fit: 'cover' })
      .composite([{ input: circleBuffer, blend: 'dest-in' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // Adaptive foreground (108dp base canvas, icon occupies centered ~66% safe area)
    const fgSize = Math.round(size * (108 / 48));
    const innerSize = Math.round(fgSize * 0.68);
    const innerBuffer = await sharp(MAIN_LOGO)
      .resize(innerSize, innerSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: fgSize,
        height: fgSize,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      },
    })
      .composite([{ input: innerBuffer, gravity: 'center' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    console.log(`✓ Generated ${folder} icons (${size}x${size}, fg: ${fgSize}x${fgSize})`);
  }

  // 3. Splash Screens (Deep Navy #002B5B background with centered NEED ELECTRO logo)
  const splashScreens = [
    { folder: 'drawable', width: 480, height: 800 },
    { folder: 'drawable-port-mdpi', width: 320, height: 480 },
    { folder: 'drawable-port-hdpi', width: 480, height: 800 },
    { folder: 'drawable-port-xhdpi', width: 720, height: 1280 },
    { folder: 'drawable-port-xxhdpi', width: 960, height: 1600 },
    { folder: 'drawable-port-xxxhdpi', width: 1280, height: 1920 },
    { folder: 'drawable-land-mdpi', width: 480, height: 320 },
    { folder: 'drawable-land-hdpi', width: 800, height: 480 },
    { folder: 'drawable-land-xhdpi', width: 1280, height: 720 },
    { folder: 'drawable-land-xxhdpi', width: 1600, height: 960 },
    { folder: 'drawable-land-xxxhdpi', width: 1920, height: 1280 },
  ];

  for (const { folder, width, height } of splashScreens) {
    const targetDir = path.join(RES_DIR, folder);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const maxLogoWidth = Math.round(width * 0.65);
    const maxLogoHeight = Math.round(height * 0.35);
    const logoTargetSize = Math.min(maxLogoWidth, maxLogoHeight, 512);

    const logoBuffer = await sharp(MAIN_LOGO)
      .resize(logoTargetSize, logoTargetSize, { fit: 'contain' })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 0, g: 43, b: 91, alpha: 1 }, // #002B5B
      },
    })
      .composite([{ input: logoBuffer, gravity: 'center' }])
      .png()
      .toFile(path.join(targetDir, 'splash.png'));

    console.log(`✓ Generated ${folder}/splash.png (${width}x${height})`);
  }

  // 4. Feature Graphic for Google Play Store (1024x500)
  const featureLogoSize = 360;
  const featureLogo = await sharp(MAIN_LOGO)
    .resize(featureLogoSize, featureLogoSize, { fit: 'contain' })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 1024,
      height: 500,
      channels: 4,
      background: { r: 0, g: 43, b: 91, alpha: 1 },
    },
  })
    .composite([{ input: featureLogo, gravity: 'center' }])
    .png()
    .toFile(path.join(OUTPUT_DIR, 'playstore-feature-graphic-1024x500.png'));

  console.log('✓ Generated Play Store feature graphic (1024x500)');
  console.log('All Android brand assets generated successfully!');
}

generateAssets().catch((err) => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
