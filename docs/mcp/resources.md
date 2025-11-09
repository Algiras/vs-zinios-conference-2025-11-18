# MCP Resources Specification

Source: https://github.com/modelcontextprotocol/specification/blob/main/docs/specification/2025-06-18/server/resources.mdx

## Overview

MCP provides a standardized way for servers to expose resources to clients. Resources allow servers to share data that provides context to language models, such as files, database schemas, or application-specific information.

Each resource is uniquely identified by a URI (RFC 3986).

## User Interaction Model

Resources are **application-driven** - host applications determine how to incorporate context based on their needs.

Examples:
- UI elements for explicit selection (tree/list view)
- Search and filter functionality
- Automatic context inclusion based on heuristics or AI model selection

## Capabilities Declaration

```json
{
  "capabilities": {
    "resources": {
      "subscribe": true,
      "listChanged": true
    }
  }
}
```

Optional features:
- `subscribe`: Client can subscribe to resource change notifications
- `listChanged`: Server emits notifications when resource list changes

## Protocol Messages

### Listing Resources

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "resources/list",
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
    "resources": [
      {
        "uri": "file:///project/src/main.rs",
        "name": "main.rs",
        "title": "Rust Software Application Main File",
        "description": "Primary application entry point",
        "mimeType": "text/x-rust"
      }
    ],
    "nextCursor": "next-page-cursor"
  }
}
```

### Reading Resources

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "resources/read",
  "params": {
    "uri": "file:///project/src/main.rs"
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "contents": [
      {
        "uri": "file:///project/src/main.rs",
        "mimeType": "text/x-rust",
        "text": "fn main() {\n println!(\"Hello world!\");\n}"
      }
    ]
  }
}
```

## Resource Definition

A resource includes:
- `uri`: Unique identifier
- `name`: Resource name
- `title`: Optional human-readable name for display
- `description`: Optional description
- `mimeType`: Optional MIME type
- `size`: Optional size in bytes

## Annotations

Resources support optional annotations providing hints about usage:

```json
{
  "uri": "file:///project/README.md",
  "name": "README.md",
  "title": "Project Documentation",
  "mimeType": "text/markdown",
  "annotations": {
    "audience": ["user"],
    "priority": 0.8,
    "lastModified": "2025-01-12T15:00:58Z"
  }
}
```

**Annotation Types:**
- `audience`: Array of ["user", "assistant"] indicating intended audience
- `priority`: Number 0.0-1.0 (1=most important, 0=least important)
- `lastModified`: ISO 8601 timestamp

## Resource Templates

Parameterized resources using URI templates (RFC 6570):

```json
{
  "resourceTemplates": [
    {
      "uriTemplate": "file:///{path}",
      "name": "Project Files",
      "title": "📁 Project Files",
      "description": "Access files in the project directory",
      "mimeType": "application/octet-stream"
    }
  ]
}
```

## Subscriptions

Optional resource change notifications:

**Subscribe Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "resources/subscribe",
  "params": {
    "uri": "file:///project/src/main.rs"
  }
}
```

**Update Notification:**
```json
{
  "jsonrpc": "2.0",
  "method": "notifications/resources/updated",
  "params": {
    "uri": "file:///project/src/main.rs"
  }
}
```

## Common URI Schemes

### https://
Web-accessible resources that clients can fetch directly

### file://
Resources behaving like a filesystem (may be virtual, not physical)

### git://
Git version control integration

### Custom URI Schemes
Must comply with RFC 3986

## Security Considerations

**Servers MUST:**
- Validate all resource URIs
- Implement access controls for sensitive resources
- Properly encode binary data
- Check resource permissions before operations

