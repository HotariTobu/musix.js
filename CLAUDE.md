# musix.js

> **Rule**: Do not add anything to CLAUDE.md unless it is necessary.

See [README.md](README.md) for project overview.

## Language

All documentation, code comments, commit messages, and issues must be written in **English**.

Exception: Specification content (`docs/specs/*.md`) may be written in other languages.

## Directory Structure

```
musix.js/
├── CLAUDE.md           # This file (Claude Code configuration)
├── README.md           # Project overview
├── preflight.sh        # Quality gate script (CI, session-start, session-end)
├── docs/
│   ├── adr/            # Architecture Decision Records
│   ├── specs/          # Specifications (each spec has its own directory)
│   │   ├── templates/  # Specification templates
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
    ├── agents/         # Custom agents
    ├── commands/       # Custom slash commands
    └── skills/         # Custom skills
```

## Architecture Decision Records (ADR)

Record significant technical decisions in `docs/adr/`.

### When to Write an ADR

- Adding or replacing a library/framework
- Choosing between multiple implementation approaches
- Adopting a new pattern or convention
- Making trade-offs that affect maintainability or performance

### Process

Use the `tech-stack-adr` skill to guide technology selection and ADR creation.

## Spec-Driven Development

This repository follows **Spec-Driven Development**.

1. **Write specs before code** - Always create a specification before implementation
2. **Keep change history** - Update the history section when modifying specs
3. **Follow the spec** - Do not implement features not described in the spec
4. **Derive tests from specs** - Test cases should be based on spec requirements

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/<feature-name>
```

### 2. Create a Specification

Before writing any code, create a specification in `docs/specs/`:

```
/spec-new <feature-name>
```

### 3. Review the Specification

Ensure the specification is complete and correct:

```
/spec-review <spec-filename>
```

### 4. Add LLM Documentation (if adding libraries)

When adding new libraries or tools, generate LLM documentation:

```
/generate-llms <library-docs-url>
```

### 5. Implement

Use the session workflow to implement the feature:

```
/session-start <spec-name>   # Start a session
# ... implement one requirement at a time ...
/session-end                 # End session with progress update
```

### 6. Test

Tests are written using Bun Test and should be derived from specification requirements.

```bash
bun test              # Run all tests
bun test <file>       # Run specific test file
```

### 7. Code Review

Review your changes:

```
/code-review
/code-review-security
```

### 8. Check Code

Run linting and formatting checks:

```bash
bun run check:code
```

### 9. Create a Pull Request

- Link to the related specification
- Ensure all tests pass
- Request a review

## Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/<name>` | `feature/spotify-adapter` |
| Bug fix | `fix/<name>` | `fix/auth-error` |
| Documentation | `docs/<name>` | `docs/api-guide` |
| Refactoring | `refactor/<name>` | `refactor/error-handling` |

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>: <description>

[optional body]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `refactor` | Code refactoring |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |

### Body Format (for feat/fix)

```
feat: add rate limit handling to Spotify adapter

## What
- Implemented exponential backoff for 429 responses
- Added RetryableError class

## Why
- Spotify API has strict rate limits (180 req/min)

## Next
- Add unit tests for retry logic
- Handle 503 Service Unavailable

## Blockers
- None
```

This format ensures session continuity by documenting what was done and what comes next.

## Pull Request Guidelines

1. **Link the specification** - Every PR must reference its specification
2. **One feature per PR** - Keep PRs focused and small
3. **All tests must pass** - Ensure CI is green
4. **Request a review** - Wait for approval before merging

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
