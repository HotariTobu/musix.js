# Formatter

## Overview

Biome is an opinionated formatter similar to Prettier that intentionally limits configuration options to prevent style debates and encourage teams to focus on substantive work.

## Supported Languages

Biome formats code across multiple languages:
- JavaScript (including ES2024 features)
- TypeScript (5.6)
- JSX and TSX
- JSON and JSONC
- CSS
- HTML
- GraphQL
- Experimental: Vue, Svelte, Astro

## Default Settings

### Language-Agnostic Defaults

- **Indentation**: Tab-based (2-space equivalent)
- **Indent width**: 2 spaces per level
- **Line width**: 80 characters
- **Line endings**: LF (Unix-style)
- **Bracket spacing**: Enabled (spaces inside object braces)

### JavaScript/TypeScript Defaults

- **Quote style**: Double quotes
- **JSX quote style**: Double quotes
- **Semicolons**: Always
- **Trailing commas**: All (ES5+ and trailing function parameters)
- **Arrow parentheses**: Always
- **Bracket same line**: False (closing bracket on new line)

## Usage

### Check Formatting

Check files without making changes:

```bash
npx @biomejs/biome format ./src
```

### Apply Formatting

Format files and write changes:

```bash
npx @biomejs/biome format --write ./src
```

### Format Specific Files

```bash
npx @biomejs/biome format --write src/index.js src/utils.ts
```

### Format with Filters

Only format files in staging area (requires VCS integration):

```bash
npx @biomejs/biome format --write --staged
```

Format only changed files:

```bash
npx @biomejs/biome format --write --changed
```

## Configuration

### Global Formatter Options

```json
{
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "indentWidth": 2,
    "lineWidth": 80,
    "lineEnding": "lf",
    "bracketSpacing": true,
    "attributePosition": "auto"
  }
}
```

### Available Options

#### indentStyle

Controls indentation character:
- `"tab"` (default) - Use tab characters
- `"space"` - Use spaces

```json
{
  "formatter": {
    "indentStyle": "space"
  }
}
```

#### indentWidth

Number of spaces per indent level (default: 2):

```json
{
  "formatter": {
    "indentWidth": 4
  }
}
```

#### lineWidth

Maximum characters per line (default: 80):

```json
{
  "formatter": {
    "lineWidth": 100
  }
}
```

#### lineEnding

Line ending style:
- `"lf"` (default) - Unix-style (\\n)
- `"crlf"` - Windows-style (\\r\\n)
- `"cr"` - Old Mac-style (\\r)

```json
{
  "formatter": {
    "lineEnding": "crlf"
  }
}
```

#### bracketSpacing

Add spaces inside object braces (default: true):

```json
{
  "formatter": {
    "bracketSpacing": false
  }
}
```

```javascript
// bracketSpacing: true
const obj = { foo: "bar" };

// bracketSpacing: false
const obj = {foo: "bar"};
```

#### attributePosition

HTML/JSX attribute wrapping:
- `"auto"` (default) - Automatic wrapping
- `"multiline"` - Force multiline

```json
{
  "formatter": {
    "attributePosition": "multiline"
  }
}
```

### JavaScript/TypeScript Options

```json
{
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "jsxQuoteStyle": "single",
      "trailingCommas": "es5",
      "semicolons": "asNeeded",
      "arrowParentheses": "asNeeded",
      "bracketSameLine": false,
      "quoteProperties": "asNeeded"
    }
  }
}
```

#### quoteStyle

String quote style:
- `"double"` (default) - Double quotes
- `"single"` - Single quotes

```json
{
  "javascript": {
    "formatter": {
      "quoteStyle": "single"
    }
  }
}
```

#### jsxQuoteStyle

JSX attribute quote style:
- `"double"` (default) - Double quotes
- `"single"` - Single quotes

#### trailingCommas

Trailing comma handling:
- `"all"` (default) - Everywhere possible
- `"es5"` - Only where valid in ES5 (arrays, objects)
- `"none"` - Never add trailing commas

```json
{
  "javascript": {
    "formatter": {
      "trailingCommas": "es5"
    }
  }
}
```

#### semicolons

Semicolon usage:
- `"always"` (default) - Always add semicolons
- `"asNeeded"` - Only when necessary

```json
{
  "javascript": {
    "formatter": {
      "semicolons": "asNeeded"
    }
  }
}
```

#### arrowParentheses

Arrow function parentheses:
- `"always"` (default) - Always use parentheses
- `"asNeeded"` - Only when necessary

```json
{
  "javascript": {
    "formatter": {
      "arrowParentheses": "asNeeded"
    }
  }
}
```

```javascript
// arrowParentheses: "always"
const fn = (x) => x * 2;

// arrowParentheses: "asNeeded"
const fn = x => x * 2;
```

#### bracketSameLine

JSX closing bracket position:
- `false` (default) - New line
- `true` - Same line as last prop

```json
{
  "javascript": {
    "formatter": {
      "bracketSameLine": true
    }
  }
}
```

```jsx
// bracketSameLine: false
<Component
  prop1="value1"
  prop2="value2"
>

// bracketSameLine: true
<Component
  prop1="value1"
  prop2="value2">
```

### JSON Options

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

### CSS Options

```json
{
  "css": {
    "formatter": {
      "quoteStyle": "double"
    }
  }
}
```

### HTML Options

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

#### whitespaceSensitivity

- `"css"` - Follow CSS display property rules
- `"strict"` - Preserve all whitespace
- `"ignore"` - Collapse whitespace

#### selfCloseVoidElements

- `"never"` (default) - `<br>`, `<img>`, etc.
- `"always"` - `<br />`, `<img />`, etc.

## Suppressing Formatting

### Disable Formatting for Code Block

Use comments to prevent formatting:

```javascript
// biome-ignore format: custom formatting needed
const matrix = [
  1,  0,  0,
  0,  1,  0,
  0,  0,  1
];
```

### Disable Formatting for File

Add to the top of the file:

```javascript
// biome-ignore format: generated file
```

## EditorConfig Support

Biome can respect `.editorconfig` files (v1.9+):

```json
{
  "formatter": {
    "useEditorconfig": true
  }
}
```

**Note**: Settings in `biome.json` take precedence over `.editorconfig`.

## Differences from Prettier

### Default Differences

- **Indentation**: Biome uses tabs by default (Prettier uses 2 spaces)
- **Quote style**: Both default to double quotes
- **Semicolons**: Biome always adds them (Prettier does too)
- **Trailing commas**: Biome uses "all" (Prettier uses "es5" in older versions)

### Migration

Use the automated migration command:

```bash
biome migrate prettier --write
```

This reads your `.prettierrc` and converts settings to `biome.json`.

## Language-Specific Examples

### JavaScript

```json
{
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "asNeeded",
      "trailingCommas": "es5",
      "arrowParentheses": "asNeeded"
    }
  }
}
```

### TypeScript

TypeScript uses the same configuration as JavaScript under the `javascript` key.

### JSON

```json
{
  "json": {
    "formatter": {
      "trailingCommas": "none",
      "lineWidth": 120
    },
    "parser": {
      "allowComments": true
    }
  }
}
```

### CSS

```json
{
  "css": {
    "formatter": {
      "quoteStyle": "single",
      "lineWidth": 100
    }
  }
}
```
