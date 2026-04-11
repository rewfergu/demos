# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A Bun monorepo of interactive demo pages (maps, animations, drawing) served through an Astro site. Each demo is a standalone package that gets embedded as a page in the Astro site.

## Commands

```bash
bun install               # Install all dependencies
bun run dev               # Dev server (astro-site only)
bun run build             # Build demo islands first, then astro-site
bun run build:islands     # Build only the demo packages (packages/demos/*)
bun run clean             # Remove dist/ and node_modules/ from all packages
```

Run a single demo package in watch mode:
```bash
bun run --filter @demo-archive/demo-leaflet dev
```

## Architecture

### Workspace structure

- **`packages/astro-site`** — Astro 5 site with React and MDX integrations. This is the main application that serves all demos. Demo pages live in `src/demos/` (each subfolder has an `index.mdx` or `index.astro`). The content collection uses a glob loader pattern from `src/demos/`.
- **`packages/demos/*`** — Standalone vanilla JS/TS demo packages (leaflet, maplibre, p5). Each exports entry functions and builds with Vite. These are imported by the Astro site via a Vite alias (`@demo-archive/demos` → `packages/demos/`).
- **`packages/island-counter`** — A React component built with Vite, used as an Astro island (`client:load`).

### Adding a new demo

1. Create a new package under `packages/demos/<name>/` with a `package.json` (name: `@demo-archive/demo-<name>`), entry `index.js`, and `vite.config`.
2. Add the workspace dependency to `packages/astro-site/package.json`.
3. Create a page in `packages/astro-site/src/demos/<name>/index.mdx` (or `.astro`) with frontmatter `name` field.
4. The demo will auto-appear on the index page via the content collection.

### Key conventions

- Demo packages use `"type": "module"` and export vanilla JS functions (not React components), except `island-counter` which is React.
- The Astro site resolves demo imports via a Vite alias, not through built dist files, so demos don't need to be pre-built during dev.
- Package manager is Bun — do not use npm, yarn, or pnpm.
