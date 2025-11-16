#!/usr/bin/env node

/**
 * Script to convert all slides to PNG images and stitch them together
 * 
 * Requirements:
 * - Marp CLI (already in your project)
 * - ImageMagick (for image stitching)
 * 
 * Usage:
 *   node scripts/slides-to-image.js [--stitch] [--output-dir ./slide-images]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const shouldStitch = args.includes('--stitch');
const outputDirIndex = args.indexOf('--output-dir');
const outputDir = outputDirIndex !== -1 ? args[outputDirIndex + 1] : './slides/slide-images';

const slidesDir = path.join(__dirname, '../slides');
const presentationFile = 'presentation.md'; // Relative to slidesDir

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Created output directory: ${outputDir}`);
}

console.log('🎬 Starting slide to image conversion...\n');

// Step 0: Preprocess markdown (generate Mermaid/QR images, keep in memory)
const { preprocessMarkdown } = require('./preprocess-for-pdf.js');

(async () => {
console.log('🔄 Preprocessing markdown (generating Mermaid diagrams and QR codes)...');
let preprocessedContent;
try {
  preprocessedContent = await preprocessMarkdown(path.join(slidesDir, presentationFile));
  console.log(`✅ Preprocessing complete\n`);
} catch (error) {
  console.error('❌ Preprocessing failed:');
  console.error(error.message);
  process.exit(1);
}

// Step 1: Export preprocessed slides to PDF
console.log('📄 Exporting slides to PDF...');
const pdfFile = path.join(slidesDir, 'slides-temp.pdf');

// Workaround: Write preprocessed content to temp directory and process from there
// This avoids Marp CLI path resolution issues
const tempDir = path.join(__dirname, '../.tmp/marp-export');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}
const tempFile = path.join(tempDir, 'presentation.md');
fs.writeFileSync(tempFile, preprocessedContent, 'utf8');

// Copy images directory to temp location so relative paths work
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
const tempThemesDir = tempDir;
['rose-pine-dawn.css', 'rose-pine-moon.css'].forEach(themeFile => {
  const sourceTheme = path.join(sourceThemesDir, themeFile);
  if (fs.existsSync(sourceTheme)) {
    fs.copyFileSync(sourceTheme, path.join(tempThemesDir, themeFile));
  }
});

try {
  // Process from temp directory - Marp CLI seems to work better this way
  // Explicitly enable HTML rendering for column layouts
  const command = `npx @marp-team/marp-cli --no-stdin --pdf --html --allow-local-files presentation.md -o "${pdfFile}"`;
  execSync(command, { stdio: 'inherit', cwd: tempDir });
  console.log(`✅ PDF exported\n`);
  
    // Cleanup temp files
    try {
      fs.unlinkSync(tempFile);
      fs.rmSync(tempImagesDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore cleanup errors
  }
} catch (error) {
  console.error('❌ PDF export failed:');
  console.error(error.message);
  process.exit(1);
}

// Step 2: Convert PDF to PNG images using ImageMagick
console.log('🖼️  Converting PDF to PNG images...');
try {
  // Check if magick (ImageMagick v7) or convert (ImageMagick v6) is installed
  let magickCmd = 'magick';
  try {
    execSync('which magick', { stdio: 'ignore' });
  } catch {
    try {
  execSync('which convert', { stdio: 'ignore' });
      magickCmd = 'convert';
    } catch {
      throw new Error('ImageMagick not found');
    }
  }
  
  const outputPattern = path.join(outputDir, 'slide-%d.png');
  execSync(
    `${magickCmd} -density 150 -quality 90 "${pdfFile}" "${outputPattern}"`,
    { stdio: 'inherit' }
  );
  console.log(`✅ PDF converted to PNG images\n`);
} catch (error) {
  console.error('❌ ImageMagick is required but not installed.');
  console.error('   Install with: brew install imagemagick (macOS)');
  console.error('   Or: sudo apt-get install imagemagick (Linux)');
  process.exit(1);
}

// Step 2: Get list of exported images
const files = fs.readdirSync(outputDir)
  .filter(f => f.match(/^slide-\d+\.(png|jpg|jpeg)$/i)) // Only slide-X.png files, exclude combined image
  .sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || 0);
    const numB = parseInt(b.match(/\d+/)?.[0] || 0);
    return numA - numB;
  });

console.log(`📋 Found ${files.length} slide images\n`);

if (files.length === 0) {
  console.error('❌ No images found in output directory');
  process.exit(1);
}

// Step 3: Stitch images together if requested
if (shouldStitch) {
  console.log('🔗 Stitching images together...');
  
  // Determine which command to use (magick for v7, convert for v6)
  let magickCmd = 'magick';
  try {
    execSync('which magick', { stdio: 'ignore' });
  } catch {
    try {
    execSync('which convert', { stdio: 'ignore' });
      magickCmd = 'convert';
  } catch {
    console.error('❌ ImageMagick is required for stitching but not installed.');
    console.error('   Install with: brew install imagemagick (macOS)');
    console.error('   Or: sudo apt-get install imagemagick (Linux)');
    process.exit(1);
    }
  }

  const imagePaths = files.map(f => path.join(outputDir, f));
  const outputPath = path.join(outputDir, 'slides-combined.png');

  try {
    // Calculate grid dimensions (aim for 3-4 columns for readability)
    const totalSlides = imagePaths.length;
    // Use 3-4 columns for better readability (not too wide, not too tall)
    const targetColumns = 4;
    const columns = Math.min(targetColumns, totalSlides); // Don't exceed total slides
    const rows = Math.ceil(totalSlides / columns);
    
    console.log(`   Arranging ${totalSlides} slides in ${columns} columns × ${rows} rows...`);
    
    // Create rows first (horizontal stacking), then stack rows vertically
    // Add borders to each slide image to clearly separate them
    const borderColor = '#888888'; // Medium gray border (more visible)
    const borderWidth = 6; // 6px border (more visible)
    
    const rowImages = [];
    for (let row = 0; row < rows; row++) {
      const rowStart = row * columns;
      const rowEnd = Math.min(rowStart + columns, totalSlides);
      const rowPaths = imagePaths.slice(rowStart, rowEnd);
      
      if (rowPaths.length > 0) {
        // Add borders to each slide image before stitching
        const borderedPaths = [];
        for (const imgPath of rowPaths) {
          const borderedPath = imgPath.replace(/\.png$/, '-bordered.png');
          // Add border: -bordercolor sets border color, -border adds border width
          execSync(
            `${magickCmd} "${imgPath}" -bordercolor "${borderColor}" -border ${borderWidth} "${borderedPath}"`,
            { stdio: 'pipe' }
          );
          borderedPaths.push(borderedPath);
        }
        
        const rowImage = path.join(outputDir, `row-${row}.png`);
        // Stack bordered images horizontally for this row
        execSync(
          `${magickCmd} ${borderedPaths.map(p => `"${p}"`).join(' ')} +append "${rowImage}"`,
          { stdio: 'pipe' }
        );
        rowImages.push(rowImage);
        
        // Cleanup bordered images
        borderedPaths.forEach(bp => {
          try {
            fs.unlinkSync(bp);
          } catch (e) {
            // Ignore cleanup errors
          }
        });
      }
    }
    
    // Stack all rows vertically
    execSync(
      `${magickCmd} ${rowImages.map(p => `"${p}"`).join(' ')} -append "${outputPath}"`,
      { stdio: 'inherit' }
    );
    
    // Cleanup temporary row images
    rowImages.forEach(rowImg => {
      try {
        fs.unlinkSync(rowImg);
      } catch (e) {
        // Ignore cleanup errors
      }
    });
    
    const stats = fs.statSync(outputPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`\n✅ Combined image created: ${outputPath}`);
    console.log(`   Size: ${sizeMB} MB`);
    
  } catch (error) {
    console.error('❌ Failed to stitch images:');
    console.error(error.message);
    process.exit(1);
  }
} else {
  console.log('💡 Individual slide images created.');
  console.log('   To stitch them together, run:');
  console.log(`   node scripts/slides-to-image.js --stitch --output-dir ${outputDir}\n`);
  console.log('   Or use ImageMagick directly:');
  console.log(`   convert ${outputDir}/slide-*.png +append ${outputDir}/slides-combined.png (horizontal)`);
  console.log(`   convert ${outputDir}/slide-*.png -append ${outputDir}/slides-combined.png (vertical)\n`);
}

// Cleanup temporary PDF file
try {
  fs.unlinkSync(pdfFile);
  console.log('🧹 Cleaned up temporary PDF file\n');
} catch (e) {
  // File may not exist, that's ok
}

console.log('📂 Image files:');
files.forEach((f, i) => {
  const filePath = path.join(outputDir, f);
  const stats = fs.statSync(filePath);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`   ${String(i + 1).padStart(3, '0')}. ${f} (${sizeMB} MB)`);
});

console.log('\n✨ Done!');

})();
