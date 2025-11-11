#!/usr/bin/env node

/**
 * Chart Generation Script
 * Generates Plotly charts as static images for embedding in Marp slides
 * 
 * This script uses Plotly's image export API (via kaleido) or puppeteer
 * to generate static PNG images from Plotly chart configurations.
 * 
 * For interactive charts in Marp, use HTML blocks with Plotly.js CDN directly.
 */

const fs = require('fs');
const path = require('path');

const chartsDir = path.join(__dirname, '..', 'slides', 'images', 'charts');

// Ensure charts directory exists
if (!fs.existsSync(chartsDir)) {
  fs.mkdirSync(chartsDir, { recursive: true });
}

/**
 * Generate a Plotly chart as PNG using puppeteer
 * This is a fallback method if kaleido is not available
 */
async function generateChartWithPuppeteer(chartConfig, outputPath, width = 1200, height = 800) {
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (e) {
    throw new Error('puppeteer not installed. Run: npm install --save-dev puppeteer');
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewport({ width, height });
  
  // Create HTML with Plotly
  const html = `
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
  <style>
    body { margin: 0; padding: 0; }
    #chart { width: ${width}px; height: ${height}px; }
  </style>
</head>
<body>
  <div id="chart"></div>
  <script>
    Plotly.newPlot('chart', ${JSON.stringify(chartConfig.data)}, ${JSON.stringify(chartConfig.layout || {})}, {staticPlot: true})
      .then(() => {
        window.chartReady = true;
      });
  </script>
</body>
</html>`;
  
  await page.setContent(html);
  await page.waitForFunction(() => window.chartReady === true, { timeout: 10000 });
  
  const element = await page.$('#chart');
  await element.screenshot({ path: outputPath, type: 'png' });
  
  await browser.close();
  console.log(`✅ Generated chart: ${path.basename(outputPath)}`);
}

/**
 * Example chart configurations
 */
const exampleCharts = {
  'agent-performance': {
    data: [{
      x: ['Reflex', 'Learning', 'FSM', 'BT', 'GOAP'],
      y: [85, 92, 78, 88, 75],
      type: 'bar',
      marker: { color: '#4a90e2' }
    }],
    layout: {
      title: { text: 'Agent Performance Comparison', font: { size: 18 } },
      xaxis: { title: 'Agent Type' },
      yaxis: { title: 'Score' },
      margin: { t: 60, b: 60, l: 60, r: 40 }
    }
  },
  'workflow-timeline': {
    data: [{
      labels: ['Planning', 'Execution', 'Review', 'Deploy'],
      values: [10, 45, 25, 20],
      type: 'pie',
      marker: { colors: ['#4a90e2', '#50c878', '#ffa500', '#ff6b6b'] }
    }],
    layout: {
      title: { text: 'Workflow Time Distribution', font: { size: 18 } },
      margin: { t: 60, b: 40, l: 40, r: 40 }
    }
  }
};

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📊 Plotly Chart Generator for Marp\n');
    console.log('Usage: node generate-charts.js <chart-name> [width] [height]');
    console.log('\nAvailable charts:');
    Object.keys(exampleCharts).forEach(name => {
      console.log(`  - ${name}`);
    });
    console.log('\nExample:');
    console.log('  node generate-charts.js agent-performance 1200 800');
    process.exit(0);
  }
  
  const chartName = args[0];
  const width = parseInt(args[1]) || 1200;
  const height = parseInt(args[2]) || 800;
  
  if (!exampleCharts[chartName]) {
    console.error(`❌ Chart "${chartName}" not found`);
    console.error(`Available: ${Object.keys(exampleCharts).join(', ')}`);
    process.exit(1);
  }
  
  const outputPath = path.join(chartsDir, `${chartName}.png`);
  generateChartWithPuppeteer(exampleCharts[chartName], outputPath, width, height)
    .catch(err => {
      console.error('❌ Error generating chart:', err.message);
      console.error('\n💡 Install puppeteer: npm install --save-dev puppeteer');
      process.exit(1);
    });
}

module.exports = { generateChartWithPuppeteer, exampleCharts };

