# Upcube Games Conversion Source Map

## Live IGDB surfaces

- `lib/igdb/client.ts`: Twitch credential handling, IGDB request wrapper, token reuse, and cached helper functions.
- `lib/igdb/queries.ts`: shared IGDB query builders for games, companies, franchises, genres, and platforms.
- `lib/igdb/search-games.ts`: query-specific IGDB search helper.
- `app/games/page.tsx`: public directory page.
- `app/game/[slug]/page.tsx`: public game detail page.
- `app/search/page.tsx`: query search page.
- `app/api/igdb/games/route.ts`: JSON directory endpoint.
- `app/company/[slug]/page.tsx`, `app/genre/[slug]/page.tsx`, `app/platform/[slug]/page.tsx`, `app/franchise/[slug]/page.tsx`: secondary IGDB detail routes.

## Cache boundaries

- Twitch access tokens stay in memory until shortly before expiry.
- Public directory/detail helpers cache successful responses for minutes.
- Genre, platform, company, and franchise list helpers cache longer because they change less often.
- Search is query-specific and only uses a short cache window.
- Error responses stay uncached so a transient IGDB failure does not poison the app.
- Token reuse stays in memory only; no IGDB secrets are written to client-visible cache.
- Public directory/detail helpers use short server-function cache windows, while search and recommendation helpers stay much shorter and query-specific.

## Drift note

- The checkout is a mixed Commerce + IGDB tree, so IGDB logic lives alongside legacy commerce routes.
- The current implementation follows the live repo files rather than the earlier commerce-only template assumptions.
