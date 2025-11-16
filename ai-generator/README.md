# AI Presentation Generator

This tool leverages Large Language Models (LLMs) via LangChain.js and Ollama to autonomously generate Marp Markdown presentations on any given topic. It uses a **multi-step workflow** to research, structure, and create professional presentations with diagrams and proper formatting.

## 🎯 Two Generation Modes

### 1. **Multi-Step Generator** (Recommended - Default)
**File**: `generate-multi-step.js`

Explicitly orchestrated workflow in 4 phases:
- **Phase 1**: Research & Planning (reads existing style, creates outline)
- **Phase 2**: Content Generation (generates each slide section-by-section)
- **Phase 3**: Diagram Generation (creates Mermaid diagrams for key concepts)
- **Phase 4**: Assembly (combines everything into final presentation)

**Pros**:
- ✅ Proper column layouts with diagrams
- ✅ Explicit control over each phase
- ✅ Better formatting consistency
- ✅ Works with any Ollama model
- ✅ Easier to debug and customize

**Cons**:
- Slower (multiple LLM calls)
- No MCP tool usage (explicit orchestration instead)

### 2. **Tool-Calling Generator** (Experimental)
**File**: `generate.js`

Uses LangChain's agent with tool calling:
- Relies on LLM to decide when to use tools
- Requires models with good tool-calling support
- Designed for MCP integration

**Status**: May not work with all Ollama models (tool calling support varies)

---

## 🚀 Quick Start

### 1. Install Ollama

If you don't have Ollama installed, follow the instructions on the [Ollama website](https://ollama.com/download).

### 2. Pull an LLM Model

For best results with technical content, it's recommended to use a capable coding model.
```bash
ollama pull qwen2.5-coder:7b
# Or choose another model like llama3.2, codellama, mistral
```

### 3. Install Dependencies

From the project root:
```bash
npm install
```

### 4. Generate a Presentation

Run the generator with your desired topic:
```bash
npm run ai:generate "Building REST APIs with Node.js"
# Example: npm run ai:generate "Docker Containers for Production"
# Example: npm run ai:generate "React Server Components"
```
The generated presentation will be saved to `slides/demo-presentation.md`.

### 5. Preview & Export

To preview the generated presentation:
```bash
npm run dev
# Then open http://localhost:8080/demo-presentation.md in your browser
```
To export to PPTX or PDF:
```bash
npm run export      # Generates slides/demo-presentation.pptx
npm run export:pdf  # Generates slides/demo-presentation.pdf
```

---

## 🧠 How It Works: Multi-Step Workflow

The default generator operates in four distinct phases:

### Phase 1: Research & Planning

**Goal**: Understand the existing presentation style and create a detailed outline.

**Steps**:
1. **Read existing presentation** (`slides/presentation.md`) to extract:
   - Front matter format
   - Style patterns (lead slides, columns, Mermaid diagrams)
   - Speaker notes usage
2. **Create outline** with:
   - 15-25 slides total
   - Clear sections (Introduction, Core Concepts, Implementation, Best Practices, Conclusion)
   - Specific slide titles
   - Which slides need diagrams
   - Which slides need two-column layouts

**Output**: Style guide + JSON outline with all sections and slides

### Phase 2: Content Generation

**Goal**: Generate content for each slide section-by-section.

**Steps**:
1. For each section:
   - Add section intro slide (with `<!-- _class: lead -->` if not Introduction)
   - Generate each slide's content with:
     - Hook slides: Engaging problem/opportunity paragraphs
     - Content slides: 5-7 concise bullet points
     - Brief speaker notes (1-2 sentences)
2. Content is context-aware (knows the topic, section, and slide purpose)

**Output**: Array of slides with content (some marked as `needsDiagram`)

### Phase 3: Diagram Generation

**Goal**: Create Mermaid diagrams for slides marked as needing visual explanation.

**Steps**:
1. For each slide marked `needsDiagram`:
   - Generate Mermaid code (flowchart, sequence, state machine, or class diagram)
   - Clean up the Mermaid code
   - Extract slide content and speaker notes
   - Rebuild slide with proper two-column layout:
     - **Left column**: Mermaid diagram
     - **Right column**: Bullet points/text content
2. Ensures proper HTML structure with no overlaps

