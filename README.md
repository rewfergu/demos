# demos

A Bun monorepo of small, self-contained interactive demos — maps, drawing tools, and animated sketches — served as pages from a single [Astro 5](https://astro.build) site. Each demo is its own workspace package so the dependencies stay isolated and the demos can be developed independently.

## Quick start

```bash
bun install     # install all workspaces
bun run dev     # start the Astro dev server
bun run build   # build demo bundles, then the Astro site
```

The dev server only runs the Astro site; demo packages are resolved from source via a Vite alias, so changes to a demo are picked up without a rebuild. To preview the site on a phone over LAN, use `bun run dev:mobile`.

> Bun is the package manager for this repo — do not use npm, yarn, or pnpm.

## Repository layout

```
packages/
├── astro-site/        # Astro 5 site that serves every demo as a page
├── demo-utils/        # Shared helpers (EXIF parsing, image processing, marker drag)
├── island-counter/    # Example React component used as an Astro island
└── demos/             # Vanilla JS/TS demo packages
    ├── leaflet/
    ├── maplibre/
    ├── p5/
    ├── photo-location/
    └── route-creator/
```

### `packages/astro-site`

The main application. Demo pages live in `src/demos/<name>/index.mdx` (or `.astro`) and are picked up automatically by a content collection using a glob loader. Each page imports its demo's entry from the corresponding workspace package.

### `packages/demos/*`

Standalone vanilla JS modules — no React. Each package exposes an entry function from `index.js` and builds with Bun's bundler (`bun build`). Current demos:

| Demo | What it shows |
| --- | --- |
| `leaflet` | Basic Leaflet map plus a Geoman drawing/editing variant |
| `maplibre` | MapLibre map plus a Geoman drawing/editing variant |
| `p5` | p5.js sketches (animated circles, orbits) |
| `photo-location` | Drop a photo, read its EXIF GPS data, drop a marker on the map |
| `route-creator` | Create and edit routes on a MapLibre map |

Several MapLibre/Leaflet demo *pages* in `astro-site/src/demos` (`map-pattern`, `map-complex-popup`, `static-map`, `leaflet-path`, `maplibre-path`, `maplibre-geojson`) are implemented inline in their `.astro` files and pull only library dependencies — they don't have a corresponding workspace package.

### `packages/demo-utils`

Shared utilities used by the photo-location and route-creator demos:

- `image-processing` — resize/orient incoming photos
- `exif` — read GPS coordinates from JPEG EXIF data
- `marker-drag` — small helper for draggable map markers

### `packages/island-counter`

A React component built with Vite, embedded in the Astro site as a `client:load` island. Kept as a reference for adding React islands to the site.

## Adding a new demo

1. Create `packages/demos/<name>/` with a `package.json` (`"name": "@demo-archive/demo-<name>"`, `"type": "module"`), an `index.js` entry, and a build script that runs `bun build`.
2. Add the workspace dependency to `packages/astro-site/package.json` (`"@demo-archive/demo-<name>": "workspace:*"`).
3. Create `packages/astro-site/src/demos/<name>/index.mdx` (or `.astro`) with frontmatter:
   ```yaml
   ---
   name: Human-readable demo title
   description: One-line summary
   ---
   ```
4. The demo will appear automatically on the site index via the content collection.

## Scripts

```bash
bun run dev               # Astro dev server only
bun run dev:mobile        # Astro dev server with --host (LAN access)
bun run dev:all           # React island packages in watch mode + Astro dev server
bun run build             # Build demo islands, then the Astro site
bun run build:islands     # Build only packages/demos/*
bun run clean             # Remove dist/ and node_modules/ everywhere
```

To run a single demo package's build in watch mode:

```bash
bun run --filter @demo-archive/demo-leaflet dev
```

## Conventions

- Demo packages are ES modules (`"type": "module"`) and export plain JS functions, not React components. The one exception is `island-counter`.
- The Astro site resolves demo imports via a Vite alias (`@demo-archive/demos` → `packages/demos/`), so demos don't need to be pre-built during development.
- Dependency versions are pinned (`bunfig.toml` sets `install.exact = true`).
