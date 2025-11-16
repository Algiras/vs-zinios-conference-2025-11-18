# Autonomous Development Workflows

**Building AI Systems That Code Independently**

A comprehensive presentation on creating autonomous development systems using AI agents, covering everything from foundational concepts to production-ready patterns.

**Presenter**: Algimantas Krasauskas | AI Tool Developer at Wix  
**Event**: Wix VS Žinios Conference | November 2025  
**Duration**: 45-50 minutes + Q&A

## 📊 Presentation Overview

This presentation explores how to build AI systems that autonomously complete programming tasks, moving beyond simple LLM interactions to structured, production-ready autonomous workflows.

### What You'll Learn

1. **Foundations** - Understanding workflows vs autonomous systems
2. **Agent Types** - Reflex and Learning agents
3. **Architecture Patterns** - FSM, Behavior Trees, GOAP, and ReAct
4. **Model Context Protocol** - Standardized tool/resource definitions
5. **Production Patterns** - What actually works at scale
6. **Frameworks** - Python, TypeScript, and orchestration tools
7. **Real Examples** - Multi-agent systems in action
8. **Best Practices** - Design principles and common pitfalls
9. **Getting Started** - Practical 8-step guide to build your first system

### Key Concepts Covered

- **Autonomous Workflows**: Self-directed systems that make decisions without human intervention
- **Agent Architectures**: From simple reflex agents to complex learning systems
- **Control Patterns**: FSM (state-based), Behavior Trees (hierarchical), GOAP (planning), ReAct (reasoning+acting)
- **MCP (Model Context Protocol)**: The "USB standard" for AI agent tools
- **Production Patterns**: AI Gateway, Scratchpad, Control Flows (queue/stack/async)
- **Wix Implementation**: Real-world patterns used in production

## 🚀 Quick Start

### View the Presentation

