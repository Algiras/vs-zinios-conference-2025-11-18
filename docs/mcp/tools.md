# MCP Tools Specification

Source: https://github.com/modelcontextprotocol/specification/blob/main/docs/specification/2025-06-18/server/tools.mdx

## Overview

MCP allows servers to expose tools that can be invoked by language models. Tools enable models to interact with external systems such as databases, APIs, or computations.

## User Interaction Model

Tools are **model-controlled** - language models can discover and invoke tools automatically based on contextual understanding and user prompts.

**Security Note**: There SHOULD always be a human in the loop with ability to deny tool invocations.

## Capabilities Declaration

```json
{
  "capabilities": {
    "tools": {
      "listChanged": true
    }
  }
}
```

## Protocol Messages

### Listing Tools

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {
    "cursor": "optional-cursor-value"
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "get_weather",
        "title": "Weather Information Provider",
        "description": "Get current weather information for a location",
        "inputSchema": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "City name or zip code"
            }
          },
          "required": ["location"]
        }
      }
    ],
    "nextCursor": "next-page-cursor"
  }
}
```

### Calling Tools

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get_weather",
    "arguments": {
      "location": "New York"
    }
  }
}
```

## Tool Definition

A tool includes:
- `name`: Unique identifier
- `title`: Optional human-readable name for display
- `description`: Human-readable functionality description
- `inputSchema`: JSON Schema for expected parameters
- `outputSchema`: Optional JSON Schema for expected output
- `annotations`: Optional properties describing tool behavior

## Annotation-Based Descriptions

Tools support annotations that provide metadata:

```json
{
  "type": "image",
  "data": "base64-encoded-data",
  "mimeType": "image/png",
  "annotations": {
    "audience": ["user"],
    "priority": 0.9
  }
}
```

**Available Annotations:**
- `audience`: Array of ["user", "assistant"] indicating intended audience
- `priority`: Number 0.0-1.0 indicating importance (1=required, 0=optional)
- `lastModified`: ISO 8601 timestamp of last modification

## Tool Result Types

### Text Content
```json
{
  "type": "text",
  "text": "Tool result text"
}
```

### Image Content
```json
{
  "type": "image",
  "data": "base64-encoded-data",
  "mimeType": "image/png"
}
```

### Resource Links
```json
{
  "type": "resource_link",
  "uri": "file:///project/src/main.rs",
  "name": "main.rs",
  "description": "Primary application entry point",
  "mimeType": "text/x-rust"
}
```

### Embedded Resources
```json
{
  "type": "resource",
  "resource": {
    "uri": "file:///project/src/main.rs",
    "mimeType": "text/x-rust",
    "text": "fn main() {\n println!(\"Hello world!\");\n}"
  }
}
```

## Error Handling

Two error reporting mechanisms:

1. **Protocol Errors**: Standard JSON-RPC errors for unknown tools, invalid arguments, server errors
2. **Tool Execution Errors**: Reported with `isError: true` in tool results

## Security Considerations

**Servers MUST:**
- Validate all tool inputs
- Implement proper access controls
- Rate limit tool invocations
- Sanitize tool outputs

**Clients SHOULD:**
- Prompt for user confirmation on sensitive operations
- Show tool inputs before calling server
- Validate tool results
- Implement timeouts
- Log tool usage for audit purposes

