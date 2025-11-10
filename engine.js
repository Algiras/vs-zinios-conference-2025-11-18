// Marp engine with Mermaid support and QR code generation
const { Marp } = require('@marp-team/marp-core');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');
const QRCode = require('qrcode');

// Directories
const IMAGES_DIR = path.join(__dirname, 'slides/images/mermaid');
const QR_DIR = path.join(__dirname, 'slides/images/qr');
const TEMP_DIR = path.join(__dirname, '.tmp/mermaid');

// Ensure directories exist
[IMAGES_DIR, QR_DIR, TEMP_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

module.exports = (opts) => {
  const marp = new Marp(opts);
  
  // Enable HTML
  marp.markdown.set({ html: true });
  
  // Function to generate QR code
  const generateQRCode = async (url) => {
    const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
    const filename = `qr-${hash}.png`;
    const qrPath = path.join(QR_DIR, filename);
    const relativePath = `images/qr/${filename}`;
    
    // Generate QR code if it doesn't exist
    if (!fs.existsSync(qrPath)) {
      try {
        await QRCode.toFile(qrPath, url, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          quality: 0.95,
          margin: 1,
          width: 300
        });
        console.log(`✅ Generated QR code for: ${url}`);
      } catch (error) {
        console.error(`❌ Failed to generate QR code for ${url}:`, error.message);
        return null;
      }
    }
    
    return relativePath;
  };
  
  // Add custom renderer for Mermaid blocks
  const defaultFence = marp.markdown.renderer.rules.fence;
  
  marp.markdown.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    
    // Check if this is a mermaid code block
    if (token.info === 'mermaid') {
      const code = token.content;
      
      // Generate hash for caching
      const hash = crypto.createHash('md5').update(code).digest('hex').substring(0, 8);
      const filename = `mermaid-${hash}`;
      const svgPath = path.join(IMAGES_DIR, `${filename}.svg`);
      const pngPath = path.join(IMAGES_DIR, `${filename}.png`);
      const relativePath = `images/mermaid/${filename}.svg`;
      
      // Generate SVG if it doesn't exist
      if (!fs.existsSync(svgPath)) {
        try {
          const mmdFile = path.join(TEMP_DIR, `${filename}.mmd`);
          fs.writeFileSync(mmdFile, code);
          
          console.log(`Generating Mermaid diagram: ${filename}...`);
          
          // Generate SVG for web (better quality, scalable)
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
          // Fallback to rendering error message
          return `<div class="mermaid-error">
            <p><strong>Mermaid rendering error</strong></p>
            <pre>${code}</pre>
          </div>`;
        }
      }
      
      // Return SVG image tag for Marp (better quality)
      return `<div class="mermaid-diagram">
        <img src="${relativePath}" alt="Mermaid diagram" style="max-width: 100%; height: auto; background: transparent;">
      </div>`;
    }
    
    // Fall back to default fence rendering
    return defaultFence(tokens, idx, options, env, self);
  };
  
  // Add custom renderer for QR codes: ![QR](qr:url)
  const defaultImage = marp.markdown.renderer.rules.image;
  
  marp.markdown.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const url = token.attrGet('src');
    
    // Check if this is a QR code request (special marker: qr: prefix)
    if (url && url.startsWith('qr:')) {
      const actualUrl = url.substring(3);
      const hash = crypto.createHash('md5').update(actualUrl).digest('hex').substring(0, 8);
      const filename = `qr-${hash}.svg`;
      const qrPath = path.join(QR_DIR, filename);
      const pngFilename = `qr-${hash}.png`;
      const pngPath = path.join(QR_DIR, pngFilename);
      // Use absolute path from server root for proper resolution
      const relativePath = `/images/qr/${filename}`;
      
      // Generate SVG QR code if it doesn't exist (better quality, scalable)
      if (!fs.existsSync(qrPath)) {
        try {
          // Generate QR code synchronously using a temporary script file
          const tempScript = path.join(TEMP_DIR, `qr-${hash}.js`);
          const scriptContent = `
const QRCode = require('qrcode');
const fs = require('fs');

(async () => {
  try {
    // Generate SVG for web (better quality, scalable)
    const svgString = await QRCode.toString(${JSON.stringify(actualUrl)}, {
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
    await QRCode.toFile('${pngPath.replace(/\\/g, '\\\\')}', ${JSON.stringify(actualUrl)}, {
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
          
          // Clean up temp script
          try {
            fs.unlinkSync(tempScript);
          } catch (e) {
            // Ignore cleanup errors
          }
          
          console.log(`✅ Generated QR code: ${filename}`);
        } catch (error) {
          console.error(`❌ Failed to generate QR code for ${actualUrl}:`, error.message);
          return `<div style="color: red; padding: 10px; border: 1px solid red;">QR Code generation failed: ${error.message}</div>`;
        }
      }
      
      return `<img src="${relativePath}" alt="QR Code" style="max-width: 200px; height: auto;">`;
    }
    
    // Fall back to default image rendering
    return defaultImage(tokens, idx, options, env, self);
  };
  
  return marp;
};

