# NovaTrade - Trading Journal Application

## Overview

NovaTrade is a full-stack trading journal application designed for futures/derivatives traders. It allows users to log trades, track performance metrics (P&L, win rate, risk/reward ratios), and visualize their equity curve over time. The app uses a dark, professional "trading terminal" aesthetic with neon cyan accents.

The core functionality includes:
- **Trade Log**: CRUD operations for trades with fields like ticker, direction (long/short), entry/exit prices, position size, tick size/value, commissions, and notes
- **Dashboard**: Summary statistics (total P&L, win rate, average R:R) and a cumulative P&L performance curve chart
- **Analytics**: Placeholder page for future advanced metrics (heatmaps, drawdown analysis, etc.)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (client/)
- **Framework**: React 18 with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router) with three routes: `/` (Dashboard), `/trades` (Trade Log), `/analytics` (Analytics)
- **State Management**: TanStack React Query for server state (fetching, caching, mutations)
- **UI Components**: Shadcn UI (new-york style) built on Radix UI primitives, styled with Tailwind CSS and CSS variables for theming
- **Charts**: Recharts (AreaChart for the performance/equity curve)
- **Forms**: React Hook Form with Zod validation via `@hookform/resolvers`
- **Layout**: Sidebar navigation (`AppSidebar` component) using Shadcn's sidebar pattern, responsive with mobile sheet drawer

### Backend (server/)
- **Framework**: Express 5 on Node.js with TypeScript (run via `tsx`)
- **API Pattern**: RESTful JSON API under `/api/*` prefix. Routes defined in `server/routes.ts`, with shared route definitions in `shared/routes.ts` that include Zod schemas for input validation and response typing
- **Storage Layer**: `IStorage` interface in `server/storage.ts` with `DatabaseStorage` implementation using Drizzle ORM. This abstraction makes it easy to swap storage backends.
- **Dev Server**: Vite dev server middleware served through Express in development; static file serving in production

### Shared Code (shared/)
- **Schema** (`shared/schema.ts`): Drizzle ORM table definitions and Zod schemas generated via `drizzle-zod`. Single table: `trades`
- **Routes** (`shared/routes.ts`): API route contracts (paths, methods, input/output schemas) shared between client and server for type safety

### Database
- **PostgreSQL** via Drizzle ORM with `node-postgres` (pg) driver
- **Schema management**: `drizzle-kit push` for applying schema changes (no migration files needed in dev)
- **Connection**: Uses `DATABASE_URL` environment variable
- **Single table**: `trades` with columns for id, ticker, dates, prices, position size, direction, P&L, risk/reward, status, tick configuration, commissions, and notes

### Build System
- **Development**: `tsx server/index.ts` runs the Express server with Vite middleware for HMR
- **Production Build**: Custom `script/build.ts` that runs Vite build for client and esbuild for server, outputting to `dist/`. Server bundles key dependencies to reduce cold start times.
- **Output**: `dist/public/` (client assets) and `dist/index.cjs` (server bundle)

### Key Design Decisions
1. **Shared route contracts**: API routes are defined once in `shared/routes.ts` with Zod schemas, used by both client hooks and server handlers. This ensures type safety across the stack.
2. **Numeric fields as strings**: Trade prices, P&L, and sizes use Postgres `numeric` type (mapped to strings in JS) to avoid floating-point precision issues common in financial applications. Forms use `z.coerce.string()` for these fields.
3. **No authentication**: Currently no auth system. All trades are globally accessible.
4. **Dark-only theme**: CSS variables are set for a single dark trading terminal theme — no light mode toggle.

## External Dependencies

### Required Services
- **PostgreSQL Database**: Required. Connection via `DATABASE_URL` environment variable. Used through Drizzle ORM with the `pg` driver.

### Key NPM Packages
- **drizzle-orm** + **drizzle-kit** + **drizzle-zod**: ORM, schema management, and Zod schema generation
- **express** (v5): HTTP server framework
- **@tanstack/react-query**: Async state management for the client
- **recharts**: Charting library for performance visualization
- **wouter**: Lightweight client-side routing
- **react-hook-form** + **zod**: Form handling and validation
- **Shadcn UI / Radix UI**: Complete component library (accordion, dialog, dropdown-menu, select, sidebar, table, tabs, toast, tooltip, etc.)
- **tailwindcss** + **class-variance-authority** + **clsx** + **tailwind-merge**: Styling utilities
- **date-fns**: Date formatting
- **connect-pg-simple**: PostgreSQL session store (available but auth not yet implemented)

### Replit-Specific Plugins
- `@replit/vite-plugin-runtime-error-modal`: Error overlay in development
- `@replit/vite-plugin-cartographer` and `@replit/vite-plugin-dev-banner`: Dev experience plugins (conditionally loaded)