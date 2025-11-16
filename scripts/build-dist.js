#!/usr/bin/env node

/**
 * Build complete distribution to dist/ folder
 * Generates all exports: PPTX, PNG (all themes), HTML, etc.
 * 
 * Output structure:
 *   dist/
 *   ├── presentation.pptx
 *   ├── presentation.html
 *   ├── presentation-light.html
 *   ├── presentation-dark.html
 *   ├── slides-combined.png
 *   ├── slides-combined-light.png
 *   ├── slides-combined-dark.png
 *   └── images/ (all slides for all themes)
 * 
 * Usage:
 *   npm run build:dist
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const slidesDir = path.join(__dirname, '../slides');
const distDir = path.join(__dirname, '../dist');
const presentationFile = 'presentation.md';

console.log('🚀 Building complete distribution to dist/ folder...\n');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log(`📁 Created: ${distDir}\n`);
} else {
  console.log(`📁 Using: ${distDir}\n`);
}

// Step 1: Run export with validation (creates slide-images, presentation.pptx)
console.log('═══════════════════════════════════════════════════════════');
console.log('STEP 1: Full export (default theme + PPTX)');
console.log('═══════════════════════════════════════════════════════════\n');

try {
  execSync(`node "${path.join(__dirname, 'export-with-validation.js')}"`, {
    stdio: 'inherit'
  });
} catch (error) {
  console.error('❌ Export failed');
  process.exit(1);
}

// Step 2: Export themed versions
console.log('\n═══════════════════════════════════════════════════════════');
console.log('STEP 2: Export light + dark theme variants');
console.log('═══════════════════════════════════════════════════════════\n');

try {
  execSync(`node "${path.join(__dirname, 'export-both-themes.js')}"`, {
    stdio: 'inherit'
  });
} catch (error) {
  console.error('❌ Theme export failed');
  process.exit(1);
}

// Step 3: Copy everything to dist folder
console.log('\n═══════════════════════════════════════════════════════════');
console.log('STEP 3: Copying exports to dist/');
console.log('═══════════════════════════════════════════════════════════\n');

try {
  // Copy PPTX files
  const pptxFiles = [
    'presentation.pptx',
    'presentation-light.pptx',
    'presentation-dark.pptx'
  ];
  
  for (const file of pptxFiles) {
    const src = path.join(slidesDir, file);
    const dest = path.join(distDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      const sizeKB = (fs.statSync(dest).size / 1024).toFixed(0);
      console.log(`✅ ${file} (${sizeKB} KB)`);
    }
  }

  // Copy HTML files
  const htmlFiles = [
    'presentation-light.html',
    'presentation-dark.html'
  ];
  
  for (const file of htmlFiles) {
    const src = path.join(slidesDir, file);
    const dest = path.join(distDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      const sizeMB = (fs.statSync(dest).size / 1024 / 1024).toFixed(2);
      console.log(`✅ ${file} (${sizeMB} MB)`);
    }
  }

  // Copy slide images
  const imageDirs = [
    { src: 'slide-images', dest: 'slides' },
    { src: 'slide-images-light', dest: 'slides-light' },
    { src: 'slide-images-dark', dest: 'slides-dark' }
  ];

  for (const dir of imageDirs) {
    const srcDir = path.join(slidesDir, dir.src);
    const destDir = path.join(distDir, dir.dest);
    
    if (fs.existsSync(srcDir)) {
      // Remove destination if exists
      if (fs.existsSync(destDir)) {
        fs.rmSync(destDir, { recursive: true, force: true });
      }
      
      // Copy entire directory
      fs.mkdirSync(destDir, { recursive: true });
      fs.readdirSync(srcDir).forEach(file => {
        fs.copyFileSync(
          path.join(srcDir, file),
          path.join(destDir, file)
        );
      });
      
      const count = fs.readdirSync(destDir).length;
      console.log(`✅ ${dir.dest}/ (${count} files)`);
    }
  }

  // Copy combined images to root
  const combinedImages = [
    { src: 'slide-images/slides-combined.png', dest: 'slides-combined.png' },
    { src: 'slide-images-light/slides-combined-light.png', dest: 'slides-combined-light.png' },
    { src: 'slide-images-dark/slides-combined-dark.png', dest: 'slides-combined-dark.png' }
  ];

  for (const img of combinedImages) {
    const src = path.join(slidesDir, img.src);
    const dest = path.join(distDir, img.dest);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      const sizeMB = (fs.statSync(dest).size / 1024 / 1024).toFixed(2);
      console.log(`✅ ${img.dest} (${sizeMB} MB)`);
    }
  }

  console.log('');

  // Create summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ DISTRIBUTION BUILD COMPLETE');
  console.log('═══════════════════════════════════════════════════════════\n');

  // List contents
  console.log('📦 Distribution contents:\n');
  const files = fs.readdirSync(distDir);
  let totalSize = 0;

  files.forEach(file => {
    const filePath = path.join(distDir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      const count = fs.readdirSync(filePath).length;
      console.log(`   📁 ${file}/ (${count} files)`);
    } else {
      const sizeKB = (stat.size / 1024).toFixed(0);
      totalSize += stat.size;
      console.log(`   📄 ${file} (${sizeKB} KB)`);
    }
  });

  console.log(`\n   Total size: ${(totalSize / 1024 / 1024).toFixed(1)} MB`);

  console.log(`\n📂 Output: ${distDir}`);
  console.log('\n✨ Ready for distribution!\n');

} catch (error) {
  console.error('❌ Copy to dist failed:');
  console.error(error.message);
  process.exit(1);
}

