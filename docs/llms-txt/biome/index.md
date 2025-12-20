# Biome

> Biome is a fast, opinionated toolchain for web development supporting JavaScript, TypeScript, JSX, JSON, CSS, HTML, and GraphQL. It provides formatting, linting, and import sorting in a single unified tool with 397 linting rules.

Biome is designed as a drop-in replacement for ESLint and Prettier with native support for monorepos, zero configuration defaults, and first-party editor extensions.

## Getting Started

- [Installation and Setup](getting-started.md): Install Biome, create configuration, and run your first commands
- [Migration from ESLint and Prettier](migration.md): Automated migration commands and compatibility notes

## Configuration

- [Configuration Guide](configuration.md): Complete configuration reference including all options and examples
- [File Patterns and Includes](configuration.md#file-patterns): Control which files are processed using glob patterns
- [Monorepo Setup](monorepos.md): Configure Biome for large projects with hierarchical configurations

## Formatter

- [Formatter Overview](formatter.md): Opinionated code formatting with limited customization options
- [Formatting Options](formatter.md#options): indentStyle, lineWidth, lineEnding, and language-specific settings
- [Supported Languages](language-support.md): JavaScript, TypeScript, JSON, CSS, HTML, GraphQL, and experimental support for Vue/Svelte/Astro

## Linter

- [Linter Overview](linter.md): Static analysis with 397 rules across 8 categories
- [Rule Configuration](linter.md#configuration): Enable, disable, or adjust severity of rules
- [Safe vs Unsafe Fixes](linter.md#fixes): Understanding automatic and manual fixes
- [Rule Categories](linter.md#categories): Accessibility, complexity, correctness, performance, security, style, and more

## CLI Usage

- [CLI Reference](cli.md): Complete command reference for check, lint, format, and ci commands
- [Common Commands](cli.md#common-commands): Quick reference for everyday usage
- [CI Integration](cli.md#ci): Use biome ci for continuous integration pipelines

## Optional

- [Editor Integration](editor-integration.md): Setup for VS Code, IntelliJ, Zed, Vim, Neovim, and Sublime Text
- [Language Support Matrix](language-support.md): Feature availability per language
- [VCS Integration](configuration.md#vcs): Respect .gitignore files and version control settings
