# Large Projects and Monorepos

## Hierarchical Configuration

Biome supports hierarchical configuration files that traverse upward through your directory structure. This allows you to apply different settings based on the project or folder by placing `biome.json` files at strategic locations.

## Monorepo Setup

Biome v2+ provides native monorepo support through configuration inheritance.

### Root Configuration

Create a base `biome.json` at your monorepo root with shared standards:

**monorepo-root/biome.json:**

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true,
    "defaultBranch": "main"
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 4,
    "lineWidth": 120
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noDebugger": "error"
      }
    }
  },
  "files": {
    "ignore": [
      "**/node_modules",
      "**/dist",
      "**/build",
      "**/.next",
      "**/coverage"
    ]
  }
}
```

### Package-Specific Configuration

Add nested configurations using the `"extends": "//"` microsyntax to inherit root settings:

**monorepo-root/packages/web/biome.json:**

```json
{
  "extends": "//",
  "linter": {
    "rules": {
      "suspicious": {
        "noConsole": "off"
      }
    }
  },
  "javascript": {
    "formatter": {
      "semicolons": "asNeeded"
    }
  }
}
```

**monorepo-root/packages/api/biome.json:**

```json
{
  "extends": "//",
  "linter": {
    "rules": {
      "suspicious": {
        "noConsole": "warn"
      },
      "performance": {
        "recommended": true
      }
    }
  }
}
```

### The "//" Microsyntax

`"extends": "//"` is special syntax that:
- References the monorepo root configuration
- Automatically sets `"root": false` (no need to specify)
- Resolves to the nearest parent `biome.json` with `"root": true`

## Configuration Inheritance

### Multiple Configuration Sources

The `extends` field accepts arrays for multiple sources:

```json
{
  "extends": [
    "//",
    "./shared-config.json",
    "@company/biome-config"
  ]
}
```

**Resolution order:**
- Later files override earlier ones
- Paths resolve relative to the `biome.json` location
- Array items are processed left to right

### NPM Package Configurations

Share configurations via NPM packages:

**@company/biome-config/package.json:**

```json
{
  "name": "@company/biome-config",
  "version": "1.0.0",
  "exports": {
    ".": "./biome.json"
  }
}
```

**@company/biome-config/biome.json:**

```json
{
  "formatter": {
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "rules": {
      "recommended": true,
      "suspicious": {
        "noDebugger": "error"
      }
    }
  }
}
```

**Using the shared config:**

```json
{
  "extends": ["@company/biome-config"],
  "linter": {
    "rules": {
      "style": {
        "useConst": "error"
      }
    }
  }
}
```

### Constraints

- Files you extend from **cannot extend other files** themselves
- This prevents circular dependencies and keeps configuration clear

## Example Monorepo Structure

```
monorepo/
├── biome.json                    # Root config
├── packages/
│   ├── web/
│   │   ├── biome.json           # Extends root, custom web rules
│   │   └── src/
│   ├── api/
│   │   ├── biome.json           # Extends root, custom API rules
│   │   └── src/
│   ├── shared/
│   │   ├── biome.json           # Extends root, library rules
│   │   └── src/
│   └── mobile/
│       ├── biome.json           # Extends root, mobile rules
│       └── src/
└── tools/
    └── scripts/
        └── biome.json           # Extends root, scripts rules
```

### Root Configuration

**monorepo/biome.json:**

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "root": true,
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "formatter": {
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": "error",
      "suspicious": {
        "noDebugger": "error",
        "noConsole": "warn"
      }
    }
  }
}
```

### Web Package

**monorepo/packages/web/biome.json:**

```json
{
  "extends": "//",
  "linter": {
    "rules": {
      "suspicious": {
        "noConsole": "off"
      },
      "a11y": {
        "recommended": true
      }
    }
  }
}
```

### API Package

**monorepo/packages/api/biome.json:**

```json
{
  "extends": "//",
  "linter": {
    "rules": {
      "suspicious": {
        "noConsole": "info"
      },
      "performance": {
        "recommended": true
      },
      "security": {
        "recommended": true
      }
    }
  }
}
```

### Shared Library

**monorepo/packages/shared/biome.json:**

```json
{
  "extends": "//",
  "linter": {
    "rules": {
      "suspicious": {
        "noConsole": "error"
      },
      "style": {
        "noDefaultExport": "error"
      }
    }
  }
}
```

### Scripts/Tools

**monorepo/tools/scripts/biome.json:**

```json
{
  "extends": "//",
  "linter": {
    "rules": {
      "suspicious": {
        "noConsole": "off"
      },
      "style": "off"
    }
  }
}
```