**Online (Recommended)**:
- **Light Theme**: [GitHub Pages - Light](https://algiras.github.io/vs-zinios-conference-2025-11-18/)
- **Dark Theme**: [GitHub Pages - Dark](https://algiras.github.io/vs-zinios-conference-2025-11-18/dark.html)

**Local Development**:
```bash
# Clone the repository
git clone https://github.com/Algiras/vs-zinios-conference-2025-11-18.git
cd vs-zinios-conference-2025-11-18

# Install dependencies
npm install

# Start dev server (light theme)
npm run dev

# Start dev server (dark theme)
npm run dev:dark

# Open http://localhost:8080 in your browser
```

**Generate Downloads**:
```bash
# Generate PowerPoint (PPTX) - 16:9 format
npm run export

# Generate PDF
npm run export:pdf

# Outputs will be in slides/ directory
```

**Or Download from GitHub Actions Artifacts**:
- Check the [latest workflow run](https://github.com/Algiras/vs-zinios-conference-2025-11-18/actions) for downloadable artifacts

## 🎯 For Presenters

### Speaker Notes

Comprehensive speaker notes are included:
- **Inline**: HTML comments in `slides/presentation.md` for quick reference
- **Complete Guide**: `SPEAKER_NOTES.md` with detailed notes, timing, transitions, and Q&A prep

**Presentation Structure** (45-50 minutes):
1. Opening Hook (5 min) - The Challenge
2. Part 1: Foundations (5 min) - Workflows vs Autonomous Systems
3. Part 2: Agent Types (6-7 min) - Reflex vs Learning
4. Part 3: Patterns (10-12 min) ⭐ - FSM, BT, GOAP, ReAct
5. Part 4: MCP (6-7 min) - Standardization
6. Part 5: Production (8-10 min) ⭐ - What Works
7. Part 6: Frameworks (5-6 min) - Tools Overview
8. Part 7: Examples (8-10 min) ⭐ - Real Systems
9. Part 8: Best Practices (6-7 min) - Pitfalls & Advice
10. Part 9: Conclusion (5-7 min) - Takeaways & Vision

### Customization

All slides are in `slides/presentation.md` (Markdown format):
- Easy to edit and version control
- Mermaid diagrams for architecture visualization
- QR codes for links (GitHub, LinkedIn)
- Two themes: Light (rose-pine-dawn) and Dark (rose-pine-moon)

## 🎓 For Learners

### Getting Started Guide

New to autonomous development? Start here:

**[Getting Started Guide](docs/getting-started.md)** - 8-step practical guide:
1. Choose your first use case
2. Pick the right architecture pattern
3. Set up your environment
4. Implement and iterate
5. Add memory and context
6. Test and observe
7. Optimize and scale
8. Learn from production

### Documentation

**[Complete Documentation Index](docs/README.md)** includes:

- **[Model Context Protocol (MCP)](docs/mcp/)** - Standardized tools/resources
  - Architecture overview
  - Tool definitions
  - Resource management
  
- **[Agent Architectures](docs/agents/)** - Patterns and implementations
  - [Reflex Agents](docs/agents/reflex-agents.md) - Simple, reactive
  - [Learning Agents](docs/agents/learning-agents.md) - Adaptive systems
  - [Finite State Machines](docs/agents/finite-state-machines.md) - State-based control
  - [Behavior Trees](docs/agents/behavior-trees.md) - Hierarchical decision-making
  - [GOAP (Goal-Oriented Action Planning)](docs/agents/goap.md) - Tree of Thought with Pruning
  - [Scratchpad Pattern](docs/agents/scratchpad-pattern.md) - Memory management

- **[Frameworks](docs/frameworks/)** - Tools and libraries
  - [Python Frameworks](docs/frameworks/python-frameworks.md) - LangChain, AG2, CrewAI
  - [TypeScript Frameworks](docs/frameworks/typescript-frameworks.md) - VoltAgent, LangChain.js
  - [Workflow Orchestration](docs/frameworks/workflow-orchestration.md) - n8n, Temporal

### Reference Repositories

Example implementations (see `repos/` directory):
- **AG2** (AutoGen) - Multi-agent conversations
- **LangChain** - Python & TypeScript implementations
- **VoltAgent** - TypeScript agent framework

## 🛠️ Development Workflow

### Development Commands

```bash
# Development (hot reload)
npm run dev              # Light theme at http://localhost:8080
npm run dev:dark         # Dark theme at http://localhost:8080

# Build (generate HTML)
npm run build            # Creates presentation.html + presentation-dark.html

# Preview (without watching)
npm run preview          # Serve without hot reload

# Export
npm run export           # Generate PPTX + slide images
npm run export:pptx      # PPTX only
npm run export:pdf       # Generate PDF
npm run export:images    # PNG images only

# Linting
npm run lint:mermaid     # Validate Mermaid diagrams
```

### How the Build Process Works

**1. Source File**: `slides/presentation.md`
- Markdown with Marp front matter
- Includes Mermaid diagrams (` ```mermaid ... ``` `)
- Includes QR codes (`![QR Code](qr:https://...)`)
- References local images (`images/profile.jpeg`, `images/wix_logo.svg`)

**2. Preprocessing** (`npm run build` step 1):
```bash
node scripts/preprocess-for-pdf.js
```
- Converts Mermaid code blocks → PNG images via Kroki API
- Generates QR codes → PNG images via qrcode library
- Replaces markdown syntax with image references
- Output: `slides/presentation.preprocessed.md`

**3. HTML Generation** (`npm run build` step 2):
```bash
node scripts/build-html.js
```
- Uses Marp CLI to convert preprocessed markdown → HTML
- Generates two versions with different themes:
  - `presentation.html` (light theme - rose-pine-dawn)
  - `presentation-dark.html` (dark theme - rose-pine-moon)
- Includes all images from `slides/images/`

**4. Deployment** (GitHub Actions):
- Runs on push to `main` branch
- Executes `npm run build`
- Copies HTML + images to `public/` directory
- Deploys to GitHub Pages
- Result: https://algiras.github.io/vs-zinios-conference-2025-11-18/

### File Structure

```
vs-zinios/
├── slides/
│   ├── presentation.md              # ⭐ Main source file (EDIT THIS)
│   ├── presentation.preprocessed.md # Generated (gitignored)
│   ├── presentation.html            # Generated (gitignored)
│   ├── presentation-dark.html       # Generated (gitignored)
│   ├── presentation.pptx            # Generated (gitignored)
│   ├── presentation.pdf             # Generated (gitignored)
│   └── images/                      # Images (tracked in git)
│       ├── profile.jpeg             # Profile photo
│       ├── wix_logo.svg             # Wix logo
│       ├── mermaid/                 # Generated diagrams (gitignored)
│       └── qr/                      # Generated QR codes (gitignored)
│
├── themes/
│   ├── rose-pine-dawn.css           # Light theme (default)
│   └── rose-pine-moon.css           # Dark theme
│
├── scripts/
│   ├── preprocess-for-pdf.js        # Mermaid + QR preprocessing
│   ├── build-html.js                # HTML generation
│   ├── export-with-validation.js    # PPTX export workflow
│   └── slides-to-image.js           # PNG slide generation
│
├── docs/                            # Reference documentation
│   ├── README.md                    # Documentation index
│   ├── getting-started.md           # Practical guide for beginners
│   ├── mcp/                         # Model Context Protocol
│   ├── agents/                      # Agent architectures
│   └── frameworks/                  # Framework comparisons
│
├── repos/                           # Reference code (gitignored)
│   ├── ag2/                         # AutoGen examples
│   ├── langchain-python/            # LangChain Python
│   └── voltagent/                   # VoltAgent TypeScript
│
├── .github/workflows/
│   └── generate-slides.yml          # CI/CD for GitHub Pages
│
├── SPEAKER_NOTES.md                 # Complete presentation guide
├── package.json                     # NPM scripts
├── .marprc.yml                      # Marp configuration
└── README.md                        # This file
```

### Themes

**Light Theme** (rose-pine-dawn):
- Warm beige background (#faf4ed)
- High contrast for projectors
- Default theme

**Dark Theme** (rose-pine-moon):
- Deep purple background (#232136)
- Easy on eyes in dark rooms
- Alternative theme

Switch themes by editing `slides/presentation.md`:
```yaml
theme: rose-pine-dawn  # or rose-pine-moon
```

## 📚 Additional Resources

### Documentation Files

- **[AGENTS.md](AGENTS.md)** - Project structure guide for AI agents
- **[SPEAKER_NOTES.md](SPEAKER_NOTES.md)** - Complete speaker guide with timing
- **[docs/README.md](docs/README.md)** - Documentation index
- **[.cursorrules](.cursorrules)** - Cursor IDE rules for this project

### External Resources

**Frameworks**:
- [LangChain](https://www.langchain.com/) - Most popular, general-purpose
- [AG2 (AutoGen)](https://github.com/ag2ai/ag2) - Multi-agent conversations
- [CrewAI](https://github.com/joaomdmoura/crewAI) - Role-based agents
- [VoltAgent](https://github.com/VoltAgent/VoltAgent) - TypeScript framework

**Standards**:
- [Model Context Protocol](https://modelcontextprotocol.io/) - Tool/resource standardization
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling) - Tool definitions

**Research**:
- [ReAct: Synergizing Reasoning and Acting](https://arxiv.org/abs/2210.03629)
- [Behavior Trees in Robotics and AI](https://arxiv.org/abs/1709.00084)
- [GOAP: Goal-Oriented Action Planning](http://alumni.media.mit.edu/~jorkin/goap.html)

### Contact & Links

**Presenter**:
- **GitHub**: [github.com/Algiras](https://github.com/Algiras)
- **LinkedIn**: [linkedin.com/in/asimplek](https://www.linkedin.com/in/asimplek/)
- **Company**: [Wix.com](https://www.wix.com)

**Presentation Repository**:
- **Source**: [github.com/Algiras/vs-zinios-conference-2025-11-18](https://github.com/Algiras/vs-zinios-conference-2025-11-18)
- **Live Demo**: [GitHub Pages](https://algiras.github.io/vs-zinios-conference-2025-11-18/)

## 🤝 Contributing

Found an issue or want to improve the presentation?

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Edit `slides/presentation.md`
4. Test locally (`npm run dev`)
5. Commit changes (`git commit -m 'feat: add improvement'`)
6. Push to branch (`git push origin feature/improvement`)
7. Open a Pull Request

## 📄 License

MIT License - Feel free to use this presentation as a template for your own talks!

## 🙏 Acknowledgments

- **Wix** - For supporting this presentation and providing real-world production insights
- **Marp** - Amazing presentation framework
- **Model Context Protocol** - For standardizing agent interactions
- **Open Source Community** - For all the frameworks and tools referenced

---

**Ready to build autonomous systems?** Start with the [Getting Started Guide](docs/getting-started.md)! 🚀
