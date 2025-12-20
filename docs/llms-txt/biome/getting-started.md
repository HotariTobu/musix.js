# Getting Started with Biome

## Installation

Install Biome as a development dependency. The `-E` flag pins the exact version for consistency:

### npm
```bash
npm i -D -E @biomejs/biome
```

### pnpm
```bash
pnpm add -D -E @biomejs/biome
```

### yarn
```bash
yarn add -D -E @biomejs/biome
```

### bun
```bash
bun add -D -E @biomejs/biome
```

### deno
```bash
deno add -D npm:@biomejs/biome
```

## Configuration

Initialize a configuration file:

### npm
```bash
npx @biomejs/biome init
```

### pnpm
```bash
pnpm exec biome init
```

### yarn
```bash
yarn exec biome init
```

### bun
```bash
bunx --bun biome init
```

### deno
```bash
deno run -A npm:@biomejs/biome init
```

This creates a `biome.json` file in your project root. Biome works with zero configuration by default, but the configuration file allows customization.

## Basic Usage

### Format Code

Check formatting without making changes:
```bash
biome format ./src
```

Apply formatting changes:
```bash
biome format --write ./src
```

### Lint Code

Run linter on files:
```bash
biome lint ./src
```

Apply safe fixes automatically:
```bash
biome lint --write ./src
```

Apply safe and unsafe fixes (requires manual review):
```bash
biome lint --write --unsafe ./src
```

### Check Everything

Run formatter, linter, and import sorting together:
```bash
biome check ./src
```

Apply all fixes:
```bash
biome check --write ./src
```

### CI Integration

For continuous integration pipelines:
```bash
biome ci ./src
```

The `ci` command is optimized for CI environments and runs in read-only mode.

## Editor Support

First-party extensions are available for:
- VS Code
- IntelliJ IDEA
- Zed

Community extensions support:
- Vim
- Neovim
- Sublime Text

Install the extension for your editor to get real-time feedback and format-on-save capabilities.

## Next Steps

- Review the [Configuration Guide](configuration.md) for customization options
- Explore [Formatter](formatter.md) and [Linter](linter.md) documentation
- If migrating from ESLint/Prettier, see the [Migration Guide](migration.md)
- Check [CLI Reference](cli.md) for advanced command usage
