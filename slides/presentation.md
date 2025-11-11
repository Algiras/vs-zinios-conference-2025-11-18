---
marp: true
size: 16:9
theme: rose-pine-dawn
paginate: true
html: true
header: 'Autonomous Development Workflows'
footer: 'Algimantas Krasauskas | Wix | November 2025'
style: |
  /* Header */
  header {
    position: absolute;
    top: 20px;
    left: 30px;
    right: 30px;
    font-size: 0.9em;
    color: #666;
    text-align: left;
    z-index: 1;
  }
  
  /* Footer */
  footer {
    position: absolute;
    bottom: 15px;
    left: 30px;
    right: 30px;
    font-size: 0.9em;
    color: #666;
    text-align: center;
    z-index: 1;
  }
  section[data-marpit-footer=""] footer {
    display: none;
  }
  
  /* Pagination - let theme handle it, just position it */
  section::after {
    position: absolute;
    bottom: 15px;
    right: 30px;
    font-size: 0.8em;
    color: #666;
    z-index: 1;
  }
  section[data-marpit-pagination=""]::after {
    display: none;
  }
  
  /* Section & Text */
  section {
    font-size: 28px;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    padding-left: 1.5em;
    padding-right: 1.5em;
    padding-top: 4em;
    padding-bottom: 3.5em;
  }
  h1 {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }
  h2 {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }
  
  /* Ensure first element in section doesn't overlap header */
  section > *:first-child {
    margin-top: 0.3em;
  }
  
  /* Extra spacing for diagrams and code blocks */
  section > p:first-child img,
  section > p:first-child code {
    margin-top: 0.5em;
  }
  
  /* Images - Mermaid diagrams */
  img[src*="mermaid"],
  .mermaid-diagram img {
    max-width: 85% !important;
    max-height: 55% !important;
    width: auto !important;
    height: auto !important;
    object-fit: contain !important;
    display: block !important;
    margin: 0.8em auto !important;
    clear: both !important;
  }
  
  /* Ensure diagrams don't overlap with headers/footers */
  section img[src*="mermaid"] {
    margin-top: 1em !important;
    margin-bottom: 0.5em !important;
  }
  
  /* Prevent diagrams from overlapping header - extra margin after headings */
  section h2 + p img[src*="mermaid"],
  section h2 + * img[src*="mermaid"],
  section h1 + p img[src*="mermaid"],
  section h1 + * img[src*="mermaid"] {
    margin-top: 0.8em !important;
  }
  
  /* Ensure code blocks don't overlap header */
  section pre,
  section code {
    margin-top: 0.5em;
  }
  
  /* QR codes - smaller, centered */
  img[src*="qr"],
  img[src*="qr/"] {
    max-width: 200px !important;
    max-height: 200px !important;
    width: auto;
    height: auto;
    object-fit: contain;
    display: block;
    margin: 0.5em auto;
  }
  
  /* Column Layouts - consistent styling for all slides */
  section .columns,
  section .reflex-columns,
  section .takeaways-grid,
  section .resources-grid {
    display: grid !important;
    grid-template-columns: 1.1fr 0.9fr !important;
    gap: 1em !important;
    width: 100% !important;
    margin: 0.5em 0 !important;
    align-items: start !important;
  }
  section .columns > div,
  section .reflex-columns > div,
  section .takeaways-grid > div,
  section .resources-grid > div {
    display: block !important;
    min-width: 0;
    padding: 0 0.5em;
    box-sizing: border-box;
    overflow: hidden;
    font-size: 0.88em !important;
    line-height: 1.4 !important;
    margin: 0 !important;
  }
  section .columns > div p,
  section .reflex-columns > div p {
    margin: 0.4em 0 !important;
  }
  section .columns > div ul,
  section .reflex-columns > div ul {
    margin: 0.4em 0 !important;
    padding-left: 1.2em !important;
  }
  
  /* Diagrams in columns - consistent sizing */
  section .columns img[src*="mermaid"],
  section .reflex-columns img[src*="mermaid"] {
    max-height: 40% !important;
    max-width: 90% !important;
    margin: 0.3em auto !important;
  }
  
  /* Headings - consistent across all slides */
  section h2 {
    margin-top: 0.2em !important;
    margin-bottom: 0.6em !important;
  }
  section .reflex-columns { 
    font-size: 0.9em !important; 
    margin: 2.2em 0 !important; 
    gap: 2.2em !important; 
  }
  section .reflex-columns h3, 
  section .takeaways-grid h3 { 
    margin: 0 0 0.4em 0; 
  }
  section .takeaways-grid { 
    font-size: 0.95em !important; 
    line-height: 1.45 !important; 
    gap: 2.4em !important; 
  }
  section .takeaways-grid h3 { 
    margin: 0 0 0.45em 0; 
  }
  section .takeaways-grid ul { 
    margin: 0 0 1em 0; 
  }
  
  /* Flex-based layouts */
  section .mcp-highlights,
  section .gateway-summary {
    display: flex !important;
    gap: 1.5em !important;
    width: 100% !important;
  }
  section .mcp-highlights > div,
  section .gateway-summary > div {
    flex: 1 !important;
    display: block !important;
    min-width: 0;
  }
  
  section .resources-grid {
    font-size: 0.9em !important;
    gap: 2em !important;
  }
  section .resources-grid div {
    background: #f7f7f7 !important;
    padding: 1em 1.2em !important;
    border-radius: 8px !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
  }
  section .resources-grid h4 { margin: 0 0 0.25em 0; font-size: 1.05em; }
  section .resources-grid p { margin: 0; }
  section .resources-grid a { color: #1565c0; text-decoration: none; }
  
  /* Lead slide - Marp's built-in lead class centers content */
  /* Theme handles centering, we just ensure proper styling */
  section.lead {
    padding-top: 0;
    padding-bottom: 0;
  }
  section.lead h1 {
    font-size: 2.5em;
    margin-bottom: 0.5em;
  }
  section.lead p {
    font-size: 1.2em;
    opacity: 0.9;
  }
  section.lead header,
  section.lead footer {
    display: none;
  }
---

<!-- _paginate: false -->
<!-- _footer: "" -->
<!-- _class: lead -->

# Autonomous Development Workflows

Building AI Systems That Code Independently

---

## About Me

**🧑‍💻 Algimantas Krasauskas**  
AI Tool Developer at Wix

**Focus:** Autonomous AI systems | LLM orchestration | Developer productivity

**Background**: Building scalable AI systems & intelligent workflows

**GitHub**: https://github.com/Algiras/vs-zinios-conference-2025-11-18

---

## Our Talk Today

**Learn how to build work environments where LLMs autonomously complete programming tasks**

**Topics**:
- Autonomous workflow environments and architectures
- Agent types and decision-making patterns
- What works (and what doesn't) in production
- Available frameworks and tools
- Real-world implementation patterns

---

## Three Deployment Environments

<div class="columns">
<div>

### 1. Local (CLI-Based)
Shell scripts, command-line tools | Direct developer interaction | Fast iteration

### 2. Remote (Single Agent)  
Web UI with one running agent | Centralized execution | User-initiated workflows

</div>
<div>

### 3. Distributed Remote
Multi-agent coordination | Scheduling and task distribution | Production-scale systems

</div>
</div>

---

## What is a Workflow?

**Sequence of steps to accomplish a task**

<div class="columns">
<div>

```mermaid
graph LR
    Input --> Process --> Output
```

</div>
<div>

**Examples**:
- CI/CD: Code → Test → Deploy
- Data: Extract → Transform → Load
- Review: Submit → Analyze → Merge

</div>
</div>


---

## What is an Autonomous Workflow?

**Autonomous Workflow** (Agentic Workflow): A system that makes decisions and takes actions without human intervention

**Key Characteristics**:
- Self-directed decision making
- Adaptive to changing conditions
- Continuous execution without supervision
- Learn from outcomes (in advanced systems)

---

## Agent Types: Overview

<div class="columns">
<div>

### Reflex Agents
- React to current input only
- No memory of past states
- Fast, simple, predictable

</div>
<div>

### Learning Agents
- Improve from experience
- Maintain state and memory
- Adapt behavior over time

</div>
</div>

<style scoped>
.columns { display: grid; grid-template-columns: 1fr 1fr; gap: 2em; }
.columns h3 { margin: 0 0 0.5em 0; font-size: 1.3em; }
.columns ul { margin: 0; padding-left: 1.2em; line-height: 1.5; }
section { padding-bottom: 3em !important; }
</style>

---

## Reflex Agent: The Thermostat

**🌡️ Simple Rule-Based System**

<div class="columns">
<div>

```mermaid
graph LR
    SENSOR["Sensor"] --> RULE["Rules"] --> HEATER["Heater"]
    style SENSOR fill:#e1f5ff
    style RULE fill:#fff3e0
    style HEATER fill:#ffebee
```

</div>
<div>

**Rules**: `IF temp < 20°C → ON` | `IF temp > 22°C → OFF`

**Pattern**: Sensor → Condition → Action

**Key**: No memory • Instant • Simple

</div>
</div>

<style scoped>
.columns { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 1em; }
img[src*="mermaid"] { max-height: 35% !important; max-width: 80% !important; margin: 0.3em auto !important; }
section { padding-bottom: 3.5em !important; padding-top: 4em !important; }
.columns div { font-size: 0.82em; line-height: 1.3; margin: 0; }
.columns div p { margin: 0.3em 0; }
h2 { margin-bottom: 0.5em !important; }
</style>

---

## Reflex Agent: Characteristics

<div class="reflex-columns">
<div>

### Strengths
- ⚡ Instant reaction to sensor input
- 💰 Low operational cost
- 🎯 Predictable, explainable behavior
- 🐛 Easy to debug and reason about

</div>
<div>

### Constraints
- 🚫 No planning or foresight
- 📚 Cannot learn new responses
- 🔧 Rigid rules require manual updates
- 🌍 Limited to narrow environments

</div>
</div>

---

## Learning Agent: Components

**🧠 Four Key Elements**

<div class="columns">
<div>

```mermaid
graph LR
    PERF["Performance"] --> LEARN["Learning"]
    CRITIC["Critic"] --> LEARN
    LEARN --> PROB["Problem Gen"]
    PROB --> PERF
    
    style PERF fill:#e3f2fd
    style LEARN fill:#c8e6c9
    style CRITIC fill:#fff3e0
    style PROB fill:#f3e5f5
```

</div>
<div>

**Components**:
- **Performance**: Selects actions
- **Learning**: Improves over time
- **Critic**: Provides feedback
- **Problem Generator**: Suggests exploration

**Key**: Agent improves through experience

</div>
</div>

<style scoped>
.columns { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 1.2em; }
img[src*="mermaid"] { max-height: 42% !important; max-width: 88% !important; margin: 0.4em auto 0.6em auto !important; }
section { padding-bottom: 3.8em !important; padding-top: 4.2em !important; }
.columns div { font-size: 0.9em; line-height: 1.6; margin: 0; padding: 0.2em 0; }
.columns div p { margin: 0.6em 0; }
.columns div ul { margin: 0.5em 0; padding-left: 1.2em; }
h2 { margin-bottom: 0.6em !important; margin-top: 0.2em !important; }
</style>

---

## Finite State Machines (FSM)

**State-Based Decision Making**

<div class="columns">
<div>

```mermaid
graph LR
    Commit[Commit] --> Analyzing[Analyzing]
    Analyzing --> Testing[Testing]
    Testing -->|Pass| Approved[Approved]
    Testing -->|Critical| Rejected[Rejected]
    Rejected -->|Fix| Analyzing
    
    style Commit fill:#e1f5ff
    style Analyzing fill:#fff3e0
    style Testing fill:#f3e5f5
    style Approved fill:#c8e6c9
    style Rejected fill:#ffebee
```

</div>
<div>

**Use Case**: CI/CD pipelines, workflows, automation

**Key**: Clear • Predictable • Debuggable • Workflow-friendly

</div>
</div>


---

## Behavior Trees (BT)

**🌳 Hierarchical Task Decomposition**

<div class="columns">
<div>

```mermaid
graph LR
    ROOT["🎯 Root"] --> A["📊 Analyze"]
    A --> L["Lint"]
    L --> T["Type Check"]
    ROOT --> B["🔨 Build"]
    B --> C["Compile"]
    C --> E["Test"]
    ROOT --> S["⏭️ Skip"]
    style ROOT fill:#FFD700
    style A fill:#87CEEB
    style B fill:#90EE90
    style S fill:#FFB6C1
```

</div>
<div>

**Selector** = first success  
**Sequence** = all in order

**Use Cases**:
- Game AI
- Task planning
- Decision trees
- Hierarchical workflows

</div>
</div>


---

## GOAP: Goal-Oriented Action Planning

**🚀 Dynamic Planning**

<div class="columns">
<div>

```mermaid
graph LR
    S["Write Tests<br/>(cost: 3)"] --> A["Implement<br/>(cost: 5)"]
    A --> F["Fix Code<br/>(cost: 2)"]
    style S fill:#ffcccc
    style F fill:#ccffcc
```

</div>
<div>

**Total Cost**: 10  
**Method**: A* pathfinding

**Key Features**:
- Cost-based planning
- Dynamic pathfinding
- Goal-oriented actions
- Optimal solutions

</div>
</div>

<style scoped>
.columns { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 1.2em; }
img[src*="mermaid"] { max-height: 42% !important; max-width: 82% !important; margin: 0.4em auto 0.6em auto !important; }
section { padding-bottom: 3.8em !important; padding-top: 4.2em !important; }
.columns div { font-size: 0.92em; line-height: 1.6; margin: 0; padding: 0.2em 0; }
.columns div p { margin: 0.6em 0; }
.columns div ul { margin: 0.5em 0; padding-left: 1.2em; }
h2 { margin-bottom: 0.6em !important; margin-top: 0.2em !important; }
</style>

---

## Agent Architecture Patterns

### Comprehensive Comparison

| **Pattern** | **Mechanism** | **Strengths** | **Best For** |
|:---|:---|:---|:---|
| 🔄 **FSM** | State + Transitions | Simple, predictable | Workflow pipelines |
| 🌳 **BT** | Tree of behaviors | Modular, scalable | Complex task hierarchies |
| 🎯 **GOAP** | A* pathfinding | Dynamic, optimal paths | Goal-driven planning |
| 💭 **ReAct** | Thought → Action → Observation | LLM reasoning | Modern LLM agents |
| 🧠 **Learning Agents** | Memory + Feedback loops | Adaptive, self-improving | Long-term autonomous systems |

**Recommendation**: For autonomous development, use **ReAct + Learning** with optional GOAP/BT for complex workflows

<style scoped>
section table { font-size: 0.75em; margin: 0.5em 0; line-height: 1.3; }
section table td { padding: 0.3em 0.2em; }
</style>

---

## ReAct Pattern (Reasoning + Acting)

**Modern LLM Agent Paradigm**

<div class="columns">
<div>

```mermaid
graph LR
    THOUGHT["💭 Think"] --> ACTION["⚙️ Act"]
    ACTION --> OBS["👁️ Observe"]
    OBS --> REFLECT["🔄 Reflect"]
    REFLECT --> THOUGHT
    
    style THOUGHT fill:#e3f2fd
    style ACTION fill:#fff3e0
    style OBS fill:#f3e5f5
    style REFLECT fill:#c8e6c9
```

</div>
<div>

**Key**: Reasoning + tool use

**Cycle**: Think → Act → Observe → Reflect

</div>
</div>

<style scoped>
.columns { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 1em; }
img[src*="mermaid"] { max-height: 35% !important; max-width: 85% !important; margin: 0.3em auto !important; }
section { padding-bottom: 3.5em !important; padding-top: 4em !important; }
.columns div { font-size: 0.85em; line-height: 1.3; margin: 0; }
.columns div p { margin: 0.3em 0; }
h2 { margin-bottom: 0.5em !important; }
</style>

---

## Memory and Feedback Cycles

**Critical for Learning**

<div class="columns">
<div>

```mermaid
graph LR
    ACTION[Action] --> OBS[Observe]
    OBS --> FEEDBACK[Feedback]
    FEEDBACK --> MEMORY[Memory]
    MEMORY --> LEARN[Learn]
    LEARN --> ACTION
    
    style MEMORY fill:#90EE90
    style LEARN fill:#87CEEB
```

</div>
<div>

**Key**: Memory enables context-aware decisions

**Process**: Act → Observe → Feedback → Memory → Learn → Action

</div>
</div>

<style scoped>
.columns { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 1em; }
img[src*="mermaid"] { max-height: 35% !important; max-width: 85% !important; margin: 0.3em auto !important; }
section { padding-bottom: 3.5em !important; padding-top: 4em !important; }
.columns div { font-size: 0.85em; line-height: 1.3; margin: 0; }
.columns div p { margin: 0.3em 0; }
h2 { margin-bottom: 0.5em !important; }
</style>

---

## 🔌 Model Context Protocol (MCP)

**Standardized Tool and Resource Definition**

| Concept | Purpose |
|---------|---------|
| **Resources** 📦 | Context and data for AI models |
| **Tools** ⚙️ | Functions AI can execute |
| **Prompts** 📋 | Templated workflows |
| **Sampling** 🎯 | Extension strategies for tool selection |

**Benefits**: Standardized interface • Easy integration • Clear capability negotiation • Secure access

---

## 🏗️ MCP Architecture

<div class="columns">
<div>

```mermaid
graph LR
    H[Host Manager] --> C1[Client 1]
    H --> C2[Client 2]
    C1 --> S1[Local Services]
    C2 --> S2[Remote Services]
    H --> S3[Shared APIs]
```

</div>
<div>

**Key Strength**
- Host manages multiple clients
- Each client connects to dedicated services

**Operational Impact**
- Centralized governance and logging
- Easy to extend with new clients or servers

</div>
</div>

<style scoped>
.columns { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 1.2em; }
img[src*="mermaid"] { max-height: 42% !important; max-width: 82% !important; margin: 0.4em auto 0.6em auto !important; }
section { padding-bottom: 3.8em !important; padding-top: 4.2em !important; }
.columns div { font-size: 0.92em; line-height: 1.6; margin: 0; padding: 0.2em 0; }
.columns div p { margin: 0.6em 0; }
.columns div ul { margin: 0.5em 0; padding-left: 1.2em; }
h2 { margin-bottom: 0.6em !important; margin-top: 0.2em !important; }
</style>

---

## What Works in Production

<div class="columns">
<div>

### Separate Planning Agent
✅ **Benefits**:
- Dedicated agent for task decomposition
- Clearer reasoning traces
- Better error recovery

</div>
<div>

### Separate Information Gathering
✅ **Benefits**:
- Focused research/search agents
- Parallel information collection
- Reduced context pollution

</div>
</div>

---

## What Works: Control Flows

<div class="columns">
<div>

### Continuous Workflows
✅ **Scheduling Patterns**:
- **Queue**: Sequential task processing
- **Stack**: Depth-first execution (interrupts)
- **Async**: Parallel agent coordination with semaphores

</div>
<div>

### Adaptive Patterns
✅ **Communication**:
- JSON-RPC 2.0 for structured communication
- STDIO for process communication
- Event-driven architectures

</div>
</div>

---

## What Works: Tool Design

✅ **Annotation-Based Descriptions**

```typescript
const tool = {
  name: "search_web",
  description: "Search the web for information",
  parameters: { query: { type: "string", description: "Search query" } },
  annotations: {
    audience: ["assistant"],
    priority: 0.8,
    category: "research"
  }
}
```

<style scoped>
section { padding-bottom: 0.2em !important; }
pre { margin-bottom: 0.2em !important; line-height: 1.2; max-height: 340px; }
p { margin: 0.3em 0 !important; }
</style>

**Benefits**: Clear metadata, better tool selection, priority handling

---

## What Works: Resource Visibility

✅ **Priority and Scoping**

```typescript
resource: {
  uri: "file:///project/README.md",
  annotations: {
    audience: ["user", "assistant"],
    priority: 0.9,  // 0.0-1.0 (1 = required)
    scope: "public"
  }
}
```

**Key Insight**: Annotations help agents choose the right resources

---

## What Works: Advanced Patterns

**Three key patterns enhance agent capabilities**:

1. **Enriched Reasoning**: Chain-of-Thought, self-critique to improve decision-making

2. **Custom Control Flows**: Bespoke execution loops (state machines) vs. built-in tool calling

3. **Scratchpad Pattern**: External working memory to track progress and reasoning

---

## Scratchpad Pattern

**Working Memory for Complex Tasks**

<div class="columns">
<div>

```mermaid
graph TB
    subgraph SCRATCHPAD["Scratchpad Memory"]
        TASK["<b>Current Task</b><br/>Build REST API"]
        PLAN["<b>Plan</b><br/>1. Design ✓<br/>2. Implement ← NOW<br/>3. Test<br/>4. Deploy"]
        OBS["<b>Observations</b><br/>• FastAPI framework<br/>• PostgreSQL database"]
        RESULTS["<b>Results</b><br/>✅ Schema designed<br/>🔄 Implementing endpoints"]
        
        TASK --> PLAN
        PLAN --> OBS
        OBS --> RESULTS
    end
    
    style SCRATCHPAD fill:#f0f0f0
    style TASK fill:#e1f5ff
    style RESULTS fill:#fff9c4
```

</div>
<div>

**Benefits**:
- Tracks task progress
- Maintains context
- Stores observations

**Use Cases**:
- Long-running tasks
- Multi-step workflows
- Complex reasoning

</div>
</div>

<style scoped>
.columns { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 1.2em; }
img[src*="mermaid"] { max-height: 47% !important; max-width: 87% !important; margin: 0.4em auto 0.6em auto !important; }
section { padding-bottom: 3.8em !important; padding-top: 4.2em !important; }
.columns div { font-size: 0.92em; line-height: 1.6; margin: 0; padding: 0.2em 0; }
.columns div p { margin: 0.6em 0; }
.columns div ul { margin: 0.5em 0; padding-left: 1.2em; }
h2 { margin-bottom: 0.6em !important; margin-top: 0.2em !important; }
</style>


---

## Python Frameworks

**LangChain** (119K+ stars)
- Agents, memory, tools, chains | General-purpose LLM applications

**AG2 (AutoGen)** (38K+ stars)
- Agent conversations, code execution | Collaborative problem solving

**CrewAI** (30K+ stars)
- Role-playing agents, workflows | Content creation and research

---

## TypeScript Frameworks

**VoltAgent** - Production-Ready  
Type safety, tool system, built-in observability | Enterprise deployments

**LangChain.js** - Feature Parity  
Agents, memory, streaming | Node.js and edge computing

**Composio** - Integration Platform  
100+ integrations, universal function calling | Integration-heavy applications

---

## Workflow Orchestration

**n8n** - Visual workflow builder | 400+ integrations | Low-code automation

**Apache Airflow** - Python-based DAGs | Production-grade scheduling | Complex dependencies

**Temporal** - Durable execution | Automatic retries | Long-running workflows (days/weeks)

---

## AI Gateway Pattern

<div class="columns">
<div>

**Problem**: Multiple LLM providers, costs, performance variability

**Solution**: Gateway layer for intelligent routing

```mermaid
graph TD
    USER[User Request] --> GATEWAY[AI Gateway]
    GATEWAY --> ROUTING[Routing Logic]
    ROUTING -->|Cost-based| GPT4[GPT-4]
    ROUTING -->|Latency-based| CLAUDE[Claude]
    ROUTING -->|Quality-based| GEMINI[Gemini]
    ROUTING -->|Load-balanced| LOCAL[Local Model]
    
    style GATEWAY fill:#90EE90
    style ROUTING fill:#FFD700
```

</div>
<div>

**Benefits**:
- Model abstraction
- Cost optimization
- Performance routing
- A/B testing
- Fallback handling

</div>
</div>

<style scoped>
.columns { display: grid; grid-template-columns: 1fr 1fr; gap: 2em; }
img[src*="mermaid"] { max-height: 50% !important; max-width: 90% !important; margin-top: 0.5em !important; }
section { padding-bottom: 3.5em !important; }
.columns div { font-size: 0.9em; }
</style>

---

## AI Gateway: Benefits

✅ **Model Abstraction** - Switch models without code changes • A/B testing

✅ **Cost Optimization** - Route cheap tasks to cheaper models • Budget enforcement

✅ **Reliability** - Automatic failover • Load balancing across instances

✅ **Observability** - Centralized logging • Cost tracking • Performance monitoring

<div class="gateway-summary">
<div>
### When to use it
- Multiple model providers in production
- Need routing by price, latency, or quality

</div>
<div>
### Operational Tips
- Instrument routing decisions for audit trails
- Tune thresholds regularly with telemetry

</div>
</div>

<style scoped>
section { padding-bottom: 2em; }
</style>

---

## What We Use at Wix

**Knowledge Base Pattern** - Infrastructure for semantic search | Build and test easily | RAG foundation

**Workflow Orchestration** - Internal systems + n8n | Agent task scheduling | Multi-step automation

**AI Gateway Adapter** - Model routing (performance, cost, availability) | Single interface, multiple providers

**Internal LLM Tooling** - 80% of daily work automated | Focus on what LLMs can't do | Productivity multiplier

---

## Practical Example: Multi-Agent System

**Scenario**: Autonomous code review system

<div class="columns">
<div>

```mermaid
graph LR
    START[Commit] --> ANALYST[Analyst]
    ANALYST --> ARCH[Architect]
    ANALYST --> REVIEW[Reviewer]
    ANALYST --> SEC[Security]
    
    ARCH --> REPORT[Report]
    REVIEW --> REPORT
    SEC --> REPORT
    
    REPORT --> DEC{Pass?}
    DEC -->|Yes| OK[✓]
    DEC -->|No| WARN[⚠]
    
    style ANALYST fill:#FFD700
    style DEC fill:#FFA500
```

</div>
<div>

**Flow**: Commit → Analyst → Agents → Report → Decision → Approve/Notify

</div>
</div>

<style scoped>
.columns { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 1.2em; }
img[src*="mermaid"] { max-height: 42% !important; max-width: 88% !important; margin: 0.4em auto 0.6em auto !important; }
section { padding-bottom: 3.8em !important; padding-top: 4.2em !important; }
.columns div { font-size: 0.9em; line-height: 1.6; margin: 0; padding: 0.2em 0; }
.columns div p { margin: 0.3em 0; }
h2 { margin-bottom: 0.5em !important; }
</style>

---

## Multi-Agent System: Flow

**Process**:
1. **Analyst Agent** receives code commit
2. **Distributes tasks** to specialized agents:
   - Architect: Code structure review
   - Code Reviewer: Quality checks
   - Security: Vulnerability scanning
3. **Agents report** back to Analyst
4. **Decision point**: Approve or notify based on results

---

## Practical Example: Agent Handoff

**Language-Agnostic Pattern**

```mermaid
graph TD
    COORD[Coordinator Agent] --> PLANNER[Planner Agent]
    COORD --> EXECUTOR[Executor Agent]
    COORD --> REVIEWER[Reviewer Agent]
    COORD --> REPORTER[Reporter Agent]
    
    PLANNER -.->|Plan Task| P_OUT[ ]
    EXECUTOR -.->|Run Code & Tests| E_OUT[ ]
    REVIEWER -.->|Check Quality| R_OUT[ ]
    REPORTER -.->|Generate Report| REP_OUT[ ]
    
    style COORD fill:#FFD700
    style PLANNER fill:#87CEEB
    style EXECUTOR fill:#90EE90
    style REVIEWER fill:#FFB6C1
    style REPORTER fill:#DDA0DD
    style P_OUT fill:none,stroke:none
    style E_OUT fill:none,stroke:none
    style R_OUT fill:none,stroke:none
    style REP_OUT fill:none,stroke:none
```

<style scoped>
img[src*="mermaid"] { max-height: 50% !important; max-width: 90% !important; margin-top: 0.5em !important; }
section { padding-bottom: 3.5em !important; }
</style>

---

## Agent Handoff: Key Benefits

**Standard interfaces (MCP) allow language-agnostic composition**

**Advantages**:
- Agents can be written in different languages
- Coordinator manages communication
- Each agent focuses on specific tasks
- Easy to add/remove agents
- Scalable architecture

---

## Best Practices: Design & Operations

<div class="columns best-practices">
<div>

### Design
- ✅ Start single → multi-agent
- ✅ Clear responsibilities
- ✅ Use standard protocols (MCP)
- ✅ Proper error handling

</div>
<div>

### Operations
- ✅ Monitor costs & tokens
- ✅ Implement rate limiting
- ✅ Log all decisions
- ✅ Plan for failures

</div>
</div>

<style scoped>
.columns { display: grid; grid-template-columns: 1fr 1fr; gap: 2em; font-size: 0.95em; }
.columns h3 { margin: 0 0 0.5em 0; font-size: 1.2em; }
.columns ul { margin: 0; padding-left: 1.2em; line-height: 1.45; }
section { padding-bottom: 3em !important; }
</style>

---

## Best Practices: Security & Testing

<div class="columns best-practices">
<div>

### Security
- ✅ Validate tool inputs
- ✅ Sandbox code (E2B)
- ✅ Access controls
- ✅ Human-in-the-loop

</div>
<div>

### Testing
- ✅ Diverse scenarios
- ✅ Benchmark baselines
- ✅ A/B test approaches
- ✅ Measure outcomes

</div>
</div>

<style scoped>
.columns { display: grid; grid-template-columns: 1fr 1fr; gap: 2em; font-size: 0.95em; }
.columns h3 { margin: 0 0 0.5em 0; font-size: 1.2em; }
.columns ul { margin: 0; padding-left: 1.2em; line-height: 1.45; }
section { padding-bottom: 3em !important; }
</style>

---

## Common Pitfalls to Avoid

<div class="columns">
<div>

❌ **Over-Automation**
- Not all tasks need agents
- Some require human judgment

❌ **Ignoring Costs**
- API calls add up quickly
- Monitor continuously

</div>
<div>

❌ **Poor Tool Design**
- Vague descriptions confuse agents
- Complex tools reduce reliability

❌ **Lack of Observability**
- Can't debug what you can't see
- Invest in logging early

</div>
</div>

<style scoped>
.columns.best-practices h3 { margin: 0 0 0.5em 0; font-size: 1.2em; }
.columns.best-practices ul { margin: 0; padding-left: 1.2em; line-height: 1.45; }
section { padding-bottom: 1.2em !important; }
</style>

---

## The Future of Autonomous Development

**Trends**:
- 🚀 Better reasoning models (GPT-5, Claude 4, etc.)
- 🚀 Longer context windows (1M+ tokens)
- 🚀 Lower costs per token
- 🚀 Specialized coding models
- 🚀 Better tool use capabilities

**Impact**:
- Agents handle more complex tasks end-to-end
- Shift from "code generation" to "system generation"
- Developers become orchestrators and architects

---

## Getting Started: Environment & Framework

<div class="columns">
<div>

### 1. Pick Your Environment
- **Local**: For experimentation
- **Remote**: For team use
- **Distributed**: For production

</div>
<div>

### 2. Choose a Framework
- **Python**: LangChain, AG2, CrewAI
- **TypeScript**: VoltAgent, LangChain.js

</div>
</div>

<style scoped>
.columns { font-size: 0.95em; gap: 2em; }
section { padding-bottom: 3em !important; }
</style>

---

## Getting Started: Approach & Resources

<div class="columns">
<div>

### 3. Start Simple
- Single-agent workflows first
- Add complexity gradually
- Measure improvements

</div>
<div>

### Resources
- **MCP**: https://modelcontextprotocol.io
- **Conference**: https://github.com/Algiras/vs-zinios-conference-2025-11-18

</div>
</div>

<style scoped>
.columns { font-size: 0.95em; gap: 2em; }
section { padding-bottom: 3em !important; }
</style>

---

## Key Takeaways: Architecture & Design

<div class="takeaways-grid">
<div>

### Choose the Right Architecture
- Simple: Reflex agents
- Complex: Learning agents + planning

### Design Matters
- Separate planning/execution
- Use scratchpad for reasoning
- Maintain proper control flows

</div>
<div>

### Production Ready
- Observability is critical
- Cost monitoring is essential
- Security first, always

</div>
</div>

<style scoped>
.takeaways-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2em; font-size: 0.9em; line-height: 1.4; }
.takeaways-grid h3 { margin: 0 0 0.4em 0; font-size: 1.1em; }
.takeaways-grid ul { margin: 0 0 0.8em 0; padding-left: 1.2em; }
section { padding-bottom: 3em !important; }
</style>

---

## Key Takeaways: Standards & Growth

<div class="takeaways-grid">
<div>

### Leverage Standards
- MCP for tools/resources
- Standard protocols across teams
- Language-agnostic patterns

</div>
<div>

### Iterate & Improve
- Start simple → expand to complex
- Measure outcomes continually
- Learn from failures quickly

### Stay Current
- Rapidly evolving field
- Track new models & capabilities
- Engage with community innovation

</div>
</div>

<style scoped>
.takeaways-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2em; font-size: 0.9em; line-height: 1.4; }
.takeaways-grid h3 { margin: 0 0 0.4em 0; font-size: 1.1em; }
.takeaways-grid ul { margin: 0 0 0.8em 0; padding-left: 1.2em; }
section { padding-bottom: 3em !important; }
</style>

