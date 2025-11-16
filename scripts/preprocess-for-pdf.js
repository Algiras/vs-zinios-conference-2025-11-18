#!/usr/bin/env node

/**
 * Preprocess markdown file to replace Mermaid diagrams and QR codes with images
 * This works around Marp CLI engine issues by preprocessing before PDF export
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');
const QRCode = require('qrcode');

const QR_DIR = path.join(__dirname, '../slides/images/qr');
const TEMP_DIR = path.join(__dirname, '../.tmp/mermaid');

// Theme color mappings
const THEME_COLORS = {
  'rose-pine-dawn': {
    primary: '#d7827e',    // --rose
    secondary: '#286983',   // --pine
    accent: '#56949f',      // --foam
    highlight: '#907aa9',   // --iris
    success: '#56949f',      // --foam (green-like)
    warning: '#ea9d34',      // --gold
    info: '#286983',         // --pine (blue-like)
    light: '#f2e9e1',        // --overlay
    lighter: '#fffaf3',      // --surface
    muted: '#dfdad9',        // --highlight-muted
  },
  'rose-pine-moon': {
    primary: '#ea9a97',      // --rose
    secondary: '#3e8fb0',    // --pine
    accent: '#9ccfd8',       // --foam
    highlight: '#c4a7e7',   // --iris
    success: '#9ccfd8',      // --foam (green-like)
    warning: '#f6c177',      // --gold
    info: '#3e8fb0',         // --pine (blue-like)
    light: '#393552',        // --overlay
    lighter: '#2a273f',      // --surface
    muted: '#44415a',        // --highlight-muted
  }
};

// Color mapping from hardcoded colors to theme colors
const COLOR_MAP = {
  '#e1f5ff': 'info',      // Light blue -> theme info color
  '#fff3e0': 'warning',   // Light orange -> theme warning color
  '#ffebee': 'primary',   // Light red -> theme primary color
  '#e3f2fd': 'info',      // Light blue -> theme info color
  '#c8e6c9': 'success',   // Light green -> theme success color
  '#f3e5f5': 'highlight', // Light purple -> theme highlight color
  '#90EE90': 'success',   // Light green -> theme success color
  '#87CEEB': 'info',      // Sky blue -> theme info color
  '#FFB6C1': 'primary',   // Light pink -> theme primary color
  '#FFD700': 'warning',   // Gold -> theme warning color
  '#FFA500': 'warning',   // Orange -> theme warning color
  '#DDA0DD': 'highlight', // Plum -> theme highlight color
  '#f0f0f0': 'light',      // Light gray -> theme light color
  '#fff9c4': 'warning',   // Light yellow -> theme warning color
};

// Ensure directories exist
[QR_DIR, TEMP_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function generateQRCode(url) {
  const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
  const filename = `qr-${hash}.png`;
  const qrPath = path.join(QR_DIR, filename);
  
  if (!fs.existsSync(qrPath)) {
    try {
      await QRCode.toFile(qrPath, url, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 1,
        width: 300
      });
      console.log(`✅ Generated QR code: ${filename}`);
    } catch (error) {
      console.error(`❌ Failed to generate QR code for ${url}:`, error.message);
      return null;
    }
  }
  
  // Use relative path from markdown file location
  return `images/qr/${filename}`;
}

function generateMermaid(code, themeName = 'rose-pine-dawn') {
  // Get theme colors
  const themeColors = THEME_COLORS[themeName] || THEME_COLORS['rose-pine-dawn'];
  
  // Replace hardcoded colors with theme colors
  let themedCode = code;
  for (const [hardcodedColor, colorKey] of Object.entries(COLOR_MAP)) {
    const themeColor = themeColors[colorKey];
    if (themeColor) {
      // Replace in style directives: style NODE fill:#COLOR
      // Handle both uppercase and lowercase hex colors
      const colorUpper = hardcodedColor.toUpperCase();
      const colorLower = hardcodedColor.toLowerCase();
      
      // Replace uppercase version
      const regexUpper = new RegExp(`fill:${colorUpper.replace('#', '\\#')}`, 'gi');
      themedCode = themedCode.replace(regexUpper, `fill:${themeColor}`);
      
      // Replace lowercase version
      const regexLower = new RegExp(`fill:${colorLower.replace('#', '\\#')}`, 'gi');
      themedCode = themedCode.replace(regexLower, `fill:${themeColor}`);
    }
  }
  
  // Create theme-specific directory
  const IMAGES_DIR = path.join(__dirname, '../slides/images/mermaid', themeName);
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }
  
  const hash = crypto.createHash('md5').update(code).digest('hex').substring(0, 8);
  const filename = `mermaid-${hash}`;
  const svgPath = path.join(IMAGES_DIR, `${filename}.svg`);
  const pngPath = path.join(IMAGES_DIR, `${filename}.png`);
  
  if (!fs.existsSync(svgPath)) {
    try {
      const mmdFile = path.join(TEMP_DIR, `${filename}-${themeName}.mmd`);
      fs.writeFileSync(mmdFile, themedCode);
      
      console.log(`   Generating Mermaid diagram: ${filename} (${themeName})...`);
      
      // Add --no-sandbox flag for CI environments (GitHub Actions, etc.)
      const sandboxFlag = process.env.CI ? ' --no-sandbox' : '';
      
      // Set Puppeteer config for CI
      const puppeteerConfig = process.env.PUPPETEER_EXECUTABLE_PATH 
        ? `PUPPETEER_EXECUTABLE_PATH="${process.env.PUPPETEER_EXECUTABLE_PATH}" `
        : '';
      
      execSync(`${puppeteerConfig}npx -y mmdc -i "${mmdFile}" -o "${svgPath}" -t default -b transparent -w 1920 -H 1080 -s 2 -q${sandboxFlag}`, {
        stdio: process.env.CI ? 'inherit' : 'pipe'
      });
      
      execSync(`${puppeteerConfig}npx -y mmdc -i "${mmdFile}" -o "${pngPath}" -t default -b transparent -w 1920 -H 1080 -s 2 -q${sandboxFlag}`, {
        stdio: process.env.CI ? 'inherit' : 'pipe'
      });
      
      console.log(`   ✅ Generated ${filename} (${themeName})`);
    } catch (error) {
      console.warn(`   ⚠️  Failed to generate ${filename} (${themeName}):`, error.message.split('\n')[0]);
      if (process.env.CI) {
        console.warn(`   Full error:`, error.message);
      }
      console.warn(`   📝 Will use inline SVG fallback instead`);
      // Return null to indicate fallback should be used (keep original mermaid block)
      return null;
    }
  }
  
  // Use relative path from markdown file location
  // Note: The theme subdirectory is only for organization - the export script will flatten it
  return `images/mermaid/${themeName}/${filename}.png`;
}

async function preprocessMarkdown(inputPath, themeName = 'rose-pine-dawn') {
  let content = fs.readFileSync(inputPath, 'utf8');
  
  // Replace Mermaid code blocks
  const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
  const mermaidMatches = [...content.matchAll(mermaidRegex)];
  
  for (const match of mermaidMatches) {
    const code = match[1].trim();
    const imagePath = generateMermaid(code, themeName);
    if (imagePath) {
      // Use pure Markdown image syntax - Marp handles this best for exports
      // Marp will embed these correctly in PDF/PPTX
      const replacement = `![Mermaid diagram](${imagePath})`;
      content = content.replace(match[0], replacement);
    }
  }
  
  // Replace QR codes: ![QR](qr:url) or ![QR Code](qr:url)
  const qrRegex = /!\[([^\]]*)\]\(qr:([^)]+)\)/g;
  const qrMatches = [...content.matchAll(qrRegex)];
  
  for (const match of qrMatches) {
    const altText = match[1];
    const url = match[2];
    const imagePath = await generateQRCode(url);
    if (imagePath) {
      const replacement = `![${altText}](${imagePath})`;
      content = content.replace(match[0], replacement);
    }
  }
  
  // Replace QR codes in img tags: <img src="qr:url">
  const qrImgRegex = /<img\s+src=["']qr:([^"']+)["'][^>]*>/g;
  const qrImgMatches = [...content.matchAll(qrImgRegex)];
  
  for (const match of qrImgMatches) {
    const url = match[1];
    const imagePath = await generateQRCode(url);
    if (imagePath) {
      // Use pure Markdown image syntax for QR codes too
      const replacement = `![QR Code](${imagePath})`;
      content = content.replace(match[0], replacement);
    }
  }
  
  // Return preprocessed content (don't write to disk)
  return content;
}

// Export function for use by other scripts
module.exports = { preprocessMarkdown, generateMermaid, generateQRCode };

// Main execution (CLI mode - for backward compatibility)
if (require.main === module) {
  const inputFile = process.argv[2] || path.join(__dirname, '../slides/presentation.md');
  const outputFile = path.join(__dirname, '../slides/presentation.preprocessed.md');
  
  // Generate single preprocessed version (theme applied during HTML build)
  preprocessMarkdown(inputFile).then(content => {
    fs.writeFileSync(outputFile, content, 'utf8');
    console.log(`✅ Preprocessed markdown saved to: ${outputFile}`);
  }).catch(error => {
    console.error(`❌ Preprocessing failed:`, error.message);
    process.exit(1);
  });
}

