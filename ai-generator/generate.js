#!/usr/bin/env node

/**
 * AI-Powered Presentation Generator with MCP Integration
 * 
 * Uses LangChain.js with Ollama (local LLMs) and MCP servers to generate
 * professional Marp presentations on any topic.
 * 
 * Features:
 * - Local LLM via Ollama (qwen2.5-coder, llama3.2, etc.)
 * - MCP integration for web search, GitHub, documentation
 * - Reads existing presentation for style learning
 * - Generates Mermaid diagrams
 * - Professional Marp formatting
 * 
 * Usage:
 *   node ai-generator/generate.js "Your Topic Here"
 *   node ai-generator/generate.js "Building REST APIs with Node.js"
 */

const fs = require('fs');
const path = require('path');
const { ChatOllama } = require('@langchain/ollama');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');
const { DynamicStructuredTool } = require('@langchain/core/tools');
const { z } = require('zod');

// Configuration
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b';
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

// Get topic from command line
const topic = process.argv[2];
if (!topic) {
  console.error('❌ Error: Please provide a topic');
  console.error('Usage: node ai-generator/generate.js "Your Topic Here"');
  process.exit(1);
}

console.log(`🎨 Generating presentation on: "${topic}"`);
console.log(`🤖 Using Ollama model: ${OLLAMA_MODEL}\n`);

// Initialize Ollama
const llm = new ChatOllama({
  model: OLLAMA_MODEL,
  baseUrl: OLLAMA_BASE_URL,
  temperature: 0.7,
});

// Load MCP configuration
const mcpConfigPath = path.join(__dirname, 'mcp-config.json');
const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));

console.log('📋 Available MCP Servers:');
Object.keys(mcpConfig.mcpServers).forEach(name => {
  const server = mcpConfig.mcpServers[name];
  console.log(`  - ${name}: ${server.description}`);
});
console.log('');

/**
 * PHASE 1 TOOLS: Information Gathering
 * Use these tools to collect information before generating content
 */

