# AGENTS.md

## What this is

- Angular 22 standalone app with SSR + prerender (`@angular/ssr`) and Bootstrap 5 loaded from CDN.
- One feature: "Registro de Insumos" inventory form/table. UI text, validation messages, and domain names are Spanish; keep them that way.
- Backend is a separate FastAPI service in `../Backend` with CRUD routes under `/api/insumo/` (trailing slash required). The frontend does **not** call it yet: `InsumoSv` is an in-memory array, there is no `HttpClient`/`provideHttpClient`, backend CORS is not configured, and the backend model requires an `id` that `InsumoIn` lacks.
- `src/app/app.routes.ts` is empty; `App` renders `InsumoComponente` directly.

## Commands

- Install: `npm ci`
- Dev server: `npm start` → http://localhost:4200
- Build: `npm run build` (production + SSR/prerender; output in `dist/frontend/{browser,server}`)
- Serve the built SSR app: `npm run serve:ssr:frontend` (port 4000, override with `PORT`)
- Tests: `npx ng test --watch=false` — Vitest + jsdom, not Karma/Jasmine. Plain `ng test` defaults to watch in a TTY and will hang.
- One spec: `npx ng test --watch=false --include=app/services/insumo-sv.spec.ts` (paths are relative to `src/`)
- Filter by suite/test name: add `--filter="InsumoSv"` or `--filter="should create"`
- No lint script. Formatting uses Prettier: `npx prettier --write <paths>` (single quotes, width 100, Angular parser for HTML).

## Known current state (don't chase blindly)

- On a clean tree, `npx ng test --watch=false` exits 1: `src/app/app.spec.ts` → "should render title" expects an `h1` containing `Hello, frontend`, but `app.html` no longer renders one. The other 3 tests pass.
- `npm run build` succeeds with pre-existing warnings: unused `RouterOutlet` import in `app.ts`, and `sweetalert2` being CommonJS.
- No e2e framework is configured despite `ng e2e` being mentioned in the README. There is no CI config.

## Conventions that differ from Angular defaults

- Uses Angular 22 Signals Forms: `form()`, `FormField`, `required`/`min`, and `[formField]` from `@angular/forms/signals`; do not migrate to `ReactiveFormsModule`/`FormsModule`.
- Services use the Angular 22 auto-provided `@Service()` decorator with `inject()`; do not replace it with `@Injectable({ providedIn: 'root' })` unless required.
- File names omit type suffixes: `insumo-sv.ts` (service), `components/insumo-componente/insumo-componente.ts` (component). Classes are `InsumoSv`, `InsumoComponente`, `App`. Files from `ng generate` will not match this naming; rename them.
- Bootstrap CSS/JS come from CDN tags in `src/index.html`; `src/styles.css` is empty. Do not add a Bootstrap npm import without intentionally migrating.
- No path aliases; imports are relative.
- SSR/prerender is enabled: avoid `window`, `document`, or `localStorage` during module init; guard browser-only code.
- `tsconfig.json` enables `noImplicitReturns`, `noImplicitOverride`, and `noPropertyAccessFromIndexSignature`, but not `strict`.
