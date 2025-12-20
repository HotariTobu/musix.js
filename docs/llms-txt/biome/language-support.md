# Language Support

## Overview

Biome supports multiple languages with varying levels of feature completeness across parsing, formatting, linting, and plugin capabilities.

## Supported Languages

### Fully Supported

These languages have complete support across all features:

#### JavaScript (ES2024)
- **Parsing**: Full ES2024 syntax support
- **Formatting**: Complete
- **Linting**: 397 rules available
- **Features**: Import sorting, safe/unsafe fixes

#### TypeScript (5.6)
- **Parsing**: TypeScript 5.6 syntax
- **Formatting**: Complete
- **Linting**: TypeScript-specific rules
- **Features**: Type-aware linting, decorators support

**Note**: Biome only supports official TypeScript syntax. Stage 3+ proposals are supported once in development.

#### JSX and TSX
- **Parsing**: React JSX syntax
- **Formatting**: Complete with JSX-specific options
- **Linting**: JSX and React rules
- **Features**: Accessibility (a11y) rules, Hook rules

#### JSON and JSONC
- **Parsing**: Standard JSON and JSON with Comments
- **Formatting**: Complete
- **Linting**: JSON-specific rules
- **Features**: Automatic well-known file detection

**Well-known files** automatically parsed as JSONC:
- `tsconfig.json`
- `.babelrc`
- `.eslintrc.json`
- `jsconfig.json`

#### CSS
- **Parsing**: CSS3 syntax
- **Formatting**: Complete
- **Linting**: CSS-specific rules
- **Features**: CSS Modules support, Tailwind directives

#### HTML
- **Parsing**: HTML5 syntax
- **Formatting**: Complete with whitespace control
- **Linting**: HTML-specific rules
- **Features**: Attribute formatting, void element control

#### GraphQL
- **Parsing**: GraphQL schema and query syntax
- **Formatting**: Complete
- **Linting**: GraphQL-specific rules
- **Features**: Schema and query support

### Experimental Support

These languages have experimental support with potential limitations:

#### Vue (v2.3.0+)
- **Status**: Experimental
- **Support**: Basic parsing and formatting
- **Limitations**:
  - Formatting might not match desired expectations
  - Some rules may produce false positives across language boundaries
  - Template and script section support varies

#### Svelte (v2.3.0+)
- **Status**: Experimental
- **Support**: Basic parsing and formatting
- **Limitations**: Similar to Vue

#### Astro (v2.3.0+)
- **Status**: Experimental
- **Support**: Basic parsing and formatting
- **Limitations**: Similar to Vue and Svelte

### In Progress

These languages are under development:

#### YAML
- **Status**: In development
- **ETA**: TBD

#### Markdown
- **Status**: In development
- **ETA**: TBD

## Feature Matrix

| Language | Parsing | Formatting | Linting | Plugin Support |
|----------|---------|------------|---------|----------------|
| JavaScript | ✅ | ✅ | ✅ | ✅ |
| TypeScript | ✅ | ✅ | ✅ | ✅ |
| JSX | ✅ | ✅ | ✅ | ✅ |
| TSX | ✅ | ✅ | ✅ | ✅ |
| JSON | ✅ | ✅ | ✅ | ❌ |
| JSONC | ✅ | ✅ | ✅ | ❌ |
| CSS | ✅ | ✅ | ✅ | ✅ |
| HTML | ✅ | ✅ | ✅ | ❌ |
| GraphQL | ✅ | ✅ | ✅ | ❌ |
| Vue | 🟡 | 🟡 | 🟡 | 🟡 |
| Svelte | 🟡 | 🟡 | 🟡 | 🟡 |
| Astro | 🟡 | 🟡 | 🟡 | 🟡 |
| YAML | ⌛️ | ⌛️ | ⌛️ | ⌛️ |
| Markdown | ⌛️ | ⌛️ | ⌛️ | ⌛️ |

**Legend:**
- ✅ Fully supported
- 🟡 Experimental (may have issues)
- ❌ Not supported
- ⌛️ In development

## JavaScript/TypeScript

### Syntax Support

Biome supports modern JavaScript and TypeScript features:

**JavaScript (ES2024):**
- Optional chaining (`?.`)
- Nullish coalescing (`??`)
- Private fields (`#field`)
- Top-level await
- Import assertions
- All ES2024 features

**TypeScript (5.6):**
- Type annotations
- Interfaces and type aliases
- Generics
- Decorators (with config)
- Enums
- Namespaces

### Parser Options

```json
{
  "javascript": {
    "parser": {
      "unsafeParameterDecoratorsEnabled": false,
      "jsxEverywhere": true
    }
  }
}
```

**Options:**
- `unsafeParameterDecoratorsEnabled` - Enable parameter decorators
- `jsxEverywhere` - Allow JSX syntax in `.js` files

### Formatting Options

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

### JSX Runtime

Configure JSX transformation:

