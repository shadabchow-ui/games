# Upcube Games

Upcube Games is a Next.js game discovery directory powered by live IGDB data.

The project turns a stock commerce template into a game-focused catalog experience for browsing top games, new releases, upcoming launches, platforms, genres, franchises, and game companies. It is built with the Next.js App Router, React 19, TypeScript, Tailwind, and Cloudflare deployment tooling through OpenNext.

## Current status

This repository is an active game directory and discovery platform foundation.

The app already includes a live IGDB integration layer, homepage discovery sections, game cards, search behavior, directory data utilities, companies, platforms, genres, franchises, rule-based recommendations, and Cloudflare-oriented deploy/preview scripts.

The honest current posture is:

```text
Game discovery directory foundation + live IGDB integration + Cloudflare deployment direction.
```

It should not yet be described as a finished gaming marketplace, full review platform, social network, storefront, or AI recommendation engine. User accounts, ratings, advanced personalization, owned libraries, comments, wishlists, and production-scale catalog operations are future or partial areas unless validated in code.

## What Upcube Games is building

Upcube Games is aimed at becoming a useful game discovery website where users can:

- Search for video games.
- Browse top-rated games.
- Browse new releases.
- Browse upcoming launches.
- Explore games by platform.
- Explore games by genre.
- Browse featured companies/studios.
- Explore franchises.
- View game details from IGDB metadata.
- Compare and discover games through rule-based recommendations.
- Use a clean, fast, server-rendered directory experience.

## Core principles

### Discovery first

The primary product goal is helping users find what to play next. Search, top games, new releases, upcoming games, genres, platforms, companies, and franchises matter more than checkout-style ecommerce flows.

### Live data, graceful fallback

The app is designed to use live IGDB data when Twitch/IGDB credentials are configured. When credentials are missing or upstream data is unavailable, the UI should fail gracefully with clear setup/fallback messages.

### Server-side data access

IGDB access is handled server-side through environment variables and server-only modules. Client-facing UI should not expose Twitch/IGDB secrets.

### Useful without paid AI

The app includes rule-based recommendation and comparison direction so the directory can remain useful without relying on paid AI providers.

### Cloudflare-ready deployment

The project includes OpenNext Cloudflare scripts for build, preview, and deploy workflows.

## Repository identity

```text
Repository: shadabchow-ui/games
Project:    Upcube Games Directory
Framework:  Next.js App Router
Runtime:    React 19 + TypeScript
Deploy:     OpenNext for Cloudflare / Wrangler
```

## Technology stack

- Next.js 15 canary
- React 19
- TypeScript
- Tailwind CSS 4 tooling
- Headless UI
- Heroicons
- Geist font package
- Sonner
- OpenNext for Cloudflare
- Wrangler
- IGDB API
- Twitch OAuth client credentials flow

## Major feature areas

### Homepage discovery

The homepage presents a game discovery shell with sections for:

- Top games.
- New releases.
- Upcoming games.
- Popular platforms.
- Browse by genre.
- Featured companies.

When IGDB credentials are not configured, the homepage renders a clear message explaining the needed server-side environment variables.

### IGDB integration

The IGDB client layer supports:

- Twitch token authentication.
- Token caching.
- Server-only IGDB API requests.
- Config error handling.
- Upstream error handling.
- Game search.
- Game lookup by slug, title, or IGDB ID.
- Top-rated games.
- Recent games.
- Upcoming games.
- Games directory queries.
- Genres.
- Platforms.
- Companies.
- Franchises.
- Rule-based recommendations.

### Search

Search supports user-entered game queries and resolves results from IGDB data. The integration sanitizes query text and limits query length to protect upstream calls.

### Games directory

The directory layer supports multiple sort modes and limits. It can fetch top-rated, newest, upcoming, and name-sorted game lists with fallback query strategies to reduce empty result states.

### Platforms and genres

The app includes platform and genre directory support, with preferred ordering for common platforms and genres.

Examples include:

- PC.
- PlayStation.
- Xbox.
- Nintendo Switch.
- Steam Deck.
- iOS.
- Android.
- RPG.
- Shooter.
- Adventure.
- Indie.
- Strategy.
- Racing.
- Sport.
- Fighting.
- Puzzle.

### Companies and studios

The app includes support for featured companies, company pages, developed games, and published games.

### Franchises

The app includes franchise directory and franchise game lookup support.

### Game detail direction

Game detail routes can use IGDB slugs to retrieve metadata such as title, summary, release date, rating, cover image, genres, platforms, themes, game modes, involved companies, and similar games.

### Rule-based recommendations

The project includes a non-AI recommendation direction based on game metadata and lookup utilities. This keeps recommendations lightweight and useful without requiring an external LLM provider.

## Environment configuration

To load live IGDB data, configure Twitch/IGDB credentials on the server.

Supported variables include:

```bash
IGDB_BASE_URL=https://api.igdb.com/v4
IGDB_CLIENT_ID=
IGDB_ACCESS_TOKEN=
TWITCH_CLIENT_ID=
TWITCH_ACCESS_TOKEN=
TWITCH_CLIENT_SECRET=
```

Credential options:

- `IGDB_CLIENT_ID` or `TWITCH_CLIENT_ID` is required as the client ID.
- Use `IGDB_ACCESS_TOKEN` or `TWITCH_ACCESS_TOKEN` if you already have a token.
- Or set `TWITCH_CLIENT_SECRET` so the app can request and cache a token through Twitch OAuth client credentials.

Do not commit real credentials to the repository.

## Development

### Prerequisites

