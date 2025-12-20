# tsdown

> tsdown is an elegant library bundler powered by Rolldown. It provides blazing fast builds with declaration file generation using Oxc and Rolldown, supports extensive plugin ecosystems (Rollup, Rolldown, unplugin, and select Vite plugins), and offers seamless migration from tsup with compatible options.

tsdown preconfigures everything needed to bundle TypeScript libraries, allowing developers to focus on writing code rather than build configuration. It requires Node.js 20.19 or higher.

## Getting Started

- [Getting Started](getting-started.md): Installation, quick start, and basic usage
- [CLI Reference](cli-reference.md): Complete command-line interface documentation

## Configuration

- [Config File](config-file.md): Configuration file setup and options
- [Entry Points](entry.md): Defining entry files and using glob patterns
- [Output Format](output-format.md): ESM, CJS, IIFE, and UMD formats
- [TypeScript Declarations](dts.md): Generating .d.ts files with isolatedDeclarations support
- [Package Exports](package-exports.md): Auto-generating package.json exports field
- [Target](target.md): JavaScript syntax transformations and compatibility
- [Platform](platform.md): Node.js, browser, or neutral runtime targets

## Build Options

- [Dependencies](dependencies.md): Handling external dependencies and bundling
- [Minification](minification.md): Code compression with Oxc
- [Source Maps](sourcemap.md): Debugging support with source maps
- [Watch Mode](watch-mode.md): Automatic rebuilds on file changes

## Advanced

- [Plugins](plugins.md): Using Rolldown, Rollup, unplugin, and Vite plugins
- [Programmatic Usage](programmatic-usage.md): Using tsdown from JavaScript/TypeScript code

## Optional

- [FAQ](faq.md): Frequently asked questions about stub mode and alternatives
