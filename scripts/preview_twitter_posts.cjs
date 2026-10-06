const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const postsDir = path.resolve('blog/src/content/posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

function calculateTwitterLength(text, url) {
  // In Twitter, URLs count as 23 characters regardless of length
  const withoutUrl = text.replace(url, '');
  return withoutUrl.length + 23;
}

function craftTweet(file, post) {
  const slug = file.replace(/\.md$/, '');
  const url = `https://flirtcheck.site/blog/${slug}/`;
  const title = post.data.title || '';
  const desc = post.data.description || '';
  const cat = post.data.category || 'safety-dossier';

  let hook = '';
  let insight = '';
  let tags = '#DatingSafety #OnlineDating';

  // Category & topic based tailoring
  if (slug.includes('sextortion') || title.toLowerCase().includes('sextortion')) {
    hook = 'Sextortion syndicates operate on rapid panic escalation.';
    insight = 'Never negotiate, freeze cloud backups, and document headers immediately.';
    tags = '#CyberSecurity #DatingSafety';
  } else if (slug.includes('pig-butchering') || title.toLowerCase().includes('crypto') || title.toLowerCase().includes('investment')) {
    hook = 'Romance-bait crypto fraud is now a $3.5B industry.';
    insight = 'Any match pushing external investment apps within 72h is an active syndicate.';
    tags = '#CryptoScam #RomanceScam';
  } else if (slug.includes('bot') || title.toLowerCase().includes('bot') || slug.includes('tinder')) {
    hook = 'Over 30% of swipe profiles exhibit automated bot telemetry.';
    insight = 'Test unprompted localized questions to break LLM token loops.';
    tags = '#BotDetection #OSINT';
  } else if (slug.includes('reverse-image') || title.toLowerCase().includes('reverse') || title.toLowerCase().includes('photo')) {
    hook = 'Stock photos & AI deepfakes flood dating apps in 2026.';
    insight = 'Cross-engine facial indexing reveals hijacked identities in under 60 seconds.';
    tags = '#OSINT #IdentityTheft';
  } else if (slug.includes('military') || title.toLowerCase().includes('military')) {
    hook = 'Stolen military identities remain the #1 romance fraud vector.';
    insight = 'Verify official APO/FPO communication protocols before emotional commitment.';
    tags = '#ScamAlert #DatingSafety';
  } else if (slug.includes('voice') || title.toLowerCase().includes('voice') || title.toLowerCase().includes('deepfake')) {
    hook = 'AI audio cloning can mimic vocal timbre from a 3-second sample.';
    insight = 'Enforce spontaneous unscheduled video calls to verify facial liveness.';
    tags = '#Deepfakes #CyberSecurity';
  } else if (slug.includes('attachment') || slug.includes('psychology') || cat === 'modern-psychology') {
    hook = 'The anxious-avoidant trap on dating apps is an engineered feedback loop.';
    insight = 'Algorithmic variable rewards amplify emotional hyper-fixation.';
    tags = '#Psychology #DatingAdvice';
  } else {
    // Dynamic distillation from title and description
    let cleanTitle = title.replace(/\s*\(2026.*?\)/gi, '').replace(/^#\s*/, '').trim();
    if (cleanTitle.length > 70) cleanTitle = cleanTitle.slice(0, 67) + '...';
    hook = `Investigation: ${cleanTitle}.`;
    
    // Extract first crisp sentence from description
    const firstDescSentence = desc.split(/[.?!]/)[0].trim();
    if (firstDescSentence && firstDescSentence.length > 20 && firstDescSentence.length < 90) {
      insight = firstDescSentence + '.';
    } else {
      insight = 'Essential forensic verification rules from the Cheltenham Desk.';
    }
  }

  // Assemble tweet
  let tweet = `${hook}\n\n${insight}\n\nFull analysis: ${url}\n${tags}`;
  
  // Ensure strict <= 275 Twitter length limit
  if (calculateTwitterLength(tweet, url) > 275) {
    tweet = `${hook}\n\nRead dossier: ${url}\n${tags}`;
  }

  return {
    slug,
    url,
    tweet,
    twLength: calculateTwitterLength(tweet, url)
  };
}

console.log('--- Sample Generated Tweets (5) ---');
for (let i = 0; i < 5; i++) {
  const raw = fs.readFileSync(path.join(postsDir, files[i]), 'utf8');
  const post = matter(raw);
  const result = craftTweet(files[i], post);
  console.log(`[#${i+1}] Slug: ${result.slug}`);
  console.log(`Length: ${result.twLength} / 280 chars`);
  console.log(result.tweet);
  console.log('-'.repeat(60));
}
