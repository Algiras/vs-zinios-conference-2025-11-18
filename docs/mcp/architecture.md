# MCP Architecture

Source: https://github.com/modelcontextprotocol/specification/blob/main/docs/specification/2025-06-18/architecture/index.mdx

## Core Components

The Model Context Protocol follows a client-host-server architecture where each host can run multiple client instances.

### Architecture Diagram (Mermaid)

```mermaid
graph LR
  subgraph "Application Host Process"
  H[Host]
  C1[Client 1]
  C2[Client 2]
  C3[Client 3]
  H --> C1
  H --> C2
  H --> C3
  end

  subgraph "Local machine"
  S1[Server 1<br>Files & Git]
  S2[Server 2<br>Database]
  R1[("Local<br>Resource A")]
  R2[("Local<br>Resource B")]

  C1 --> S1
  C2 --> S2
  S1 <--> R1
  S2 <--> R2
  end

  subgraph "Internet"
  S3[Server 3<br>External APIs]
  R3[("Remote<br>Resource C")]

  C3 --> S3
  S3 <--> R3
  end
```

### Host Responsibilities

- Creates and manages multiple client instances
- Controls client connection permissions and lifecycle
- Enforces security policies and consent requirements
- Handles user authorization decisions
- Coordinates AI/LLM integration and sampling
- Manages context aggregation across clients

### Client Responsibilities

- Establishes one stateful session per server
- Handles protocol negotiation and capability exchange
- Routes protocol messages bidirectionally
- Manages subscriptions and notifications
- Maintains security boundaries between servers

### Server Responsibilities

- Expose resources, tools and prompts via MCP primitives
- Operate independently with focused responsibilities
- Request sampling through client interfaces
- Must respect security constraints
- Can be local processes or remote services

## Capability Negotiation

MCP uses capability-based negotiation where clients and servers explicitly declare supported features during initialization.

### Negotiation Flow (Mermaid)

```mermaid
sequenceDiagram
  participant Host
  participant Client
  participant Server

  Host->>+Client: Initialize client
  Client->>+Server: Initialize session with capabilities
  Server-->>Client: Respond with supported capabilities

  Note over Host,Server: Active Session with Negotiated Features

  loop Client Requests
  Host->>Client: User- or model-initiated action
  Client->>Server: Request (tools/resources)
  Server-->>Client: Response
  Client-->>Host: Update UI or respond to model
  end

  loop Server Requests
  Server->>Client: Request (sampling)
  Client->>Host: Forward to AI
  Host-->>Client: AI response
  Client-->>Server: Response
  end

  loop Notifications
  Server--)Client: Resource updates
  Client--)Server: Status changes
  end

  Host->>Client: Terminate
  Client->>-Server: End session
  deactivate Server
```

## Design Principles

1. **Easy to Build**: Host applications handle complex orchestration, servers focus on specific capabilities
2. **Highly Composable**: Each server provides focused functionality in isolation
3. **Isolation**: Servers cannot read full conversations or see into other servers
4. **Progressive Enhancement**: Features can be added progressively with backward compatibility

