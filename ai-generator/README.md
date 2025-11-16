# AI Presentation Generator

Automatically generate professional Marp presentations using **Ollama** (local LLMs) and **MCP** (Model Context Protocol) servers.

## 🚀 Features

- 🤖 **Local LLMs via Ollama** - No API keys, runs on your machine
- 🔌 **MCP Integration** - Web search, GitHub, documentation access
- 📚 **Style Learning** - Learns from existing presentation
- 📊 **Mermaid Diagrams** - Auto-generates architecture diagrams
- 🎨 **Professional Formatting** - Follows Marp best practices
- 🔄 **Two-Phase Workflow** - Research → Create

## 📋 Prerequisites

### 1. Install Ollama

```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Or download from: https://ollama.com
```

### 2. Pull a Model

```bash
# Recommended: Qwen 2.5 Coder (excellent for technical content)
ollama pull qwen2.5-coder:7b

# Alternatives:
ollama pull llama3.2        # General purpose
ollama pull codellama      # Code-focused
ollama pull mistral        # Fast and capable
```

### 3. Install Dependencies

```bash
cd vs-zinios
npm install
```

### 4. (Optional) Set up MCP Servers

For enhanced capabilities, set up these MCP servers:

**Brave Search** (web search):
```bash
export BRAVE_API_KEY="your-brave-api-key"
# Get key from: https://brave.com/search/api/
```

**GitHub/Octocode** (code search):
```bash
export GITHUB_TOKEN="your-github-token"
# Get token from: https://github.com/settings/tokens
```

## 🎯 Usage

### Basic Usage

```bash
npm run ai:generate "Your Topic Here"
```

### Examples

```bash
# Generate presentation on REST APIs
npm run ai:generate "Building REST APIs with Node.js and Express"

# Generate presentation on Docker
npm run ai:generate "Docker Containers: Development to Production"

# Generate presentation on React
npm run ai:generate "Modern React with Hooks and Server Components"

# Generate presentation on Kubernetes
npm run ai:generate "Kubernetes Orchestration and Best Practices"
```

### Advanced Options

```bash
# Use different Ollama model
OLLAMA_MODEL=llama3.2 npm run ai:generate "Your Topic"

# Use Ollama on different host
OLLAMA_BASE_URL=http://192.168.1.100:11434 npm run ai:generate "Your Topic"

# Direct script usage
node ai-generator/generate.js "Your Topic Here"
```

## 📁 Project Structure

```
ai-generator/
├── generate.js           # Main generator script
├── mcp-config.json      # MCP server configuration
└── README.md            # This file
```

## 🔧 How It Works

### Two-Phase Workflow

**PHASE 1: Information Gathering**
1. ✅ `read_existing_presentation` - Learn Marp style
2. 🔍 `search_web` - Find current information (via brave-search MCP)
3. 🐙 `search_github` - Find code examples (via octocode MCP)
4. 📚 `fetch_documentation` - Get official docs (via fetch/context7 MCP)

**PHASE 2: Content Creation**
5. 📊 `create_diagram` - Generate Mermaid diagrams
6. 📐 `create_two_column_layout` - Create comparison slides
7. 💾 `save_presentation` - Save to `slides/demo-presentation.md`

### Tool Annotations

Each tool has clear documentation:
- **WHEN TO USE**: Specific scenarios for the tool
- **MCP SERVER**: Which MCP server it uses
- **EXAMPLES**: Practical usage examples

## 🔌 MCP Configuration

The `mcp-config.json` defines available MCP servers:

### Required MCPs
- **filesystem** - Read local files (existing presentation)

### Recommended MCPs
- **brave-search** - Web search for current info
- **octocode** - GitHub search for code/repos
- **fetch** - Fetch documentation pages

### Optional MCPs
- **context7** - Library docs (React, Next.js, etc.)

### MCP Server Details

| MCP | Purpose | Use For | Setup |
|-----|---------|---------|-------|
| **brave-search** | Web search | Latest trends, tools, practices | `BRAVE_API_KEY` |
| **octocode** | GitHub search | Code examples, MCP servers | `GITHUB_TOKEN` |
| **fetch** | HTTP requests | Documentation pages | No setup |
| **filesystem** | File access | Read existing presentation | Auto (workspace) |
| **context7** | Library docs | Official API references | No setup |

## 📖 Generated Presentation Structure

The generator creates presentations with:

1. **Title Slide**
   - Topic name
   - Subtitle
   - No pagination/footer

2. **Hook Slide**
   - Engaging introduction
   - Problem/opportunity

3. **3-5 Sections**
   - Section intro (lead class)
   - 3-5 content slides per section
   - Mermaid diagrams
   - Two-column layouts
   - Code examples

4. **Conclusion**
   - Key takeaways
   - Best practices

5. **End Slides**
   - Questions
   - Thank you

### Features Included

- ✅ Mermaid diagrams (2-4 per presentation)
- ✅ Two-column layouts for comparisons
- ✅ Code snippets (when relevant)
- ✅ Speaker notes for each slide
- ✅ Professional formatting
- ✅ Consistent theme (rose-pine-dawn)

## 🎨 Preview & Export

### Preview Generated Presentation

```bash
# Start dev server
npm run dev

# Open in browser
open http://localhost:8080/demo-presentation.md
```

### Build HTML

```bash
npm run build
# Opens: slides/demo-presentation.html
```

### Export to PPTX

