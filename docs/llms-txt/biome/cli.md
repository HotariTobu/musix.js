# CLI Reference

## Main Commands

### biome check

Runs formatter, linter, and import sorting together. This is the most comprehensive command.

```bash
biome check [OPTIONS] [PATH]...
```

**Common usage:**

```bash
# Check all files
biome check ./src

# Check and apply safe fixes
biome check --write ./src

# Check and apply all fixes (safe + unsafe)
biome check --write --unsafe ./src

# Check only staged files
biome check --write --staged

# Check only changed files
biome check --write --changed
```

**Key options:**
- `--write` - Apply safe fixes and formatting
- `--unsafe` - Also apply unsafe fixes
- `--staged` - Only check Git staged files
- `--changed` - Only check Git changed files
- `--since=BRANCH` - Check files changed since a branch

### biome format

Run the formatter on files.

```bash
biome format [OPTIONS] [PATH]...
```

**Common usage:**

```bash
# Check formatting (dry run)
biome format ./src

# Apply formatting
biome format --write ./src

# Format specific files
biome format --write src/index.js src/utils.ts

# Format only staged files
biome format --write --staged
```

**Key options:**
- `--write` - Apply formatting changes
- `--staged` - Only format staged files
- `--changed` - Only format changed files

### biome lint

Run the linter on files.

```bash
biome lint [OPTIONS] [PATH]...
```

**Common usage:**

```bash
# Lint files
biome lint ./src

# Lint and apply safe fixes
biome lint --write ./src

# Lint and apply all fixes
biome lint --write --unsafe ./src

# Lint specific files
biome lint src/index.js src/utils.ts
```

**Key options:**
- `--write` - Apply safe fixes
- `--unsafe` - Also apply unsafe fixes
- `--only=RULE` - Run only specific rules
- `--skip=RULE` - Skip specific rules
- `--staged` - Only lint staged files
- `--changed` - Only lint changed files

**Examples:**

```bash
# Run only specific rule
biome lint --only=suspicious/noDebugger ./src

# Skip specific rule
biome lint --skip=style/useConst ./src

# Multiple filters
biome lint --only=suspicious --skip=suspicious/noConsole ./src
```

### biome ci

Optimized command for CI environments. Runs checks in read-only mode.

```bash
biome ci [OPTIONS] [PATH]...
```

**Common usage:**

```bash
# CI check
biome ci ./src

# CI check with changed files only
biome ci --changed

# CI check since main branch
biome ci --since=main
```

**Differences from `check`:**
- Read-only mode (no `--write`)
- Optimized error reporting for CI
- Different exit codes for different error types

## Utility Commands

### biome init

Initialize a new Biome project with default configuration.

```bash
biome init [OPTIONS]
```

**Options:**
- `--jsonc` - Create `biome.jsonc` instead of `biome.json`

**Example:**

```bash
# Create biome.json
biome init

# Create biome.jsonc
biome init --jsonc
```

### biome migrate

Migrate configuration from other tools.

```bash
# Migrate from Prettier
biome migrate prettier --write

# Migrate from ESLint
biome migrate eslint --write

# Include inspired rules (ESLint)
biome migrate eslint --write --include-inspired
```

### biome version

Display version information.

```bash
biome version
```

### biome rage

Print debugging information for bug reports.

```bash
# Basic debug info
biome rage

# Include daemon logs
biome rage --daemon-logs

# Include formatter info
biome rage --formatter

# Include linter info
biome rage --linter
```

### biome explain

Get documentation for rules and CLI features.

```bash
# Explain a rule
biome explain noDebugger

# Explain a CLI option
biome explain --write
```

### biome start / biome stop

Manage the Biome daemon server.

```bash
# Start daemon
biome start

# Stop daemon
biome stop
```

### biome clean

Remove daemon-generated logs.

```bash
biome clean
```

### biome lsp-proxy

Language Server Protocol proxy for editor integration.

```bash
biome lsp-proxy
```

**Note**: Usually invoked by editor extensions, not manually.

## Global Options

These options work with all commands:

### Configuration

- `--config-path=PATH` - Path to `biome.json` file
- `--no-config` - Disable configuration file discovery

**Example:**

```bash
biome check --config-path=./configs/biome.json ./src
```

### Output Control

