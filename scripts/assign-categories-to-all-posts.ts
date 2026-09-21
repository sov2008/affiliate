import fs from 'fs';
import path from 'path';

const postsDir = path.resolve(process.cwd(), 'blog/src/content/posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

// Explicit category assignments for the 39 articles
const CATEGORY_MAP: Record<string, string> = {
  // 1. Algorithmic Mechanics
  'tinder-elo-algorithm-2026-ranking-reset-the-truth-the-myths-and-t.md': 'algo-mechanics',
  'optimal-photo-order-dating-apps-the-psychological-anchor-rule.md': 'algo-mechanics',
  'the-slot-machine-algorithm-how-dating-apps-engineer-loneliness.md': 'algo-mechanics',
  'dead-giveaways-in-bio-punctuation-llm-spambots-dating.md': 'algo-mechanics',
  'dating-profile-image-reverse-search-spot-fake-matches-in-seconds-.md': 'algo-mechanics',
  'reverse-image-search-wont-save-you-ai-catfishers-google-lens-2026.md': 'algo-mechanics',

  // 2. Digital Dialogue
  'hinge-opening-lines-that-get-85-reply-rates-data-backed-strategie.md': 'digital-dialogue',
  'what-to-say-when-a-match-disappears-and-comes-back-the-exact-scri.md': 'digital-dialogue',
  'voice-prompts-on-hinge-what-vocal-tone-triggers-attraction-or-rep.md': 'digital-dialogue',
  'the-voice-note-verification-trick-spotting-audio-deepfakes-in-onl.md': 'digital-dialogue',
  'voice-phishing-on-tinder-audio-notes-trap.md': 'digital-dialogue',

  // 3. Modern Psychology
  '2026-guide-spotting-narcissist-red-flags-in-online-dating-bios-ph.md': 'modern-psychology',
  'the-dating-app-burnout-why-singles-are-fleeing-to-unscripted-reality.md': 'modern-psychology',
  'why-you-get-matches-but-no-dates-cracking-the-2026-matchesbutnoda.md': 'modern-psychology',
  'bumble-bio-filter-time-wasters-the-2026-playbook-for-attracting-i.md': 'modern-psychology',
  '2026-guide-dating-profile-bio-red-flags-guys-overlook-spot-the-si.md': 'modern-psychology',
  'mastering-group-photos-on-dating-apps-rules-boost-your-profile-wi.md': 'modern-psychology',

  // 4. Offline First Dates
  '3question-compatibility-test-to-ask-before-the-first-date.md': 'first-dates',
  'how-to-politely-decline-a-date-request-without-burning-the-bridge.md': 'first-dates',
  'how-to-stay-safe-spot-scams-and-optimize-your-dating-profile-in-2.md': 'first-dates',

  // 5. Romantic Essays
  'the-safety-smokescreen-why-dating-corporations-profit-from-scams.md': 'romantic-essays',
  'the-2026-ultimate-dating-safety-playbook-verify-optimize-thrive-o.md': 'romantic-essays',
  '2026-dating-safety-playbook-verify-optimize-and-protect-your-onli.md': 'romantic-essays',

  // 6. Safety Dossier & Scams
  'pig-butchering-scam-dating-apps-2026s-ultimate-survival-guide.md': 'safety-dossier',
  'the-48-hour-whatsapp-move-crypto-dating-funnel-anatomy.md': 'safety-dossier',
  'dating-scam-verification-guide-2026.md': 'safety-dossier',
  'ai-catfishing-on-hinge-how-to-spot-deepfake-photos-protect-your-h.md': 'safety-dossier',
  '7-crypto-romance-scam-red-flags-that-steal-millions-from-singles-.md': 'safety-dossier',
  'detect-stolen-instagram-photos-on-dating-profiles-your-2026-playb.md': 'safety-dossier',
  'how-to-avoid-catfishing-the-2026-online-dating-safety-guide-every.md': 'safety-dossier',
  'how-to-verify-if-a-tinder-match-is-a-bot-2026-detection-blueprint.md': 'safety-dossier',
  'military-romance-scam-signs-2026-guide-to-spotting-an-imposter-be.md': 'safety-dossier',
  'stolen-photos-fake-dating-profile-how-to-fight-back-in-2026.md': 'safety-dossier',
  'tinder-verification-checkmark-human-bot-farms.md': 'safety-dossier',
  '2026-ultimate-dating-safety-playbook-verify-optimize-outsmart-sca.md': 'safety-dossier',
  '2026-ultimate-online-dating-safety-guide-verify-optimize-date-con.md': 'safety-dossier',
  '2026-dating-safety-blueprint-verify-optimize-protect-your-online-.md': 'safety-dossier',
  '2026-dating-safety-guide-optimize-your-profile-spot-scams-build-r.md': 'safety-dossier',
  'dating-safety-2026-verify-optimize-protect-thrive-your-ultimate-g.md': 'safety-dossier'
};

console.log(`Assigning categories to ${files.length} posts...\n`);

const counts: Record<string, number> = {};

for (const file of files) {
  const category = CATEGORY_MAP[file] || 'safety-dossier';
  counts[category] = (counts[category] || 0) + 1;

  const filePath = path.join(postsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // If category is already in frontmatter, replace it, otherwise insert it
  if (/^category:\s*.*$/m.test(content)) {
    content = content.replace(/^category:\s*.*$/m, `category: "${category}"`);
  } else {
    content = content.replace(/^pubDate:\s*(.*)$/m, `pubDate: $1\ncategory: "${category}"`);
  }

  // Ensure caseId exists
  if (!/^caseId:\s*.*$/m.test(content)) {
    const casePrefix = category === 'algo-mechanics' ? 'ALG'
      : category === 'digital-dialogue' ? 'TXT'
      : category === 'modern-psychology' ? 'PSY'
      : category === 'first-dates' ? 'DAT'
      : category === 'romantic-essays' ? 'ESS'
      : 'DOS';
    const num = Math.abs(file.split('').reduce((acc, c) => (acc << 5) - acc + c.charCodeAt(0), 0)) % 900 + 100;
    const caseId = `FC-${num}-${casePrefix}`;
    content = content.replace(/^category:\s*(.*)$/m, `category: $1\ncaseId: "${caseId}"\nclassification: "PUBLIC INVESTIGATION DOSSIER // DECLASSIFIED 2026"`);
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ [${category.padEnd(18)}] ${file}`);
}

console.log('\n=============================================');
console.log('Final Category Distribution Across All 39 Posts:');
console.log(counts);
console.log('=============================================\n');
