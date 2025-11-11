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

const IMAGES_DIR = path.join(__dirname, '../slides/images/mermaid');
const QR_DIR = path.join(__dirname, '../slides/images/qr');
const TEMP_DIR = path.join(__dirname, '../.tmp/mermaid');

// Ensure directories exist
[IMAGES_DIR, QR_DIR, TEMP_DIR].forEach(dir => {
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

function generateMermaid(code) {
  const hash = crypto.createHash('md5').update(code).digest('hex').substring(0, 8);
  const filename = `mermaid-${hash}`;
  const svgPath = path.join(IMAGES_DIR, `${filename}.svg`);
  const pngPath = path.join(IMAGES_DIR, `${filename}.png`);
  
  if (!fs.existsSync(svgPath)) {
    try {
      const mmdFile = path.join(TEMP_DIR, `${filename}.mmd`);
      fs.writeFileSync(mmdFile, code);
      
      console.log(`Generating Mermaid diagram: ${filename}...`);
      
      execSync(`npx -y mmdc -i "${mmdFile}" -o "${svgPath}" -t default -b transparent -w 1920 -H 1080 -s 2 -q`, {
        stdio: 'pipe'
      });
      
      execSync(`npx -y mmdc -i "${mmdFile}" -o "${pngPath}" -t default -b transparent -w 1920 -H 1080 -s 2 -q`, {
        stdio: 'pipe'
      });
      
      console.log(`✅ Generated ${filename}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${filename}:`, error.message);
      return null;
    }
  }
  
  // Use relative path from markdown file location
  // Marp CLI v4+ can resolve these correctly
  return `images/mermaid/${filename}.png`;
}

async function preprocessMarkdown(inputPath) {
  let content = fs.readFileSync(inputPath, 'utf8');
  
  // Replace Mermaid code blocks
  const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
  const mermaidMatches = [...content.matchAll(mermaidRegex)];
  
  for (const match of mermaidMatches) {
    const code = match[1].trim();
    const imagePath = generateMermaid(code);
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
  const outputFile = process.argv[3] || path.join(__dirname, '../slides/presentation.preprocessed.md');

  preprocessMarkdown(inputFile).then(content => {
    fs.writeFileSync(outputFile, content, 'utf8');
    console.log(`✅ Preprocessed markdown saved to: ${outputFile}`);
  }).catch(error => {
    console.error('❌ Preprocessing failed:', error.message);
    process.exit(1);
  });
}

