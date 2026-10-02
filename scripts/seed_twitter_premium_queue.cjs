const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const dbPath = path.resolve('core/data/content_queue.sqlite');
const postsDir = path.resolve('blog/src/content/posts');

console.log('--- 🚀 Seeding Twitter Premium Long-Form Queue ---');
console.log('Database:', dbPath);

const db = new DatabaseSync(dbPath);

const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
console.log(`Discovered ${files.length} articles for long-form formatting.`);

// Check existing dispatched to preserve live history
const dispatched = db.prepare("SELECT target_url FROM content_queue_v2 WHERE platform = 'TWITTER' AND status = 'DISPATCHED'").all();
const dispatchedUrls = new Set(dispatched.map(d => d.target_url));
console.log(`Preserving ${dispatchedUrls.size} already dispatched posts.`);

// Clear existing APPROVED queue to upgrade to Premium Long-form format
const deleted = db.prepare("DELETE FROM content_queue_v2 WHERE platform = 'TWITTER' AND status = 'APPROVED'").run();
console.log(`Upgrading ${deleted.changes} pending items to Premium Long-Form standards.`);

function craftPremiumTweet(file, post) {
  const slug = file.replace(/\.md$/, '');
  const url = `https://flirtcheck.site/${slug}/`;
  const title = (post.data.title || '').replace(/\s*\(2026.*?\)/gi, '').trim();
  const desc = (post.data.description || '').trim();
  const caseId = post.data.caseId || `FC-${Math.floor(100 + Math.random() * 899)}-UK`;
  const cat = (post.data.category || 'Forensic Dossier').toUpperCase();
  const risk = (post.data.telemetryRisk || 'HIGH').toUpperCase();

  // Extract key takeaways or sections from markdown body
  const bodyText = post.content || '';
  const lines = bodyText.split('\n').map(l => l.trim()).filter(Boolean);

  let takeaways = [];
  let inTakeaways = false;

  for (const line of lines) {
    if (line.toLowerCase().includes('takeaway') || line.toLowerCase().includes('dossier')) {
      inTakeaways = true;
      continue;
    }
    if (inTakeaways && (line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line))) {
      const clean = line.replace(/^[-*•\d.]+\s*/, '').trim();
      if (clean.length > 15 && clean.length < 130) {
        takeaways.push(clean);
      }
      if (takeaways.length >= 3) break;
    } else if (inTakeaways && line.startsWith('#')) {
      break;
    }
  }

  // Fallback telemetry points if none parsed from markdown
  if (takeaways.length < 3) {
    takeaways = [
      'Unscheduled video liveness check: Enforce a spontaneous 30s interaction to bust 2D deepfake pipelines.',
      'Linguistic token cadence: Watch for unnatural LLM repetition, rapid empathy mirroring, and immediate off-platform pressure.',
      'EXIF & cross-engine reverse lookup: Search peripheral geometry and visual index footprints before emotional investment.'
    ];
  }

  // Assemble Long-form Premium Post
  let tweet = `🛡️ FLIRTCHECK FORENSIC DESK // CASE ${caseId}
Category: ${cat} | Threat Level: ${risk}
Investigator: Arthur Vance (Cheltenham Bureau)

Investigation: ${title}

${desc}

🔍 CORE TELEMETRY & VERIFICATION PROTOCOLS:
1. ${takeaways[0]}
2. ${takeaways[1]}
3. ${takeaways[2]}

📑 Access the complete declassified dossier & verification tools:
${url}

#DatingSafety #CyberSecurity #OSINT #RomanceScams #FlirtCheck #VerificationLab`;

  // Resolve cover image path
  let imageRelPath = `blog/public/images/posts/${slug}.webp`;
  const imageAbsPath = path.resolve(imageRelPath);
  if (!fs.existsSync(imageAbsPath)) {
    imageRelPath = 'blog/public/images/posts/default-cover.webp';
  }

  return {
    slug,
    url,
    title,
    tweet,
    imageRelPath,
    hook: `🛡️ FLIRTCHECK CASE ${caseId}: ${title.slice(0, 70)}`
  };
}

const insertStmt = db.prepare(`
  INSERT INTO content_queue_v2 (
    id, campaign_id, network, target_platform, platform, subreddit,
    target_url, published_url, payload, hook, body, stealth_cta,
    tracking_url, image_path, risk_score, status, created_at, updated_at
  ) VALUES (
    ?, ?, 'organic', 'SOCIAL_SNIPPET', 'TWITTER', 'dating_safety',
    ?, NULL, ?, ?, ?, 'Read Full Dossier',
    ?, ?, 1, 'APPROVED', ?, ?
  )
`);

let addedCount = 0;
const now = Date.now();

for (let i = 0; i < files.length; i++) {
  const file = files[i];
  const raw = fs.readFileSync(path.join(postsDir, file), 'utf8');
  const post = matter(raw);
  const crafted = craftPremiumTweet(file, post);

  if (dispatchedUrls.has(crafted.url)) {
    continue;
  }

  const itemId = `snip_tw_prem_${now + i}_${Math.random().toString(36).substring(2, 6)}`;
  const payload = JSON.stringify({
    slug: crafted.slug,
    title: crafted.title,
    url: crafted.url,
    imagePath: crafted.imageRelPath,
    platform: 'Twitter_Premium_Longform',
    format: 'LONG_DOSSIER'
  });

  insertStmt.run(
    itemId,
    `twitter_premium_${crafted.slug}`,
    crafted.url,
    payload,
    crafted.hook,
    crafted.tweet,
    crafted.url,
    crafted.imageRelPath,
    now + i * 1000,
    now + i * 1000
  );
  addedCount++;
}

console.log(`✅ Successfully loaded ${addedCount} Premium Long-Form Dossiers into Twitter queue!`);

const finalStats = db.prepare("SELECT platform, status, count(*) as count FROM content_queue_v2 WHERE platform = 'TWITTER' GROUP BY status").all();
console.log('Updated Twitter Queue State:', finalStats);