- `--colors=MODE` - Color output: `off`, `auto`, `force`
- `--verbose` - Enable verbose output
- `--diagnostic-level=LEVEL` - Diagnostic level: `info`, `warn`, `error`
- `--max-diagnostics=N` - Maximum number of diagnostics to display

**Example:**

```bash
biome check --colors=force --verbose ./src
```

### Reporters

- `--reporter=FORMAT` - Output format

Available formats:
- `summary` (default) - Human-readable summary
- `json` - JSON output
- `json-pretty` - Pretty JSON output
- `github` - GitHub Actions format
- `junit` - JUnit XML format
- `gitlab` - GitLab format

**Example:**

```bash
# For CI
biome ci --reporter=github ./src

# For IDE integration
biome lint --reporter=json ./src

# For test reporting
biome ci --reporter=junit > test-results.xml
```

### Logging

- `--log-level=LEVEL` - Log level: `none`, `debug`, `info`, `warn`, `error`
- `--log-kind=KIND` - Log kind: `pretty`, `compact`, `json`

**Example:**

```bash
biome check --log-level=debug --log-kind=json ./src
```

## File Filtering

### By Path

Specify files or directories:

```bash
# Single file
biome check src/index.js

# Multiple files
biome check src/index.js src/utils.ts

# Directory
biome check ./src

# Multiple directories
biome check ./src ./tests
```

### By Git Status

- `--staged` - Only files in Git staging area
- `--changed` - Only files with uncommitted changes
- `--since=BRANCH` - Files changed since a branch

**Example:**

```bash
# Pre-commit hook
biome check --write --staged

# Check changes before PR
biome check --since=main
```

### By Pattern

Use configuration file for glob patterns:

```json
{
  "files": {
    "include": ["src/**/*.{js,ts,jsx,tsx}"],
    "ignore": ["**/*.test.js", "**/dist/**"]
  }
}
```

## Common Workflows

### Pre-commit Hook

```bash
biome check --write --staged
```

### CI Pipeline

```bash
# Basic CI check
biome ci ./src

# CI with specific reporter
biome ci --reporter=github ./src

# CI for changed files only
biome ci --changed
```

### Format Only

```bash
# Check formatting
biome format ./src

# Fix formatting
biome format --write ./src
```

### Lint Only

```bash
# Check linting
biome lint ./src

# Fix safe issues
biome lint --write ./src

# Fix all issues
biome lint --write --unsafe ./src
```

### Check Everything

```bash
# Check all
biome check ./src

# Fix safe issues
biome check --write ./src

# Fix all issues
biome check --write --unsafe ./src
```

## Exit Codes

- `0` - Success, no issues found
- `1` - General error or issues found
- Other codes - Specific error conditions

For CI, use the exit code to fail builds on issues:

```bash
biome ci ./src || exit 1
```

## Environment Variables

### BIOME_LOG_PATH

Set custom log directory:

```bash
export BIOME_LOG_PATH=/tmp/biome-logs
biome check ./src
```

### NO_COLOR

Disable colored output:

```bash
export NO_COLOR=1
biome check ./src
```

## Examples

### Basic Usage

```bash
# Check project
biome check ./src

# Format project
biome format --write ./src

# Lint project
biome lint --write ./src
```

### Pre-commit Hook

```bash
#!/bin/sh
biome check --write --staged
```

### CI Configuration

**.github/workflows/ci.yml**

```yaml
- name: Run Biome
  run: biome ci --reporter=github ./src
```

**GitLab CI**

```yaml
lint:
  script:
    - biome ci --reporter=gitlab ./src
```

### Advanced Usage

```bash
# Check changed files with verbose output
biome check --changed --verbose --reporter=json-pretty

# Lint with specific rules only
biome lint --only=suspicious/noDebugger --only=correctness/noUnusedVariables ./src

# Format with custom config
biome format --write --config-path=./custom-biome.json ./src

# CI check for PR
biome ci --since=origin/main --reporter=github
```

### NPM Scripts

**package.json**

```json
{
  "scripts": {
    "format": "biome format --write ./src",
    "lint": "biome lint --write ./src",
    "check": "biome check --write ./src",
    "ci": "biome ci ./src"
  }
}
```

Usage:

```bash
npm run format
npm run lint
npm run check
npm run ci
```
