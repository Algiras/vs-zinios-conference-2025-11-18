#!/usr/bin/env node

/**
 * Build HTML presentations from preprocessed markdown (light + dark themes)
 * Uses single preprocessed file with different themes
 * Handles Marp CLI export with proper error handling
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const slidesDir = path.join(__dirname, '../slides');
const themesDir = path.join(__dirname, '../themes');
const preprocessed = path.join(slidesDir, 'presentation.preprocessed.md');

const builds = [
  {
    output: path.join(slidesDir, 'presentation.html'),
    theme: path.join(themesDir, 'rose-pine-dawn.css'),
    label: 'light (default)'
  },
  {
    output: path.join(slidesDir, 'presentation-dark.html'),
    theme: path.join(themesDir, 'rose-pine-moon.css'),
    label: 'dark'
  }
];

try {
  console.log('📄 Building HTML presentations...\n');
  
  // Check if preprocessed file exists
  if (!fs.existsSync(preprocessed)) {
    console.error(`❌ Error: Preprocessed file not found: ${preprocessed}`);
    console.error('Please run preprocessing first');
    process.exit(1);
  }
  
  for (const build of builds) {
    console.log(`🎨 Building ${build.label} theme...`);
  
    // Use Marp CLI to convert markdown to HTML
    // Specify full output file path to avoid directory interpretation
    // Skip config file that forces directory input mode
    const cmd = `npx @marp-team/marp-cli --no-stdin --no-config-file --html --allow-local-files --theme "${build.theme}" "${preprocessed}" -o "${build.output}"`;
  
    execSync(cmd, {
      stdio: 'inherit'
    });
  
    console.log(`✅ ${build.label} theme: ${build.output}\n`);
  }
  
  console.log('✅ All HTML presentations generated successfully');
  
} catch (error) {
  console.error('\n❌ HTML build failed');
  process.exit(1);
}
