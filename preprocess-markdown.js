// Preprocess markdown to convert QR codes and Mermaid diagrams to image references
// This creates a "processed" version before the engine runs
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const INPUT_FILE = path.join(__dirname, 'slides/presentation.md');
const OUTPUT_FILE = path.join(__dirname, 'slides/presentation.processed.md');
const IMAGES_DIR = path.join(__dirname, 'slides/images/mermaid');
const QR_DIR = path.join(__dirname, 'slides/images/qr');
const TEMP_DIR = path.join(__dirname, '.tmp/mermaid');

// Ensure directories exist
[IMAGES_DIR, QR_DIR, TEMP_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function processMarkdown(content) {
  let processed = content;
  
  // Process QR codes: ![QR](qr:url) or ![QR Code](qr:url) -> <img src="/images/qr/qr-{hash}.svg">
  processed = processed.replace(/!\[QR[^\]]*\]\(qr:([^)]+)\)/g, (match, url) => {
    const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
    const filename = `qr-${hash}.svg`;
    const qrPath = path.join(QR_DIR, filename);
    const pngFilename = `qr-${hash}.png`;
    const pngPath = path.join(QR_DIR, pngFilename);
    
    // Generate SVG QR code if it doesn't exist (better quality, scalable)
    if (!fs.existsSync(qrPath)) {
      try {
        const tempScript = path.join(TEMP_DIR, `qr-${hash}.js`);
        const scriptContent = `
const QRCode = require('qrcode');
const fs = require('fs');

(async () => {
  try {
    // Generate SVG for web (better quality, scalable)
    const svgString = await QRCode.toString(${JSON.stringify(url)}, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    fs.writeFileSync('${qrPath.replace(/\\/g, '\\\\')}', svgString);
    
    // Also generate PNG for PPTX export (fallback)
    await QRCode.toFile('${pngPath.replace(/\\/g, '\\\\')}', ${JSON.stringify(url)}, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
})();
`;
        fs.writeFileSync(tempScript, scriptContent);
        execSync(`node "${tempScript}"`, {
          stdio: 'pipe',
          cwd: __dirname,
          timeout: 10000
        });
        try {
          fs.unlinkSync(tempScript);
        } catch (e) {
          // Ignore cleanup errors
        }
        console.log(`✅ Generated QR code: ${filename}`);
      } catch (error) {
        console.error(`❌ Failed to generate QR code for ${url}:`, error.message);
        return `<!-- QR Code generation failed for ${url} -->`;
      }
    }
    
    return `<img src="/images/qr/${filename}" alt="QR Code">`;
  });
  
  // Process Mermaid diagrams: ```mermaid ... ``` -> <img src="/images/mermaid/mermaid-{hash}.svg">
  processed = processed.replace(/```mermaid\n([\s\S]*?)```/g, (match, code) => {
    const hash = crypto.createHash('md5').update(code.trim()).digest('hex').substring(0, 8);
    const filename = `mermaid-${hash}`;
    const svgPath = path.join(IMAGES_DIR, `${filename}.svg`);
    const pngPath = path.join(IMAGES_DIR, `${filename}.png`);
    
    // Generate SVG if it doesn't exist (better quality, scalable)
    if (!fs.existsSync(svgPath)) {
      try {
        const mmdFile = path.join(TEMP_DIR, `${filename}.mmd`);
        fs.writeFileSync(mmdFile, code.trim());
        
        console.log(`Generating Mermaid diagram: ${filename}...`);
        
        // Generate SVG for web (better quality)
        // Use larger dimensions (1920x1080) and scale factor (2) for better text rendering
        execSync(`npx -y mmdc -i "${mmdFile}" -o "${svgPath}" -t default -b transparent -w 1920 -H 1080 -s 2 -q`, {
          stdio: 'pipe'
        });
        
        // Also generate PNG for PPTX export (fallback) with same dimensions
        execSync(`npx -y mmdc -i "${mmdFile}" -o "${pngPath}" -t default -b transparent -w 1920 -H 1080 -s 2 -q`, {
          stdio: 'pipe'
        });
        
        console.log(`✅ Generated ${filename}`);
      } catch (error) {
        console.error(`❌ Failed to generate ${filename}:`, error.message);
        return `<!-- Mermaid rendering error: ${error.message} -->\n\`\`\`mermaid\n${code}\`\`\``;
      }
    }
    
    return `<img src="/images/mermaid/${filename}.svg" alt="Mermaid diagram" style="max-width: 100%; height: auto; background: transparent;">`;
  });
  
  return processed;
}

// Read original markdown
const originalContent = fs.readFileSync(INPUT_FILE, 'utf8');

// Process it
console.log('Processing markdown...');
const processedContent = processMarkdown(originalContent);

// Write processed version
fs.writeFileSync(OUTPUT_FILE, processedContent, 'utf8');
console.log(`✅ Processed markdown saved to: ${OUTPUT_FILE}`);

