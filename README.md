# WatchHentai API

Unofficial REST API that scrapes [watchhentai.net](https://watchhentai.net), built with Next.js (App Router), TypeScript, and Cheerio.

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/home` | Homepage sliders, recent episodes, and series |
| GET | `/api/videos?page=1` | Paginated episode listing |
| GET | `/api/watch/[slug]` | Episode detail (player, genres, episode list, gallery) |
| GET | `/api/series?page=1&genre=...&year=...` | Series listing, filterable by genre or release year |
| GET | `/api/series/[slug]` | Series detail (synopsis, episodes, gallery, related) |
| GET | `/api/trending?page=1` | Trending series |
| GET | `/api/calendar` | Upcoming/past release calendar grouped by month |
| GET | `/api/search?q=...&page=1` | Search series and episodes |
| GET | `/api/genres` | List all genres with name, slug, and series count |
| GET | `/api/genres/[slug]?page=1` | Series listing filtered by genre slug |

Interactive API docs (Swagger UI) are available at `/docs`.

CORS is enabled for all `/api/*` routes.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000).

## Build & Run

\`\`\`bash
npm run build
npm start
\`\`\`

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `BASE_URL` | Yes | Target site to scrape, e.g. `https://watchhentai.net` |

## Deploy to Render

1. Push this repo to GitHub.
2. In Render, create a new **Web Service** (or use the included `render.yaml` Blueprint).
3. Build command: `npm install && npm run build`
4. Start command: `npm start`

The `start` script binds to Render's `$PORT` automatically.

## Notes

- Scraper selectors live in `lib/scraper.ts` and are derived from watchhentai.net's live HTML structure.
- Responses are fetched fresh on each request (`cache: "no-store"`) to avoid stale data from the upstream site.
- This project is for educational purposes; it is not affiliated with watchhentai.net.
