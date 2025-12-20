# Configuration Guide

## Configuration File

Biome uses `biome.json` or `biome.jsonc` configuration files. The file is typically placed at your project root.

### File Discovery

Biome automatically searches the working directory and parent folders for configuration files. If both `biome.json` and `biome.jsonc` exist in the same location, `biome.json` takes precedence.

### Basic Structure

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "indentWidth": 2,
    "lineWidth": 80
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  }
}
```

## Schema and Extension

### Schema Validation

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json"
}
```

### Extending Configurations

Inherit settings from other configuration files:

```json
{
  "extends": ["./base.json", "@org/shared-configs/biome"]
}
```

For monorepos, use the `"//"` microsyntax to reference the root:

```json
{
  "extends": "//",
  "linter": {
    "rules": {
      "suspicious": {
        "noConsole": "off"
      }
    }
  }
}
```

## File Patterns

Control which files Biome processes using the `files` section:

```json
{
  "files": {
    "includes": ["src/**/*.js", "src/**/*.ts"],
    "ignore": ["**/node_modules", "**/dist"],
    "maxSize": 1048576
  }
}
```

### Pattern Syntax

- `*` matches characters except path separators
- `**` recursively matches all directories
- `!pattern` excludes matching files
- `!!pattern` force-ignores (prevents scanner indexing)

### Examples

```json
{
  "files": {
    "includes": [
      "src/**/*.{js,ts,jsx,tsx}",
      "!src/**/*.test.js"
    ],
    "ignore": [
      "**/*.min.js",
      "**/vendor/**"
    ]
  }
}
```

## VCS Integration

Enable version control system integration to respect ignore files:

```json
{
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true,
    "defaultBranch": "main"
  }
}
```

### Benefits

- Respects `.gitignore` files
- Enables `--changed` and `--staged` CLI flags
- Detects changes against the default branch

## Formatter Configuration

### Global Formatter Options

```json
{
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "tab",
    "indentWidth": 2,
    "lineEnding": "lf",
    "lineWidth": 80,
    "attributePosition": "auto",
    "bracketSpacing": true,
    "useEditorconfig": false
  }
}
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `enabled` | `true` | Enable/disable formatter |
| `indentStyle` | `"tab"` | Use `"tab"` or `"space"` |
| `indentWidth` | `2` | Number of spaces per indent level |
| `lineEnding` | `"lf"` | Line ending: `"lf"`, `"crlf"`, or `"cr"` |
| `lineWidth` | `80` | Maximum characters per line |
| `bracketSpacing` | `true` | Add spaces inside object braces |
| `attributePosition` | `"auto"` | HTML/JSX attribute position |
| `formatWithErrors` | `false` | Format files with syntax errors |
| `useEditorconfig` | `false` | Respect `.editorconfig` settings |

### Language-Specific Formatting

#### JavaScript/TypeScript

```json
{
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "jsxQuoteStyle": "double",
      "trailingCommas": "all",
      "semicolons": "always",
      "arrowParentheses": "always",
      "bracketSameLine": false,
      "quoteProperties": "asNeeded"
    }
  }
}
```

#### JSON

```json
{
  "json": {
    "formatter": {
      "trailingCommas": "none"
    },
    "parser": {
      "allowComments": false,
      "allowTrailingCommas": false
    }
  }
}
```

#### CSS

```json
{
  "css": {
    "formatter": {
      "quoteStyle": "double"
    },
    "parser": {
      "cssModules": false
    }
  }
}
```

## Linter Configuration

### Basic Linter Setup

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

### Rule Configuration

Enable/disable specific rules:

```json
{
  "linter": {
    "rules": {
      "suspicious": {
        "noDebugger": "off",
        "noConsole": "warn"
      },
      "complexity": {
        "noExtraBooleanCast": "error"
      }
    }
  }
}
```

### Severity Levels

- `"off"` - Disable the rule
- `"info"` - Informational message
- `"warn"` - Warning message
- `"error"` - Error message

### Fix Configuration

Control automatic fixes:

```json
{
  "linter": {
    "rules": {
      "suspicious": {
        "noDebugger": {
          "level": "error",
          "fix": "safe"
        }
      }
    }
  }
}
```

Fix options: `"safe"`, `"unsafe"`, or `"none"`

### Rule Categories

- `accessibility` - Web accessibility rules
- `complexity` - Code complexity reduction
- `correctness` - Code correctness checks
- `nursery` - Experimental rules (disabled by default)
- `performance` - Performance optimizations
- `security` - Security vulnerabilities
- `style` - Code style preferences
- `suspicious` - Suspicious code patterns

## Overrides

Apply different configurations to specific files:

```json
{
  "overrides": [
    {
      "include": ["generated/**"],
      "formatter": {
        "lineWidth": 160,
        "indentStyle": "space"
      }
    },
    {
      "include": ["test/**"],
      "linter": {
        "rules": {
          "suspicious": {
            "noConsole": "off"
          }
        }
      }
    },
    {
      "include": ["*.config.js"],
      "linter": {
        "rules": {
          "style": {
            "useNodejsImportProtocol": "off"
          }
        }
      }
    }
  ]
}
```

**Note**: First matching pattern takes precedence. Order matters.

## Protected Files

Biome automatically ignores these lock files:
- `package-lock.json`
- `yarn.lock`
- `npm-shrinkwrap.json`
- `composer.lock`

## Complete Example

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true,
    "defaultBranch": "main"
  },
  "files": {
    "includes": ["src/**/*.{js,ts,jsx,tsx}", "scripts/**/*.js"],
    "ignore": ["**/dist", "**/coverage", "**/*.min.js"],
    "maxSize": 1048576
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noDebugger": "error",
        "noConsole": "warn"
      },
      "style": {
        "useImportType": "error"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "es5",
      "semicolons": "asNeeded"
    }
  },
  "overrides": [
    {
      "include": ["test/**"],
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