```json
{
  "javascript": {
    "jsxRuntime": "transparent"
  }
}
```

Options:
- `"transparent"` (default) - No transformation
- `"reactClassic"` - Classic React runtime

## JSON/JSONC

### JSONC Features

JSON with Comments (JSONC) support:

```json
{
  "json": {
    "parser": {
      "allowComments": true,
      "allowTrailingCommas": true
    }
  }
}
```

### Well-Known Files

Biome automatically enables JSONC parsing for:
- `tsconfig.json`
- `jsconfig.json`
- `.babelrc`
- `.eslintrc.json`
- `.jshintrc`
- `.swcrc`

### Formatting Options

```json
{
  "json": {
    "formatter": {
      "trailingCommas": "none"
    }
  }
}
```

**Note**: JSON standard doesn't allow trailing commas, but JSONC does.

## CSS

### Features

- CSS3 syntax support
- CSS Modules parsing
- Tailwind directives support
- Custom properties
- Nested selectors

### Parser Options

```json
{
  "css": {
    "parser": {
      "cssModules": false,
      "tailwindDirectives": true
    }
  }
}
```

### Formatting Options

```json
{
  "css": {
    "formatter": {
      "quoteStyle": "double"
    }
  }
}
```

## HTML

### Features

- HTML5 syntax support
- Template literals
- Custom elements
- Void elements

### Parser Options

```json
{
  "html": {
    "parser": {
      "experimentalFullSupportEnabled": true
    }
  }
}
```

### Formatting Options

```json
{
  "html": {
    "formatter": {
      "whitespaceSensitivity": "css",
      "selfCloseVoidElements": "never"
    }
  }
}
```

**Whitespace sensitivity:**
- `"css"` - Follow CSS display property rules
- `"strict"` - Preserve all whitespace
- `"ignore"` - Collapse whitespace

**Self-closing void elements:**
- `"never"` - `<br>`, `<img>` (default)
- `"always"` - `<br />`, `<img />`

## GraphQL

### Features

- Schema definitions
- Query syntax
- Mutation and subscription support
- Fragment definitions

### Formatting Options

```json
{
  "graphql": {
    "formatter": {
      "quoteStyle": "double",
      "lineWidth": 80
    }
  }
}
```

## Experimental Languages

### Vue, Svelte, Astro

**Status**: Experimental (v2.3.0+)

**Known Limitations:**
- Formatting might not match community expectations
- Some linting rules may produce false positives
- Cross-language boundary issues
- Limited plugin support

**Usage:**

```json
{
  "files": {
    "include": ["**/*.vue", "**/*.svelte", "**/*.astro"]
  }
}
```

**Recommendation**: Test thoroughly before production use.

## File Detection

### By Extension

Biome automatically detects language by file extension:

| Extension | Language |
|-----------|----------|
| `.js`, `.mjs`, `.cjs` | JavaScript |
| `.ts`, `.mts`, `.cts` | TypeScript |
| `.jsx` | JSX |
| `.tsx` | TSX |
| `.json` | JSON |
| `.jsonc` | JSONC |
| `.css` | CSS |
| `.html`, `.htm` | HTML |
| `.graphql`, `.gql` | GraphQL |
| `.vue` | Vue |
| `.svelte` | Svelte |
| `.astro` | Astro |

### By Content

Some files are auto-detected by name:
- `tsconfig.json` → JSONC
- `.babelrc` → JSONC
- `.eslintrc.json` → JSONC

## Language-Specific Rules

### JavaScript/TypeScript Rules

- Type checking (TypeScript only)
- Import/export validation
- Variable usage
- Function complexity
- Async/await patterns

### React/JSX Rules

- Hook usage validation
- Component naming
- Props validation
- Accessibility (a11y)

### CSS Rules

- Property validation
- Selector specificity
- Browser compatibility
- Performance

### HTML Rules

- Tag validation
- Attribute validation
- Accessibility
- Semantic HTML

### GraphQL Rules

- Schema validation
- Query structure
- Type usage

## Configuration Examples

### Multi-Language Project

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
  },
  "json": {
    "formatter": {
      "trailingCommas": "none"
    }
  },
  "css": {
    "formatter": {
      "quoteStyle": "double"
    }
  },
  "html": {
    "formatter": {
      "whitespaceSensitivity": "css"
    }
  }
}
```

### TypeScript Project

```json
{
  "javascript": {
    "parser": {
      "unsafeParameterDecoratorsEnabled": true
    },
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "all"
    }
  },
  "linter": {
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error"
      }
    }
  }
}
```

### React Project

```json
{
  "javascript": {
    "formatter": {
      "jsxQuoteStyle": "double",
      "bracketSameLine": false
    }
  },
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

## Future Language Support

Biome is actively working on:
- YAML support
- Markdown support
- Additional language-specific rules
- Improved experimental language support

Check the [Biome roadmap](https://biomejs.dev/roadmap) for updates.