```bash
npm run export
# Creates: slides/demo-presentation.pptx
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OLLAMA_MODEL` | Ollama model to use | `qwen2.5-coder:7b` |
| `OLLAMA_BASE_URL` | Ollama server URL | `http://localhost:11434` |
| `BRAVE_API_KEY` | Brave Search API key | (optional) |
| `GITHUB_TOKEN` | GitHub personal access token | (optional) |
| `WORKSPACE_PATH` | Path to workspace for filesystem MCP | Auto-detected |

### Recommended Models

| Model | Size | Best For | Speed |
|-------|------|----------|-------|
| **qwen2.5-coder:7b** | 4.7GB | Technical content, code | Fast |
| **llama3.2** | 2.0GB | General topics | Very fast |
| **codellama** | 3.8GB | Code-heavy presentations | Fast |
| **mistral** | 4.1GB | Balanced content | Fast |
| **llama3.1:8b** | 4.7GB | Detailed content | Medium |

### Model Selection Guide

```bash
# For technical/coding topics:
OLLAMA_MODEL=qwen2.5-coder:7b npm run ai:generate "REST APIs"

# For general business topics:
OLLAMA_MODEL=llama3.2 npm run ai:generate "Project Management"

# For maximum quality (slower):
OLLAMA_MODEL=llama3.1:8b npm run ai:generate "Complex Topic"
```

## 🐛 Troubleshooting

### Error: Cannot connect to Ollama

```bash
# Make sure Ollama is running
ollama serve

# Or check if it's already running
ps aux | grep ollama
```

### Error: Model not found

```bash
# Pull the model first
ollama pull qwen2.5-coder:7b

# List available models
ollama list
```

### Slow Generation

```bash
# Use a smaller/faster model
OLLAMA_MODEL=llama3.2 npm run ai:generate "Topic"

# Check Ollama performance
ollama ps
```

### MCP Server Not Working

```bash
# Check environment variables
echo $BRAVE_API_KEY
echo $GITHUB_TOKEN

# Test MCP manually (if using npx)
npx -y @modelcontextprotocol/server-brave-search
```

### Generated Content Issues

If the generated presentation needs improvement:

1. **Try a different model**: `qwen2.5-coder:7b` is best for technical content
2. **Edit manually**: The generated markdown is meant to be refined
3. **Run again**: Each generation is unique
4. **Check phase execution**: Ensure Phase 1 tools ran successfully

## 💡 Tips for Best Results

### 1. Be Specific with Topics

✅ Good:
- "Building RESTful APIs with Node.js, Express, and PostgreSQL"
- "React Server Components: Patterns and Best Practices"
- "Docker Multi-stage Builds for Production"

❌ Too vague:
- "APIs"
- "React"
- "Docker"

### 2. Include Context

Add what aspect you want to focus on:
- "GraphQL for beginners"
- "Advanced Kubernetes networking"
- "React performance optimization techniques"

### 3. Choose Right Model

- **Technical topics**: `qwen2.5-coder:7b`
- **General topics**: `llama3.2`
- **Code-heavy**: `codellama`

### 4. Set Up MCPs

For best results, configure:
- Brave Search (current information)
- Octocode (code examples)

### 5. Review and Refine

The generator creates a solid foundation. Always:
- Review for accuracy
- Adjust diagrams
- Refine speaker notes
- Add your expertise

## 🔄 Example Workflow

```bash
# 1. Generate presentation
npm run ai:generate "Building Microservices with Node.js"

# 2. Preview
npm run dev
# Open: http://localhost:8080/demo-presentation.md

# 3. Edit if needed
code slides/demo-presentation.md

# 4. Build HTML
npm run build

# 5. Export to PPTX
npm run export

# 6. Present!
open slides/demo-presentation.pptx
```

## 📚 Examples of Generated Content

The generator creates presentations with:

### Slide Types
- **Title slides** with proper front matter
- **Section intros** with lead class
- **Content slides** with diagrams + text
- **Comparison slides** with two columns
- **Code examples** with syntax highlighting
- **Conclusion slides** with key takeaways

### Mermaid Diagrams
- **Flowcharts** for processes (graph LR)
- **Sequence diagrams** for interactions
- **State diagrams** for FSM
- **Class diagrams** for structure

### Formatting
- Proper YAML front matter
- Consistent theme (rose-pine-dawn)
- Speaker notes on key slides
- Professional typography

## 🚀 Advanced Usage

### Custom MCP Servers

Edit `mcp-config.json` to add your own MCPs:

```json
{
  "mcpServers": {
    "your-mcp": {
      "command": "npx",
      "args": ["-y", "your-mcp-package"],
      "description": "Your MCP description",
      "useFor": ["What it's used for"]
    }
  }
}
```

### Modify System Prompt

Edit `generate.js` to customize the system prompt:

```javascript
const systemPrompt = `Your custom prompt...`;
```

### Add New Tools

Add tools to `phase1Tools` or `phase2Tools`:

```javascript
new DynamicStructuredTool({
  name: 'your_tool',
  description: 'Tool description with WHEN TO USE section',
  schema: z.object({ /* params */ }),
  func: async (params) => { /* implementation */ }
})
```

## 📄 License

MIT - Same as parent project

## 🤝 Contributing

Contributions welcome! Areas for improvement:

- Additional MCP integrations
- More diagram templates
- Better content generation prompts
- Support for more Ollama models
- Enhanced tool annotations

---

**Need help?** Check the main project README or open an issue!

