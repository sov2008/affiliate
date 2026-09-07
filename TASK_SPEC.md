# TASK_SPEC: Autonomous SEO Content Hub & Auto-Publishing Pipeline (Astro + Pollinations + LosPollos)

## 1. Executive Summary & Architecture

Transform the project into a fully autonomous, self-publishing Dating SEO Content Hub built with Astro 5 SSG, served via Nginx at `https://flirtcheck.site/blog/`. The system operates in an Auto-Pilot mode: AI generates batches of longread articles (10–20 items) with AI-generated covers via Pollinations, compiles Markdown into Astro content collections, triggers static builds, updates SQLite telemetry, and deploys to DigitalOcean (`178.128.199.28`). All internal monetization CTAs route exclusively through LosPollos Dating Smartlink via cloaked/internal redirects (`/r/...`).

---

## 2. Target Constraints & Parameters

- **Target Audience / GEO**: Tier-1 Organic Search & Social (US, UK, CA, AU). Language strictly English (EN-US).
- **Offer / Monetization**: LosPollos Dating Smartlink via internal cloaked route `GET /r/dating?ref=[slug]`. All links enforce `rel="nofollow sponsored" target="_blank"`.
- **Workflow Mode**: **AUTO-PILOT**. Generated posts automatically write to `blog/src/content/posts/*.md`, followed by a single batch trigger of `npm run build:blog`. Direct sync to SQLite status `DISPATCHED`.
- **Batch Processing**: Batch generation cycle generates **10 to 20 low-competition long-tail keywords** per trigger.
- **Visuals**: Cover images generated on-the-fly via **Pollinations Image-Gen API** with a 10s network timeout, compressed using `sharp` to `blog/public/images/posts/[slug].webp`. Fallback to `/blog/images/posts/default-cover.webp` on API error.

---

## 3. Scope of Implementation

### Module A: Keyword Matrix & Semantic Topic Engine

- File: `core/src/config/datingKeywords.ts`
- Implement an extensible pool of 50+ low-competition, high-intent Tier-1 dating search intents across clusters:
  1. _Romance Scam & Bot Detection_ (e.g., "how to verify if tinder match is bot", "dating profile image reverse search")
  2. _First Message & Icebreakers_ (e.g., "what to say after match disappears", "hinge opening lines that get replies")
  3. _Profile Optimization & Psychological Triggers_ (e.g., "dating profile bio red flags guys overlook", "optimal photo order for dating apps")
  4. _Safety & Identity Verification_ (e.g., "dating safety checklist before meeting IRL")
- Deduplication: Cross-reference existing SQLite `content_queue_v2` and files in `blog/src/content/posts/` to avoid duplicate slugs/topics.
- Service exposes `getNextKeywordBatch(count: number = 10): Promise<KeywordIntent[]>`.

### Module B: Resilient Cover Generator (Pollinations + Sharp)

- File: `core/src/services/imageGenerator.service.ts`
- Method: `generateArticleCover(slug: string, promptTheme: string): Promise<string>`
  - Request Pollinations AI with prompt: `minimalist modern dating lifestyle, neon bokeh, editorial, high quality, photorealistic, 16:9, no text, no watermark`.
  - Enforce a 10-second `AbortController` timeout.
  - If successful: download stream, convert/compress to WebP (80% quality, max width 1200px) using `sharp`, save to `blog/public/images/posts/${slug}.webp`.
  - Fallback logic: If request fails or times out, ensure a generated SVG/WebP placeholder is copied to `blog/public/images/posts/${slug}.webp`.
  - Returns web path `/blog/images/posts/${slug}.webp`.

### Module C: Autonomous SEO Longread Generator

