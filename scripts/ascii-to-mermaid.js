#!/usr/bin/env node

/**
 * Convert ASCII diagrams to Mermaid diagrams
 * This is a helper tool to suggest Mermaid conversions for ASCII diagrams
 */

const fs = require('fs');
const path = require('path');

const PRESENTATION_FILE = path.join(__dirname, '../slides/presentation.md');

// Pattern recognition for common ASCII diagram types
const patterns = {
  flowchart: {
    test: (ascii) => /[─│┌┐└┘├┤┬┴┼→↓]/.test(ascii) && /\[.*\]/.test(ascii),
    converter: convertToFlowchart
  },
  sequence: {
    test: (ascii) => /→|-->/.test(ascii) && !/[┌┐└┘├┤┬┴┼]/.test(ascii),
    converter: convertToSequence
  },
  stateTransition: {
    test: (ascii) => /→/.test(ascii) && /\(.*\)/.test(ascii),
    converter: convertToStateDiagram
  }
};

function convertToFlowchart(ascii) {
  const lines = ascii.split('\n').map(l => l.trim()).filter(l => l);
  
  // Extract nodes (text in boxes or standalone)
  const nodes = [];
  const edges = [];
  
  lines.forEach(line => {
    // Match patterns like: Input → Process → Output
    const arrowPattern = /(\w+[\w\s]*)\s*[→├┤┬┴┼]\s*(\w+[\w\s]*)/g;
    let match;
    
    while ((match = arrowPattern.exec(line)) !== null) {
      const from = match[1].trim();
      const to = match[2].trim();
      
      if (!nodes.find(n => n.id === from)) {
        nodes.push({ id: from, label: from });
      }
      if (!nodes.find(n => n.id === to)) {
        nodes.push({ id: to, label: to });
      }
      
      edges.push({ from, to });
    }
  });
  
  if (nodes.length === 0) {
    return null;
  }
  
  let mermaid = 'graph TD\n';
  nodes.forEach(node => {
    const id = node.id.replace(/\s+/g, '_');
    mermaid += `    ${id}[${node.label}]\n`;
  });
  edges.forEach(edge => {
    const fromId = edge.from.replace(/\s+/g, '_');
    const toId = edge.to.replace(/\s+/g, '_');
    mermaid += `    ${fromId} --> ${toId}\n`;
  });
  
  return mermaid;
}

function convertToSequence(ascii) {
  // Simple sequence diagram converter
  const lines = ascii.split('\n');
  let mermaid = 'sequenceDiagram\n';
  
  lines.forEach(line => {
    if (/(\w+)\s*→\s*(\w+):?\s*(.*)/.test(line)) {
      const match = line.match(/(\w+)\s*→\s*(\w+):?\s*(.*)/);
      const from = match[1];
      const to = match[2];
      const message = match[3] || '';
      mermaid += `    ${from}->>${to}: ${message}\n`;
    }
  });
  
  return mermaid;
}

function convertToStateDiagram(ascii) {
  return null; // Implement if needed
}

function extractAsciiDiagrams(content) {
  const diagrams = [];
  const codeBlockRegex = /```\n([\s\S]*?)```/g;
  let match;
  
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const block = match[1];
    // Check if it's an ASCII diagram
    if (/[─│┌┐└┘├┤┬┴┼→↓]/.test(block)) {
      diagrams.push({
        original: match[0],
        ascii: block,
        startIndex: match.index
      });
    }
  }
  
  return diagrams;
}

function analyzeDiagram(ascii) {
  for (const [type, { test, converter }] of Object.entries(patterns)) {
    if (test(ascii)) {
      const mermaid = converter(ascii);
      if (mermaid) {
        return { type, mermaid };
      }
    }
  }
  return null;
}

// Main execution
console.log('🔍 Analyzing ASCII diagrams in presentation...\n');

const content = fs.readFileSync(PRESENTATION_FILE, 'utf-8');
const diagrams = extractAsciiDiagrams(content);

console.log(`Found ${diagrams.length} ASCII diagram(s)\n`);

diagrams.forEach((diagram, index) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Diagram ${index + 1}:`);
  console.log(`${'='.repeat(60)}`);
  console.log('\n📄 Original ASCII:\n');
  console.log(diagram.ascii);
  
  const analysis = analyzeDiagram(diagram.ascii);
  
  if (analysis) {
    console.log(`\n✨ Detected type: ${analysis.type}`);
    console.log('\n🔄 Suggested Mermaid conversion:\n');
    console.log('```mermaid');
    console.log(analysis.mermaid);
    console.log('```');
  } else {
    console.log('\n⚠️  Could not auto-convert. Manual conversion recommended.');
    console.log('\n💡 Suggestions:');
    console.log('   - For flowcharts: Use graph TD/LR');
    console.log('   - For sequences: Use sequenceDiagram');
    console.log('   - For states: Use stateDiagram-v2');
    console.log('   - For simple flows: Use graph with --> arrows');
  }
});

console.log(`\n${'='.repeat(60)}\n`);
console.log('📚 Mermaid Documentation: https://mermaid.js.org/');
console.log('🔧 To apply changes, edit slides/presentation.md manually');

