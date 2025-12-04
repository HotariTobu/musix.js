# musix.js

A JavaScript library that provides a unified interface for multiple music streaming services.

## Project Goal

Abstract APIs from different music streaming services (Spotify, Apple Music, YouTube Music, etc.) and provide a unified interface to interact with them.

### Key Features

- Track search
- Playlist management
- Playback control
- User library access
- Cross-service data conversion

### Design Principles

- **Adapter Pattern**: Abstract each service's API through adapters
- **Plugin Architecture**: Easy to add new services
- **Type Safety**: Provide TypeScript type definitions

---

This repository follows **Spec-Driven Development**.

## Development Workflow

### 1. Create a Specification
Before implementing any feature or change, create a specification in `docs/specs/`.

```
/spec-new <feature-name>
```

### 2. Review the Specification
Review the specification content and check for issues.

```
/spec-review <spec-filename>
```

### 3. Implement
Implement the code based on the specification.

```
/spec-implement <spec-filename>
```

## Directory Structure

```
musix.js/
├── CLAUDE.md           # This file (Claude Code configuration)
├── docs/
│   ├── specs/          # Specifications
│   │   └── TEMPLATE.md # Specification template
│   └── PRE_DEVELOPMENT_DECISIONS.md  # Pre-development decisions
├── src/
│   ├── core/           # Shared types, errors, interfaces
│   └── adapters/       # Service adapters
│       ├── spotify/
│       ├── apple-music/
│       └── youtube-music/
├── tests/              # Test code
└── .claude/
    └── commands/       # Custom slash commands
```

## Spec-Driven Development Rules

1. **Write specs before code** - Always create a specification before implementation
2. **Keep change history** - Update the history section when modifying specs
3. **Follow the spec** - Do not implement features not described in the spec
4. **Derive tests from specs** - Test cases should be based on spec requirements

## Commands

### Development Commands
```bash
bun install    # Install dependencies
bun test       # Run tests
bun run build  # Build
bun run lint   # Lint check
bun run format # Format code
```

## Coding Standards

- Use TypeScript
- Use Biome for linting and formatting
- Use Bun Test for testing
