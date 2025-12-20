# Linter

## Overview

Biome's linter statically analyzes code to find errors and promote modern coding practices. It provides **397 rules** divided into organized groups and supports multiple languages.

## Key Features

- Static analysis across JavaScript, TypeScript, JSX, JSON, CSS, HTML, and GraphQL
- Safe and unsafe automatic fixes
- Configurable rule severity levels
- Technology-specific rule sets (React, TypeScript, testing frameworks)
- Detailed diagnostics with context

## Usage

### Basic Linting

Run linter on files:

```bash
npx @biomejs/biome lint ./src
```

### Apply Safe Fixes

Automatically apply fixes that don't alter code semantics:

```bash
npx @biomejs/biome lint --write ./src
```

### Apply All Fixes

Apply both safe and unsafe fixes (requires manual review):

```bash
npx @biomejs/biome lint --write --unsafe ./src
```

### Lint Specific Files

```bash
npx @biomejs/biome lint --write src/index.js src/utils.ts
```

### Lint Changed Files

Only lint files in staging area (requires VCS integration):

```bash
npx @biomejs/biome lint --write --staged
```

Lint only changed files:

```bash
npx @biomejs/biome lint --write --changed
```

## Safe vs Unsafe Fixes

### Safe Fixes

Safe fixes can be applied automatically without review because they don't alter code semantics:

- Removing unused imports
- Sorting imports
- Adding missing semicolons
- Removing unnecessary parentheses

Enable with `--write` flag:

```bash
biome lint --write ./src
```

### Unsafe Fixes

Unsafe fixes may change program behavior and require manual review:

- Type assertions
- Null coalescing conversions
- Complex refactoring suggestions

Enable with `--write --unsafe` flags:

```bash
biome lint --write --unsafe ./src
```

Or configure per-rule in `biome.json`:

```json
{
  "linter": {
    "rules": {
      "suspicious": {
        "noExplicitAny": {
          "level": "error",
          "fix": "unsafe"
        }
      }
    }
  }
}
```

## Configuration

### Enable Linter

```json
{
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  }
}
```

### Disable Specific Rules

```json
{
  "linter": {
    "rules": {
      "suspicious": {
        "noDebugger": "off",
        "noConsole": "off"
      }
    }
  }
}
```

### Adjust Rule Severity

```json
{
  "linter": {
    "rules": {
      "suspicious": {
        "noDebugger": "error",
        "noConsole": "warn",
        "noEmptyBlockStatements": "info"
      }
    }
  }
}
```