const phase1Tools = [
  // TOOL 1.1: Read existing presentation
  // WHEN TO USE: Start of every generation to learn style and structure
  // MCP: filesystem
  new DynamicStructuredTool({
    name: 'read_existing_presentation',
    description: `Read the existing presentation.md to learn Marp style, structure, and best practices.
    
WHEN TO USE:
- At the very start of generation
- To understand slide formatting
- To learn Mermaid diagram patterns
- To see two-column layouts
    
MCP SERVER: filesystem (reads slides/presentation.md)`,
    schema: z.object({}),
    func: async () => {
      console.log('  📖 [PHASE 1] Reading existing presentation for style...');
      const presentationPath = path.join(__dirname, '../slides/presentation.md');
      const content = fs.readFileSync(presentationPath, 'utf8');
      
      // Extract structure info
      const lines = content.split('\n');
      const frontMatter = lines.slice(0, 150).join('\n');
      
      return JSON.stringify({
        phase: 1,
        frontMatter: frontMatter,
        themes: ['rose-pine-dawn', 'rose-pine-moon'],
        features: {
          mermaid: 'Use ```mermaid for diagrams',
          columns: 'Use <div class="columns"> for two-column layouts',
          lead: 'Use <!-- _class: lead --> for section intros',
          speakerNotes: 'Add notes with <!-- SPEAKER NOTES: ... -->',
          qrCodes: 'Use ![QR](qr:URL) for QR codes'
        },
        layoutPatterns: [
          'Title slide (no pagination)',
          'Section intro (lead class)',
          'Content slides (2-column with diagram left, text right)',
          'Comparison slides (2-column equal)',
          'Conclusion slide (key takeaways)'
        ]
      }, null, 2);
    }
  }),

  // TOOL 1.2: Search web for current information
  // WHEN TO USE: Find latest trends, frameworks, best practices
  // MCP: brave-search
  new DynamicStructuredTool({
    name: 'search_web',
    description: `Search the web for current information on the topic.
    
WHEN TO USE:
- Find latest frameworks and tools
- Get current best practices
- Discover trending technologies
- Find statistics and data
    
MCP SERVER: brave-search (requires BRAVE_API_KEY)
FALLBACK: Use general knowledge if MCP not available`,
    schema: z.object({
      query: z.string().describe('Search query for current information'),
      focus: z.enum(['tools', 'practices', 'trends', 'examples']).describe('What aspect to focus on')
    }),
    func: async ({ query, focus }) => {
      console.log(`  🔍 [PHASE 1] Searching web: "${query}" (focus: ${focus})`);
      
      // TODO: Integrate with brave-search MCP when available
      // For now, return guidance for LLM
      return JSON.stringify({
        phase: 1,
        note: 'Use brave-search MCP if available, otherwise use training knowledge',
        query: query,
        focus: focus,
        guidance: {
          tools: 'Focus on popular frameworks, libraries, and development tools',
          practices: 'Focus on industry standards, patterns, and methodologies',
          trends: 'Focus on recent developments and emerging technologies',
          examples: 'Focus on real-world use cases and implementations'
        }
      });
    }
  }),

  // TOOL 1.3: Search GitHub for code examples
  // WHEN TO USE: Find real implementations, popular repos, MCP servers
  // MCP: octocode
  new DynamicStructuredTool({
    name: 'search_github',
    description: `Search GitHub repositories for code examples and popular projects.
    
WHEN TO USE:
- Find code examples for the topic
- Discover popular repositories
- Search for MCP servers
- Find framework usage examples
    
MCP SERVER: octocode (requires GITHUB_TOKEN)
EXAMPLE QUERIES:
- "mcp server typescript" (find MCP implementations)
- "express rest api" (find REST API examples)
- "react hooks tutorial" (find React examples)`,
    schema: z.object({
      query: z.string().describe('GitHub search query'),
      type: z.enum(['repositories', 'code', 'mcp-servers']).describe('What to search for')
    }),
    func: async ({ query, type }) => {
      console.log(`  🐙 [PHASE 1] Searching GitHub: "${query}" (type: ${type})`);
      
      // TODO: Integrate with octocode MCP when available
      return JSON.stringify({
        phase: 1,
        note: 'Use octocode MCP if available (githubSearchCode, githubSearchRepositories)',
        query: query,
        type: type,
        mcpServers: type === 'mcp-servers' ? [
          'Search for: "mcp server" + topic',
          'Check: @modelcontextprotocol organization',
          'Look for: server-* repositories'
        ] : undefined
      });
    }
  }),

  // TOOL 1.4: Fetch documentation
  // WHEN TO USE: Get official docs, API references, guides
  // MCP: fetch, context7
  new DynamicStructuredTool({
    name: 'fetch_documentation',
    description: `Fetch official documentation from web or Context7.
    
WHEN TO USE:
- Get official framework documentation
- Read API references
- Access guides and tutorials
    
MCP SERVERS: 
- fetch (for web pages)
- context7 (for popular libraries like React, Next.js)`,
    schema: z.object({
      library: z.string().describe('Library/framework name (e.g., "react", "express")'),
      topic: z.string().describe('Specific topic to focus on')
    }),
    func: async ({ library, topic }) => {
      console.log(`  📚 [PHASE 1] Fetching docs: ${library} (${topic})`);
      
      // TODO: Integrate with context7/fetch MCP when available
      return JSON.stringify({
        phase: 1,
        note: 'Use context7 MCP (resolve-library-id, get-library-docs) or fetch MCP',
        library: library,
        topic: topic,
        suggestion: `Search for official ${library} documentation on ${topic}`
      });
    }
  })
];

/**
 * PHASE 2 TOOLS: Content Creation
 * Use these tools to create presentation content
 */

