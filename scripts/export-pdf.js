#!/usr/bin/env node

/**
 * Export presentation to PDF
 * Uses in-memory preprocessing for theme-aware Mermaid diagrams
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const slidesDir = path.join(__dirname, '../slides');
const presentationFile = path.join(slidesDir, 'presentation.md');
const pdfFile = path.join(slidesDir, 'presentation.pdf');

(async () => {
  console.log('📄 Exporting presentation to PDF...\n');

  // Step 1: Preprocess markdown (in memory)
  console.log('🔄 Preprocessing markdown...');
  const { preprocessMarkdown } = require('./preprocess-for-pdf.js');
  
  let preprocessedContent;
  try {
    // Use default theme (rose-pine-dawn) for PDF export
    preprocessedContent = await preprocessMarkdown(presentationFile, 'rose-pine-dawn');
    console.log('✅ Preprocessing complete\n');
  } catch (error) {
    console.error('❌ Preprocessing failed:');
    console.error(error.message);
    process.exit(1);
  }

  // Step 2: Create temp directory for Marp export
  const tempDir = path.join(__dirname, '../.tmp/marp-export-pdf');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const tempFile = path.join(tempDir, 'presentation.md');
  fs.writeFileSync(tempFile, preprocessedContent, 'utf8');

  // Step 3: Copy images directory
  const tempImagesDir = path.join(tempDir, 'images');
  if (fs.existsSync(tempImagesDir)) {
    fs.rmSync(tempImagesDir, { recursive: true, force: true });
  }

  // Copy mermaid images
  const sourceMermaidDir = path.join(slidesDir, 'images/mermaid/rose-pine-dawn');
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

  // Copy theme files
  const sourceThemesDir = path.join(__dirname, '../themes');
  ['rose-pine-dawn.css', 'rose-pine-moon.css'].forEach(themeFile => {
    const sourceTheme = path.join(sourceThemesDir, themeFile);
    if (fs.existsSync(sourceTheme)) {
      fs.copyFileSync(sourceTheme, path.join(tempDir, themeFile));
    }
  });

  // Update paths in preprocessed content to remove theme subdirectory
  let finalContent = fs.readFileSync(tempFile, 'utf8');
  finalContent = finalContent.replace(
    /images\/mermaid\/rose-pine-dawn\//g,
    'images/mermaid/'
  );
  fs.writeFileSync(tempFile, finalContent, 'utf8');

  // Step 4: Export to PDF
  console.log('📄 Exporting to PDF...');
  try {
    const themeFilePath = path.join(tempDir, 'rose-pine-dawn.css');
    const command = `npx @marp-team/marp-cli --pdf --html --allow-local-files --theme ${themeFilePath} presentation.md -o "${pdfFile}"`;
    execSync(command, { stdio: 'inherit', cwd: tempDir });
    console.log(`\n✅ PDF exported: ${pdfFile}`);
    
    const stats = fs.statSync(pdfFile);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`   Size: ${sizeMB} MB`);
  } catch (error) {
    console.error('❌ PDF export failed:');
    console.error(error.message);
    process.exit(1);
  } finally {
    // Cleanup temp files
    try {
      fs.unlinkSync(tempFile);
      fs.rmSync(tempImagesDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore cleanup errors
    }
  }
})();