---

## Resources

### Documentation & Links

<div class="resources-grid">
<div>
<h4>MCP Specification</h4>
<p><a href="https://modelcontextprotocol.io">modelcontextprotocol.io</a></p>
</div>
<div>
<h4>AG2 (AutoGen)</h4>
<p><a href="https://ag2.ai">ag2.ai</a></p>
</div>
<div>
<h4>LangChain Python</h4>
<p><a href="https://python.langchain.com">python.langchain.com</a></p>
</div>
<div>
<h4>Conference Repository</h4>
<p><a href="https://github.com/Algiras/vs-zinios-conference-2025-11-18">github.com/Algiras/vs-zinios-conference-2025-11-18</a></p>
</div>
</div>

<style scoped>
.resources-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2em; font-size: 0.9em; }
.resources-grid div { background: #f7f7f7; padding: 1em 1.2em; border-radius: 8px; display: flex; flex-direction: column; align-items: flex-start; }
.resources-grid h4 { margin: 0 0 0.25em 0; font-size: 1.05em; }
.resources-grid p { margin: 0; }
.resources-grid a { color: #1565c0; text-decoration: none; }
section { padding-bottom: 1.2em !important; }
</style>

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

**Conference Repository**: https://github.com/Algiras/vs-zinios-conference-2025-11-18

![QR Code](qr:https://github.com/Algiras/vs-zinios-conference-2025-11-18)

<style scoped>
img { 
  max-width: 200px !important; 
  max-height: 200px !important;
  width: auto !important;
  height: auto !important;
  margin-top: 1em !important;
  display: block !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
</style>

---

<!-- _footer: "Backup Slides - For Reference" -->

## Backup Slides

---

## Detailed FSM Example

```python
class State:
    def enter(self): pass
    def execute(self): pass
    def exit(self): pass
    def check_transitions(self): return None

class AnalyzingState(State):
    def execute(self):
        run_code_analysis()
    
    def check_transitions(self):
        if issues_found():
            return TestingState()
        return IdleState()

class FSM:
    def __init__(self, initial_state):
        self.current_state = initial_state
        self.current_state.enter()
    
    def update(self):
        self.current_state.execute()
        next_state = self.current_state.check_transitions()
        if next_state:
            self.current_state.exit()
            self.current_state = next_state
            self.current_state.enter()
```

<style scoped>
code { font-size: 0.6em; line-height: 1.25; }
section { padding-bottom: 3em !important; padding-top: 3.5em !important; }
</style>

---

## Behavior Tree Node Types

<div class="columns">
<div>

### Sequence Node
- Runs children left-to-right
- Stops on first **FAILURE**
- Returns SUCCESS if all pass
- Use for: Required steps

### Selector Node
- Runs children left-to-right
- Stops on first **SUCCESS**
- Returns FAILURE if all fail
- Use for: Fallback options

</div>
<div>

### Decorator Node
- Modifies child behavior
- Inverter, Repeater, etc.
- Single child only

### Leaf Nodes
- **Condition**: Check state
- **Action**: Do something
- No children

</div>
</div>

<style scoped>
.columns { display: grid; grid-template-columns: 1fr 1fr; gap: 2em; font-size: 0.9em; }
section { padding-bottom: 2.5em !important; }
</style>

---

## GOAP Planning Algorithm

<div class="columns">
<div>

### A* Search Process
1. Start with current state
2. Try all possible actions
3. Calculate costs
4. Choose lowest cost path
5. Return action sequence

### World State
- Key-value pairs
- `has_weapon: true`
- `ammo: 10`

</div>
<div>

### Action Structure
- **Preconditions**: What's needed
- **Effects**: What changes
- **Cost**: How expensive

### Planning
- Build action graph
- Find cheapest path
- Execute in sequence

</div>
</div>

<style scoped>
.columns { display: grid; grid-template-columns: 1fr 1fr; gap: 2em; font-size: 0.9em; }
section { padding-bottom: 2.5em !important; }
</style>

---

## MCP Tool Structure

<div class="columns">
<div>

### Core Components
- **name**: Unique identifier
- **description**: What it does  
- **inputSchema**: JSON Schema
- **outputSchema**: Output format

### Annotations
- **audience**: `["user", "assistant"]`
- **priority**: `0.0` to `1.0`
- **category**: Grouping

</div>
<div>

### Example: web_search
```json
{
  "name": "web_search",
  "description": "Search web",
  "input": {
    "query": "required",
    "max_results": "optional"
  },
  "output": {
    "results": "array"
  }
}
```

</div>
</div>

<style scoped>
code { font-size: 0.6em; line-height: 1.25; }
section { padding-bottom: 3em !important; padding-top: 3.5em !important; }
.columns { font-size: 0.85em; }
</style>