## Running Biome in Monorepos

### Check Entire Monorepo

```bash
# From root
biome check .

# With write
biome check --write .
```

### Check Specific Package

```bash
# From root
biome check packages/web

# From package directory
cd packages/web
biome check .
```

### Package-Specific Scripts

**packages/web/package.json:**

```json
{
  "scripts": {
    "lint": "biome lint --write .",
    "format": "biome format --write .",
    "check": "biome check --write ."
  }
}
```

### Root-Level Scripts

**package.json:**

```json
{
  "scripts": {
    "lint": "biome lint --write .",
    "format": "biome format --write .",
    "check": "biome check --write .",
    "check:web": "biome check --write packages/web",
    "check:api": "biome check --write packages/api",
    "ci": "biome ci ."
  }
}
```

### Workspace Scripts (pnpm/npm/yarn)

**package.json:**

```json
{
  "scripts": {
    "check:all": "pnpm -r exec biome check --write ."
  }
}
```

## Advanced Patterns

### Per-Package Overrides

Apply different rules to different file types within a package:

**packages/web/biome.json:**

```json
{
  "extends": "//",
  "overrides": [
    {
      "include": ["**/*.test.ts", "**/*.test.tsx"],
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
      "include": ["src/components/**"],
      "linter": {
        "rules": {
          "a11y": {
            "recommended": true
          }
        }
      }
    }
  ]
}
```

### Environment-Specific Configuration

**packages/api/biome.json:**

```json
{
  "extends": "//",
  "overrides": [
    {
      "include": ["src/dev/**"],
      "linter": {
        "rules": {
          "suspicious": {
            "noConsole": "off"
          }
        }
      }
    },
    {
      "include": ["src/prod/**"],
      "linter": {
        "rules": {
          "suspicious": {
            "noConsole": "error"
          },
          "security": {
            "recommended": true
          }
        }
      }
    }
  ]
}
```

### Technology-Specific Rules

**packages/web/biome.json (React):**

```json
{
  "extends": "//",
  "linter": {
    "rules": {
      "recommended": true,
      "a11y": {
        "recommended": true
      }
    }
  }
}
```

**packages/api/biome.json (Node.js):**

```json
{
  "extends": "//",
  "linter": {
    "rules": {
      "recommended": true,
      "security": {
        "recommended": true
      },
      "performance": {
        "recommended": true
      }
    }
  }
}
```

## Large Project Optimization

### File Size Limits

Control maximum file size to skip very large files:

```json
{
  "files": {
    "maxSize": 2097152
  }
}
```

### Ignore Patterns

Use force-ignore (`!!`) to prevent scanner from indexing output folders:

```json
{
  "files": {
    "ignore": [
      "!!**/dist",
      "!!**/build",
      "!!**/.next",
      "**/node_modules"
    ]
  }
}
```

### VCS Integration

Enable VCS to automatically respect `.gitignore`:

```json
{
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  }
}
```

### Changed Files Only

For faster checks in large codebases:

```bash
# Check only changed files
biome check --changed

# Check only staged files
biome check --staged

# Check changes since main
biome check --since=main
```

## CI/CD for Monorepos

### GitHub Actions

**.github/workflows/ci.yml:**

```yaml
name: CI

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx @biomejs/biome ci --reporter=github .
```

### Package-Specific CI

```yaml
jobs:
  web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx @biomejs/biome ci packages/web

  api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx @biomejs/biome ci packages/api
```

### Changed Files Only

```yaml
- name: Get changed files
  id: changed-files
  uses: tj-actions/changed-files@v35

- name: Run Biome on changed files
  if: steps.changed-files.outputs.any_changed == 'true'
  run: |
    npx @biomejs/biome ci --changed
```

## Best Practices

### Keep Root Configuration Minimal

Only include shared, organization-wide rules in the root:

```json
{
  "formatter": {
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "rules": {
      "recommended": true,
      "suspicious": {
        "noDebugger": "error"
      }
    }
  }
}
```

### Package-Specific Customization

Let packages override as needed:

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

### Document Deviations

When packages deviate from root config, document why:

```jsonc
{
  "extends": "//",
  "linter": {
    "rules": {
      // Dev tools need console for debugging
      "suspicious": {
        "noConsole": "off"
      }
    }
  }
}
```

### Use VCS Integration

Enable VCS for all packages:

```json
{
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  }
}
```

### Incremental Adoption

Start with root config, gradually add package-specific configs:

1. Week 1: Root config only
2. Week 2: Add web package config
3. Week 3: Add API package config
4. Week 4: Fine-tune all configs