const phase2Tools = [
  // TOOL 2.1: Create Mermaid diagram
  // WHEN TO USE: Visualize architecture, flows, relationships
  new DynamicStructuredTool({
    name: 'create_diagram',
    description: `Create a Mermaid diagram for visualization.
    
WHEN TO USE:
- Show system architecture
- Illustrate workflow/process
- Display state transitions
- Show relationships

DIAGRAM TYPES:
- flowchart: For processes and workflows (graph LR)
- sequence: For interactions (sequenceDiagram)
- state: For state machines (stateDiagram-v2)
- class: For object structures (classDiagram)`,
    schema: z.object({
      type: z.enum(['flowchart', 'sequence', 'state', 'class']).describe('Diagram type'),
      description: z.string().describe('What the diagram should show'),
      orientation: z.enum(['LR', 'TB']).optional().describe('Left-to-right or top-to-bottom')
    }),
    func: async ({ type, description, orientation = 'LR' }) => {
      console.log(`  📊 [PHASE 2] Creating ${type} diagram: ${description}`);
      
      const templates = {
        flowchart: `graph ${orientation}
    Start[Start] --> Process[Process Step]
    Process --> Decision{Decision?}
    Decision -->|Yes| Success[Success]
    Decision -->|No| Error[Handle Error]
    Success --> End[End]`,
        
        sequence: `sequenceDiagram
    participant Client
    participant API
    participant DB
    Client->>API: Request
    API->>DB: Query
    DB-->>API: Data
    API-->>Client: Response`,
        
        state: `stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: start
    Processing --> Success: complete
    Processing --> Error: fail
    Success --> [*]
    Error --> Idle: retry`,
        
        class: `classDiagram
    class ClassName {
        +String attribute
        +method() void
    }
    ClassName --> RelatedClass`
      };
      
      return JSON.stringify({
        phase: 2,
        type: type,
        template: templates[type],
        syntax: '```mermaid\n' + templates[type] + '\n```',
        tip: `Customize this ${type} diagram for: ${description}`
      });
    }
  }),

  // TOOL 2.2: Create two-column layout
  // WHEN TO USE: Compare options, show diagram + explanation
  new DynamicStructuredTool({
    name: 'create_two_column_layout',
    description: `Create a two-column slide layout.
    
WHEN TO USE:
- Compare two options/approaches
- Show diagram on left, explanation on right
- Display pros/cons
- Show before/after

SYNTAX:
<div class="columns">
<div>
Left content
</div>
<div>
Right content
</div>
</div>`,
    schema: z.object({
      purpose: z.enum(['comparison', 'diagram-text', 'pros-cons']).describe('Layout purpose')
    }),
    func: async ({ purpose }) => {
      console.log(`  📐 [PHASE 2] Creating two-column layout: ${purpose}`);
      
      const templates = {
        comparison: `<div class="columns">
<div>

### Option A
- Feature 1
- Feature 2
- Use when: X

</div>
<div>

### Option B
- Feature 1
- Feature 2
- Use when: Y

</div>
</div>`,
        
        'diagram-text': `<div class="columns">
<div>

\`\`\`mermaid
graph LR
    A --> B
\`\`\`

</div>
<div>

### Explanation
- Point 1
- Point 2
- Point 3

</div>
</div>`,
        
        'pros-cons': `<div class="columns">
<div>

### ✅ Advantages
- Pro 1
- Pro 2

</div>
<div>

### ❌ Limitations
- Con 1
- Con 2

</div>
</div>`
      };
      
      return JSON.stringify({
        phase: 2,
        template: templates[purpose],
        tip: 'Adjust content based on your needs'
      });
    }
  }),

  // TOOL 2.3: Save presentation
  // WHEN TO USE: After generating complete content
  new DynamicStructuredTool({
    name: 'save_presentation',
    description: `Save the generated presentation to a markdown file.
    
WHEN TO USE:
- After creating complete presentation content
- When all slides are ready
- As the final step

OUTPUT: slides/demo-presentation.md`,
    schema: z.object({
      content: z.string().describe('Complete Marp markdown content including front matter'),
      filename: z.string().default('demo-presentation').describe('Filename without extension')
    }),
    func: async ({ content, filename }) => {
      const filepath = path.join(__dirname, '../slides', `${filename}.md`);
      fs.writeFileSync(filepath, content, 'utf8');
      
      console.log(`\n✅ [PHASE 2] Presentation saved to: slides/${filename}.md`);
      
      return JSON.stringify({
        phase: 2,
        success: true,
        path: filepath,
        filename: `${filename}.md`,
        nextSteps: [
          'Preview: npm run dev',
          'Open: http://localhost:8080/' + filename + '.md',
          'Build: npm run build',
          'Export: npm run export'
        ]
      });
    }
  })
];

