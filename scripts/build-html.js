#!/usr/bin/env node

/**
 * Build HTML presentation from preprocessed markdown
 * Handles Marp CLI export with proper error handling
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const slidesDir = path.join(__dirname, '../slides');
const preprocessedFile = path.join(slidesDir, 'presentation.preprocessed.md');
const outputFile = path.join(slidesDir, 'presentation.html');

try {
  console.log('📄 Building HTML presentation...\n');
  
  // Check if preprocessed file exists
  if (!fs.existsSync(preprocessedFile)) {
    console.error(`❌ Error: Preprocessed file not found: ${preprocessedFile}`);
    console.error('Please run npm run build first');
    process.exit(1);
  }
  
  // Use Marp CLI to convert markdown to HTML
  // Specify full output file path to avoid directory interpretation
  // Skip config file that forces directory input mode
  const cmd = `npx @marp-team/marp-cli --no-stdin --no-config-file --html --allow-local-files "${preprocessedFile}" -o "${outputFile}"`;
  
  console.log(`Running: marp-cli --html presentation.preprocessed.md -o slides/presentation.html\n`);
  
  execSync(cmd, {
    stdio: 'inherit'
  });
  
  console.log('\n✅ HTML presentation generated successfully');
  console.log(`📄 Output: ${outputFile}`);
  
} catch (error) {
  console.error('\n❌ HTML build failed');
  process.exit(1);
}
