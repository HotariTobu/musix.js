# Contributing Guide

Thank you for your interest in contributing to musix.js!

## Development Setup

### Prerequisites

- [Bun](https://bun.sh/) (latest version)

### Installation

```bash
git clone https://github.com/HotariTobu/musix.js.git
cd musix.js
bun install
```

## Development Workflow

This project follows **Spec-Driven Development**. All features must have a specification before implementation.

### 1. Create a Specification

Before writing any code, create a specification in `docs/specs/`:

```
/spec-new <feature-name>
```

### 2. Review the Specification

Ensure the specification is complete and correct:

```
/spec-review <spec-filename>
```

### 3. Create a Branch

```bash
git checkout -b feature/<feature-name>
```

### 4. Implement

Follow the specification to implement the feature:

```
/spec-implement <spec-filename>
```

### 5. Test

```bash
bun test
```

### 6. Create a Pull Request

- Link to the related specification
- Ensure all tests pass
- Request a review

## Branch Naming

We use GitHub Flow. Branch names should follow this convention:

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/<name>` | `feature/spotify-adapter` |
| Bug fix | `fix/<name>` | `fix/auth-error` |
| Documentation | `docs/<name>` | `docs/api-guide` |
| Refactoring | `refactor/<name>` | `refactor/error-handling` |

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/).

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

### Examples

```
feat: add Spotify adapter

fix: handle rate limit errors

docs: update API documentation
```

## Code Style

This project uses [Biome](https://biomejs.dev/) for linting and formatting.

```bash
# Check for lint errors
bun run lint

# Format code
bun run format
```

## Testing

Tests are written using Bun Test and should be derived from specification requirements.

```bash
# Run all tests
bun test

# Run specific test file
bun test <file>
```

## Pull Request Guidelines

1. **Link the specification** - Every PR must reference its specification
2. **One feature per PR** - Keep PRs focused and small
3. **All tests must pass** - Ensure CI is green
4. **Request a review** - Wait for approval before merging

## Questions?

If you have any questions, feel free to open an issue.
