#!/usr/bin/env node

/**
 * Export presentation in both light and dark themes
 * Generates combined images for both themes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const slidesDir = path.join(__dirname, '../slides');
const presentationFile = 'presentation.md';
const presentationPath = path.join(slidesDir, presentationFile);

// Themes
const themes = {
  light: {
    name: 'rose-pine-dawn',
    outputDir: path.join(slidesDir, 'slide-images-light'),
    combinedImage: 'slides-combined-light.png'
  },
  dark: {
    name: 'rose-pine-moon',
    outputDir: path.join(slidesDir, 'slide-images-dark'),
    combinedImage: 'slides-combined-dark.png'
  }
};

// Read the original presentation
let originalContent = fs.readFileSync(presentationPath, 'utf8');

// Function to replace theme in content
function replaceTheme(content, themeName) {
  // Replace theme: rose-pine-dawn or theme: rose-pine-moon
  return content.replace(
    /theme:\s*(rose-pine-dawn|rose-pine-moon)/,
    `theme: ${themeName}`
  );
}

// Function to export slides for a theme
async function exportTheme(themeKey) {
  const theme = themes[themeKey];
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎨 Exporting ${themeKey.toUpperCase()} theme (${theme.name})`);
  console.log(`${'='.repeat(60)}\n`);

  // Ensure output directory exists
  if (!fs.existsSync(theme.outputDir)) {
    fs.mkdirSync(theme.outputDir, { recursive: true });
  }

  // Create temporary presentation with theme
  const tempPresentationPath = path.join(slidesDir, `presentation-${themeKey}.md`);
  const themedContent = replaceTheme(originalContent, theme.name);
  fs.writeFileSync(tempPresentationPath, themedContent, 'utf8');

  // Verify theme replacement
  const verifyContent = fs.readFileSync(tempPresentationPath, 'utf8');
  if (!verifyContent.includes(`theme: ${theme.name}`)) {
    console.error(`❌ Theme replacement failed! Expected: theme: ${theme.name}`);
    throw new Error('Theme replacement verification failed');
  }

  try {
    // Use the existing slides-to-image.js logic but with custom paths
    const { preprocessMarkdown } = require('./preprocess-for-pdf.js');
    
    console.log('🔄 Preprocessing markdown (generating theme-aware Mermaid diagrams)...');
    // Preprocess the themed content with theme name for Mermaid diagram generation
    let preprocessedContent = await preprocessMarkdown(tempPresentationPath, theme.name);
    
    // Verify theme is still in preprocessed content
    if (!preprocessedContent.includes(`theme: ${theme.name}`)) {
      console.error(`❌ Theme lost during preprocessing! Expected: theme: ${theme.name}`);
      throw new Error('Theme lost during preprocessing');
    }
    
    // Update paths in preprocessed content to remove theme subdirectory BEFORE writing temp file
    // Replace: images/mermaid/rose-pine-dawn/mermaid-xxx.png -> images/mermaid/mermaid-xxx.png
    preprocessedContent = preprocessedContent.replace(
      new RegExp(`images/mermaid/${theme.name}/`, 'g'),
      'images/mermaid/'
    );
    
    console.log('✅ Preprocessing complete\n');

    // Create temp directory for Marp export
    const tempDir = path.join(__dirname, '../.tmp/marp-export-' + themeKey);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempFile = path.join(tempDir, 'presentation.md');
    fs.writeFileSync(tempFile, preprocessedContent, 'utf8');

    // Copy images directory
    const tempImagesDir = path.join(tempDir, 'images');
    if (fs.existsSync(tempImagesDir)) {
      fs.rmSync(tempImagesDir, { recursive: true, force: true });
    }

    // Copy theme-specific mermaid images
    const sourceMermaidDir = path.join(slidesDir, 'images/mermaid', theme.name);
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
      console.log(`   ✓ Copied theme-specific Mermaid diagrams (${theme.name})`);
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

    // Copy theme files - Marp looks for themes relative to the markdown file
    // Create a themes subdirectory in temp directory (Marp convention)
    const tempThemesDir = path.join(tempDir, 'themes');
    if (!fs.existsSync(tempThemesDir)) {
      fs.mkdirSync(tempThemesDir, { recursive: true });
    }
    
    const sourceThemesDir = path.join(__dirname, '../themes');
    ['rose-pine-dawn.css', 'rose-pine-moon.css'].forEach(themeFile => {
      const sourceTheme = path.join(sourceThemesDir, themeFile);
      if (fs.existsSync(sourceTheme)) {
        // Copy to temp themes directory
        fs.copyFileSync(sourceTheme, path.join(tempThemesDir, themeFile));
        console.log(`   ✓ Copied theme: ${themeFile}`);
      }
    });
    
    // Also copy to temp root (Marp might look in both places)
    ['rose-pine-dawn.css', 'rose-pine-moon.css'].forEach(themeFile => {
      const sourceTheme = path.join(sourceThemesDir, themeFile);
      if (fs.existsSync(sourceTheme)) {
        fs.copyFileSync(sourceTheme, path.join(tempDir, themeFile));
      }
    });
    
    // Also verify the theme in the preprocessed content one more time
    const finalCheck = fs.readFileSync(tempFile, 'utf8');
    if (!finalCheck.includes(`theme: ${theme.name}`)) {
      console.error(`❌ Theme missing in final temp file! Expected: theme: ${theme.name}`);
      console.error(`   Found: ${finalCheck.match(/theme:\s*[\w-]+/)?.[0] || 'none'}`);
      throw new Error('Theme verification failed in final temp file');
    }
    console.log(`   ✓ Verified theme in temp file: ${theme.name}\n`);

    // Export to PDF
    console.log('📄 Exporting to PDF...');
    const pdfFile = path.join(theme.outputDir, 'slides-temp.pdf');
    // Use --theme with the full path to ensure Marp finds it
    // Marp CLI looks for themes in: current dir, themes/ subdir, or via --theme-set
    // Using the theme file path directly is most reliable
    const themeFilePath = path.join(tempDir, `${theme.name}.css`);
    const command = `npx @marp-team/marp-cli --no-stdin --pdf --html --allow-local-files --theme ${themeFilePath} presentation.md -o "${pdfFile}"`;
    console.log(`   Using theme: ${theme.name} (from ${themeFilePath})`);
    execSync(command, { stdio: 'inherit', cwd: tempDir });
    console.log('✅ PDF exported\n');

    // Convert PDF to PNG images
    console.log('🖼️  Converting PDF to PNG images...');
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

    const outputPattern = path.join(theme.outputDir, 'slide-%d.png');
    execSync(
      `${magickCmd} -density 150 -quality 90 "${pdfFile}" "${outputPattern}"`,
      { stdio: 'inherit' }
    );
    console.log('✅ PDF converted to PNG images\n');

    // Get list of exported images
    const files = fs.readdirSync(theme.outputDir)
      .filter(f => f.match(/^slide-\d+\.(png|jpg|jpeg)$/i))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || 0);
        const numB = parseInt(b.match(/\d+/)?.[0] || 0);
        return numA - numB;
      });

    console.log(`📋 Found ${files.length} slide images\n`);

    // Stitch images together
    console.log('🔗 Stitching images together...');
    const imagePaths = files.map(f => path.join(theme.outputDir, f));
    const outputPath = path.join(theme.outputDir, theme.combinedImage);

    const totalSlides = imagePaths.length;
    const targetColumns = 4;
    const columns = Math.min(targetColumns, totalSlides);
    const rows = Math.ceil(totalSlides / columns);

    console.log(`   Arranging ${totalSlides} slides in ${columns} columns × ${rows} rows...`);

    const borderColor = '#888888';
    const borderWidth = 6;

    const rowImages = [];
    for (let row = 0; row < rows; row++) {
      const rowStart = row * columns;
      const rowEnd = Math.min(rowStart + columns, totalSlides);
      const rowPaths = imagePaths.slice(rowStart, rowEnd);

      if (rowPaths.length > 0) {
        const borderedPaths = [];
        for (const imgPath of rowPaths) {
          const borderedPath = imgPath.replace(/\.png$/, '-bordered.png');
          execSync(
            `${magickCmd} "${imgPath}" -bordercolor "${borderColor}" -border ${borderWidth} "${borderedPath}"`,
            { stdio: 'pipe' }
          );
          borderedPaths.push(borderedPath);
        }

        const rowImage = path.join(theme.outputDir, `row-${row}.png`);
        execSync(
          `${magickCmd} ${borderedPaths.map(p => `"${p}"`).join(' ')} +append "${rowImage}"`,
          { stdio: 'pipe' }
        );
        rowImages.push(rowImage);

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

    // Cleanup
    rowImages.forEach(rowImg => {
      try {
        fs.unlinkSync(rowImg);
      } catch (e) {
        // Ignore cleanup errors
      }
    });

    // Cleanup temp files
    try {
      fs.unlinkSync(tempPresentationPath);
      fs.unlinkSync(pdfFile);
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore cleanup errors
    }

    const stats = fs.statSync(outputPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`\n✅ ${themeKey.toUpperCase()} theme export complete!`);
    console.log(`   Combined image: ${outputPath}`);
    console.log(`   Size: ${sizeMB} MB`);
    console.log(`   Slides: ${files.length}`);

  } catch (error) {
    console.error(`❌ Failed to export ${themeKey} theme:`);
    console.error(error.message);
    // Cleanup temp file even on error
    try {
      fs.unlinkSync(tempPresentationPath);
    } catch (e) {
      // Ignore
    }
    throw error;
  }
}

// Main execution
(async () => {
  console.log('🎨 Exporting presentation in both themes...\n');

  try {
    // Export light theme
    await exportTheme('light');

    // Export dark theme
    await exportTheme('dark');

    console.log(`\n${'='.repeat(60)}`);
    console.log('✨ ALL EXPORTS COMPLETE!');
    console.log(`${'='.repeat(60)}\n`);
    console.log('📸 Light theme: slides/slide-images-light/slides-combined-light.png');
    console.log('📸 Dark theme:  slides/slide-images-dark/slides-combined-dark.png\n');

  } catch (error) {
    console.error('\n❌ Export failed:', error.message);
    process.exit(1);
  }
})();