- Node.js compatible with the project dependencies
- pnpm
- Twitch/IGDB API credentials for live data

### Install

```bash
pnpm install
```

### Run locally

```bash
pnpm dev
```

The app should run locally at:

```text
http://localhost:3000
```

### Build

```bash
pnpm build
```

### Start production server locally

```bash
pnpm start
```

### Format

```bash
pnpm prettier
```

### Check formatting

```bash
pnpm prettier:check
```

### Test

```bash
pnpm test
```

`pnpm test` currently runs the Prettier check.

## Cloudflare deployment

The project includes Cloudflare deployment scripts using OpenNext:

```bash
pnpm preview
pnpm deploy
```

These run:

```bash
opennextjs-cloudflare build && opennextjs-cloudflare preview
opennextjs-cloudflare build && opennextjs-cloudflare deploy
```

Make sure Cloudflare/Wrangler configuration and environment variables are set before deploying.

## Available scripts

| Script | Purpose |
|---|---|
| `pnpm dev` | Start Next.js development server with Turbopack |
| `pnpm build` | Build the Next.js app |
| `pnpm start` | Start the Next.js production server |
| `pnpm prettier` | Format files with Prettier |
| `pnpm prettier:check` | Check formatting |
| `pnpm test` | Run formatting check |
| `pnpm preview` | Build and preview through OpenNext Cloudflare |
| `pnpm deploy` | Build and deploy through OpenNext Cloudflare |

## Validation checklist

Before claiming a change is complete, run:

```bash
pnpm prettier:check
pnpm build
```

For data and route changes, manually verify:

- Homepage loads.
- Missing IGDB credentials show a clear fallback message.
- Top games render when credentials are configured.
- New releases render when credentials are configured.
- Upcoming games render when credentials are configured.
- Platform pages load.
- Genre pages load.
- Company pages load and do not 404 for valid company slugs.
- Franchise pages load where available.
- Search returns useful results.
- Game detail pages load for valid slugs.
- Game cover images are sharp enough for card and detail usage.
- Pagination or load-more behavior is clear where limits apply.
- Cloudflare preview/deploy scripts still work when configured.

## Maturity map

| Area | Status | Notes |
|---|---|---|
| Next.js app shell | Implemented foundation | App Router, React 19, TypeScript |
| Homepage game discovery | Implemented foundation | Top/new/upcoming/platform/genre/company sections |
| IGDB integration | Implemented foundation | Server-only client, token handling, query helpers |
| Search | Implemented foundation | Query sanitization and IGDB search support |
| Games directory | Implemented foundation | Sort modes and fallback queries |
| Platforms/genres | Implemented foundation | Directory tile support |
| Companies/studios | Implemented foundation | Featured companies, developed/published games support |
| Franchises | Implemented foundation | Franchise directory and game lookup support |
| Rule-based recommendations | Foundation | Useful without paid AI providers |
| User accounts | Future | Not a current core claim |
| Reviews/ratings by users | Future | IGDB ratings exist; local user reviews are not a current core claim |
| Commerce/checkout | Not core | Stock commerce README has been removed; this is a games directory |
| Production catalog ops | Partial/future | Needs caching, monitoring, image QA, pagination, and rate-limit hardening |

## Roadmap

### Near term

- Improve game detail pages.
- Fix any remaining 404s on game/company/platform/genre routes.
- Add clearer pagination or load-more behavior.
- Improve cover image quality and responsive image handling.
- Improve empty/error/loading states.
- Add better route metadata for SEO.
- Harden Cloudflare deployment configuration.

### Mid term

- Add richer game comparison pages.
- Expand rule-based recommendations.
- Add franchise and studio browsing polish.
- Add saved games or wishlist behavior.
- Add better caching and rate-limit protection for IGDB calls.
- Add structured sitemap generation for indexed game pages.

### Longer term

- Add user accounts.
- Add personal game libraries/backlogs.
- Add reviews, ratings, and community lists.
- Add AI-assisted discovery if useful and cost-controlled.
- Add admin/catalog health tooling.
- Add provider abstraction for non-IGDB data sources.

## Data and provider boundaries

Upcube Games uses IGDB/Twitch data when configured. The app should respect provider terms, rate limits, attribution requirements, and API credential security.

The app should not:

- Expose Twitch/IGDB secrets to the browser.
- Scrape or rehost assets outside provider terms.
- Claim ownership of third-party metadata.
- Present unavailable upstream data as verified.

## What this repo is not

Upcube Games is not a finished game marketplace, Steam clone, social network, or review platform.

It is best understood as a live game discovery and directory foundation in active development.

## Good short description

Use this when describing the project publicly:

> A Next.js game discovery directory powered by IGDB, with top games, new releases, upcoming games, platforms, genres, companies, franchises, search, and rule-based recommendation foundations.

## Contributing and development notes

When working on this repo:

- Keep IGDB credentials server-side only.
- Keep missing-credential states graceful.
- Avoid restoring stock ecommerce/Shopify README language.
- Validate route links so cards do not lead to 404 pages.
- Prefer sharp cover/image URLs for cards and detail pages.
- Add pagination or clear limits where large directories are shown.
- Run formatting and build checks before claiming completion.

## License

License information has not been finalized yet.

## Disclaimer

Upcube Games is an independent game discovery project in active development. It is not affiliated with IGDB, Twitch, Steam, Nintendo, Sony, Microsoft, or any game publisher/platform holder. Use of third-party metadata, images, and APIs must follow each provider's terms, attribution rules, rate limits, and branding requirements.
