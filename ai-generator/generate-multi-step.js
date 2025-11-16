#!/usr/bin/env node

/**
 * Multi-Step AI Presentation Generator
 * 
 * Explicitly orchestrates a multi-phase workflow:
 * 1. Research Phase: Gather information
 * 2. Structure Phase: Plan slide outline
 * 3. Content Phase: Generate each section
 * 4. Diagram Phase: Create Mermaid diagrams
 * 5. Assembly Phase: Combine into final presentation
 * 
 * Works with any Ollama model, no tool calling required.
 * 
 * Usage:
 *   node ai-generator/generate-multi-step.js "Your Topic"
 */

const fs = require('fs');
const path = require('path');
const { ChatOllama } = require('@langchain/ollama');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Configuration
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b';
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

// Get topic from command line
const topic = process.argv[2];
if (!topic) {
  console.error('❌ Error: Please provide a topic');
  console.error('Usage: node ai-generator/generate-multi-step.js "Your Topic"');
  process.exit(1);
}

console.log('🎨 Multi-Step Presentation Generator');
console.log('═'.repeat(60));
console.log(`📋 Topic: "${topic}"`);
console.log(`🤖 Model: ${OLLAMA_MODEL}`);
console.log('═'.repeat(60));
console.log('');

// Initialize Ollama
const llm = new ChatOllama({
  model: OLLAMA_MODEL,
  baseUrl: OLLAMA_BASE_URL,
  temperature: 0.7,
  numCtx: 8192,
});

// Helper: Call LLM
async function callLLM(systemPrompt, userPrompt) {
  const response = await llm.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt)
  ]);
  return response.content;
}

// Helper: Search web via Brave (if available)
async function searchWeb(query) {
  if (!process.env.BRAVE_API_KEY) {
    return { note: 'Brave API key not set, using model knowledge' };
  }
  
  try {
    // TODO: Call Brave Search API
    return { note: 'Web search would be called here', query };
  } catch (error) {
    return { error: error.message };
  }
}