- File: `core/src/services/blogGenerator.service.ts`
- Uses AI Credits Gateway (`Gemini 1.5 Flash` or `Qwen 2.5 72B` balancing).
- Input: `KeywordIntent`.
- Output requirements:
  - 1500–2200 words of authentic, high-value, non-fluff English content.
  - Strict YAML Frontmatter matching `blog/src/content.config.ts`:
    - `title`, `description`, `pubDate`, `author`, `tags`, `seoKeywords`, `coverImage`, `draft: false`.
  - Structured Markdown: `H1`, `H2`, `H3`, key takeaways box, numbered actionable steps, comparative tables.
  - Native Context CTA: Seamlessly embed `<DatingSmartlinkCTA />` or button linking to `/r/dating?ref=${slug}`.
  - FAQ schema block with 3–5 high-volume PAA (People Also Ask) questions.

### Module D: Auto-Pilot Publisher & Batch Site Builder

- File: `core/src/services/autoPublisher.service.ts`
- Workflow logic:
  1. Executes batch generation for $N$ keywords sequentially or with concurrency of 2.
  2. Writes all `.md` files to `blog/src/content/posts/${slug}.md`.
  3. Inserts task records into `core/data/content_queue.sqlite` (`content_queue_v2`) with status `DISPATCHED` and public URL `https://flirtcheck.site/blog/${slug}`.
  4. Automatically derives 2 `SOCIAL_SNIPPET` tasks per article (Reddit discussion question + X thread snippet) into `content_queue_v2`.
  5. **Post-Batch Build Trigger**: Executes `npm run build:blog` **ONCE** after the entire batch is written.
  6. Emits SSE event `queue_update` and updates telemetry metrics.

### Module E: Dashboard, Cloaking Route & API Controls

- File: `core/src/dashboard-server.ts` & `core/src/dashboard.html`
- Cloaking & Smartlink Route:
  - Add `GET /r/dating`:
    - Evaluates request with `bot-shield` (crawler/bot heuristics).
    - Crawlers/Scrapers $\rightarrow$ 302 Redirect to `/blog/`.
    - Valid Humans $\rightarrow$ 302 Redirect to `LOSPOLLOS_SMARTLINK_URL` from `.env`.
- API endpoint: `POST /api/blog/batch-generate` with payload `{ count: number }` (default: 10).
- Dashboard UI:
  - Add button `[ 🚀 Auto-Gen 10 Blog Posts ]` to the bottom toolbar.
  - Visual indicator / toast showing batch progress.
  - Queue table filter/badge for `BLOG_POST` items showing thumbnail, slug, and live preview link.

### Module F: Remote Production Deployment & Nginx Verification

- Target Server: `178.128.199.28` (Ubuntu, Nginx, PM2).
- Deploy procedure:
  - Sync codebase and run `npm run build:blog`.
  - Ensure `blog/dist/` is served at `/blog/` with `auth_basic off;`.
  - Ensure `blog/public/robots.txt` is served at `/robots.txt` or `/blog/robots.txt`.
  - Restart PM2 service `affiliate-dashboard`.
  - Guarantee Reddit bots remain strictly `STOPPED`.

---

## 4. Definition of Done (DoD)

The autonomous agent MUST NOT stop until ALL of the following criteria are validated:

1. `npm run typecheck` in the root repository returns 0 errors.
2. An automated test generates at least 3 live articles with real images and valid Frontmatter into `blog/src/content/posts/`.
3. `npm run build:blog` completes successfully with exit code 0, verifying `blog/dist/index.html` and `blog/dist/sitemap-index.xml` exist.
4. Remote deploy script runs and updates the server `178.128.199.28`.
5. Automated HTTP probes verify:
   - `curl -Is https://flirtcheck.site/blog/ | grep -E "HTTP/[12](\.[0-9])? 200"`
   - `curl -Is https://flirtcheck.site/blog/[any-new-slug]/ | grep -E "HTTP/[12](\.[0-9])? 200"`
   - `curl -Is https://flirtcheck.site/r/dating | grep -E "HTTP/[12](\.[0-9])? 302"`
6. Telemetry and SQLite queue tables verify entries exist with `platform = 'BLOG_POST'` and `status = 'DISPATCHED'`.
7. Reddit scrapers/posters remain safely `STOPPED`.
