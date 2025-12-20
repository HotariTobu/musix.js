# Migration from ESLint and Prettier

## Quick Migration

Biome provides automated migration commands:

```bash
# Migrate from ESLint
biome migrate eslint --write

# Migrate from Prettier
biome migrate prettier --write
```

## Migrating from ESLint

### Automated Migration

The migration command reads your ESLint configuration and converts it to Biome format:

```bash
biome migrate eslint --write
```

**What it does:**
- Reads ESLint configuration (both legacy `.eslintrc.*` and flat `eslint.config.js` formats)
- Processes `extends` fields and loads shared configurations
- Converts supported plugins (TypeScript, JSX A11y, React, Unicorn)
- Migrates `.eslintignore` files to Biome's `files.ignore`
- Creates or updates `biome.json`

### Include Inspired Rules

To include rules inspired by ESLint (not exact equivalents):

```bash
biome migrate eslint --write --include-inspired
```

### Requirements

- Node.js is required to resolve plugins and configurations
- ESLint and plugins should be installed in your project

### Supported Plugins

The migration supports these popular ESLint plugins:

- **@typescript-eslint** - TypeScript-specific rules
- **eslint-plugin-jsx-a11y** - Accessibility rules for JSX
- **eslint-plugin-react** - React-specific rules
- **eslint-plugin-react-hooks** - React Hooks rules
- **eslint-plugin-unicorn** - Additional JS/TS rules

### Rule Name Differences

Biome uses `camelCaseRuleName` format instead of ESLint's `kebab-case-rule-name`:

**ESLint:**
```json
{
  "rules": {
    "no-debugger": "error",
    "prefer-const": "warn"
  }
}
```

**Biome:**
```json
{
  "linter": {
    "rules": {
      "suspicious": {
        "noDebugger": "error"
      },
      "style": {
        "useConst": "warn"
      }
    }
  }
}
```

### Rule Mapping

Many ESLint rules have Biome equivalents with different names:

| ESLint Rule | Biome Rule |
|-------------|------------|
| `no-debugger` | `suspicious/noDebugger` |
| `no-console` | `suspicious/noConsole` |
| `prefer-const` | `style/useConst` |
| `no-unused-vars` | `correctness/noUnusedVariables` |
| `eqeqeq` | `suspicious/noDoubleEquals` |
| `no-var` | `style/noVar` |

See the Biome rules documentation for a complete mapping.

### Important Notes

- The migration may disable `recommended` rules and configure individual rules explicitly
- Some ESLint rule options may not have Biome equivalents
- Biome has chosen not to implement some rule options that conflict with its design philosophy
- Cyclic references in plugin dependencies may cause loading failures

### VCS Integration

Enable VCS integration for consistent ignore file handling:

```json
{
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  }
}
```

### Example Migration

**Before (.eslintrc.json):**

```json
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "plugins": ["@typescript-eslint", "react"],
  "rules": {
    "no-console": "warn",
    "prefer-const": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "react/jsx-uses-react": "off"
  }
}
```

**After (biome.json):**

```json
{
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noConsole": "warn",
        "noExplicitAny": "warn"
      },
      "style": {
        "useConst": "error"
      }
    }
  }
}
```

## Migrating from Prettier

### Automated Migration

```bash
biome migrate prettier --write
```

**What it does:**
- Reads `.prettierrc`, `.prettierrc.json`, `.prettierrc.js`, or `prettier.config.js`
- Converts Prettier options to Biome formatter configuration
- Migrates `.prettierignore` to Biome's `files.ignore`
- Updates or creates `biome.json`

### Supported Formats

- `.prettierrc` (JSON)
- `.prettierrc.json`
- `.prettierrc.js` (requires Node.js)
- `prettier.config.js` (requires Node.js)

**Not supported:**
- JSON5 format
- TOML format
- YAML format

### Default Differences

Biome has different defaults than Prettier:

| Option | Prettier Default | Biome Default |
|--------|-----------------|---------------|
| `indentStyle` | `space` | `tab` |
| `indentWidth` | `2` | `2` |
| `lineWidth` | `80` | `80` |
| `quoteStyle` | `double` | `double` |
| `semicolons` | `true` | `always` |
| `trailingCommas` | `es5` (older), `all` (newer) | `all` |

The migration automatically adjusts these in `biome.json`.

### Option Mapping

| Prettier Option | Biome Option |
|----------------|--------------|
| `useTabs` | `formatter.indentStyle` (`tab`/`space`) |
| `tabWidth` | `formatter.indentWidth` |
| `printWidth` | `formatter.lineWidth` |
| `endOfLine` | `formatter.lineEnding` |
| `semi` | `javascript.formatter.semicolons` |
| `singleQuote` | `javascript.formatter.quoteStyle` |
| `jsxSingleQuote` | `javascript.formatter.jsxQuoteStyle` |
| `trailingComma` | `javascript.formatter.trailingCommas` |
| `bracketSpacing` | `formatter.bracketSpacing` |
| `arrowParens` | `javascript.formatter.arrowParentheses` |

