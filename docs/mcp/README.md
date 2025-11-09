# Model Context Protocol (MCP) Documentation

## Overview

The Model Context Protocol (MCP) is an open protocol that enables seamless integration between LLM applications and external data sources and tools. Built on JSON-RPC 2.0, MCP provides a stateful session protocol focused on context exchange and sampling coordination between clients and servers.

**Official Documentation**: https://modelcontextprotocol.io  
**GitHub Repository**: https://github.com/modelcontextprotocol/specification  
**Schema**: https://github.com/modelcontextprotocol/specification/blob/main/schema/2025-06-18/schema.ts

## Key Concepts

### Architecture

MCP follows a client-host-server architecture:

- **Hosts**: LLM applications that initiate connections and manage multiple client instances
- **Clients**: Connectors within the host application that maintain isolated server connections
- **Servers**: Services that provide context and capabilities

### Core Features

**Server Features** (provided to clients):
- **Resources**: Context and data for users or AI models
- **Prompts**: Templated messages and workflows
- **Tools**: Functions for AI models to execute

**Client Features** (provided to servers):
- **Sampling**: Server-initiated agentic behaviors
- **Roots**: Server-initiated filesystem boundary inquiries
- **Elicitation**: Server-initiated requests for user information

### Design Principles

1. Servers should be extremely easy to build
2. Servers should be highly composable
3. Servers cannot read full conversations or "see into" other servers
4. Features can be added progressively

## Protocol Details

### Base Protocol
- JSON-RPC 2.0 message format
- Stateful connections
- Server and client capability negotiation

### Communication Flow

```
Host → Creates → Multiple Clients
Each Client ↔ 1:1 Connection ↔ Server
Servers ↔ Resources (local or remote)
```

## Security Considerations

1. **User Consent and Control**: Users must explicitly consent to data access and operations
2. **Data Privacy**: Hosts must obtain consent before exposing user data to servers
3. **Tool Safety**: Tools represent arbitrary code execution and must be treated with caution
4. **LLM Sampling Controls**: Users must approve any LLM sampling requests

## Additional Resources

See individual files in this directory for detailed specifications on:
- Architecture and design
- Tools specification
- Resources specification
- Server and client capabilities

