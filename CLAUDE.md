# musix.js

> **Rule**: Do not add anything to CLAUDE.md unless it is necessary.

See [README.md](README.md) for project overview and [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow.

## Directory Structure

```
musix.js/
├── CLAUDE.md           # This file (Claude Code configuration)
├── README.md           # Project overview
├── CONTRIBUTING.md     # Contributing guide
├── preflight.sh        # Quality gate script (CI, session-start, session-end)
├── docs/
│   ├── specs/          # Specifications (each spec has its own directory)
│   │   ├── templates/  # Specification templates
│   │   │   ├── FEATURE.md
│   │   │   ├── ENHANCEMENT.md
│   │   │   ├── FIX.md
│   │   │   └── REFACTOR.md
│   │   └── <spec-name>/  # Example: 20251207-feat-spotify-adapter/
│   │       ├── spec.md       # Specification document
│   │       └── progress.json # Progress tracking
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

This repository follows **Spec-Driven Development**.

1. **Write specs before code** - Always create a specification before implementation
2. **Keep change history** - Update the history section when modifying specs
3. **Follow the spec** - Do not implement features not described in the spec
4. **Derive tests from specs** - Test cases should be based on spec requirements

## Slash Commands

| Command | When to use |
|---------|-------------|
| `/spec-new <name>` | Before starting any new feature/fix |
| `/spec-review <name>` | To review a specification and its implementation |
| `/session-start [spec-name]` | At the start of a coding session |
| `/session-end` | At the end of a coding session |
| `/status` | To check progress of all specs |

## Web Search Rules

1. **Avoid specifying years** - Do not include specific years in search queries
2. **Verify current date first** - If a year must be specified, check the current date before searching

## Agent Guardrails

Rules to prevent common failure patterns in long-running agent sessions.

### Preflight Check

Run `./preflight.sh` to verify codebase health. Used by CI, `/session-start`, and `/session-end`.

### Preventing Context Exhaustion

- Focus on **ONE requirement per session**
- If a requirement is too large, split into sub-tasks and restart session planning
- Always read existing code with Read tool before writing new code
- Do not attempt to implement multiple features at once

#### Requirement Size Guidelines

A requirement is **TOO LARGE** if:
- Implementation touches more than 3 files
- Expected to take more than 50 tool calls
- Contains "and" connecting distinct features

**Split strategy:**
1. Identify sub-tasks
2. Create temporary sub-requirements (e.g., FR-001a, FR-001b)
3. Complete each in separate session
4. Mark parent requirement as passed only when all sub-tasks complete

### Test Integrity

- **NEVER delete or modify existing tests** to make them pass
- If a test fails, fix the implementation, not the test
- Exception: Test is genuinely incorrect (document reason in commit)
- New functionality must have corresponding new tests

### Preventing Premature Completion

A requirement can only be marked as `passes: true` when:

1. `./preflight.sh` passes
2. Manual verification completed (when applicable)
3. You have actually verified the behavior, not assumed it works

**"Probably works" = `passes: false`**

### Recovery from Failed Sessions

1. `git stash` or `git reset --soft HEAD~1` to preserve work
2. Run `/session-start` to re-orient
3. Document what went wrong in blockers
4. Split the failed requirement into smaller pieces