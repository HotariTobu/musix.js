# musix.js

See [README.md](README.md) for project overview.

## Directory Structure

```
musix.js/
├── CLAUDE.md           # This file (Claude Code configuration)
├── README.md           # Project overview
├── CONTRIBUTING.md     # Contributing guide
├── docs/
│   ├── specs/          # Specifications
│   │   └── templates/  # Specification templates
│   │       ├── FEATURE.md
│   │       ├── ENHANCEMENT.md
│   │       ├── FIX.md
│   │       └── REFACTOR.md
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

## Web Search Rules

When performing web searches to obtain up-to-date information:

1. **Avoid specifying years** - Do not include specific years in search queries to get the latest information
2. **Verify current date first** - If a year must be specified, always check the current date before searching

These rules ensure that search results are not limited to outdated information.

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for commands, coding standards, and guidelines.
