#!/usr/bin/env node

/**
 * Complete export workflow with validation:
 * 1. Preprocess markdown (generate Mermaid/QR images, keep in memory)
 * 2. Export to images (test rendering)
 * 3. Validate images
 * 4. Export to PPTX
 * 
 * Usage:
 *   node scripts/export-with-validation.js [--skip-images] [--skip-pptx] [--skip-validation]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const skipImages = args.includes('--skip-images');
const skipPptx = args.includes('--skip-pptx');
const skipValidation = args.includes('--skip-validation');

const slidesDir = path.join(__dirname, '../slides');
const presentationFile = 'presentation.md';
const imageScript = path.join(__dirname, 'slides-to-image.js');
const imageOutputDir = path.join(slidesDir, 'slide-images');
const combinedImage = path.join(imageOutputDir, 'slides-combined.png');
const pptxFile = path.join(slidesDir, 'presentation.pptx');

console.log('🚀 Starting complete export workflow with validation...\n');

// Step 1: Preprocess markdown (in memory)
console.log('═══════════════════════════════════════════════════════════');
console.log('STEP 1: Preprocessing markdown');
console.log('═══════════════════════════════════════════════════════════\n');

const { preprocessMarkdown } = require('./preprocess-for-pdf.js');

(async () => {
let preprocessedContent;
try {
  preprocessedContent = await preprocessMarkdown(path.join(slidesDir, presentationFile));
  console.log(`\n✅ Preprocessing complete (in memory)\n`);
} catch (error) {
  console.error('❌ Preprocessing failed:');
  console.error(error.message);
  process.exit(1);
}

// Step 2: Export to images (validation)
if (!skipImages) {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('STEP 2: Exporting to images (validation)');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  try {
    execSync(`node "${imageScript}" --stitch`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    // Validate combined image exists and has reasonable size
    if (fs.existsSync(combinedImage)) {
      const stats = fs.statSync(combinedImage);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`\n✅ Combined image created: ${sizeMB} MB`);
      
      if (!skipValidation) {
        // Check if image is too small (might indicate rendering issues)
        if (stats.size < 100000) { // Less than 100KB is suspicious
          console.warn('⚠️  Warning: Combined image is very small, may indicate rendering issues');
        } else {
          console.log('✅ Image size validation passed');
        }
      }
    } else {
      console.error('❌ Combined image not found');
      process.exit(1);
    }
    
    // Count individual slide images
    const slideImages = fs.readdirSync(imageOutputDir)
      .filter(f => f.match(/^slide-\d+\.png$/))
      .sort();
    
    console.log(`✅ Generated ${slideImages.length} individual slide images\n`);
  } catch (error) {
    console.error('❌ Image export failed:');
    console.error(error.message);
    if (!skipValidation) {
      process.exit(1);
    }
  }
} else {
  console.log('⏭️  Skipping image export (--skip-images)\n');
}

// Step 3: Export to PPTX
if (!skipPptx) {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('STEP 3: Exporting to PPTX');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Workaround: Write preprocessed content to temp directory for Marp CLI
  const tempDir = path.join(__dirname, '../.tmp/marp-export');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const tempFile = path.join(tempDir, 'presentation.md');
  fs.writeFileSync(tempFile, preprocessedContent, 'utf8');
  
  // Also copy images directory to temp location so relative paths work
  const tempImagesDir = path.join(tempDir, 'images');
  if (fs.existsSync(tempImagesDir)) {
    fs.rmSync(tempImagesDir, { recursive: true, force: true });
  }
  
  // Copy mermaid images
  const sourceMermaidDir = path.join(slidesDir, 'images/mermaid');
  const tempMermaidDir = path.join(tempImagesDir, 'mermaid');
  if (fs.existsSync(sourceMermaidDir)) {
    fs.mkdirSync(tempMermaidDir, { recursive: true });
    fs.readdirSync(sourceMermaidDir).forEach(file => {
      if (file.match(/\.(png|svg)$/)) {
        fs.copyFileSync(
          path.join(sourceMermaidDir, file),
          path.join(tempMermaidDir, file)
        );
      }
    });
  }
  
  // Copy QR images
  const sourceQrDir = path.join(slidesDir, 'images/qr');
  const tempQrDir = path.join(tempImagesDir, 'qr');
  if (fs.existsSync(sourceQrDir)) {
    fs.mkdirSync(tempQrDir, { recursive: true });
    fs.readdirSync(sourceQrDir).forEach(file => {
      if (file.match(/\.(png|svg)$/)) {
        fs.copyFileSync(
          path.join(sourceQrDir, file),
          path.join(tempQrDir, file)
        );
      }
    });
  }
  
  // Copy theme files to temp location so Marp CLI can find them
  const sourceThemesDir = path.join(slidesDir);
  ['rose-pine-dawn.css', 'rose-pine-moon.css'].forEach(themeFile => {
    const sourceTheme = path.join(sourceThemesDir, themeFile);
    if (fs.existsSync(sourceTheme)) {
      fs.copyFileSync(sourceTheme, path.join(tempDir, themeFile));
    }
  });
  
  try {
    console.log('📊 Exporting PPTX with preprocessed markdown...');
    // Explicitly enable HTML rendering for column layouts
    const command = `npx @marp-team/marp-cli --no-stdin --pptx --html --allow-local-files presentation.md -o "${pptxFile}"`;
    execSync(command, { stdio: 'inherit', cwd: tempDir });
    
    // Validate PPTX file
    if (fs.existsSync(pptxFile)) {
      const stats = fs.statSync(pptxFile);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`\n✅ PPTX exported: ${sizeMB} MB`);
      
      if (!skipValidation) {
        if (stats.size < 50000) { // Less than 50KB is suspicious
          console.warn('⚠️  Warning: PPTX file is very small, may indicate rendering issues');
        } else {
          console.log('✅ PPTX size validation passed');
        }
      }
    } else {
      console.error('❌ PPTX file not found');
      process.exit(1);
    }
    
    // Cleanup temp file
    try {
      fs.unlinkSync(tempFile);
      fs.rmSync(tempImagesDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore cleanup errors
    }
    
    console.log(`\n✅ PPTX export complete: ${pptxFile}\n`);
  } catch (error) {
    console.error('❌ PPTX export failed:');
    console.error(error.message);
    process.exit(1);
  }
} else {
  console.log('⏭️  Skipping PPTX export (--skip-pptx)\n');
}

// Summary
console.log('═══════════════════════════════════════════════════════════');
console.log('✅ EXPORT WORKFLOW COMPLETE');
console.log('═══════════════════════════════════════════════════════════\n');

if (!skipImages) {
  console.log(`📸 Images: ${combinedImage}`);
  const slideCount = fs.existsSync(imageOutputDir) 
    ? fs.readdirSync(imageOutputDir).filter(f => f.match(/^slide-\d+\.png$/)).length
    : 0;
  console.log(`   ${slideCount} individual slides + combined image`);
}

if (!skipPptx) {
  console.log(`📊 PPTX: ${pptxFile}`);
}

console.log(`\n💡 Tip: Open ${combinedImage} to verify all slides render correctly`);
if (!skipPptx) {
  console.log(`💡 Tip: Open ${pptxFile} to verify PPTX export`);
}
console.log('');

})();
