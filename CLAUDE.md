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

## Directory Structure

```
musix.js/
├── CLAUDE.md           # This file (Claude Code configuration)
├── CONTRIBUTING.md     # Contributing guide
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

## Spec-Driven Development

This repository follows **Spec-Driven Development**. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow.

### Rules

1. **Write specs before code** - Always create a specification before implementation
2. **Keep change history** - Update the history section when modifying specs
3. **Follow the spec** - Do not implement features not described in the spec
4. **Derive tests from specs** - Test cases should be based on spec requirements

### Slash Commands

| Command | Description |
|---------|-------------|
| `/spec-new <name>` | Create a new specification |
| `/spec-review <file>` | Review a specification |
| `/spec-implement <file>` | Implement based on specification |

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for commands, coding standards, and guidelines.