// Combine all tools
const allTools = [...phase1Tools, ...phase2Tools];

// System prompt
const systemPrompt = `You are an expert technical presentation designer specializing in Marp presentations.

WORKFLOW (Follow these phases):

PHASE 1 - INFORMATION GATHERING (Use Phase 1 tools):
1. read_existing_presentation - Learn Marp style and structure
2. search_web - Find current information (tools, practices, trends)
3. search_github - Find code examples and popular repos
4. fetch_documentation - Get official docs if needed

PHASE 2 - CONTENT CREATION (Use Phase 2 tools):
5. create_diagram - Generate 2-4 Mermaid diagrams for key concepts
6. create_two_column_layout - Use for comparisons and diagram+text slides
7. save_presentation - Save the final markdown

PRESENTATION STRUCTURE (15-25 slides):
1. Title slide (with topic and subtitle)
2. Hook slide (engaging introduction)
3. Section 1: Introduction/Basics (3-4 slides)
4. Section 2: Core Concepts (4-5 slides with diagrams)
5. Section 3: Implementation/Practice (4-5 slides with examples)
6. Section 4: Best Practices (2-3 slides)
7. Conclusion: Key Takeaways (2-3 slides)
8. Questions slide
9. Thank You slide

MARP FORMATTING RULES:
- Start with YAML front matter (marp: true, theme: rose-pine-dawn, size: 16:9)
- Use --- to separate slides
- Use <!-- _class: lead --> for section intros
- Use <!-- _paginate: false --> and <!-- _footer: "" --> for title/end slides
- Add speaker notes: <!-- SPEAKER NOTES: content -->
- Use Mermaid: \`\`\`mermaid ... \`\`\`
- Use columns: <div class="columns">

CONTENT GUIDELINES:
- Be concise (5-7 bullets max per slide)
- Use practical examples
- Include code snippets when relevant (keep short)
- Add speaker notes for transitions
- Make it engaging and professional

Now generate the presentation!`;

// Main generation function
async function generatePresentation() {
  try {
    console.log('🚀 Starting presentation generation...\n');
    console.log('═'.repeat(60));
    
    // Bind tools to LLM
    const llmWithTools = llm.bindTools(allTools);
    
    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(`Generate a complete Marp presentation on: "${topic}"

Follow the two-phase workflow:

PHASE 1: Use information gathering tools to research the topic
PHASE 2: Create the presentation content with diagrams and proper formatting

The presentation should be professional, engaging, and follow Marp best practices.`)
    ];
    
    let response = await llmWithTools.invoke(messages);
    messages.push(response);
    
    // Handle tool calls iteratively
    let iterations = 0;
    const maxIterations = 20;
    
    while (response.tool_calls && response.tool_calls.length > 0 && iterations < maxIterations) {
      iterations++;
      console.log(`\n${'='.repeat(60)}`);
      console.log(`ITERATION ${iterations}: Processing ${response.tool_calls.length} tool call(s)`);
      console.log('='.repeat(60));
      
      for (const toolCall of response.tool_calls) {
        const tool = allTools.find(t => t.name === toolCall.name);
        if (tool) {
          try {
            const result = await tool.func(toolCall.args);
            
            messages.push({
              role: 'tool',
              content: result,
              tool_call_id: toolCall.id,
              name: toolCall.name
            });
          } catch (error) {
            console.error(`  ❌ Error calling ${toolCall.name}:`, error.message);
            messages.push({
              role: 'tool',
              content: JSON.stringify({ error: error.message }),
              tool_call_id: toolCall.id,
              name: toolCall.name
            });
          }
        }
      }
      
      response = await llmWithTools.invoke(messages);
      messages.push(response);
    }
    
    if (iterations >= maxIterations) {
      console.warn(`\n⚠️  Reached maximum iterations (${maxIterations})`);
    }
    
    console.log('\n' + '='.repeat(60));
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
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
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