// PHASE 1: Research & Planning
async function phase1Research() {
  console.log('\n' + '═'.repeat(60));
  console.log('PHASE 1: RESEARCH & PLANNING');
  console.log('═'.repeat(60));
  
  // Step 1.1: Read existing presentation style
  console.log('\n📖 Step 1.1: Reading existing presentation for style...');
  const presentationPath = path.join(__dirname, '../slides/presentation.md');
  const existingPresentation = fs.readFileSync(presentationPath, 'utf8');
  
  // Extract key patterns
  const frontMatterMatch = existingPresentation.match(/^---\n([\s\S]*?)\n---/);
  const frontMatter = frontMatterMatch ? frontMatterMatch[1] : '';
  
  const styleGuide = {
    frontMatter: frontMatter,
    hasLeadSlides: existingPresentation.includes('<!-- _class: lead -->'),
    hasTwoColumns: existingPresentation.includes('<div class="columns">'),
    hasMermaid: existingPresentation.includes('```mermaid'),
    hasSpeakerNotes: existingPresentation.includes('<!-- SPEAKER NOTES'),
  };
  
  console.log('   ✅ Style patterns extracted');
  
  // Step 1.2: Create presentation outline
  console.log('\n📋 Step 1.2: Creating presentation outline...');
  
  const outlinePrompt = `You are a presentation architect. Create a CONCISE outline for a technical presentation.

Topic: "${topic}"

CRITICAL RULES:
- 12-15 slides total (keep it SHORT)
- Clear sections (Introduction, Core Concepts, Implementation, Best Practices, Conclusion)
- Specific, concise slide titles
- Use diagrams SPARINGLY (max 3-4 total, only for architecture/flow/process)
- Most slides should be text-only with 3-4 bullets

Diagram Guidelines:
- Use diagrams ONLY for: architecture, workflows, data flows, system interactions
- DON'T use diagrams for: lists of features, best practices, comparisons

Format as JSON:
{
  "title": "Presentation Title",
  "subtitle": "Short Engaging Subtitle",
  "sections": [
    {
      "name": "Introduction",
      "slides": [
        {"title": "Hook Slide", "type": "hook", "hasDiagram": false},
        {"title": "Why This Matters", "type": "content", "hasDiagram": false}
      ]
    },
    {
      "name": "Core Concepts",
      "slides": [
        {"title": "What is X?", "type": "content", "hasDiagram": true},
        {"title": "Key Features", "type": "content", "hasDiagram": false}
      ]
    }
  ]
}

IMPORTANT: Keep total slides under 15, use max 3-4 diagrams total.`;

  const outlineResponse = await callLLM(
    'You are a presentation architect. Output valid JSON only.',
    outlinePrompt
  );
  
  // Parse outline (handle markdown fences)
  let outline;
  try {
    const jsonMatch = outlineResponse.match(/```json\n([\s\S]*?)\n```/) || 
                     outlineResponse.match(/```\n([\s\S]*?)\n```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : outlineResponse;
    outline = JSON.parse(jsonStr);
    console.log(`   ✅ Outline created: ${outline.sections.length} sections`);
  } catch (error) {
    console.error('   ⚠️  Failed to parse outline JSON, using fallback');
    outline = createFallbackOutline(topic);
  }
  
  return { styleGuide, outline };
}

// PHASE 2: Content Generation
async function phase2Content(outline, styleGuide) {
  console.log('\n' + '═'.repeat(60));
  console.log('PHASE 2: CONTENT GENERATION');
  console.log('═'.repeat(60));
  
  const slides = [];
  let slideNumber = 0;
  
  for (const section of outline.sections) {
    console.log(`\n📝 Generating section: ${section.name}`);
    
    // Add section intro (lead slide)
    if (section.name !== 'Introduction') {
      slides.push({
        type: 'section-intro',
        content: `---

<!-- _class: lead -->

# ${section.name}

${section.description || ''}
`
      });
    }
    
    // Generate each slide in section
    for (const slide of section.slides) {
      slideNumber++;
      console.log(`   ${slideNumber}. ${slide.title}`);
      
      const contentPrompt = `Create MINIMAL content for this slide in a technical presentation about "${outline.title}".

Slide Title: ${slide.title}
Slide Type: ${slide.type}
Section: ${section.name}
${slide.hasDiagram ? 'Note: This slide has a DIAGRAM - use only 3 SHORT bullets' : ''}

STRICT REQUIREMENTS:
- ${slide.type === 'hook' ? 'ONE short paragraph (2-3 sentences MAX)' : 'ONLY 3-4 bullet points (NO exceptions)'}
- Each bullet: 5-8 words MAXIMUM
- NO sub-bullets, NO nested items
- ONE sentence speaker note
- Keep it SIMPLE and READABLE

BAD Example (too wordy):
- **Feature Name**: This is a detailed explanation that goes on and on with multiple clauses

GOOD Example (concise):
- Fast in-memory storage
- Supports multiple data types
- Easy to scale

Format as:
## ${slide.title}

[Content - 3-4 SHORT bullets only]

<!-- SPEAKER NOTES: [one sentence] -->

CRITICAL: Slides must fit on ONE screen. Keep bullets under 8 words each.`;

      const slideContent = await callLLM(
        'You are a technical content writer. Create clear, professional slide content. Follow formatting rules exactly.',
        contentPrompt
      );
      
      // Clean up the content - remove inline speaker notes, extra spacing
      let cleanedContent = slideContent
        // Remove inline speaker notes (sometimes LLM puts them inside bullets)
        .replace(/\s*<!-- SPEAKER NOTES:.*?-->\s*/g, '')
        // Extract the actual speaker notes at the end
        .match(/([\s\S]*?)(<!-- SPEAKER NOTES:[\s\S]*)?$/);
      
      let mainContent = cleanedContent[1].trim();
      const speakerNotes = cleanedContent[2] || '';
      
      // Hard limit: Keep only 3-4 bullets per slide
      if (mainContent.includes('-') || mainContent.includes('1.')) {
        const maxBullets = slide.hasDiagram ? 3 : 4;
        const bullets = mainContent.split(/\n(?=[-\d])/);
        if (bullets.length > maxBullets) {
          console.log(`   ⚠️  Truncating ${bullets.length} bullets to ${maxBullets}`);
          bullets.length = maxBullets;
          mainContent = bullets.join('\n');
        }
      }
      
      // Also truncate long bullets (over 80 characters)
      mainContent = mainContent.split('\n').map(line => {
        if (line.trim().startsWith('-') && line.length > 85) {
          return line.substring(0, 82) + '...';
        }
        return line;
      }).join('\n');
      
      slides.push({
        type: slide.type,
        title: slide.title,
        content: `---

${mainContent}

${speakerNotes}
`,
        needsDiagram: slide.hasDiagram
      });
    }
  }
  
  console.log(`\n✅ Generated ${slides.length} slides`);
  return slides;
}

// PHASE 3: Diagram Generation
async function phase3Diagrams(slides) {
  console.log('\n' + '═'.repeat(60));
  console.log('PHASE 3: DIAGRAM GENERATION');
  console.log('═'.repeat(60));
  
  const diagramSlides = slides.filter(s => s.needsDiagram);
  console.log(`\n📊 Generating ${diagramSlides.length} Mermaid diagrams...`);
  
  for (const slide of diagramSlides) {
    const diagramPrompt = `Create a SIMPLE Mermaid diagram for this slide.

Slide: ${slide.title}
Context: ${slide.content}

CRITICAL RULES:
- Use graph LR (left-to-right) for best readability
- Maximum 5-6 nodes (keep it simple!)
- Short labels (2-4 words max per node)
- Clear flow showing key concepts only

Choose diagram type:
- graph LR: processes, architectures, flows (PREFERRED)
- sequenceDiagram: interactions between systems
- stateDiagram-v2: state transitions
- classDiagram: relationships between entities

Example GOOD diagram (simple):
graph LR
    A[User] --> B[API]
    B --> C[Database]
    C --> D[Response]

Example BAD (too complex - avoid this):
graph TD
    A[Long detailed node description] --> B[Another long description]
    B --> C[Too many nodes]
    B --> D[Makes diagram]
    B --> E[Unreadable and]
    D --> F[Cluttered]

Output ONLY the Mermaid code (no explanations, no markdown fences).`;

    const mermaidCode = await callLLM(
      'You are a diagram expert. Output only valid Mermaid syntax.',
      diagramPrompt
    );
    
    // Clean up mermaid code
    let cleanedCode = mermaidCode
      .replace(/```mermaid\n/g, '')
      .replace(/```\n/g, '')
      .replace(/```/g, '')
      .trim();
    
    // Extract the main content (remove title and speaker notes)
    const contentMatch = slide.content.match(/## .*?\n\n([\s\S]*?)(?:\n<!-- SPEAKER NOTES|$)/);
    const mainContent = contentMatch ? contentMatch[1].trim() : '';
    const speakerNotesMatch = slide.content.match(/(<!-- SPEAKER NOTES:[\s\S]*?-->)/);
    const speakerNotes = speakerNotesMatch ? speakerNotesMatch[1] : '';
    
    // Rebuild slide with proper column layout
    slide.content = `---

## ${slide.title}

<div class="columns">
<div>

\`\`\`mermaid
${cleanedCode}
\`\`\`

</div>
<div>

${mainContent}

</div>
</div>

${speakerNotes}
`;
    
    console.log(`   ✅ Diagram added to: ${slide.title}`);
  }
  
  return slides;
}

// PHASE 4: Assembly
async function phase4Assembly(outline, slides, styleGuide) {
  console.log('\n' + '═'.repeat(60));
  console.log('PHASE 4: FINAL ASSEMBLY');
  console.log('═'.repeat(60));
  
  console.log('\n🔧 Assembling final presentation...');
  
  // Front matter with global styles
  const frontMatter = `---
marp: true
size: 16:9
theme: rose-pine-dawn
paginate: true
html: true
header: '${outline.title}'
footer: 'AI Generated | ${new Date().toLocaleDateString()}'
style: |
  /* Global column layout for diagrams */
  .columns {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 1.5em;
    align-items: start;
    font-size: 0.88em;
    line-height: 1.5;
  }
  
  /* Mermaid diagram sizing - make it fit better */
  .columns img[alt*="Mermaid"],
  .columns svg {
    max-height: 400px;
    max-width: 100%;
    margin: 0 auto;
    display: block;
  }
  
  /* Section padding to avoid footer overlap */
  section {
    padding: 4em 2em 5em 2em;
  }
  
  /* Heading sizes for better hierarchy */
  h2 {
    font-size: 1.8em;
    margin-top: 0.2em;
    margin-bottom: 0.6em;
  }
  
  /* Bullet points - better spacing */
  ul {
    margin: 0.5em 0;
    padding-left: 1.2em;
  }
  
  li {
    margin: 0.4em 0;
    line-height: 1.5;
  }
  
  /* Paragraphs */
  p {
    margin: 0.5em 0;
    line-height: 1.6;
  }
---
`;

  // Title slide
  const titleSlide = `
<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _footer: "" -->

# ${outline.title}

${outline.subtitle}
`;

  // Combine all slides
  const allSlides = [titleSlide, ...slides.map(s => s.content)];
  
  // End slides
  const endSlides = `
---

<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _footer: "" -->

# Questions?

---

<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _footer: "" -->

# Thank You!

**Topic**: ${outline.title}
`;

  const fullPresentation = frontMatter + allSlides.join('\n') + endSlides;
  
  // Save
  const outputPath = path.join(__dirname, '../slides/demo-presentation.md');
  fs.writeFileSync(outputPath, fullPresentation, 'utf8');
  
  console.log(`✅ Saved to: slides/demo-presentation.md`);
  console.log(`📏 Total slides: ${allSlides.length + 2}`); // +2 for Questions and Thank You
  
  // Post-process: Build HTML with Mermaid diagrams
  console.log('\n🔧 Post-processing: Building HTML with Mermaid diagrams...');
  try {
    // Preprocess Mermaid diagrams to images
    execSync(`node scripts/preprocess-for-pdf.js slides/demo-presentation.md`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    
    // Build HTML from preprocessed markdown
    execSync(`npx @marp-team/marp-cli --no-stdin --no-config-file --html --allow-local-files --theme themes/rose-pine-dawn.css slides/presentation.preprocessed.md -o slides/demo-presentation.html`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    
    console.log('✅ HTML built: slides/demo-presentation.html');
  } catch (error) {
    console.warn('⚠️  Post-processing failed, but markdown was saved');
    console.warn('Run manually: npm run build');
  }
  
  return outputPath;
}

// Fallback outline creator (12 slides, 3 diagrams)
function createFallbackOutline(topic) {
  return {
    title: topic,
    subtitle: "A Practical Guide",
    sections: [
      {
        name: "Introduction",
        slides: [
          { title: "The Challenge", type: "hook", hasDiagram: false },
          { title: "Why This Matters", type: "content", hasDiagram: false }
        ]
      },
      {
        name: "Core Concepts",
        slides: [
          { title: "Overview", type: "content", hasDiagram: true },
          { title: "Key Features", type: "content", hasDiagram: false }
        ]
      },
      {
        name: "How It Works",
        slides: [
          { title: "Architecture", type: "content", hasDiagram: true },
          { title: "Basic Usage", type: "content", hasDiagram: false }
        ]
      },
      {
        name: "Best Practices",
        slides: [
          { title: "Getting Started", type: "content", hasDiagram: false },
          { title: "Common Patterns", type: "content", hasDiagram: false },
          { title: "Optimization Tips", type: "content", hasDiagram: false }
        ]
      },
      {
        name: "Conclusion",
        slides: [
          { title: "Key Takeaways", type: "content", hasDiagram: false },
          { title: "Next Steps", type: "content", hasDiagram: false }
        ]
      }
    ]
  };
}

// Main execution
async function main() {
  try {
    // Test connection
    console.log('📡 Testing Ollama connection...');
    await llm.invoke([new HumanMessage('test')]);
    console.log('✅ Connected to Ollama\n');
    
    // Execute phases
    const { styleGuide, outline } = await phase1Research();
    const slides = await phase2Content(outline, styleGuide);
    const slidesWithDiagrams = await phase3Diagrams(slides);
    const outputPath = await phase4Assembly(outline, slidesWithDiagrams, styleGuide);
    
    // Final summary
    console.log('\n' + '═'.repeat(60));
    console.log('✅ PRESENTATION GENERATION COMPLETE');
    console.log('═'.repeat(60));
    console.log('\n📋 FILES CREATED:');
    console.log('   - slides/demo-presentation.md (source)');
    console.log('   - slides/demo-presentation.html (with rendered diagrams)');
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Preview: open slides/demo-presentation.html (in browser)');
    console.log('2. Or dev mode: npm run dev → http://localhost:8080/demo-presentation.html');
    console.log('3. Edit/refine: slides/demo-presentation.md');
    console.log('4. Rebuild: npm run build (if you edit the .md file)');
    console.log('5. Export PPTX: npm run export');
    console.log('\n💡 TIP: Use the .html file for preview (Mermaid diagrams work)');
    console.log('         The .md file in dev mode won\'t render Mermaid');
    console.log('═'.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();

