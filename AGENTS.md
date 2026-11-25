# AGENTS.md

## What this is

- Angular 22 standalone app with SSR + prerender (`@angular/ssr`) and Bootstrap 5 loaded from CDN.
- Three screens: simulated login (`/login`), inventory (`/inventario`), and stock alerts (`/alertas`). UI text, validation messages, and domain names are Spanish; keep them that way.
- Backend is a separate FastAPI service in `../Backend` with CRUD routes under `/api/insumo/`, `/api/categoria/`, and `/api/unidad-medida/` (trailing slash required) and auth routes under `/api/auth/`. `InsumoSv`, `CategoriaSv`, and `UnidadMedidaSv` call it through `HttpClient`; CORS is configured in the backend for ports 4200/4000.
- `src/app/app.routes.ts` defines the routes; `App` only renders a `router-outlet`. Protected routes live under `Layout` and are guarded by `authGuard`; `AuthSv` performs real login against `/api/auth/login`, stores JWT + user in `localStorage` (SSR-guarded), and validates with `/api/auth/me`. Logout is client-side token removal.

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

- `npx ng test --watch=false` passes (18 tests across `app`, `InsumoSv`, `AuthSv`, `Inventario`, `Alertas`, `Login`).
- `npm run build` succeeds. Expected warnings: CDN stylesheets cannot be resolved offline ("Unable to locate stylesheet") and `sweetalert2` is CommonJS.
- Only `/login` is prerendered; the protected routes render client-side (`app.routes.server.ts`) so the auth guard is not evaluated during prerender.
- Demo data comes from `../Backend/seed.py` (idempotent): Frijoles (abastecido), Lentejas (crítico alta), Aceite (crítico media), and user `admin / Admin2026` (Argon2 hash).
- No e2e framework is configured despite `ng e2e` being mentioned in the README. There is no CI config.

## Conventions that differ from Angular defaults

- Uses Angular 22 Signals Forms: `form()`, `FormField`, `required`/`min`, and `[formField]` from `@angular/forms/signals`; do not migrate to `ReactiveFormsModule`/`FormsModule`.
- Services use the Angular 22 auto-provided `@Service()` decorator with `inject()`; do not replace it with `@Injectable({ providedIn: 'root' })` unless required.
- File names omit type suffixes: `insumo-sv.ts` (service), `pages/inventario/inventario.ts` (component). Classes are `InsumoSv`, `Inventario`, `App`. Files from `ng generate` will not match this naming; rename them.
- Bootstrap CSS/JS come from CDN tags in `src/index.html`; `src/styles.css` holds the design tokens and shared classes. Do not add a Bootstrap npm import without intentionally migrating.
- No path aliases; imports are relative.
- SSR/prerender is enabled: avoid `window`, `document`, or `localStorage` during module init; guard browser-only code.
- `tsconfig.json` enables `noImplicitReturns`, `noImplicitOverride`, and `noPropertyAccessFromIndexSignature`, but not `strict`.