**Output**: Updated slides with diagrams in proper column layouts

### Phase 4: Final Assembly

**Goal**: Combine everything into a complete, properly formatted Marp presentation.

**Steps**:
1. Create front matter with:
   - Marp configuration
   - Global styles for columns and diagrams
   - Theme and pagination settings
2. Add title slide (lead class, no pagination/footer)
3. Combine all section and content slides
4. Add end slides (Questions? + Thank You!)
5. Write to `slides/demo-presentation.md`

**Output**: Complete Marp Markdown presentation

---

## 📊 Generated Output Format

The AI generator produces presentations with:

- **15-35 slides** (varies by topic complexity)
- **Front matter** with global styles for columns and diagrams
- **Title slide** (lead class, centered)
- **Hook slide** to engage the audience
- **Section intro slides** (lead class) between major sections
- **Content slides** with:
  - Clear bullet points (5-7 max)
  - Brief speaker notes
- **Diagram slides** with:
  - Two-column layout (diagram left, content right)
  - Mermaid diagrams (flowcharts, sequences, state machines)
  - Properly sized and styled
- **Conclusion slides**:
  - Key Takeaways
  - Resources (if applicable)
- **End slides** (Questions? + Thank You!)

### Example Structure

```markdown
---
marp: true
size: 16:9
theme: rose-pine-dawn
paginate: true
html: true
header: 'Topic Title'
footer: 'AI Generated | Date'
style: |
  .columns { ... }
  /* Proper column and diagram sizing */
---

<!-- Title Slide -->
<!-- _class: lead -->
# Topic Title
Subtitle

---

<!-- Hook Slide -->
## The Challenge
Engaging problem/opportunity...

---

<!-- Section Intro -->
<!-- _class: lead -->
# Core Concepts

---

<!-- Content Slide with Diagram -->
## What is X?

<div class="columns">
<div>

\`\`\`mermaid
graph LR
    A --> B
    B --> C
\`\`\`

</div>
<div>

- Bullet 1
- Bullet 2
- Bullet 3

</div>
</div>

<!-- SPEAKER NOTES: Brief notes -->

---

<!-- More slides... -->

---

<!-- End Slides -->
<!-- _class: lead -->
# Questions?

---

<!-- _class: lead -->
# Thank You!
```

---

## 🔧 Configuration

### Environment Variables

- `OLLAMA_MODEL` - Model to use (default: `qwen2.5-coder:7b`)
- `OLLAMA_BASE_URL` - Ollama server URL (default: `http://localhost:11434`)
- `BRAVE_API_KEY` - (Optional) For web search MCP (experimental)
- `GITHUB_TOKEN` - (Optional) For GitHub search MCP (experimental)

### Switching Generator Mode

To use the experimental tool-calling generator:
```bash
# Edit package.json
"ai:generate": "node ai-generator/generate.js"
```

Or run directly:
```bash
node ai-generator/generate.js "Your Topic"
```

---

## 🛠️ Customization

### Modify the Outline Structure

Edit the `createFallbackOutline()` function in `generate-multi-step.js` to change default sections:

```javascript
function createFallbackOutline(topic) {
  return {
    title: topic,
    subtitle: "An Introduction",
    sections: [
      {
        name: "Your Custom Section",
        slides: [
          { title: "Slide Title", type: "content", hasDiagram: true }
        ]
      }
    ]
  };
}
```

### Adjust Diagram Types

Modify the diagram generation prompt in Phase 3 to prefer specific diagram types:

```javascript
const diagramPrompt = `Create a Mermaid diagram for this slide.

Prefer: graph LR (horizontal flowcharts)
Or use: sequenceDiagram, stateDiagram-v2, classDiagram

...`;
```

### Change Themes

The generated presentations use `rose-pine-dawn` (light theme) by default. To use the dark theme, edit `generate-multi-step.js`:

```javascript
const frontMatter = `---
marp: true
theme: rose-pine-moon  // Change to dark theme
...
---
`;
```

---

## 🔌 Model Context Protocol (MCP) Integration (Experimental)

The tool-calling generator (`generate.js`) is designed to work with MCP servers for enhanced functionality. These are configured in `mcp-config.json`.

### Available MCP Servers

