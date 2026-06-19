# ENYGMA

Plataforma de streaming privada para la familia Enigma. Estilo HBO Max / Disney+ con fondo negro puro, letras blanco hueso, y púrpura vibrante #A855F7 como acento. Contenido desde Google Sheets + TMDB.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/enygma run dev` — run the frontend (port 20693)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + TailwindCSS + Framer Motion + wouter
- API: Express 5 (no database — all content from Google Sheets CSVs)
- Data: Google Sheets (public CSV export) + TMDB API
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas
- `artifacts/api-server/src/lib/sheets.ts` — Google Sheets CSV fetcher with 5-min cache
- `artifacts/api-server/src/lib/tmdb.ts` — TMDB API client
- `artifacts/api-server/src/routes/` — API routes (profiles, content, tmdb)
- `artifacts/enygma/src/` — React frontend

## Architecture decisions

- No database — all content is read from public Google Sheets CSVs, cached in-memory for 5 minutes
- TMDB API used server-side as a proxy to add posters, logos, cast, trailers, recommendations
- Profile selection stored in localStorage + React context; Kids profile filters content by genre
- Content read "de abajo hacia arriba" (latest added first = reversed array)
- TMDB key stored as env var `TMDB_API_KEY`

## Product

- Profile selection screen (Señor Enigma, Señora Enigma, Kids)
- Home with banner carousel, Top 10, Trending, Recommended, Latest sections
- Movies, Series, Anime grids with search/filter
- Detail pages with TMDB enrichment (cast, trailers, recommendations)
- Full-screen video player (iframe embed)

## Google Sheets

- Movies: `1Xv3EcCNlwwxzLWfEeY_rjNcnGNyMc93IuHKVw6mjeRw` (gid=208195175)
- Series: `1FuovS9r9syC7n3wykiILuxKuf9w6TqAtyHecV9PP4i0` (gid=642855286)
- Anime: `1dyr3NtX4PQ-Znje2dJOd0UTFKinwkSBPqk0SOAWuG28` (gid=0)

## User preferences

- Diseño premium tipo streaming, fondo negro puro, letras blanco hueso, púrpura vibrante #A855F7, cinematográfico
- Responsive + Smart TV friendly
- Contenido leído de abajo hacia arriba (últimos añadidos primero)
- No usar emojis en la UI

## Gotchas

- After each OpenAPI spec change, run codegen before starting development
- Google Sheets must remain public (anyone with link can view)
- Cache TTL is 5 minutes — content updates appear after at most 5 min
- TMDB_API_KEY env var must be set (currently: b9b334be32f57187296a06cfed4f2821)
