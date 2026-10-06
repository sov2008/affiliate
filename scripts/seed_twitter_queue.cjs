const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const dbPath = path.resolve('core/data/content_queue.sqlite');
const postsDir = path.resolve('blog/src/content/posts');

console.log('--- Seeding Twitter Content Queue ---');
console.log('Database:', dbPath);

const db = new DatabaseSync(dbPath);

const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
console.log(`Discovered ${files.length} blog articles to format for Twitter.`);

// Check existing dispatched tweets to avoid re-queuing duplicate slugs
const dispatched = db.prepare("SELECT target_url FROM content_queue_v2 WHERE platform = 'TWITTER' AND status = 'DISPATCHED'").all();
const dispatchedUrls = new Set(dispatched.map(d => d.target_url));
console.log(`Already dispatched tweets: ${dispatchedUrls.size}`);

// Remove stale unapproved/pending tweets to replace with high-quality formatted tweets
const deleted = db.prepare("DELETE FROM content_queue_v2 WHERE platform = 'TWITTER' AND status IN ('PENDING_APPROVAL', 'APPROVED')").run();
console.log(`Cleared ${deleted.changes} old generic Twitter queue items.`);

function calculateTwitterLength(text, url) {
  const withoutUrl = text.replace(url, '');
  return withoutUrl.length + 23;
}

