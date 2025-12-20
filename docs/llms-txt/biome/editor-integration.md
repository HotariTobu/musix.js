# Editor Integration

## Overview

Biome provides first-party extensions for popular editors, enabling real-time feedback, format-on-save, and quick fixes directly in your development environment.

## First-Party Extensions

### VS Code

Official Biome extension for Visual Studio Code.

#### Installation

1. **From VS Code Marketplace:**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
   - Search for "Biome"
   - Click Install

2. **From Command Line:**
   ```bash
   code --install-extension biomejs.biome
   ```

#### Configuration

**.vscode/settings.json:**

```json
{
  "[javascript]": {
    "editor.defaultFormatter": "biomejs.biome",
    "editor.formatOnSave": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome",
    "editor.formatOnSave": true
  },
  "[json]": {
    "editor.defaultFormatter": "biomejs.biome",
    "editor.formatOnSave": true
  },
  "[css]": {
    "editor.defaultFormatter": "biomejs.biome",
    "editor.formatOnSave": true
  }
}
```

#### Extension Settings

```json
{
  "biome.enabled": true,
  "biome.lspBin": null,
  "biome.configPath": null,
  "biome.rename": true
}
```

**Available settings:**
- `biome.enabled` - Enable/disable the extension
- `biome.lspBin` - Path to custom Biome binary
- `biome.configPath` - Path to `biome.json`
- `biome.rename` - Enable rename refactoring

#### Features

- **Format on Save** - Automatic formatting when saving files
- **Quick Fixes** - Apply safe fixes with Ctrl+. / Cmd+.
- **Diagnostics** - Real-time linting errors and warnings
- **Organize Imports** - Sort and organize imports
- **Rename Refactoring** - Smart rename with LSP support

#### Workspace Recommendations

**.vscode/extensions.json:**

```json
{
  "recommendations": [
    "biomejs.biome"
  ]
}
```

### IntelliJ IDEA

Official Biome plugin for IntelliJ IDEA, WebStorm, and other JetBrains IDEs.

#### Installation

1. Open IntelliJ IDEA / WebStorm
2. Go to Settings / Preferences → Plugins
3. Search for "Biome"
4. Click Install
5. Restart IDE

#### Configuration

1. **Enable Biome:**
   - Settings → Languages & Frameworks → Biome
   - Check "Enable Biome"

2. **Configure Path:**
   - Auto-detect: Leave path empty
   - Custom: Specify path to Biome binary

3. **Format on Save:**
   - Settings → Tools → Actions on Save
   - Enable "Run Biome"

#### Features

- Format on save
- Real-time diagnostics
- Quick fixes
- Code actions
- Import organization

### Zed

Official Biome extension for Zed editor.

#### Installation

Biome support is built into Zed. No installation required.

#### Configuration

**settings.json:**

```json
{
  "formatter": "biome",
  "format_on_save": "on",
  "linter": "biome"
}
```

#### Features

- Built-in Biome support
- Format on save
- Real-time linting
- Quick fixes

## Community Extensions

### Vim

Community-supported Biome integration for Vim.

#### Installation with vim-plug

```vim
Plug 'biomejs/biome.vim'
```

#### Configuration

```vim
" Enable Biome formatting
let g:biome_format_on_save = 1

" Custom Biome path
let g:biome_bin_path = '/path/to/biome'
```

#### Usage

```vim
" Format current buffer
:BiomeFormat

" Lint current buffer
:BiomeLint

" Check current buffer
:BiomeCheck
```

### Neovim

Community-supported integration using LSP and null-ls.

#### Installation with lazy.nvim

```lua
{
  "nvimtools/none-ls.nvim",
  dependencies = {
    "nvim-lua/plenary.nvim"
  },
  config = function()
    local null_ls = require("null-ls")
    null_ls.setup({
      sources = {
        null_ls.builtins.formatting.biome,
        null_ls.builtins.diagnostics.biome,
      },
    })
  end,
}
```

#### LSP Configuration

```lua
require('lspconfig').biome.setup({
  cmd = { "biome", "lsp-proxy" },
  filetypes = {
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "json",
    "css"
  },
})
```

#### Format on Save

```lua
vim.api.nvim_create_autocmd("BufWritePre", {
  pattern = { "*.js", "*.ts", "*.jsx", "*.tsx", "*.json", "*.css" },
  callback = function()
    vim.lsp.buf.format({ async = false })
  end,
})
```

### Sublime Text

Community-supported Biome package for Sublime Text.

#### Installation

1. Install Package Control
2. Ctrl+Shift+P / Cmd+Shift+P → Package Control: Install Package
3. Search for "Biome"
4. Install

#### Configuration

**Preferences → Package Settings → Biome → Settings:**

```json
{
  "biome_path": "biome",
  "format_on_save": true
}
```

## Language Server Protocol (LSP)

### Manual LSP Setup

For editors not listed above, you can configure Biome's LSP directly.