| MCP Server     | Purpose                                                              | Environment Variable |
| :------------- | :------------------------------------------------------------------- | :------------------- |
| `brave-search` | Web search for current information.                                  | `BRAVE_API_KEY`      |
| `octocode`     | GitHub code and repository search.                                   | `GITHUB_TOKEN`       |
| `fetch`        | Fetches content from specified URLs (e.g., documentation).           | None                 |
| `filesystem`   | Reads local files (e.g., existing presentation for style guidance).  | None                 |
| `context7`     | Specialized knowledge base search (optional, for internal docs).     | None                 |

**Note**: The multi-step generator (default) does NOT use MCP servers. It explicitly orchestrates each phase without relying on LLM tool calling.

---

## ⚠️ Troubleshooting

### Ollama Connection Failed

```bash
# Make sure Ollama is running
ollama serve

# Check if model is available
ollama list

# Pull model if missing
ollama pull qwen2.5-coder:7b
```

### Column Layouts Not Rendering

- Ensure `style:` block in front matter includes `.columns` CSS
- Check that `<div class="columns">` has proper closing `</div>` tags
- Verify content is inside column divs, not after

### Mermaid Diagrams Not Showing

- Check Mermaid syntax is valid (no markdown fences inside the code)
- Ensure preprocessing runs: `npm run build`
- Verify `mmdc` is installed: `npx -y mmdc --version`

### Generated Content Too Long

- Slides overflow footer
- **Fix**: Edit `slides/demo-presentation.md` manually to split content
- Or regenerate with more specific topic

### LLM Produces Invalid JSON

- The outline parser has a fallback
- If it keeps failing, check `OLLAMA_MODEL` supports structured output
- Try: `llama3.2`, `qwen2.5`, or `mistral`

---

## 📚 Generated Presentation Workflow

1. **Generate**: `npm run ai:generate "Topic"`
2. **Preview**: `npm run dev` → `http://localhost:8080/demo-presentation.md`
3. **Refine**: Edit `slides/demo-presentation.md` manually
4. **Build HTML**: `npm run build` (processes Mermaid diagrams)
5. **Export PPTX**: `npm run export`
6. **Export PDF**: `npm run export:pdf`

---

## 🎓 Tips for Best Results

### Choose the Right Topic

✅ **Good topics**:
- "GraphQL APIs: Modern Data Fetching"
- "Docker Containers for Production"
- "TypeScript Best Practices"
- "React Server Components Explained"

❌ **Avoid**:
- Too broad: "Programming" (be specific)
- Too narrow: "useState Hook" (not enough content)

### Review and Edit

The generator creates a **solid foundation**, but you should:
- **Edit for accuracy** - LLMs can hallucinate
- **Add real examples** - Replace generic examples with your own
- **Adjust speaker notes** - Personalize to your presentation style
- **Verify diagrams** - Ensure Mermaid syntax is correct

### Customize Style

- Change theme: Edit `theme:` in front matter
- Adjust colors: Modify theme CSS files
- Change layout: Edit `.columns` grid template in `style:` block

---

## 📖 Additional Resources

### Marp Documentation
- [Marp Official Docs](https://marpit.marp.app/)
- [Marp CLI](https://github.com/marp-team/marp-cli)
- [Marp Themes](https://github.com/topics/marp-theme)

### Ollama & LangChain
- [Ollama](https://ollama.com/)
- [LangChain.js](https://js.langchain.com/docs/)
- [LangChain Ollama](https://js.langchain.com/docs/integrations/llms/ollama)

### Mermaid Diagrams
- [Mermaid Live Editor](https://mermaid.live/)
- [Mermaid Syntax](https://mermaid.js.org/intro/)

---

## 🤝 Contributing

Contributions to improve the generator are welcome! Areas for improvement:

- Better diagram generation (smarter type selection)
- MCP server integration (web search, GitHub code search)
- Template customization
- Support for more themes
- Interactive refinement prompts

---

## 📄 License

This project is licensed under the MIT License (see main repository).

---

## 🙏 Acknowledgments

- **Marp**: Markdown presentation ecosystem
- **Ollama**: Local LLM runtime
- **LangChain.js**: LLM application framework
- **Qwen 2.5 Coder**: High-quality coding model

---

**Ready to create your first presentation?**

```bash
npm run ai:generate "Your Amazing Topic"
```