Severity levels:
- `"off"` - Disable the rule
- `"info"` - Informational message
- `"warn"` - Warning message (doesn't fail CI)
- `"error"` - Error message (fails CI)

### Configure Fix Behavior

```json
{
  "linter": {
    "rules": {
      "correctness": {
        "noUnusedVariables": {
          "level": "error",
          "fix": "safe"
        }
      },
      "suspicious": {
        "noExplicitAny": {
          "level": "warn",
          "fix": "unsafe"
        }
      }
    }
  }
}
```

Fix options:
- `"safe"` - Can be applied automatically
- `"unsafe"` - Requires manual review
- `"none"` - Suggest only, no automatic fix

### Enable/Disable Groups

Enable or disable entire rule categories:

```json
{
  "linter": {
    "rules": {
      "recommended": true,
      "suspicious": "off",
      "style": {
        "recommended": true,
        "useConst": "error"
      }
    }
  }
}
```

## Rule Categories

### Accessibility

Rules for web accessibility (a11y):
- ARIA attribute validation
- Interactive element semantics
- Keyboard navigation support
- Screen reader compatibility

### Complexity

Rules to reduce code complexity:
- Nested conditional depth
- Function complexity
- Cognitive complexity
- Boolean expression simplification

### Correctness

Rules for code correctness:
- Invalid syntax detection
- Type errors
- Logic errors
- Best practice violations

**Recommended**: Most correctness rules are enabled by default.

### Nursery

Experimental rules under development:
- New rule proposals
- Beta features
- Rules being refined

**Note**: Nursery rules are disabled by default. Enable explicitly:

```json
{
  "linter": {
    "rules": {
      "nursery": {
        "recommended": true
      }
    }
  }
}
```

### Performance

Rules for performance optimization:
- Inefficient patterns
- Unnecessary computations
- Memory leaks
- Render optimization

### Security

Rules for security vulnerabilities:
- XSS vulnerabilities
- Dangerous patterns
- Insecure APIs
- Data validation

### Style

Rules for code style consistency:
- Naming conventions
- Import ordering
- Code organization
- Modern syntax usage

### Suspicious

Rules for suspicious code patterns:
- Potential bugs
- Deprecated APIs
- Code smells
- Unsafe patterns

## Technology-Specific Rules

### React Rules

Automatically enabled when React is detected:

```json
{
  "linter": {
    "rules": {
      "recommended": true
    }
  }
}
```

React-specific rules include:
- Hook usage validation
- Component naming
- Props validation
- JSX best practices

### TypeScript Rules

Enabled for `.ts` and `.tsx` files:
- Type assertion safety
- Interface vs type usage
- Enum best practices
- Generic constraints

### Testing Framework Rules

Enabled for test files:
- Test structure
- Assertion patterns
- Mock usage
- Test naming

## Suppressing Rules

### Suppress Single Line

```javascript
// biome-ignore lint/suspicious/noDebugger: debugging production issue
debugger;
```

### Suppress Next Line

```javascript
// biome-ignore lint/suspicious/noConsole: temporary logging
console.log('Debug:', value);
```

### Suppress Multiple Rules

```javascript
// biome-ignore lint/suspicious/noDebugger lint/suspicious/noConsole: debugging
debugger;
console.log('Debug');
```

### Suppress Entire File

Add to the top of the file:

```javascript
// biome-ignore lint: generated file
```

### Suppress via Configuration

Use overrides for specific files:

```json
{
  "overrides": [
    {
      "include": ["scripts/**"],
      "linter": {
        "rules": {
          "suspicious": {
            "noConsole": "off"
          }
        }
      }
    }
  ]
}
```

## CLI Options

### Filter Rules

Run only specific rules:

```bash
biome lint --only=suspicious/noDebugger ./src
```

Skip specific rules:

```bash
biome lint --skip=style/useConst ./src
```

### Error Reporting

Control what counts as an error:

```bash
biome lint --error-on-warnings ./src
```

### Diagnostic Verbosity

Show more diagnostic details:

```bash
biome lint --verbose ./src
```

### Max Diagnostics

Limit number of diagnostics shown:

```bash
biome lint --max-diagnostics=50 ./src
```

## Examples

### Basic Configuration

```json
{
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noDebugger": "error",
        "noConsole": "warn"
      },
      "style": {
        "useConst": "error",
        "useTemplate": "warn"
      }
    }
  }
}
```

### Strict Configuration

```json
{
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": "error",
      "suspicious": "error",
      "security": "error",
      "performance": "warn",
      "style": {
        "recommended": true
      },
      "nursery": {
        "recommended": true
      }
    }
  }
}
```

### Project-Specific Configuration

```json
{
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noConsole": "off",
        "noDebugger": "error"
      }
    }
  },
  "overrides": [
    {
      "include": ["src/**/*.test.ts"],
      "linter": {
        "rules": {
          "suspicious": {
            "noConsole": "off",
            "noExplicitAny": "off"
          }
        }
      }
    },
    {
      "include": ["scripts/**"],
      "linter": {
        "rules": {
          "suspicious": {
            "noConsole": "off"
          },
          "style": "off"
        }
      }
    }
  ]
}
```

## Rule Documentation

To get documentation for a specific rule:

```bash
biome explain noDebugger
```

Or visit the Biome website to browse all 397 rules with examples and explanations.

## Migration from ESLint

Use the automated migration command:

```bash
biome migrate eslint --write
```

This command:
- Reads ESLint configuration
- Maps ESLint rules to Biome equivalents
- Converts `.eslintignore` files
- Supports major ESLint plugins (TypeScript, React, JSX A11y, Unicorn)

See the [Migration Guide](migration.md) for details.
