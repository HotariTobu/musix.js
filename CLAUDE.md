# musix.js

See [README.md](README.md) for project overview.

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

This repository follows **Spec-Driven Development**. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow.

### Rules

1. **Write specs before code** - Always create a specification before implementation
2. **Keep change history** - Update the history section when modifying specs
3. **Follow the spec** - Do not implement features not described in the spec
4. **Derive tests from specs** - Test cases should be based on spec requirements

### Slash Commands

| Command | Description |
|---------|-------------|
| `/spec-new <name>` | Create a new specification with progress.json |
| `/spec-review <file>` | Review a specification |

## Web Search Rules

When performing web searches to obtain up-to-date information:

1. **Avoid specifying years** - Do not include specific years in search queries to get the latest information
2. **Verify current date first** - If a year must be specified, always check the current date before searching

These rules ensure that search results are not limited to outdated information.

## Session Protocol

This project uses session management to maintain continuity across coding sessions.

### Starting a Session

Run `/session-start [spec-name]` to:
- Load progress for the target spec
- Review recent git history
- Identify next incomplete requirement
- Create a focused plan for this session

### Ending a Session

Run `/session-end` to:
- Update progress.json for the worked spec
- Create a commit with What/Why/Next/Blockers format
- Ensure continuity for next session

### Progress Tracking

- Each spec folder contains `progress.json`
- Only update `passes` field, never delete requirements
- Mark `status: completed` only after all requirements verified

### Slash Commands (Session)

| Command | Description |
|---------|-------------|
| `/session-start [spec-name]` | Start a session with progress review |
| `/session-end` | End session with progress update and commit |
| `/status` | Show progress summary of all specs |

## Agent Guardrails

Rules to prevent common failure patterns in long-running agent sessions.

### Preflight Check

Run `./preflight.sh` to verify codebase health. This script is used by:
- CI (before merge)
- `/session-start` (before starting work)
- `/session-end` (before committing)

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

A requirement can only be marked as `passes: true` when ALL of the following are met:

1. `./preflight.sh` passes (tests + code quality)
2. Manual verification completed (when applicable)
3. You have actually verified the behavior, not assumed it works

**"Probably works" = `passes: false`**

Never mark a requirement as passed based on assumption. If you cannot verify, leave it as false and document what verification is needed.

### Session Boundaries

- Start each session by reading progress.json and recent git history
- End each session with a quality gate (`./preflight.sh`) and structured commit
- Leave the codebase ready for the next session to start immediately

### Recovery from Failed Sessions

If a session ends with broken state:
1. `git stash` or `git reset --soft HEAD~1` to preserve work
2. Run `/session-start` to re-orient
3. Document what went wrong in blockers
4. Split the failed requirement into smaller pieces

## Implementation Guidelines

Rules for implementing features based on specifications.

- Do not implement features not described in the specification
- Strictly follow the type definitions in the specification
- Tests must cover the test requirements in the specification
- If unclear points are found during implementation, confirm before implementing

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for commands, coding standards, and guidelines.