function craftTweet(file, post) {
  const slug = file.replace(/\.md$/, '');
  const url = `https://flirtcheck.site/blog/${slug}/`;
  const title = (post.data.title || '').trim();
  const desc = (post.data.description || '').trim();
  const cat = post.data.category || 'safety-dossier';

  let hook = '';
  let insight = '';
  let tags = '#DatingSafety #OnlineDating';

  const tLower = title.toLowerCase();
  const sLower = slug.toLowerCase();

  if (sLower.includes('sextortion') || tLower.includes('sextortion') || tLower.includes('blackmail')) {
    hook = '🚨 Sextortion syndicates operate on rapid panic escalation.';
    insight = 'Never negotiate, freeze cloud backups, and document headers immediately.';
    tags = '#CyberSecurity #DatingSafety #ScamAlert';
  } else if (sLower.includes('pig-butchering') || tLower.includes('crypto') || tLower.includes('investment')) {
    hook = '💰 Romance-bait crypto fraud is now a multi-billion dollar syndicate.';
    insight = 'Any match pushing external investment apps or trade platforms is hostile.';
    tags = '#CryptoScam #RomanceScam #OSINT';
  } else if (sLower.includes('bot') || tLower.includes('bot') || sLower.includes('tinder-bot')) {
    hook = '🤖 Over 30% of active dating profiles show automated bot patterns.';
    insight = 'Test localized, unprompted neighborhood queries to break LLM token loops.';
    tags = '#BotDetection #OSINT #DatingApps';
  } else if (sLower.includes('reverse-image') || tLower.includes('reverse') || tLower.includes('photo')) {
    hook = '🔍 Stock photos and synthetic AI deepfakes flood dating apps in 2026.';
    insight = 'Cross-engine visual indexing reveals hijacked identities in under 60s.';
    tags = '#OSINT #IdentityTheft #Verification';
  } else if (sLower.includes('military') || tLower.includes('military') || tLower.includes('valor')) {
    hook = '🎖️ Stolen military profiles remain a top vector for cross-border fraud.';
    insight = 'Always verify official military communication protocols before trust.';
    tags = '#MilitaryScam #DatingSafety';
  } else if (sLower.includes('voice') || tLower.includes('audio') || tLower.includes('deepfake')) {
    hook = '🎙️ AI audio cloning can mimic vocal timbre from a 3-second sample.';
    insight = 'Enforce spontaneous unscheduled video calls to verify facial liveness.';
    tags = '#Deepfakes #CyberSecurity #TechTrends';
  } else if (sLower.includes('sugar-daddy') || tLower.includes('sugar') || tLower.includes('allowance')) {
    hook = '💳 Fake allowance & check-cashing schemes target vulnerable daters.';
    insight = 'Any advance fee or mobile deposit request is immediate fraud.';
    tags = '#ScamAlert #FinancialSafety';
  } else if (sLower.includes('attachment') || sLower.includes('psychology') || cat === 'modern-psychology') {
    hook = '🧠 The anxious-avoidant trap on dating apps is an engineered feedback loop.';
    insight = 'Algorithmic variable rewards amplify emotional hyper-fixation.';
    tags = '#Psychology #DatingAdvice #MentalHealth';
  } else {
    let cleanTitle = title.replace(/\s*\(2026.*?\)/gi, '').replace(/^#\s*/, '').trim();
    if (cleanTitle.length > 70) cleanTitle = cleanTitle.slice(0, 67) + '...';
    hook = `🛡️ Forensic Dossier: ${cleanTitle}.`;

    const firstSentence = desc.split(/[.?!]/)[0].trim();
    if (firstSentence && firstSentence.length > 20 && firstSentence.length < 85) {
      insight = firstSentence + '.';
    } else {
      insight = 'Essential verification protocols from the Cheltenham Desk.';
    }
  }

  let tweet = `${hook}\n\n${insight}\n\nFull dossier: ${url}\n${tags}`;
  if (calculateTwitterLength(tweet, url) > 275) {
    tweet = `${hook}\n\nRead report: ${url}\n${tags}`;
  }

  return {
    slug,
    url,
    title,
    tweet,
    hook: hook.slice(0, 100),
    twLength: calculateTwitterLength(tweet, url)
  };
}

const insertStmt = db.prepare(`
  INSERT INTO content_queue_v2 (
    id, campaign_id, network, target_platform, platform, subreddit,
    target_url, published_url, payload, hook, body, stealth_cta,
    tracking_url, image_path, risk_score, status, created_at, updated_at
  ) VALUES (
    ?, ?, 'organic', 'SOCIAL_SNIPPET', 'TWITTER', 'dating_safety',
    ?, NULL, ?, ?, ?, 'Read Thread',
    ?, ?, 1, 'APPROVED', ?, ?
  )
`);

let addedCount = 0;
const now = Date.now();

for (let i = 0; i < files.length; i++) {
  const file = files[i];
  const raw = fs.readFileSync(path.join(postsDir, file), 'utf8');
  const post = matter(raw);
  const crafted = craftTweet(file, post);

  if (dispatchedUrls.has(crafted.url)) {
    console.log(`Skipping already dispatched: ${crafted.slug}`);
    continue;
  }

  // Resolve cover image path
  let imageRelPath = `blog/public/images/posts/${crafted.slug}.webp`;
  const imageAbsPath = path.resolve(imageRelPath);
  if (!fs.existsSync(imageAbsPath)) {
    imageRelPath = 'blog/public/images/posts/default-cover.webp';
  }

  const itemId = `snip_tw_${now + i}_${Math.random().toString(36).substring(2, 6)}`;
  const payload = JSON.stringify({
    slug: crafted.slug,
    title: crafted.title,
    url: crafted.url,
    imagePath: imageRelPath,
    platform: 'Twitter',
    tweetLength: crafted.twLength
  });

  insertStmt.run(
    itemId,
    `twitter_syndication_${crafted.slug}`,
    crafted.url,
    payload,
    crafted.hook,
    crafted.tweet,
    crafted.url,
    imageRelPath,
    now + i * 1000,
    now + i * 1000
  );
  addedCount++;
}

console.log(`✅ Successfully queued ${addedCount} high-quality Twitter posts (Status: APPROVED)!`);

const finalStats = db.prepare("SELECT platform, status, count(*) as count FROM content_queue_v2 WHERE platform = 'TWITTER' GROUP BY status").all();
console.log('Final Twitter Queue State:', finalStats);
