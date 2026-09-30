/**
 * EDITORIAL TAXONOMY & TOPIC MATRIX (2026 EDITION)
 * Centralized organic keyword & topic intelligence for FlirtCheck.site
 * 
 * Maps directly to the 6 Core Editorial Categories:
 * 1. algo-mechanics      - ELO black-boxes, shadowbans, facial tiering, diffusion feeds
 * 2. safety-dossier      - Pig butchering, romance scams, OSINT, audio deepfakes, extortion
 * 3. digital-dialogue    - High-conversion openers, text pacing, revival scripts, tone
 * 4. modern-psychology   - Burnout, narcissist bios, attachment styles, multi-dating
 * 5. first-dates         - Screening, safety checklist, venue choice, body language, etiquette
 * 6. romantic-essays     - Analog intimacy, imperfect vulnerability, anti-corporate critiques
 */

export type TaxonomyCategory = 
  | 'algo-mechanics'
  | 'safety-dossier'
  | 'digital-dialogue'
  | 'modern-psychology'
  | 'first-dates'
  | 'romantic-essays';

export interface EditorialTopicDefinition {
  id: string;
  topic: string;
  slug: string;
  keyword: string;
  category: TaxonomyCategory;
  searchVolumeTier: 'TIER_1_MASS' | 'TIER_2_CORE' | 'TIER_3_NICHE';
  intent: 'scam_verification' | 'algorithm_optimization' | 'chat_mastery' | 'psychological_insight' | 'first_date_prep' | 'philosophical_essay';
  seoKeywords: string[];
  tags: string[];
  motto: string;
  caseIdPrefix: 'ALG' | 'DOS' | 'TXT' | 'PSY' | 'DAT' | 'ESS';
  telemetryRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export const EDITORIAL_TAXONOMY_POOL: EditorialTopicDefinition[] = [
  // =========================================================================
  // 1. ALGORITHMIC MECHANICS (algo-mechanics)
  // =========================================================================
  {
    id: 'algo_001',
    topic: 'Tinder ELO Algorithm 2026: The Truth, The Myths, and The Reset Protocol',
    slug: 'tinder-elo-algorithm-2026-ranking-reset-the-truth-the-myths-and-t',
    keyword: 'tinder elo algorithm reset 2026',
    category: 'algo-mechanics',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'algorithm_optimization',
    seoKeywords: ['tinder algorithm hack', 'reset tinder elo', 'tinder secret rating score', 'how tinder ranks profiles'],
    tags: ['Tinder', 'ELO Rating', 'Algorithms', 'Reverse Engineering'],
    motto: 'Love is... beating the black-box algorithm by staying genuinely human.',
    caseIdPrefix: 'ALG',
    telemetryRisk: 'MEDIUM'
  },
  {
    id: 'algo_002',
    topic: 'Optimal Photo Order Dating Apps: The Psychological Anchor Rule',
    slug: 'optimal-photo-order-dating-apps-the-psychological-anchor-rule',
    keyword: 'dating app photo order psychological anchor',
    category: 'algo-mechanics',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'algorithm_optimization',
    seoKeywords: ['best photo order tinder', 'hinge photo order rules', 'dating profile picture order', 'smart photos algorithm test'],
    tags: ['Profile Photos', 'Visual Optimization', 'Tinder Algorithms', 'Bumble Tips'],
    motto: 'Love is... letting genuine light hit the lens before curating the perfect angle.',
    caseIdPrefix: 'ALG',
    telemetryRisk: 'LOW'
  },
  {
    id: 'algo_003',
    topic: 'The Slot Machine Algorithm: How Dating Apps Engineer Artificial Scarcity',
    slug: 'the-slot-machine-algorithm-how-dating-apps-engineer-loneliness',
    keyword: 'how dating apps engineer artificial scarcity',
    category: 'algo-mechanics',
    searchVolumeTier: 'TIER_2_CORE',
    intent: 'algorithm_optimization',
    seoKeywords: ['dating app addiction psychology', 'variable reward dating apps', 'why dating apps hold back matches', 'gamified romance algorithms'],
    tags: ['Algorithms', 'Gamification', 'Match Group', 'Digital Ethics'],
    motto: 'Love is... stepping away from the casino floor before your humanity is tokenized.',
    caseIdPrefix: 'ALG',
    telemetryRisk: 'HIGH'
  },
  {
    id: 'algo_004',
    topic: 'Dead Giveaways in Bio Punctuation: How LLM Spambots Write Dating Profiles',
    slug: 'dead-giveaways-in-bio-punctuation-llm-spambots-dating',
    keyword: 'how llm spambots write dating bios',
    category: 'algo-mechanics',
    searchVolumeTier: 'TIER_2_CORE',
    intent: 'algorithm_optimization',
    seoKeywords: ['ai bot bio detection', 'chatgpt dating bio signs', 'llm punctuation bot giveaway', 'automated dating scripts'],
    tags: ['LLM Bots', 'Bio Analysis', 'Linguistic Forensics', 'Bot Detection'],
    motto: 'Love is... falling for honest typos, not for clinical LLM perfection.',
    caseIdPrefix: 'ALG',
    telemetryRisk: 'CRITICAL'
  },
  {
    id: 'algo_005',
    topic: 'How to Test If Your Tinder Account Is Shadowbanned: 5 Signal Indicators',
    slug: 'how-to-test-if-tinder-account-is-shadowbanned-indicators',
    keyword: 'how to test tinder shadowban 2026',
    category: 'algo-mechanics',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'algorithm_optimization',
    seoKeywords: ['am i shadowbanned on tinder', 'tinder shadowban fix', 'tinder zero matches bug', 'device ban tinder'],
    tags: ['Tinder', 'Shadowban', 'Technical Forensics', 'Account Health'],
    motto: 'Love is... realizing a broken network packet has nothing to do with your real worth.',
    caseIdPrefix: 'ALG',
    telemetryRisk: 'HIGH'
  },
  {
    id: 'algo_006',
    topic: 'Does Bumble Show When You Were Last Active? Telemetry vs Myths',
    slug: 'does-bumble-show-when-you-were-last-active-telemetry',
    keyword: 'does bumble show when last active',
    category: 'algo-mechanics',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'algorithm_optimization',
    seoKeywords: ['bumble activity status', 'can you see if someone is online on bumble', 'bumble snooze mode tracking', 'bumble distance change while inactive'],
    tags: ['Bumble', 'Activity Tracking', 'Privacy', 'Telemetry'],
    motto: 'Love is... trusting someone without checking their background timestamp.',
    caseIdPrefix: 'ALG',
    telemetryRisk: 'LOW'
  },
  {
    id: 'algo_007',
    topic: 'Hinge "Most Compatible" Algorithm: What the Backend Telemetry Actually Measures',
    slug: 'hinge-most-compatible-algorithm-backend-telemetry',
    keyword: 'how hinge most compatible algorithm works',
    category: 'algo-mechanics',
    searchVolumeTier: 'TIER_2_CORE',
    intent: 'algorithm_optimization',
    seoKeywords: ['hinge gale shapley algorithm', 'why hinge most compatible is bad', 'hinge algorithm explained', 'how hinge pairs users'],
    tags: ['Hinge', 'Matchmaking Math', 'Algorithms', 'Gale-Shapley'],
    motto: 'Love is... a spontaneous connection no mathematical theorem can anticipate.',
    caseIdPrefix: 'ALG',
    telemetryRisk: 'MEDIUM'
  },

  // =========================================================================
  // 2. SAFETY DOSSIER & SCAMS (safety-dossier)
  // =========================================================================
  {
    id: 'safe_001',
    topic: 'The 48-Hour WhatsApp Move: Anatomy of a Crypto Dating Funnel',
    slug: 'the-48-hour-whatsapp-move-crypto-dating-funnel-anatomy',
    keyword: 'why dating matches switch to whatsapp crypto scam',
    category: 'safety-dossier',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'scam_verification',
    seoKeywords: ['whatsapp dating scam', 'crypto romance fraud script', 'off-platform dating scam', 'pig butchering whatsapp transition'],
    tags: ['Crypto Scams', 'WhatsApp', 'Fraud Funnels', 'Financial Safety'],
    motto: 'Love is... refusing to leave safe ground just because a stranger flattered your ego.',
    caseIdPrefix: 'DOS',
    telemetryRisk: 'CRITICAL'
  },
  {
    id: 'safe_002',
    topic: 'Pig Butchering Scam Dating Apps: 2026’s Ultimate Survival Guide',
    slug: 'pig-butchering-scam-dating-apps-2026s-ultimate-survival-guide',
    keyword: 'pig butchering scam dating apps 2026',
    category: 'safety-dossier',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'scam_verification',
    seoKeywords: ['sha zhu pan dating', 'crypto investment romance fraud', 'fake trading platform dating scam', 'tinder pig butchering signs'],
    tags: ['Pig Butchering', 'Crypto Fraud', 'Organized Crime', 'Safety Dossier'],
    motto: 'Love is... investing in someone’s presence, never in their private trading liquidity.',
    caseIdPrefix: 'DOS',
    telemetryRisk: 'CRITICAL'
  },
  {
    id: 'safe_003',
    topic: 'Dating Profile Image Reverse Search: Spot Fake Matches in Seconds',
    slug: 'dating-profile-image-reverse-search-spot-fake-matches-in-seconds-',
    keyword: 'dating profile image reverse search',
    category: 'safety-dossier',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'scam_verification',
    seoKeywords: ['catfish photo lookup', 'reverse image search dating profile', 'google lens dating verification', 'fake match image detector'],
    tags: ['Reverse Image Search', 'Catfish', 'OSINT Tools', 'Profile Verification'],
    motto: 'Love is... knowing who is truly behind the lens before giving them your trust.',
    caseIdPrefix: 'DOS',
    telemetryRisk: 'HIGH'
  },
  {
    id: 'safe_004',
    topic: 'Voice Phishing on Tinder: Why Sending Audio Notes Has Become a Trap',
    slug: 'voice-phishing-on-tinder-audio-notes-trap',
    keyword: 'voice note phishing scam tinder',
    category: 'safety-dossier',
    searchVolumeTier: 'TIER_2_CORE',
    intent: 'scam_verification',
    seoKeywords: ['ai voice clone scam dating', 'voice note tinder trap', 'audio deepfake romance fraud', 'spectrogram voice verification'],
    tags: ['Voice Clones', 'Audio Notes', 'Deepfake Audio', 'Acoustic Forensics'],
    motto: 'Love is... hearing the genuine tremor of an honest voice, not an AI synthesis.',
    caseIdPrefix: 'DOS',
    telemetryRisk: 'CRITICAL'
  },
  {
    id: 'safe_005',
    topic: 'Tinder Verification Checkmark: Does It Actually Stop Human-Operated Bot Farms?',
    slug: 'tinder-verification-checkmark-human-bot-farms',
    keyword: 'are tinder blue checkmarks verified',
    category: 'safety-dossier',
    searchVolumeTier: 'TIER_2_CORE',
    intent: 'scam_verification',
    seoKeywords: ['fake tinder verified accounts', 'how bot farms bypass tinder verification', 'blue checkmark tinder scams', 'stolen identity verified tinder'],
    tags: ['Blue Checkmark', 'Account Farms', 'Identity Bypass', 'Platform Flaws'],
    motto: 'Love is... looking past corporate checkmarks to judge character directly.',
    caseIdPrefix: 'DOS',
    telemetryRisk: 'HIGH'
  },
  {
    id: 'safe_006',
    topic: 'What to Do if a Dating Match Blackmails You: The Anti-Sextortion Protocol',
    slug: 'what-to-do-if-dating-match-blackmails-you-anti-sextortion-protocol',
    keyword: 'dating app sextortion what to do 2026',
    category: 'safety-dossier',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'scam_verification',
    seoKeywords: ['tinder blackmailed with photos', 'instagram follower extortion dating', 'do sextortionists actually send photos', 'anti sextortion checklist'],
    tags: ['Sextortion', 'Blackmail', 'Emergency Protocol', 'Privacy Shield'],
    motto: 'Love is... maintaining your dignity when predators weaponize your vulnerability.',
    caseIdPrefix: 'DOS',
    telemetryRisk: 'CRITICAL'
  },

  // =========================================================================
  // 3. DIGITAL DIALOGUE (digital-dialogue)
  // =========================================================================
  {
    id: 'chat_001',
    topic: 'Hinge Opening Lines That Get 85% Reply Rates: Data-Backed Strategies',
    slug: 'hinge-opening-lines-that-get-85-reply-rates-data-backed-strategie',
    keyword: 'hinge opening lines that get replies',
    category: 'digital-dialogue',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'chat_mastery',
    seoKeywords: ['best hinge openers', 'prompt reply formulas', 'funny hinge opening lines', 'hinge conversation starters that work'],
    tags: ['Hinge', 'Openers', 'Conversation Strategy', 'Texting Psychology'],
    motto: 'Love is... opening a dialogue with curious warmth instead of rehearsed scripts.',
    caseIdPrefix: 'TXT',
    telemetryRisk: 'LOW'
  },
  {
    id: 'chat_002',
    topic: 'What to Say When a Match Disappears and Comes Back: The Exact Scripts',
    slug: 'what-to-say-when-a-match-disappears-and-comes-back-the-exact-scri',
    keyword: 'what to say when ghoster returns',
    category: 'digital-dialogue',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'chat_mastery',
    seoKeywords: ['zombieing dating text replies', 'what to text when ghost returns', 'playful reply to ghoster', 'boundary setting texts dating'],
    tags: ['Ghosting', 'Zombieing', 'Text Scripts', 'Boundary Setting'],
    motto: 'Love is... having the self-respect to set terms when vanished ghosts re-emerge.',
    caseIdPrefix: 'TXT',
    telemetryRisk: 'LOW'
  },
  {
    id: 'chat_003',
    topic: 'Voice Prompts on Hinge: What Vocal Tone Triggers Attraction or Repulsion',
    slug: 'voice-prompts-on-hinge-what-vocal-tone-triggers-attraction-or-rep',
    keyword: 'hinge voice prompt tips vocal tone',
    category: 'digital-dialogue',
    searchVolumeTier: 'TIER_2_CORE',
    intent: 'chat_mastery',
    seoKeywords: ['best hinge voice prompts', 'vocal fry hinge voice notes', 'how to record hinge voice prompt', 'audio attraction psychology'],
    tags: ['Hinge', 'Voice Prompts', 'Acoustic Psychology', 'Profile Cues'],
    motto: 'Love is... speaking from the diaphragm with honest, unhurried cadence.',
    caseIdPrefix: 'TXT',
    telemetryRisk: 'LOW'
  },
  {
    id: 'chat_004',
    topic: 'How to Revive a Dead Tinder Conversation: 5 Pattern Interrupt Texts',
    slug: 'how-to-revive-dead-tinder-conversation-pattern-interrupts',
    keyword: 'how to revive dead tinder conversation',
    category: 'digital-dialogue',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'chat_mastery',
    seoKeywords: ['save dry dating chat', 'pattern interrupt dating texting', 're-engage bumble match', 'what to text after dry responses'],
    tags: ['Texting Hacks', 'Conversation Revival', 'Pattern Interrupts', 'Dating Banter'],
    motto: 'Love is... breaking through the numbness of small talk with playful courage.',
    caseIdPrefix: 'TXT',
    telemetryRisk: 'LOW'
  },
  {
    id: 'chat_005',
    topic: 'Signs Your Match Is Using ChatGPT to Text You: 5 Syntactic Tell-Tales',
    slug: 'signs-your-match-is-using-chatgpt-to-text-you',
    keyword: 'signs match is using chatgpt on dating apps',
    category: 'digital-dialogue',
    searchVolumeTier: 'TIER_2_CORE',
    intent: 'chat_mastery',
    seoKeywords: ['ai generated tinder messages', 'how to spot chatgpt dating texts', 'llm conversational markers', 'synthetic texting detection'],
    tags: ['AI Dating', 'ChatGPT Texts', 'Linguistic Analysis', 'Authenticity Check'],
    motto: 'Love is... noticing when a sentence sounds too polished to belong to a living heart.',
    caseIdPrefix: 'TXT',
    telemetryRisk: 'MEDIUM'
  },

  // =========================================================================
  // 4. MODERN PSYCHOLOGY (modern-psychology)
  // =========================================================================
  {
    id: 'psy_001',
    topic: 'Dating App Burnout: Why Singles Are Fleeing to Unscripted Reality',
    slug: 'the-dating-app-burnout-why-singles-are-fleeing-to-unscripted-reality',
    keyword: 'dating app burnout symptoms why singles quit',
    category: 'modern-psychology',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'psychological_insight',
    seoKeywords: ['dating app fatigue 2026', 'quitting tinder mental health', 'swiping exhaustion cure', 'meeting people in real life offline'],
    tags: ['Dating Burnout', 'Mental Health', 'Offline Dating', 'App Exhaustion'],
    motto: 'Love is... choosing real-world vulnerability over sterile algorithmic validation.',
    caseIdPrefix: 'PSY',
    telemetryRisk: 'LOW'
  },
  {
    id: 'psy_002',
    topic: 'Spotting Narcissist Red Flags in Online Dating Bios and Photos',
    slug: '2026-guide-spotting-narcissist-red-flags-in-online-dating-bios-ph',
    keyword: 'spotting narcissist red flags dating bios',
    category: 'modern-psychology',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'psychological_insight',
    seoKeywords: ['narcissist profile cues', 'covert narcissist tinder prompts', 'dating bio red flags', 'manipulative dating profiles'],
    tags: ['Narcissism', 'Red Flags', 'Psychological Profiling', 'Safety'],
    motto: 'Love is... spotting the grand illusion before your emotional boundaries collapse.',
    caseIdPrefix: 'PSY',
    telemetryRisk: 'MEDIUM'
  },
  {
    id: 'psy_003',
    topic: 'Why You Get Matches But No Dates: Cracking the Modern Matches-to-Date Bottleneck',
    slug: 'why-you-get-matches-but-no-dates-cracking-the-2026-matchesbutnoda',
    keyword: 'why get matches but no dates online dating',
    category: 'modern-psychology',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'psychological_insight',
    seoKeywords: ['getting matches but no dates fix', 'matches stop replying on tinder', 'dating app bottleneck', 'conversion from match to date'],
    tags: ['Dating Bottlenecks', 'Psychology', 'Conversion', 'Banter to Dates'],
    motto: 'Love is... turning digital curiosity into physical courage across the table.',
    caseIdPrefix: 'PSY',
    telemetryRisk: 'LOW'
  },
  {
    id: 'psy_004',
    topic: 'The Anxious-Avoidant Trap on Dating Apps: Why You Match With Your Worst Match',
    slug: 'the-anxious-avoidant-trap-on-dating-apps-attachment-styles',
    keyword: 'anxious avoidant trap dating apps attachment',
    category: 'modern-psychology',
    searchVolumeTier: 'TIER_2_CORE',
    intent: 'psychological_insight',
    seoKeywords: ['attachment styles dating apps', 'why avoidants thrive on tinder', 'anxious attachment dating advice', 'breaking toxic dating loops'],
    tags: ['Attachment Theory', 'Anxious Avoidant', 'Emotional Safety', 'Psychology'],
    motto: 'Love is... choosing peaceful consistency over the intoxicating chaos of avoidant chase.',
    caseIdPrefix: 'PSY',
    telemetryRisk: 'MEDIUM'
  },
  {
    id: 'psy_005',
    topic: 'Breadcrumbing vs Benching: How Emotionally Unavailable Matches Keep You on Standby',
    slug: 'breadcrumbing-vs-benching-emotionally-unavailable-matches',
    keyword: 'breadcrumbing vs benching dating apps meaning',
    category: 'modern-psychology',
    searchVolumeTier: 'TIER_2_CORE',
    intent: 'psychological_insight',
    seoKeywords: ['breadcrumbing signs text', 'benching in modern dating', 'how to spot low effort matches', 'walking away from breadcrumbs'],
    tags: ['Breadcrumbing', 'Benching', 'Low Effort Men', 'Self Worth'],
    motto: 'Love is... demanding a full meal and refusing to survive on scattered digital crumbs.',
    caseIdPrefix: 'PSY',
    telemetryRisk: 'LOW'
  },

  // =========================================================================
  // 5. OFFLINE FIRST DATES (first-dates)
  // =========================================================================
  {
    id: 'date_001',
    topic: 'The 3-Question Compatibility Test to Ask Before the First Date',
    slug: '3question-compatibility-test-to-ask-before-the-first-date',
    keyword: 'compatibility questions before first date',
    category: 'first-dates',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'first_date_prep',
    seoKeywords: ['screening dates before meeting', 'what to ask before meeting online date', 'first date compatibility check', 'pre-date screening questions'],
    tags: ['First Dates', 'Screening', 'Compatibility', 'Date Preparation'],
    motto: 'Love is... discovering alignment through three honest questions before spending three hours.',
    caseIdPrefix: 'DAT',
    telemetryRisk: 'LOW'
  },
  {
    id: 'date_002',
    topic: 'How to Politely Decline a Date Request Without Burning Bridges',
    slug: 'how-to-politely-decline-a-date-request-without-burning-the-bridge',
    keyword: 'how to politely decline date request text',
    category: 'first-dates',
    searchVolumeTier: 'TIER_2_CORE',
    intent: 'first_date_prep',
    seoKeywords: ['how to turn down a date politely', 'rejecting date over text gracefully', 'declining second date without ghosting', 'polite rejection scripts'],
    tags: ['Etiquette', 'Boundary Setting', 'Rejection Scripts', 'Polite Communication'],
    motto: 'Love is... delivering truth with grace, leaving human dignity intact on both ends.',
    caseIdPrefix: 'DAT',
    telemetryRisk: 'LOW'
  },
  {
    id: 'date_003',
    topic: 'First Date Safety Checklist: 5 Non-Negotiable Rules Before Meeting Strangers',
    slug: 'first-date-safety-checklist-5-non-negotiable-rules',
    keyword: 'first date safety checklist meet online stranger',
    category: 'first-dates',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'first_date_prep',
    seoKeywords: ['meeting online match in person safely', 'first date red flags in person', 'share location first date protocol', 'dating safety protocol'],
    tags: ['First Date Safety', 'Checklists', 'Physical Security', 'Location Protocols'],
    motto: 'Love is... verifying situational safety so that your heart can freely explore genuine chemistry.',
    caseIdPrefix: 'DAT',
    telemetryRisk: 'HIGH'
  },
  {
    id: 'date_004',
    topic: 'Low-Pressure First Date Ideas in 2026: Why Formal Dinners Are Statistically Flawed',
    slug: 'low-pressure-first-date-ideas-why-dinners-are-flawed',
    keyword: 'low pressure first date ideas 2026',
    category: 'first-dates',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'first_date_prep',
    seoKeywords: ['best casual first dates', 'why coffee date is best', 'walk and talk first date', 'interactive first date ideas'],
    tags: ['First Date Ideas', 'Low Pressure', 'Date Venues', 'Modern Dating'],
    motto: 'Love is... finding a relaxed public corner where silences don’t feel awkward.',
    caseIdPrefix: 'DAT',
    telemetryRisk: 'LOW'
  },
  {
    id: 'date_005',
    topic: 'First Date Body Language Telemetry: Micro-Expressions That Reveal Genuine Intent',
    slug: 'first-date-body-language-telemetry-micro-expressions-intent',
    keyword: 'first date body language signs of attraction intent',
    category: 'first-dates',
    searchVolumeTier: 'TIER_2_CORE',
    intent: 'first_date_prep',
    seoKeywords: ['how to read body language on first date', 'micro expressions attraction first date', 'signs date is lying in person', 'eye contact chemistry cues'],
    tags: ['Body Language', 'Micro Expressions', 'Behavioral Forensics', 'In-Person Chemistry'],
    motto: 'Love is... observing the unscripted truth in how eyes linger and shoulders relax.',
    caseIdPrefix: 'DAT',
    telemetryRisk: 'LOW'
  },

  // =========================================================================
  // 6. ROMANTIC ESSAYS (romantic-essays)
  // =========================================================================
  {
    id: 'ess_001',
    topic: 'The Safety Smokescreen: Why Commercial Matchmaking Empires Profit From Scams',
    slug: 'the-safety-smokescreen-why-dating-corporations-profit-from-scams',
    keyword: 'why dating app corporations profit from loneliness and fraud',
    category: 'romantic-essays',
    searchVolumeTier: 'TIER_2_CORE',
    intent: 'philosophical_essay',
    seoKeywords: ['match group corporate critique', 'dating app safety theatre', 'why tinder does not ban bots', 'commodification of romance'],
    tags: ['Corporate Critique', 'Matchmaking Empires', 'Essays', 'Arthur Vance Dossier'],
    motto: 'Love is... uncovering the truth behind commercial facades to keep human hope alive.',
    caseIdPrefix: 'ESS',
    telemetryRisk: 'HIGH'
  },
  {
    id: 'ess_002',
    topic: 'In Defense of Honest Typos: Why Imperfect Human Flaws Beat Silicon AI Scripts',
    slug: 'in-defense-of-honest-typos-human-flaws-vs-silicon-scripts',
    keyword: 'authentic human conversation vs ai dating scripts',
    category: 'romantic-essays',
    searchVolumeTier: 'TIER_2_CORE',
    intent: 'philosophical_essay',
    seoKeywords: ['why perfect dating bios fail', 'beauty of human awkwardness in love', 'analog romance modern world', 'anti ai dating manifesto'],
    tags: ['Philosophical Essay', 'Human Vulnerability', 'Arthur Vance', 'Analog Romance'],
    motto: 'Love is... falling for fragile, unedited warmth, never for algorithmic perfection.',
    caseIdPrefix: 'ESS',
    telemetryRisk: 'LOW'
  },
  {
    id: 'ess_003',
    topic: 'The Lost Art of Anticipation: How Instant Swiping Killed Romantic Mystery',
    slug: 'the-lost-art-of-anticipation-how-instant-swiping-killed-mystery',
    keyword: 'how instant swiping destroyed romantic mystery',
    category: 'romantic-essays',
    searchVolumeTier: 'TIER_2_CORE',
    intent: 'philosophical_essay',
    seoKeywords: ['loss of romance in modern dating', 'slow dating movement', 'anticipation in love psychology', 'analog dating revival'],
    tags: ['Slow Dating', 'Romantic Essays', 'Cultural Observation', 'Patience'],
    motto: 'Love is... giving a slow ember time to breathe into an enduring flame.',
    caseIdPrefix: 'ESS',
    telemetryRisk: 'LOW'
  },
  {
    id: 'ess_004',
    topic: 'Stations of a Broken Connection: A Forensic Investigator’s Notebook on Digital Heartbreak',
    slug: 'stations-of-a-broken-connection-investigator-notebook-heartbreak',
    keyword: 'forensic reflection on digital heartbreak online dating',
    category: 'romantic-essays',
    searchVolumeTier: 'TIER_3_NICHE',
    intent: 'philosophical_essay',
    seoKeywords: ['healing from online dating ghosting', 'digital grief after sudden block', 'arthur vance personal memoirs', 'emotional recovery from bot scams'],
    tags: ['Personal Memoirs', 'Digital Heartbreak', 'Cheltenham Desk', 'Healing'],
    motto: 'Love is... picking up your dignity and walking forward with an open, wiser heart.',
    caseIdPrefix: 'ESS',
    telemetryRisk: 'LOW'
  },
  // =========================================================================
  // 7. EXPANDED TAXONOMY POOL (2026 FRESH HIGH-INTENT EXPANSION)
  // =========================================================================
  {
    id: 'algo_006',
    topic: 'Hinge Algorithm Unmasked: How Standouts and Most Compatible Are Calculated',
    slug: 'hinge-algorithm-unmasked-standouts-most-compatible-scoring',
    keyword: 'hinge algorithm most compatible calculation 2026',
    category: 'algo-mechanics',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'algorithm_optimization',
    seoKeywords: ['how hinge calculates compatibility', 'hinge standout algorithm explained', 'hinge backend scoring mechanics', 'reset hinge algorithm score'],
    tags: ['Hinge', 'Algorithms', 'Matchmaking Telemetry', 'Reverse Engineering'],
    motto: 'Love is... understanding the math without reducing your feelings to data.',
    caseIdPrefix: 'ALG',
    telemetryRisk: 'MEDIUM'
  },
  {
    id: 'algo_007',
    topic: 'Bumble Travel Mode Telemetry: How Changing Locations Alters Your Recommendation Queue',
    slug: 'bumble-travel-mode-telemetry-how-location-shifts-alter-queue',
    keyword: 'bumble travel mode algorithm recommendation queue',
    category: 'algo-mechanics',
    searchVolumeTier: 'TIER_2_CORE',
    intent: 'algorithm_optimization',
    seoKeywords: ['bumble travel mode distance glitch', 'bumble swipe queue reset travel mode', 'does bumble show travel mode badge', 'geolocation spoofing bumble'],
    tags: ['Bumble', 'Geolocation', 'Telemetry', 'Privacy'],
    motto: 'Love is... meeting where you truly are, not where an IP address claims you sit.',
    caseIdPrefix: 'ALG',
    telemetryRisk: 'LOW'
  },
  {
    id: 'algo_008',
    topic: 'The Dynamic Reset: Why Deleting and Remaking Dating Profiles Fails in 2026',
    slug: 'why-deleting-and-remaking-dating-profiles-fails-in-2026',
    keyword: 'why deleting and remaking dating profiles fails',
    category: 'algo-mechanics',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'algorithm_optimization',
    seoKeywords: ['tinder hard reset 2026', 'device id ban dating apps', 'how to clean reset tinder bumble', 'shadowban after account reset'],
    tags: ['Account Reset', 'Device Fingerprinting', 'Tinder', 'Bumble'],
    motto: 'Love is... beginning anew with genuine presence instead of recycled profiles.',
    caseIdPrefix: 'ALG',
    telemetryRisk: 'HIGH'
  },
  {
    id: 'algo_009',
    topic: 'How Dating Algorithms Rank Matches by Facial Symmetry and Photo Lighting',
    slug: 'how-dating-algorithms-rank-matches-by-facial-symmetry',
    keyword: 'how dating algorithms rank facial symmetry lighting',
    category: 'algo-mechanics',
    searchVolumeTier: 'TIER_2_CORE',
    intent: 'algorithm_optimization',
    seoKeywords: ['ai photo attractiveness scoring tinder', 'computer vision dating app photos', 'facial symmetry dating algorithm score', 'smart photos ai rank'],
    tags: ['Computer Vision', 'Photo Scoring', 'Algorithms', 'Profile Optimization'],
    motto: 'Love is... being drawn to a human soul rather than an optical symmetry score.',
    caseIdPrefix: 'ALG',
    telemetryRisk: 'MEDIUM'
  },
  {
    id: 'safe_007',
    topic: 'Deepfake Voice Notes on Dating Apps: How Scammers Clone Audio to Establish False Trust',
    slug: 'deepfake-voice-notes-dating-apps-cloned-audio-false-trust',
    keyword: 'deepfake voice notes dating apps audio cloning',
    category: 'safety-dossier',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'scam_verification',
    seoKeywords: ['audio deepfake dating scam', 'cloned voice note tinder hinge', 'how to verify voice note authenticity', 'ai generated audio romance fraud'],
    tags: ['Deepfake Audio', 'Voice Scams', 'Safety Dossier', 'Fraud Detection'],
    motto: 'Love is... listening for the natural breath and cadence of an honest human voice.',
    caseIdPrefix: 'DOS',
    telemetryRisk: 'CRITICAL'
  },
  {
    id: 'safe_008',
    topic: 'The Fake Verification Checkmark Trap: How Bot Networks Bypass Dating App Identity Checks',
    slug: 'fake-verification-checkmark-trap-how-bots-bypass-tinder-checks',
    keyword: 'fake verification checkmark tinder bot networks',
    category: 'safety-dossier',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'scam_verification',
    seoKeywords: ['verified badge scam tinder', 'can bots get blue checkmark tinder', 'fake verified profile hinge bumble', 'bypass selfie verification bot farm'],
    tags: ['Bot Networks', 'Verification Fraud', 'Tinder', 'Safety Protocol'],
    motto: 'Love is... verifying character with your own eyes rather than trusting a corporate badge.',
    caseIdPrefix: 'DOS',
    telemetryRisk: 'CRITICAL'
  },
  {
    id: 'safe_009',
    topic: 'Off-App Urgency: Why Scammers Demand WhatsApp Within Three Messages',
    slug: 'why-dating-scammers-demand-whatsapp-within-three-messages',
    keyword: 'why scammers demand whatsapp within three messages',
    category: 'safety-dossier',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'scam_verification',
    seoKeywords: ['why do tinder matches want to move to whatsapp immediately', 'off app red flags online dating', 'telegram move scam dating apps', 'whatsapp crypto dating scam'],
    tags: ['Scam Tactics', 'WhatsApp Move', 'Red Flags', 'Dating Safety'],
    motto: 'Love is... respecting boundaries without rushing into unmonitored private channels.',
    caseIdPrefix: 'DOS',
    telemetryRisk: 'HIGH'
  },
  {
    id: 'safe_010',
    topic: 'Countering Video Call Avoidance: The 15-Second Liveness Protocol for Online Dating',
    slug: 'countering-video-call-avoidance-15-second-liveness-protocol',
    keyword: 'video call avoidance liveness verification dating apps',
    category: 'safety-dossier',
    searchVolumeTier: 'TIER_2_CORE',
    intent: 'scam_verification',
    seoKeywords: ['match refuses video call red flag', 'how to verify catfish video wave', '15 second liveness test dating', 'broken camera excuse online dating'],
    tags: ['Video Verification', 'Catfish Defense', 'Safety Checklist', 'OSINT'],
    motto: 'Love is... glad to share a warm, fleeting video smile before meeting in person.',
    caseIdPrefix: 'DOS',
    telemetryRisk: 'HIGH'
  },
  {
    id: 'safe_011',
    topic: 'Crypto Romance Scams in 2026: Identifying Liquidity Node Traps on Hinge and Bumble',
    slug: 'crypto-romance-scams-2026-liquidity-node-traps-on-hinge',
    keyword: 'crypto romance scams liquidity node traps dating apps 2026',
    category: 'safety-dossier',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'scam_verification',
    seoKeywords: ['pig butchering crypto liquidity node', 'tinder crypto trading uncle scam', 'fake investment platform dating apps', 'financial solicitation romance scam'],
    tags: ['Crypto Scams', 'Pig Butchering', 'Financial Safety', 'Romance Fraud'],
    motto: 'Love is... never traded on a fraudulent decentralized exchange.',
    caseIdPrefix: 'DOS',
    telemetryRisk: 'CRITICAL'
  },
  {
    id: 'safe_012',
    topic: 'Anti-Extortion Playbook: Protecting Your Digital Privacy If Compromising Media Was Shared',
    slug: 'anti-extortion-playbook-protecting-privacy-compromising-media',
    keyword: 'anti extortion playbook dating app blackmail',
    category: 'safety-dossier',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'scam_verification',
    seoKeywords: ['what to do if blackmailed on instagram tinder', 'sextortion containment protocol', 'should you pay dating app blackmailer', 'reporting online dating extortion'],
    tags: ['Blackmail Defense', 'Emergency Protocol', 'Privacy Vaulting', 'Sextortion'],
    motto: 'Love is... reclaiming your power and never surrendering to manipulative fear.',
    caseIdPrefix: 'DOS',
    telemetryRisk: 'CRITICAL'
  },
  {
    id: 'txt_006',
    topic: 'The 10-Second Text Rule: How Fast Responses Reveal High Intent vs Boredom',
    slug: 'the-ten-second-text-rule-how-responses-reveal-intent',
    keyword: 'how fast response times reveal dating intent vs boredom',
    category: 'digital-dialogue',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'chat_mastery',
    seoKeywords: ['texting response time psychology dating', 'does replying fast look desperate', 'intermittent texting rewards dating apps', 'consistent communication vs hot and cold'],
    tags: ['Texting Pacing', 'Response Latency', 'Intentional Dating', 'Communication'],
    motto: 'Love is... calm, consistent reciprocity that values another human’s time.',
    caseIdPrefix: 'TXT',
    telemetryRisk: 'LOW'
  },
  {
    id: 'txt_007',
    topic: 'Reviving a Stalled Conversation: 3 Low-Pressure Openers That Elicit Genuine Replies',
    slug: 'reviving-stalled-conversations-low-pressure-openers',
    keyword: 'reviving stalled dating app conversation low pressure openers',
    category: 'digital-dialogue',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'chat_mastery',
    seoKeywords: ['how to revive dead tinder chat', 'what to text when match stops replying', 'pattern interrupt dating conversation', 'low pressure check in message bumble'],
    tags: ['Conversation Revival', 'Pattern Interrupt', 'Hinge Openers', 'Texting Tips'],
    motto: 'Love is... an effortless rhythm that never requires performing on stage.',
    caseIdPrefix: 'TXT',
    telemetryRisk: 'LOW'
  },
  {
    id: 'txt_008',
    topic: 'Voice Prompts on Hinge: The Psychological Impact of Vocal Tone on First Impressions',
    slug: 'voice-prompts-hinge-psychological-impact-vocal-tone',
    keyword: 'hinge voice prompts vocal tone psychology attraction',
    category: 'digital-dialogue',
    searchVolumeTier: 'TIER_2_CORE',
    intent: 'chat_mastery',
    seoKeywords: ['best hinge voice prompt examples', 'does voice attractive psychology work', 'hinge voice note awkwardness', 'vocal resonance dating apps'],
    tags: ['Hinge Voice Prompts', 'Vocal Attraction', 'Acoustic Psychology', 'Profile Optimization'],
    motto: 'Love is... finding reassurance in the gentle tone of a warm, unfiltered voice.',
    caseIdPrefix: 'TXT',
    telemetryRisk: 'LOW'
  },
  {
    id: 'txt_009',
    topic: 'Spotting AI-Generated Chat Messages: 4 Linguistic Tells of Automated Responses',
    slug: 'spotting-ai-generated-chat-messages-linguistic-tells',
    keyword: 'how to spot ai generated chat messages dating apps',
    category: 'digital-dialogue',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'chat_mastery',
    seoKeywords: ['is my tinder match using chatgpt', 'linguistic tells ai dating messages', 'ai rizz bot detection', 'formulaic response patterns in dating dms'],
    tags: ['AI Bots', 'Linguistic Analysis', 'Texting Authenticity', 'Bot Detection'],
    motto: 'Love is... clumsy, heartfelt authenticity over polished algorithmic prose.',
    caseIdPrefix: 'TXT',
    telemetryRisk: 'MEDIUM'
  },
  {
    id: 'txt_010',
    topic: 'Boundary Setting via Text: How Confident Daters Decline Last-Minute Late Night Invites',
    slug: 'boundary-setting-via-text-declining-late-night-invites',
    keyword: 'how to decline last minute late night invites dating apps',
    category: 'digital-dialogue',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'chat_mastery',
    seoKeywords: ['setting boundaries over text dating', 'how to respond to u up text gracefully', 'declining low effort invites without being rude', 'high value communication dating'],
    tags: ['Boundaries', 'Assertiveness', 'Texting Scripts', 'Self Respect'],
    motto: 'Love is... setting gentle, clear boundaries that safeguard your peace.',
    caseIdPrefix: 'TXT',
    telemetryRisk: 'LOW'
  },
  {
    id: 'psy_006',
    topic: 'The Anxious-Avoidant Dating Trap: Breaking the Cycle on Modern Dating Apps',
    slug: 'breaking-the-anxious-avoidant-cycle-on-modern-dating-apps',
    keyword: 'breaking anxious avoidant trap dating apps 2026',
    category: 'modern-psychology',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'psychological_insight',
    seoKeywords: ['attachment styles tinder bumble', 'anxious avoidant trap dating loop', 'why do avoidants swipe on anxious partners', 'secure dating habits online'],
    tags: ['Attachment Styles', 'Psychology', 'Emotional Health', 'Relationship Advice'],
    motto: 'Love is... safe, calm consistency that soothes rather than activates your nervous system.',
    caseIdPrefix: 'PSY',
    telemetryRisk: 'LOW'
  },
  {
    id: 'psy_007',
    topic: 'Love Bombing vs Healthy Enthusiasm: The 7-Day Consistency Test',
    slug: 'love-bombing-vs-healthy-enthusiasm-seven-day-consistency-test',
    keyword: 'love bombing vs healthy enthusiasm seven day test',
    category: 'modern-psychology',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'psychological_insight',
    seoKeywords: ['how to tell love bombing from genuine interest', 'premature intensity red flag dating', 'narcissist love bombing timeline', 'emotional pacing rules first week'],
    tags: ['Love Bombing', 'Narcissist Red Flags', 'Emotional Pacing', 'Psychology'],
    motto: 'Love is... patient discovery that grows through mutual respect, not immediate adoration.',
    caseIdPrefix: 'PSY',
    telemetryRisk: 'HIGH'
  },
  {
    id: 'psy_008',
    topic: 'The Illusion of Infinite Options: Why Too Many Matches Destroys Real Connection',
    slug: 'the-illusion-of-infinite-options-why-matches-destroy-connection',
    keyword: 'paradox of choice dating apps illusion of options',
    category: 'modern-psychology',
    searchVolumeTier: 'TIER_2_CORE',
    intent: 'psychological_insight',
    seoKeywords: ['swiping fatigue psychology', 'paradox of choice online dating', 'why modern dating feels like a catalog', 'intentional dating single match focus'],
    tags: ['Paradox of Choice', 'Swipe Fatigue', 'Psychology', 'Intentionality'],
    motto: 'Love is... choosing one imperfect person with wholehearted commitment.',
    caseIdPrefix: 'PSY',
    telemetryRisk: 'LOW'
  },
  {
    id: 'psy_009',
    topic: 'Breadcrumbing and Benching: How Emotionally Unavailable Singles Keep Backup Options',
    slug: 'breadcrumbing-and-benching-emotionally-unavailable-backup-options',
    keyword: 'breadcrumbing benching emotionally unavailable dating apps',
    category: 'modern-psychology',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'psychological_insight',
    seoKeywords: ['signs you are being benched dating app', 'hot and cold behavior psychology', 'why do matches keep texting without meeting', 'cutting off breadcrumbers gracefully'],
    tags: ['Breadcrumbing', 'Benching', 'Emotional Availability', 'Red Flags'],
    motto: 'Love is... an active choice every day, never an occasional reserve option on a bench.',
    caseIdPrefix: 'PSY',
    telemetryRisk: 'LOW'
  },
  {
    id: 'psy_010',
    topic: 'Dating App Burnout: A Practical 14-Day Reset Protocol for Emotional Exhaustion',
    slug: 'dating-app-burnout-14-day-reset-protocol-emotional-exhaustion',
    keyword: 'dating app burnout reset protocol 2026',
    category: 'modern-psychology',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'psychological_insight',
    seoKeywords: ['dating app fatigue recovery', 'taking a break from tinder bumble', 'mental health impact of swiping apps', 'offline dating return protocol'],
    tags: ['Dating Burnout', 'Mental Health', 'Digital Detox', 'Wellness'],
    motto: 'Love is... resting when weary and remembering your worth exists far outside any app.',
    caseIdPrefix: 'PSY',
    telemetryRisk: 'LOW'
  },
  {
    id: 'date_006',
    topic: 'Coffee vs Dinner for Date One: Why Low-Investment Venues Yield Better Chemistry',
    slug: 'coffee-vs-dinner-date-one-why-low-investment-venues-win',
    keyword: 'coffee vs dinner first date low investment venues',
    category: 'first-dates',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'first_date_prep',
    seoKeywords: ['why dinner first dates are bad idea', 'best low pressure first date ideas', 'coffee date etiquette online dating', 'first date psychology venue choice'],
    tags: ['First Date Prep', 'Venue Choice', 'Low Pressure Dating', 'Safety Protocol'],
    motto: 'Love is... finding magic over a simple morning coffee with zero forced expectations.',
    caseIdPrefix: 'DAT',
    telemetryRisk: 'LOW'
  },
  {
    id: 'date_007',
    topic: 'First-Date Body Language: 5 Subtle Signs That Reveal Genuine Romantic Attraction',
    slug: 'first-date-body-language-subtle-signs-reveal-attraction',
    keyword: 'first date body language subtle signs attraction',
    category: 'first-dates',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'first_date_prep',
    seoKeywords: ['how to tell if date likes you body language', 'micro expressions first date chemistry', 'eye contact pupil dilation dating', 'mirroring behavior first date'],
    tags: ['Body Language', 'Micro Expressions', 'Attraction Signals', 'First Date'],
    motto: 'Love is... quiet gestures and honest eye contact speaking truth when words fail.',
    caseIdPrefix: 'DAT',
    telemetryRisk: 'LOW'
  },
  {
    id: 'date_008',
    topic: 'Public Venue Safety: Non-Negotiable Rules Before Meeting Any Online Match',
    slug: 'public-venue-safety-non-negotiable-rules-online-matches',
    keyword: 'first date safety public venue rules online matches',
    category: 'first-dates',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'first_date_prep',
    seoKeywords: ['dating safety rules for women meetups', 'sharing location first date safety', 'apartment invite date one red flag', 'safe first meeting protocol 2026'],
    tags: ['Safety Protocol', 'Public Venues', 'Risk Containment', 'First Date Checklist'],
    motto: 'Love is... never having to apologize for prioritizing your personal safety.',
    caseIdPrefix: 'DAT',
    telemetryRisk: 'HIGH'
  },
  {
    id: 'date_009',
    topic: 'The 45-Minute Exit Strategy: How to End a First Date Gracefully Without Guilt',
    slug: 'forty-five-minute-exit-strategy-ending-first-date-gracefully',
    keyword: 'how to end first date gracefully 45 minute exit strategy',
    category: 'first-dates',
    searchVolumeTier: 'TIER_2_CORE',
    intent: 'first_date_prep',
    seoKeywords: ['first date exit excuse polite', 'how long should first date last', 'leaving bad date gracefully', 'post date text if not interested'],
    tags: ['Exit Strategy', 'First Date Etiquette', 'Boundaries', 'Communication'],
    motto: 'Love is... mutual clarity and honest kindness, even when saying goodbye.',
    caseIdPrefix: 'DAT',
    telemetryRisk: 'LOW'
  },
  {
    id: 'date_010',
    topic: 'Vetting Matches Before Meeting: 3 Essential Questions That Save Wasted Evenings',
    slug: 'vetting-matches-before-meeting-three-essential-questions',
    keyword: 'vetting matches before meeting essential questions',
    category: 'first-dates',
    searchVolumeTier: 'TIER_1_MASS',
    intent: 'first_date_prep',
    seoKeywords: ['questions to ask before meeting dating app', 'filter incompatible matches pre date', 'screening questions online dating', 'saving time on bad first dates'],
    tags: ['Pre Date Screening', 'Vetting Questions', 'Intentional Dating', 'Compatibility'],
    motto: 'Love is... valuing each other’s finite time with honest, early questions.',
    caseIdPrefix: 'DAT',
    telemetryRisk: 'LOW'
  },
  {
    id: 'ess_005',
    topic: 'In Defense of Vulnerability: Why Curated Perfection Destroys Romantic Spark',
    slug: 'in-defense-of-vulnerability-why-curation-destroys-spark',
    keyword: 'in defense of vulnerability online dating curation',
    category: 'romantic-essays',
    searchVolumeTier: 'TIER_2_CORE',
    intent: 'philosophical_essay',
    seoKeywords: ['why perfect dating profiles fail', 'authenticity vs curated aesthetic dating', 'vulnerability in modern romance', 'arthur vance essays on connection'],
    tags: ['Authenticity', 'Vulnerability', 'Essays', 'Cheltenham Desk'],
    motto: 'Love is... opening the door to your flaws and discovering they were what made you lovable.',
    caseIdPrefix: 'ESS',
    telemetryRisk: 'LOW'
  },
  {
    id: 'ess_006',
    topic: 'The Digital Scent of Silence: What Modern Ghosting Says About Contemporary Society',
    slug: 'the-digital-scent-of-silence-what-ghosting-says-about-society',
    keyword: 'sociological perspective on modern ghosting dating',
    category: 'romantic-essays',
    searchVolumeTier: 'TIER_3_NICHE',
    intent: 'philosophical_essay',
    seoKeywords: ['why ghosting is culturally pervasive', 'disposable culture in dating apps', 'psychological aftermath of being ghosted', 'restoring dignity after sudden blocks'],
    tags: ['Ghosting Culture', 'Sociology', 'Reflections', 'Healing'],
    motto: 'Love is... braving honest closure instead of vanishing into comfortable silence.',
    caseIdPrefix: 'ESS',
    telemetryRisk: 'LOW'
  },
  {
    id: 'ess_007',
    topic: 'Slow Dating in an Instant Swiping Era: Reclaiming the Lost Art of Romance',
    slug: 'slow-dating-instant-swiping-era-reclaiming-romance',
    keyword: 'slow dating movement instant swiping era romance',
    category: 'romantic-essays',
    searchVolumeTier: 'TIER_2_CORE',
    intent: 'philosophical_essay',
    seoKeywords: ['slow dating manifesto 2026', 'counter culture to tinder swiping', 'deep romance in digital age', 'pen pal pacing before meeting'],
    tags: ['Slow Dating', 'Romantic Essays', 'Antidote to Swiping', 'Authenticity'],
    motto: 'Love is... taking the long, unscripted road and savoring every mile together.',
    caseIdPrefix: 'ESS',
    telemetryRisk: 'LOW'
  }
];

/**
 * Returns topics by category
 */
export function getTopicsByCategory(category: TaxonomyCategory): EditorialTopicDefinition[] {
  return EDITORIAL_TAXONOMY_POOL.filter(t => t.category === category);
}

/**
 * Calculates current topic deficit across the 6 categories compared to target ratio
 */
export function calculateCategoryDeficits(existingPostCategories: Record<string, number>): Array<{
  category: TaxonomyCategory;
  count: number;
  deficitScore: number; // Higher means greater need for new articles
}> {
  const allCategories: TaxonomyCategory[] = [
    'algo-mechanics',
    'safety-dossier',
    'digital-dialogue',
    'modern-psychology',
    'first-dates',
    'romantic-essays'
  ];

  // Target distribution weight per category
  const targetWeights: Record<TaxonomyCategory, number> = {
    'algo-mechanics': 0.20,    // 20% Technical CTR & Search Volume
    'safety-dossier': 0.25,    // 25% Commercial / High Intent Safety Funnel
    'digital-dialogue': 0.20,  // 20% High Search Volume Texting Queries
    'modern-psychology': 0.15, // 15% Evergreen Emotional Queries
    'first-dates': 0.10,       // 10% Tactical Pre-Date Prep
    'romantic-essays': 0.10,   // 10% Dwell Time, Authority & In-Depth Voice
  };

  const totalPosts = Object.values(existingPostCategories).reduce((sum, c) => sum + c, 0) || 1;

  return allCategories.map(category => {
    const currentCount = existingPostCategories[category] || 0;
    const currentShare = currentCount / totalPosts;
    const targetShare = targetWeights[category];
    // Deficit is positive when current share is below target share
    const deficitScore = targetShare - currentShare;

    return {
      category,
      count: currentCount,
      deficitScore,
    };
  }).sort((a, b) => b.deficitScore - a.deficitScore); // Highest deficit first
}
