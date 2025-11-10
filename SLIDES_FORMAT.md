# Slides Format Documentation

This project maintains two versions of the presentation slides:

## File Structure

### 1. `slides/presentation.md` (Original/Source)
**Purpose**: Main source file for editing
**Format**: Uses source format for QR codes and Mermaid diagrams
- QR codes: `![QR](qr:https://example.com)` or `![QR Code](qr:https://example.com)`
- Mermaid diagrams: ````mermaid` code blocks
- **Exception**: QR codes inside HTML `<div>` blocks use `<img>` tags (because markdown inside HTML doesn't get processed)

**Usage**: 
- Edit this file
- Use with `npm run dev` (engine processes on-the-fly)
- Use with `npm run build:original` (builds from source)

### 2. `slides/presentation.processed.md` (Processed/Rendered)
**Purpose**: Pre-processed version with all QR codes and Mermaid diagrams converted to images
**Format**: Uses rendered format
- QR codes: `<img src="/images/qr/qr-{hash}.png" alt="QR Code">`
- Mermaid diagrams: `<img src="/images/mermaid/mermaid-{hash}.png" alt="Mermaid diagram">`

**Usage**:
- Generated automatically by `npm run preprocess`
- Use with `npm run build` (builds from processed version)
- Use with `npm run export` (exports PPTX/PDF from processed version)

## Workflow

1. **Edit**: Make changes to `slides/presentation.md`
2. **Preprocess**: Run `npm run preprocess` to generate `slides/presentation.processed.md`
3. **Build/Export**: Use processed version for final outputs

## Commands

- `npm run preprocess` - Generate processed markdown file
- `npm run dev` - Dev server (uses original with engine)
- `npm run build` - Build HTML from processed version
- `npm run build:original` - Build HTML from original version
- `npm run export` - Export PPTX from processed version
- `npm run export:pdf` - Export PDF from processed version

## Notes

- The processed file (`*.processed.md`) is gitignored
- QR codes and Mermaid images are generated automatically
- The engine (`engine.js`) processes source format on-the-fly for dev server
- For production builds/exports, use the processed version for consistency

