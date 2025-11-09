# Autonomous Development Workflows

## Description

This presentation will showcase how to create and configure work environments that enable Large Language Models (LLMs) to autonomously complete programming tasks. We'll explore the integration of modern AI tools into development processes, automated code generation strategies, and methods for building reliable infrastructure that can independently solve programming challenges.

The talk will demonstrate practical examples of setting up AI agents capable of performing code writing, testing, and review tasks. We'll examine which tools and technologies to use, how to ensure code quality and security, and how to integrate these solutions into existing development workflows.

Participants will learn about best practices for creating autonomous workflows, methods for managing AI model performance and limitations, and how these solutions can transform traditional software development approaches in the future.

**Target Audience**: Developers focusing on building autonomous coding flows


## Key points

When creating autonomous workflows there are 3 distinct environments they can run in:
- local (cli-based, sometimes even a combination of shell or other type of scripts)
- remote (remote ui-based with single running agent)
- distributed remote (remote ui-based with distribution element, that allows scheduling and executing many requests)

We want to also cover defintion of:
- workflow
- autonomous workflow (aka. agentic workflows)
  - reflex agent (need a diagram for this. e.g. termostat)
    - Trigger -> Action
  - learning agent (need a diagram for this. e.g. system that learn from environoment)
    - FSM ->
    - Behavior Trees ->
    - GOAP ->
    - Utility based agent ->
    - Learning (FOCUS HERE)
- Importance of memory and feedback cycles
- Tools and Resource defintion based on MCPs


When we have definitions we want to state what works and was does not:
- seperate step/agent for planning
- seperate step/agent for information gathering
- continues workflow with ability for agent to schedule and manage control flows:
  - queue
  - stacks
  - async abstractions that allow multiple agents/system share resources using semapharoes 
  - Adaptive patterns like JSONRPC2 other stdio 
 - annotation based description of tools
 - visibility of controlled resources 
   - priority
   - scoping
 - enriched reasoning
 - custom control flows that don't relly on native tool calling
 - scratchpad pattern


Available frameworks:
- python
  - 
- typescript




What do we use at wix:
- knowledge base pattern (Infrastrucute to easily build/test semantic knowledge bases)
- workflow orcehstration system (internal ones and external ones like n8n)
- AI Gateway adapter layer to shift between models in the same workflow based on performance & cost
- Internal LLM tooling to cover up to 80% of daily work so users can focus on what LLM's can't do
  
In practical examples we want to cover workflow diagrams showcasing how one can plug similar agent/pattern in language agnostic way for opaque workflow



## Development Workflow

### Setup

Install dependencies:

```bash
npm install
```

### Development

Start the development server with hot reload:

```bash
npm run dev
```

This will:
- Watch for changes in `slides/presentation.md`
- Auto-reload in browser when changes are made
- Open at http://localhost:8080

### Preview

Preview the slides without watching for changes:

```bash
npm run preview
```

### Build

Generate HTML output:

```bash
npm run build
```

Output: `slides/presentation.html`

### Export

Export to PowerPoint (PPTX):

```bash
npm run export
```

Output: `slides/presentation.pptx` (16:9 format)

Export to PDF:

```bash
npm run export:pdf
```

Output: `slides/presentation.pdf`

## Requirements

Please prepare your presentations using PowerPoint (16:9, .ppt or .pptx format).
Please send your presentations by November 13th, 2:00 PM.
If you plan to demonstrate code or use your own computer, please make sure to inform us in advance and have the necessary adapter.

## Project Structure

```
vs-zinios/
├── slides/
│   └── presentation.md       # Main presentation file (Marp format)
├── docs/
│   ├── README.md            # Documentation index
│   ├── mcp/                 # Model Context Protocol docs
│   ├── agents/              # Agent architecture docs
│   └── frameworks/          # Framework documentation
├── repos/                   # Reference repositories (gitignored)
├── package.json             # NPM scripts and dependencies
└── .marprc.yml             # Marp CLI configuration
```

## Marp Features

The presentation uses Marp with:
- ✅ Mermaid diagram support
- ✅ 16:9 aspect ratio
- ✅ Pagination
- ✅ Code syntax highlighting
- ✅ Export to PPTX/PDF/HTML

## Documentation

See `docs/README.md` for comprehensive documentation index covering:
- Model Context Protocol (MCP)
- Agent architectures (Reflex, Learning, FSM, BT, GOAP)
- Python and TypeScript frameworks
- Workflow orchestration and AI gateways
- Practical examples and best practices
