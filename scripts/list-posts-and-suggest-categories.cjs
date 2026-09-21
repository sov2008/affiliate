const fs = require('fs');
const path = require('path');

const postsDir = path.resolve(__dirname, '../blog/src/content/posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

console.log(`Analyzing ${files.length} posts for category classification:\n`);

function classifyPost(slug, title, content) {
  const text = (slug + ' ' + title + ' ' + content).toLowerCase();

  // 1. Algo Mechanics
  if (
    /elo|algorithm|shadowban|ranking|glitch|filter.*bot|token|spectrogram|reverse.*image.*search|anchor.*rule|pixel/i.test(slug) ||
    /algorithm|elo ranking|shadowban|photo order|punctuation.*spambots/i.test(title)
  ) {
    if (/tinder-elo|optimal-photo|slot-machine|dead-giveaways|dating-profile-image-reverse|reverse-image-search|tinder-verification-checkmark/i.test(slug)) {
      return 'algo-mechanics';
    }
  }

  // 2. Safety Dossier & Scams
  if (
    /crypto|scam|fraud|pig-butchering|whatsapp.*move|stolen.*photo|deepfake|catfish|military|voice-phishing/i.test(slug) ||
    /crypto|pig butchering|scam|stolen|imposter|phishing/i.test(title)
  ) {
    return 'safety-dossier';
  }

  // 3. Digital Dialogue
  if (
    /opening-line|what-to-say|voice-prompts|texting|icebreaker|banter|dry-chat|conversation|disappears-and-comes-back/i.test(slug) ||
    /opening lines|what to say|voice prompts|text|reply rate/i.test(title)
  ) {
    return 'digital-dialogue';
  }

  // 4. Offline First Dates
  if (
    /first-date|compatibility-test|politely-decline|meet-in-person/i.test(slug) ||
    /first date|compatibility test|politely decline/i.test(title)
  ) {
    return 'first-dates';
  }

  // 5. Modern Psychology
  if (
    /narcissist|burnout|matches-but-no-dates|red-flags|time-wasters|group-photos|dating-app-burnout/i.test(slug) ||
    /narcissist|burnout|matches but no dates|time wasters|red flags/i.test(title)
  ) {
    return 'modern-psychology';
  }

  // 6. Romantic Essays
  if (
    /safety-smokescreen|analog|essay|unscripted-reality|manifesto/i.test(slug) ||
    /smokescreen|unscripted|corporations profit/i.test(title)
  ) {
    return 'romantic-essays';
  }

  return 'safety-dossier'; // Default fallback
}

const distribution = {};
files.forEach((f, idx) => {
  const raw = fs.readFileSync(path.join(postsDir, f), 'utf-8');
  const titleMatch = raw.match(/title:\s*["']?([^"'\n\r]+)["']?/);
  const title = titleMatch ? titleMatch[1] : f;
  const suggestedCat = classifyPost(f, title, raw);
  distribution[suggestedCat] = (distribution[suggestedCat] || 0) + 1;
  console.log(`${(idx + 1).toString().padStart(2)}. [${suggestedCat.padEnd(18)}] ${title.slice(0, 60)}`);
});

console.log('\nSuggested Category Distribution:', distribution);