#### Starting the LSP

```bash
biome lsp-proxy
```

This starts the Language Server Protocol server over stdin/stdout.

#### LSP Configuration

**Capabilities:**
- Text synchronization
- Diagnostics
- Formatting
- Code actions
- Rename

**Example Client Configuration:**

```json
{
  "command": "biome",
  "args": ["lsp-proxy"],
  "filetypes": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "json",
    "jsonc",
    "css",
    "html",
    "graphql"
  ]
}
```

## Format on Save

### VS Code

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "biomejs.biome"
}
```

### IntelliJ

Settings → Tools → Actions on Save → Enable "Run Biome"

### Vim

```vim
let g:biome_format_on_save = 1
```

### Neovim

```lua
vim.api.nvim_create_autocmd("BufWritePre", {
  pattern = { "*.js", "*.ts", "*.jsx", "*.tsx" },
  callback = function()
    vim.lsp.buf.format({ async = false })
  end,
})
```

## Organize Imports on Save

### VS Code

```json
{
  "editor.codeActionsOnSave": {
    "source.organizeImports.biome": "explicit"
  }
}
```

### IntelliJ

Built into format on save.

### Neovim

```lua
vim.api.nvim_create_autocmd("BufWritePre", {
  pattern = { "*.js", "*.ts", "*.jsx", "*.tsx" },
  callback = function()
    vim.lsp.buf.code_action({
      context = { only = { "source.organizeImports.biome" } },
      apply = true,
    })
  end,
})
```

## Quick Fixes

### VS Code

1. Place cursor on diagnostic
2. Press Ctrl+. / Cmd+.
3. Select "Fix using Biome"

Or use keyboard shortcut:
```json
{
  "key": "ctrl+shift+f",
  "command": "biome.fix",
  "when": "editorTextFocus"
}
```

### IntelliJ

1. Place cursor on diagnostic
2. Press Alt+Enter / Option+Enter
3. Select fix from menu

### Vim/Neovim

```vim
" Apply fix
:BiomeFix
```

## Project-Specific Configuration

### VS Code Workspace Settings

**.vscode/settings.json:**

```json
{
  "biome.configPath": "./config/biome.json",
  "biome.lspBin": "./node_modules/@biomejs/biome/bin/biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports.biome": "explicit",
    "source.fixAll.biome": "explicit"
  },
  "[javascript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[json]": {
    "editor.defaultFormatter": "biomejs.biome"
  }
}
```

### IntelliJ Project Settings

**.idea/biome.xml:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="BiomeSettings">
    <option name="enabled" value="true" />
    <option name="configPath" value="$PROJECT_DIR$/biome.json" />
    <option name="runOnSave" value="true" />
  </component>
</project>
```

## Troubleshooting

### Extension Not Working

1. **Check Biome Installation:**
   ```bash
   npx @biomejs/biome --version
   ```

2. **Check Configuration:**
   - Ensure `biome.json` exists
   - Verify configuration is valid

3. **Restart Language Server:**
   - VS Code: Ctrl+Shift+P → "Reload Window"
   - IntelliJ: Invalidate Caches → Restart

### Format on Save Not Working

1. **Verify Settings:**
   - Check `editor.formatOnSave` is `true`
   - Check `editor.defaultFormatter` is set to Biome

2. **Check File Type:**
   - Ensure file type is supported
   - Verify file is not in `files.ignore`

3. **Check Errors:**
   - Look for syntax errors
   - Check Biome output/logs

### Slow Performance

1. **Increase File Size Limit:**
   ```json
   {
     "files": {
       "maxSize": 2097152
     }
   }
   ```

2. **Ignore Large Directories:**
   ```json
   {
     "files": {
       "ignore": ["**/node_modules", "**/dist"]
     }
   }
   ```

3. **Disable Daemon:**
   ```bash
   biome stop
   ```

## Best Practices

### Team Setup

1. **Commit Editor Settings:**
   ```
   .vscode/settings.json
   .vscode/extensions.json
   ```

2. **Document Setup:**
   Add to README.md:
   ```markdown
   ## Editor Setup

   Install the Biome extension for your editor:
   - VS Code: biomejs.biome
   - IntelliJ: Biome plugin
   ```

3. **Enforce Formatting:**
   Use pre-commit hooks:
   ```bash
   biome check --write --staged
   ```

### Performance

- Enable format on save for instant feedback
- Use file patterns to exclude large files
- Configure ignored directories
- Use VCS integration

### Workflow

1. **Write code** - Real-time diagnostics
2. **Save file** - Auto-format and organize imports
3. **Quick fixes** - Apply safe fixes with keyboard shortcuts
4. **Commit** - Pre-commit hook ensures quality

## CI/CD Integration

Even with editor integration, use CI to enforce code quality:

```yaml
- name: Check Code Quality
  run: npx @biomejs/biome ci .
```

This ensures all code meets standards, regardless of individual editor configurations.
