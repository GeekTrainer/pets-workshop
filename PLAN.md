# Plan: Simplify Client App — Pure Astro, Remove Svelte

## Problem Statement

The client app is more complex than necessary:

1. **Svelte is unnecessary** — Both Svelte components (`DogList.svelte`, `DogDetails.svelte`) have zero client-side interactivity (no state changes, no event handlers, just data display and `<a>` links). They can be simple Astro components.
2. **Unnecessary client-side data fetching** — Components fetch data client-side via `fetch('/api/...')`, even though Astro is configured for SSR and can fetch server-side in page frontmatter
3. **Middleware API proxy adds complexity** — The middleware intercepts `/api/` requests and proxies them to Flask. With server-side fetching in Astro, this layer is unnecessary
4. **Dead dependencies** — `autoprefixer`, `postcss` (Tailwind v4 handles this), `flask-cors` (no cross-origin requests with SSR)
5. **Unused assets & redundant code** — Starter template leftovers, duplicate imports, placeholder comments

## Proposed Approach

Remove Svelte entirely. Convert Svelte components to Astro components. Fetch data server-side in Astro page frontmatter. Remove the middleware proxy, dead dependencies, and unused files.

## Todos

### 1. Convert `DogList.svelte` → `DogList.astro`
- **Delete**: `client/src/components/DogList.svelte`
- **Create**: `client/src/components/DogList.astro`
- Accept `dogs` array via `Astro.props`
- Render the same HTML grid of dog cards (pure template, no JS)

### 2. Convert `DogDetails.svelte` → `DogDetails.astro`
- **Delete**: `client/src/components/DogDetails.svelte`
- **Create**: `client/src/components/DogDetails.astro`
- Accept `dog` object via `Astro.props`
- Render the same HTML dog detail card (pure template, no JS)

### 3. Update `index.astro` — server-side data fetching
- **File**: `client/src/pages/index.astro`
- Fetch dogs list from Flask in frontmatter (`API_SERVER_URL/api/dogs`)
- Pass data to `DogList.astro` as props
- Handle error states in the page
- Remove `global.css` import (already in Layout)

### 4. Update `[id].astro` — server-side data fetching
- **File**: `client/src/pages/dog/[id].astro`
- Fetch dog details from Flask in frontmatter (`API_SERVER_URL/api/dogs/{id}`)
- Pass data to `DogDetails.astro` as props
- Handle 404 / error states
- Remove redundant `export const prerender = false` and unused `props` variable

### 5. Remove the API proxy middleware
- **Delete**: `client/src/middleware.ts`

### 6. Remove Svelte from the project
- **File**: `client/astro.config.mjs` — Remove Svelte integration and duplicate vite plugin
- **Delete**: `client/svelte.config.js`
- **File**: `client/package.json` — Remove `svelte`, `@astrojs/svelte`

### 7. Remove dead dependencies
- **File**: `client/package.json` — Remove `autoprefixer`, `postcss` (Tailwind v4 + Vite handles CSS natively)
- **File**: `server/requirements.txt` — Remove `flask-cors` (no cross-origin with SSR)

### 8. Remove unused assets
- **Delete**: `client/src/assets/astro.svg`, `client/src/assets/background.svg` (starter template leftovers, not referenced anywhere)

### 9. Clean up minor issues
- **Eliminate `global.css`** — It only contains `@import "tailwindcss"`. Move this into the `<style is:global>` block in `Layout.astro` and delete the file. Removes a file and 3 redundant imports.
- **Simplify Header to always-visible nav** — The hamburger menu with JS toggle is overkill for 2 nav links (Home, About). Replace with simple inline nav links. This eliminates the **only client-side JavaScript** in the entire app, making it truly zero-JS.
- **Remove unused `dark:` variants** — `<html>` has `class="dark"` hardcoded, so `dark:` prefixes are always active. The non-dark variants (`bg-blue-500`, `bg-white`, `text-slate-800`) never apply. Replace `bg-blue-500 dark:bg-blue-700` with just `bg-blue-700`, etc. Simpler for learners to read.
- **Remove `transition-colors duration-300`** — These transition classes appear on many elements but never trigger (no theme switching). Dead code.
- Remove `// about page` comment from `about.astro`

### 10. Update all libraries to latest versions
- **Client**: `astro`, `@astrojs/node`, `@tailwindcss/vite`, `tailwindcss`, `typescript`, `@playwright/test`, `@types/node`
- **Server**: Pin `flask`, `sqlalchemy`, `flask_sqlalchemy` to latest stable

### 11. Add data-testid attributes to all components
- Add `data-testid` attributes to key elements across all Astro components for stable test selectors
- Components: `DogList.astro`, `DogDetails.astro`, `index.astro`, `[id].astro`, `about.astro`, `Header.astro`
- Key attributes: `dog-list`, `dog-card`, `dog-name`, `dog-breed`, `dog-details`, `dog-age`, `dog-gender`, `dog-status`, `dog-description`, `error-message`, `empty-state`, `back-link`

### 12. Create mock API server for e2e tests
- **Create**: `client/e2e-tests/mock-api.ts` — A lightweight Node.js HTTP server that serves the same endpoints as Flask (`/api/dogs`, `/api/dogs/:id`) with hardcoded test data
- **Update**: `client/playwright.config.ts` — Use Playwright's multiple `webServer` config to start both the mock API and Astro dev server (with `API_SERVER_URL` pointing to the mock)
- This decouples e2e tests from the Flask server entirely

### 13. Update e2e tests to use data-testid selectors
- **All test files**: Replace brittle text selectors (`getByText('Buddy')`) and CSS selectors (`.grid a[href^="/dog/"]`) with `data-testid` locators
- **`api-integration.spec.ts`**: Rewrite to test against mock API server-rendered content (no more `page.route()` mocks)
- **`homepage.spec.ts`**: Remove the "loading state" test (no loading state with SSR) and the client-side API error test
- **`dog-details.spec.ts`**: Update selectors to use data-testid

### 14. Run `npm install` and verify build + e2e tests

## Notes

- The Flask server (`server/app.py`) is unchanged (logic-wise)
- `API_SERVER_URL` env var moves from middleware to a shared constant used by Astro pages
- The `Header.astro` component with its vanilla JS menu toggle is fine as-is
- E2e tests should pass since rendered HTML output is equivalent
- This eliminates the entire Svelte framework from the dependency tree
