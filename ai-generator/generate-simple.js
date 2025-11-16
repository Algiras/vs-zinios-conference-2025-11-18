#!/usr/bin/env node

/**
 * Simple AI Presentation Generator (No Tool Calling)
 * 
 * Works with any Ollama model without requiring tool calling support.
 * Generates presentations in a single pass.
 * 
 * Usage:
 *   node ai-generator/generate-simple.js "Your Topic"
 */

const fs = require('fs');
const path = require('path');
const { ChatOllama } = require('@langchain/ollama');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');

// Configuration
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b';
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

// Get topic from command line
const topic = process.argv[2];
if (!topic) {
  console.error('❌ Error: Please provide a topic');
  console.error('Usage: node ai-generator/generate-simple.js "Your Topic"');
  process.exit(1);
}

console.log(`🎨 Generating presentation on: "${topic}"`);
console.log(`🤖 Using Ollama model: ${OLLAMA_MODEL}\n`);

// Initialize Ollama
const llm = new ChatOllama({
  model: OLLAMA_MODEL,
  baseUrl: OLLAMA_BASE_URL,
  temperature: 0.7,
  numCtx: 8192, // Larger context for full presentation
});

// Read existing presentation for style
console.log('📖 Reading existing presentation for style...');
const presentationPath = path.join(__dirname, '../slides/presentation.md');
const existingPresentation = fs.readFileSync(presentationPath, 'utf8');
const frontMatter = existingPresentation.split('\n').slice(0, 150).join('\n');

console.log('✅ Style loaded\n');

// System prompt
const systemPrompt = `You are an expert technical presentation designer specializing in Marp presentations.

Create a complete, professional Marp presentation that follows this exact structure:

FRONT MATTER (copy this style):
${frontMatter}

REQUIRED STRUCTURE (15-25 slides):
1. Title slide:
   ---
   <!-- _class: lead -->
   <!-- _paginate: false -->
   <!-- _footer: "" -->
   
   # [Topic Title]
   
   [Engaging subtitle]

2. Hook slide (no lead class):
   ---
   
   ## The Challenge/Opportunity
   [Engaging introduction]

3. Sections (use lead for intros):
   ---
   <!-- _class: lead -->
   
   # Section 1: Basics
   
   ---
   
   ## Content Slide
   - Point 1
   - Point 2

4. Diagrams (use Mermaid):
   \`\`\`mermaid
   graph LR
       A[Start] --> B[Process]
       B --> C[End]
   \`\`\`

5. Two-column layouts:
   <div class="columns">
   <div>
   Left content
   </div>
   <div>
   Right content
   </div>
   </div>

6. Speaker notes:
   <!-- SPEAKER NOTES: Your notes here -->

7. Conclusion:
   ## Key Takeaways
   - Takeaway 1
   - Takeaway 2

8. End slides:
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

IMPORTANT RULES:
- Use --- to separate slides
- Use <!-- _class: lead --> for section intros only
- Include 2-4 Mermaid diagrams
- Keep bullets concise (5-7 max)
- Add speaker notes on key slides
- Use two-column layouts for comparisons
- Make it engaging and professional

Generate the COMPLETE presentation now, starting with the front matter!`;

async function generatePresentation() {
  try {
    console.log('🧠 Generating presentation content...\n');
    console.log('⏳ This may take 30-60 seconds...\n');
    
    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(`Create a complete Marp presentation on: "${topic}"

The presentation should:
- Have 15-25 slides
- Include an engaging opening
- Cover fundamentals, architecture/concepts, best practices, and examples
- Use 2-4 Mermaid diagrams for key concepts
- Have practical takeaways
- Follow the Marp formatting shown above

Generate the FULL markdown now!`)
    ];
    
    const response = await llm.invoke(messages);
    let content = response.content;
    
    console.log(`✅ Generated ${content.length} characters\n`);
    
    // Clean up the content
    // Remove markdown code fences if LLM wrapped it
    content = content.replace(/^```markdown\n/, '').replace(/\n```$/, '');
    content = content.replace(/^```\n/, '').replace(/\n```$/, '');
    
    // Ensure it starts with front matter
    if (!content.startsWith('---\nmarp: true')) {
      console.warn('⚠️  Adding missing front matter');
      content = `---
marp: true
size: 16:9
theme: rose-pine-dawn
paginate: true
html: true
header: 'Presentation'
footer: 'Generated with AI | ${new Date().getFullYear()}'
---

` + content;
    }
    
    // Save the presentation
    const outputPath = path.join(__dirname, '../slides/demo-presentation.md');
    fs.writeFileSync(outputPath, content, 'utf8');
    
    console.log('✅ Presentation saved to: slides/demo-presentation.md\n');
    console.log('=' + '='.repeat(59));
    console.log('✅ PRESENTATION GENERATION COMPLETE');
    console.log('='.repeat(60));
    console.log('\nNEXT STEPS:');
    console.log('1. Preview: npm run dev');
    console.log('2. Open: http://localhost:8080/demo-presentation.md');
    console.log('3. Edit: slides/demo-presentation.md (refine as needed)');
    console.log('4. Build: npm run build');
    console.log('5. Export: npm run export');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Error generating presentation:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run
console.log('📡 Checking Ollama connection...');
llm.invoke([new HumanMessage('test')]).then(() => {
  console.log('✅ Ollama connected\n');
  generatePresentation();
}).catch(error => {
  console.error('❌ Error: Cannot connect to Ollama');
  console.error('Make sure Ollama is running: ollama serve');
  console.error(`Make sure model is available: ollama pull ${OLLAMA_MODEL}`);
  console.error(`URL: ${OLLAMA_BASE_URL}`);
  process.exit(1);
});

