# Prettier Configuration

This project uses Prettier for code formatting to ensure consistent code style across all files.

## Configuration Files

- `.prettierrc` - Main Prettier configuration with rules for formatting
- `.prettierignore` - Files and directories to exclude from formatting

## Available Scripts

- `npm run format` - Format all files in the project
- `npm run format:check` - Check if files are properly formatted (without making changes)

## Supported File Types

- JavaScript/TypeScript files (`.js`, `.ts`, `.jsx`, `.tsx`)
- Astro files (`.astro`) - using prettier-plugin-astro
- CSS files (`.css`)
- JSON files (`.json`)
- Markdown files (`.md`, `.mdx`)

## Usage

### Format all files:
```bash
npm run format
```

### Check formatting without making changes:
```bash
npm run format:check
```

### Format specific files:
```bash
npx prettier --write "path/to/file.astro"
```

## IDE Integration

If you're using VSCode, install the Prettier extension for automatic formatting on save.
