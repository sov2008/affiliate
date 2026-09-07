# TASK_SPEC: Autonomous SEO Content Hub & Auto-Publishing Pipeline (Astro + Pollinations + LosPollos)

## 1. Executive Summary & Architecture

Transform the project into a fully autonomous, self-publishing Dating SEO Content Hub built with Astro 5 SSG, served via Nginx at `https://flirtcheck.site/blog/`. The system operates in an Auto-Pilot mode: AI generates batches of longread articles (10–20 items) with AI-generated covers via Pollinations, compiles Markdown into Astro content collections, triggers static builds, updates SQLite telemetry, and deploys to DigitalOcean (`178.128.199.28`). All internal monetization CTAs route exclusively through LosPollos Dating Smartlink via cloaked/internal redirects (`/r/...`).

---

## 2. Target Constraints & Parameters

- **Target Audience / GEO**: Tier-1 Organic Search & Social (US, UK, CA, AU). Language strictly English (EN-US).
- **Offer / Monetization**: LosPollos Dating Smartlink. Internal routing via `/r/dating-smartlink` or `/api/redirect/dating` with strict `rel="nofollow sponsored"` and bot-shield filtering.
- **Workflow Mode**: **AUTO-PILOT**. Generated posts automatically write to `blog/src/content/posts/*.md` and trigger `npm run build:blog`. Direct sync to SQLite status `DISPATCHED`.
- **Batch Processing**: Batch generation cycle generates **10 to 20 low-competition long-tail keywords** per trigger.
- **Visuals**: Cover images generated on-the-fly via **Pollinations Image-Gen API**, downloaded and placed into `blog/public/images/posts/[slug].webp` (or embedded via direct CDN URLs with fallbacks).

---

## 3. Scope of Implementation

### Module A: Keyword Matrix & Semantic Topic Engine

- File: `core/src/config/datingKeywords.ts`
- Implement an extensible pool of 50+ low-competition, high-intent Tier-1 dating search intents across clusters:
  1. _Romance Scam & Bot Detection_ (e.g., "how to verify if tinder match is bot", "dating profile image reverse search")
  2. _First Message & Icebreakers_ (e.g., "what to say after match disappears", "hinge opening lines that get replies")
  3. _Profile Optimization & Psychological Triggers_ (e.g., "dating profile bio red flags guys overlook", "optimal photo order for dating apps")
  4. _Safety & Identity Verification_ (e.g., "dating safety checklist before meeting IRL")
- Service exposes `getNextKeywordBatch(count: number = 10): KeywordIntent[]`.

### Module B: Pollinations AI Image Cover Generator

- File: `core/src/services/imageGenerator.service.ts`
- Method: `generateArticleCover(slug: string, promptTheme: string): Promise<string>`
  - Uses Pollinations AI endpoint with stylized cinematic/editorial dating prompts: `minimalist modern dating lifestyle, neon bokeh, cyber-aesthetic, high quality, photorealistic, 16:9, no text, no watermark`.
  - Downloads the generated image stream, optimizes/saves to `blog/public/images/posts/${slug}.webp` (or stores valid cached URL).
  - Returns local path `/blog/images/posts/${slug}.webp`.

### Module C: Autonomous SEO Longread Generator

- File: `core/src/services/blogGenerator.service.ts`
- Uses AI Credits Gateway (`Gemini 1.5 Flash` or `Qwen 2.5 72B` balancing).
- Input: `KeywordIntent`.
- Output requirements:
  - 1500–2200 words of authentic, high-value, non-fluff English content.
  - Strict YAML Frontmatter matching `blog/src/content.config.ts`:
    - `title`, `description`, `pubDate`, `author`, `tags`, `seoKeywords`, `coverImage`, `draft: false`.
  - Structured Markdown: `H1`, `H2`, `H3`, key takeaways box, numbered actionable steps, comparative tables.
  - Interactive Smartlink hook: Native context transition to verification/compatibility test inserting `<DatingSmartlinkCTA />` or markdown CTA buttons pointing to LosPollos link.
  - FAQ schema block with 3–5 high-volume PAA (People Also Ask) questions.

### Module D: Auto-Pilot Publisher & Static Site Builder

- File: `core/src/services/autoPublisher.service.ts`
- Workflow logic:
  1. Iterates through the generated batch of articles.
  2. Writes `.md` files directly to `blog/src/content/posts/${slug}.md`.
  3. Inserts task records into `core/data/content_queue.sqlite` (`content_queue_v2`) with status `DISPATCHED` and public URL `https://flirtcheck.site/blog/${slug}`.
  4. Automatically derives 2 `SOCIAL_SNIPPET` tasks per article (Reddit case question + X/Twitter punchy thread) into `content_queue_v2` for downstream syndication.
  5. Runs `npm run build:blog` synchronously or via worker queue to generate fresh static pages in `blog/dist/`.
  6. Emits SSE event `queue_update` and `telemetry` for live logging.

### Module E: Dashboard & API Controls

- File: `core/src/dashboard-server.ts` & `core/src/dashboard.html`
- Add API route: `POST /api/blog/batch-generate` with payload `{ count: number }` (default: 10).
- Update Dashboard UI:
  - Add button `[ 🚀 Auto-Gen 10 Blog Posts ]` to the bottom toolbar.
  - Add notification toast/telemetry log during batch execution.
  - Filter in `SQLITE CONTENT QUEUE` for `BLOG_POST` items showing live URLs and cover thumbnails.

### Module F: Remote Production Deployment & Nginx Verification

- Target Server: `178.128.199.28` (Ubuntu, Nginx, PM2).
- Update remote deployment script to:
  - Pull latest code.
  - Run `npm run build:blog`.
  - Sync `blog/dist/` to `/var/www/affiliate/blog/dist/`.
  - Ensure Nginx serves `/blog/` with `auth_basic off;` and proper mime-types/caching.
  - Ensure PM2 services (`affiliate-dashboard`, `affiliate-scheduler`) are active, and Reddit bots remain `STOPPED`.

---

## 4. Definition of Done (DoD)

The autonomous agent MUST NOT stop until ALL of the following criteria are validated:

1. `npm run typecheck` in the root repository returns 0 errors.
2. An automated test generates at least 3 live articles with real images into `blog/src/content/posts/`.
3. `npm run build:blog` completes successfully with exit code 0, generating static HTML files in `blog/dist/`.
4. Remote deploy script runs and updates the server `178.128.199.28`.
5. Automated probe verifies:
   - `curl -Is https://flirtcheck.site/blog/ | grep "HTTP/2 200"`
   - `curl -Is https://flirtcheck.site/blog/[any-new-slug]/ | grep "HTTP/2 200"`
6. Telemetry and queue tables in SQLite verify entries exist with `platform = 'BLOG_POST'` and `status = 'DISPATCHED'`.
7. Reddit scrapers/posters remain safely `STOPPED`.