### VCS Integration

Enable VCS integration to respect `.prettierignore`:

```json
{
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  }
}
```

### Example Migration

**Before (.prettierrc):**

```json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

**After (biome.json):**

```json
{
  "formatter": {
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "semicolons": "asNeeded",
      "quoteStyle": "single",
      "trailingCommas": "es5"
    }
  }
}
```

## Migrating Both Tools

You can migrate from both ESLint and Prettier:

```bash
# Migrate both
biome migrate eslint --write
biome migrate prettier --write
```

Or in one configuration:

```bash
# Create initial config from Prettier
biome migrate prettier --write

# Add ESLint rules
biome migrate eslint --write
```

## Manual Migration

If automated migration doesn't work, manually create `biome.json`:

### Step 1: Create Base Configuration

```bash
biome init
```

### Step 2: Add Formatter Settings

Copy your Prettier settings to the formatter section:

```json
{
  "formatter": {
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "asNeeded"
    }
  }
}
```

### Step 3: Add Linter Rules

Map ESLint rules to Biome:

```json
{
  "linter": {
    "rules": {
      "recommended": true,
      "suspicious": {
        "noConsole": "warn",
        "noDebugger": "error"
      },
      "style": {
        "useConst": "error"
      }
    }
  }
}
```

### Step 4: Add Ignore Patterns

Combine `.eslintignore` and `.prettierignore`:

```json
{
  "files": {
    "ignore": [
      "**/node_modules",
      "**/dist",
      "**/build",
      "**/*.min.js"
    ]
  }
}
```

Or enable VCS integration:

```json
{
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  }
}
```

## Validation

After migration, validate the configuration:

```bash
# Test formatting
biome format ./src

# Test linting
biome lint ./src

# Test everything
biome check ./src
```

Compare results with your previous tools to ensure compatibility.

## Uninstalling ESLint and Prettier

Once migration is complete and validated:

### Remove Dependencies

```bash
# npm
npm uninstall eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react

# pnpm
pnpm remove eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react

# yarn
yarn remove eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react
```

### Remove Configuration Files

```bash
rm .eslintrc.json .eslintrc.js .eslintignore
rm .prettierrc .prettierrc.json .prettierignore
```

### Update Scripts

**Before (package.json):**

```json
{
  "scripts": {
    "lint": "eslint src",
    "format": "prettier --write src"
  }
}
```

**After (package.json):**

```json
{
  "scripts": {
    "lint": "biome lint --write src",
    "format": "biome format --write src",
    "check": "biome check --write src"
  }
}
```

## Incremental Migration

For large projects, migrate incrementally:

### Option 1: Run in Parallel

Keep ESLint/Prettier while testing Biome:

```json
{
  "scripts": {
    "lint:eslint": "eslint src",
    "lint:biome": "biome lint src",
    "format:prettier": "prettier --write src",
    "format:biome": "biome format --write src"
  }
}
```

### Option 2: Migrate by Directory

```json
{
  "overrides": [
    {
      "include": ["src/new-code/**"],
      "linter": {
        "enabled": true
      }
    },
    {
      "include": ["src/legacy/**"],
      "linter": {
        "enabled": false
      }
    }
  ]
}
```

### Option 3: Migrate by Feature

Start with formatting only, then add linting:

```bash
# Week 1: Format only
biome format --write ./src

# Week 2: Add safe linting
biome lint --write ./src

# Week 3: Full check
biome check --write ./src
```

## Common Issues

### Missing Rules

Some ESLint rules may not have Biome equivalents. Document these:

```json
{
  "linter": {
    "rules": {
      "recommended": true
    }
  }
}
```

Add a comment in `biome.json`:

```jsonc
{
  // Note: ESLint's 'import/order' is handled by Biome's import sorting
  // Note: ESLint's 'no-restricted-imports' - manually review imports
  "linter": {
    "rules": {
      "recommended": true
    }
  }
}
```

### Different Behavior

Some rules may behave differently. Test thoroughly:

```bash
# Compare ESLint and Biome output
eslint src --format json > eslint-output.json
biome lint src --reporter json > biome-output.json
```

### Performance

Biome is significantly faster, but may find different issues:

```bash
# Benchmark
time eslint src
time biome lint src
```

## Resources

- [Biome Rules Documentation](https://biomejs.dev/linter/rules/) - Complete rule reference
- [ESLint to Biome Rule Mapping](https://biomejs.dev/linter/rules-sources/) - Rule equivalents
- [Biome Discord](https://biomejs.dev/chat) - Community support
