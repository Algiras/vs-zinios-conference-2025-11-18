#!/usr/bin/env node

/**
 * Extract Mermaid diagrams from presentation.md and generate images
 * Usage: node scripts/generate-mermaid-images.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PRESENTATION_FILE = path.join(__dirname, '../slides/presentation.md');
const OUTPUT_DIR = path.join(__dirname, '../slides/images/mermaid');
const TEMP_DIR = path.join(__dirname, '../.tmp/mermaid');

// Ensure directories exist
[OUTPUT_DIR, TEMP_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Read presentation file
const content = fs.readFileSync(PRESENTATION_FILE, 'utf-8');

// Extract Mermaid diagrams
const mermaidRegex = /<div class="mermaid">([\s\S]*?)<\/div>/g;
const diagrams = [];
let match;
let index = 1;

while ((match = mermaidRegex.exec(content)) !== null) {
  const diagram = match[1].trim();
  diagrams.push({
    index,
    content: diagram,
    filename: `diagram-${index.toString().padStart(2, '0')}`
  });
  index++;
}

console.log(`Found ${diagrams.length} Mermaid diagrams`);

// Generate images for each diagram
diagrams.forEach(({ index, content, filename }) => {
  const mmdFile = path.join(TEMP_DIR, `${filename}.mmd`);
  const pngFile = path.join(OUTPUT_DIR, `${filename}.png`);
  const svgFile = path.join(OUTPUT_DIR, `${filename}.svg`);
  
  // Write temporary .mmd file
  fs.writeFileSync(mmdFile, content);
  
  console.log(`\nGenerating ${filename}...`);
  
  try {
    // Generate PNG (for PPTX compatibility)
    execSync(`npx mmdc -i "${mmdFile}" -o "${pngFile}" -t default -b transparent`, {
      stdio: 'inherit'
    });
    
    // Generate SVG (for web/PDF)
    execSync(`npx mmdc -i "${mmdFile}" -o "${svgFile}" -t default -b transparent`, {
      stdio: 'inherit'
    });
    
    console.log(`✅ Generated ${filename}.png and ${filename}.svg`);
  } catch (error) {
    console.error(`❌ Failed to generate ${filename}:`, error.message);
  }
});

// Generate a mapping file for reference
const mapping = diagrams.map(({ index, filename, content }) => {
  const firstLine = content.split('\n')[0].trim();
  return {
    index,
    filename,
    type: firstLine,
    png: `slides/images/mermaid/${filename}.png`,
    svg: `slides/images/mermaid/${filename}.svg`
  };
});

const mappingFile = path.join(OUTPUT_DIR, 'diagram-mapping.json');
fs.writeFileSync(mappingFile, JSON.stringify(mapping, null, 2));

console.log(`\n✅ Generated ${diagrams.length} diagrams`);
console.log(`📄 Mapping saved to: ${mappingFile}`);
console.log(`\nTo use in presentation, replace <div class="mermaid"> blocks with:`);
console.log(`![Description](images/mermaid/diagram-XX.png)`);

