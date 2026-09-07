export interface KeywordIntent {
  topic: string;
  keyword: string;
  cluster: 'scam_detection' | 'icebreakers' | 'profile_optimization' | 'dating_safety';
  seoKeywords: string[];
  tags: string[];
  intent: string;
}

export const DATING_KEYWORD_POOL: KeywordIntent[] = [
  // 1. Romance Scam & Bot Detection
  {
    topic: 'How to Verify if a Tinder Match is a Bot: 2026 Detection Blueprint',
    keyword: 'how to verify if tinder match is bot',
    cluster: 'scam_detection',
    seoKeywords: ['tinder bot check', 'spot dating app bots', 'fake profile detection', 'verify tinder match'],
    tags: ['Tinder', 'Scams', 'Safety', 'Bot Check'],
    intent: 'scam_verification_high_intent'
  },
  {
    topic: 'Dating Profile Image Reverse Search: Spot Fake Matches in Seconds',
    keyword: 'dating profile image reverse search',
    cluster: 'scam_detection',
    seoKeywords: ['reverse image search dating', 'catfish image finder', 'fake photo verification', 'dating scam tools'],
    tags: ['Catfish', 'Image Search', 'Safety', 'Scam Detection'],
    intent: 'identity_verification'
  },
  {
    topic: '7 Crypto Romance Scam Red Flags That Steal Millions from Singles',
    keyword: 'crypto romance scam red flags',
    cluster: 'scam_detection',
    seoKeywords: ['pig butchering scam signs', 'crypto dating scam warning', 'whatsapp dating fraud', 'online romance fraud'],
    tags: ['Crypto Scams', 'Safety', 'Fraud Prevention', 'Dating Warnings'],
    intent: 'fraud_prevention'
  },
  {
    topic: 'Deepfake Photos & AI Catfishing on Hinge: How to Protect Your Heart and Wallet',
    keyword: 'ai catfishing hinge deepfake photos',
    cluster: 'scam_detection',
    seoKeywords: ['ai catfish detection', 'deepfake dating profiles', 'hinge fake accounts', 'synthetic identity dating'],
    tags: ['AI Dating', 'Deepfakes', 'Hinge', 'Safety'],
    intent: 'tech_scam_detection'
  },
  {
    topic: 'What to Do if Someone Stole Your Photos for a Fake Dating Account',
    keyword: 'stolen photos fake dating profile',
    cluster: 'scam_detection',
    seoKeywords: ['report stolen photos tinder', 'identity theft dating apps', 'fake profile impersonation', 'remove fake dating profile'],
    tags: ['Identity Theft', 'Privacy', 'Legal Dating Help'],
    intent: 'privacy_remediation'
  },

  // 2. First Message & Icebreakers
  {
    topic: 'What to Say When a Match Disappears and Comes Back: The Exact Script',
    keyword: 'what to say after match disappears',
    cluster: 'icebreakers',
    seoKeywords: ['zombieing dating text', 'ghosted match returns', 're-engage dating match', 'high response openers'],
    tags: ['Ghosting', 'Icebreakers', 'Texting Tips', 'Dating Scripts'],
    intent: 'communication_optimization'
  },
  {
    topic: 'Hinge Opening Lines That Get 85% Reply Rates (Data-Backed 2026)',
    keyword: 'hinge opening lines that get replies',
    cluster: 'icebreakers',
    seoKeywords: ['best hinge openers', 'prompt reply formulas', 'funny hinge opening lines', 'hinge conversation starters'],
    tags: ['Hinge', 'Conversation Starters', 'Dating Psychology'],
    intent: 'openers_optimization'
  },
  {
    topic: 'Bumble First Messages for Women: Psychological Hooks That Guarantee Answers',
    keyword: 'bumble first message psychological hooks',
    cluster: 'icebreakers',
    seoKeywords: ['best bumble openers for girls', 'bumble first text ideas', 'smart bumble icebreakers', 'high conversion texts'],
    tags: ['Bumble', 'Women Dating', 'Chat Starters'],
    intent: 'communication_optimization'
  },
  {
    topic: 'Tinder Banter Blueprint: How to Move from Dry Chat to a Real Date in 5 Texts',
    keyword: 'tinder chat to real date script',
    cluster: 'icebreakers',
    seoKeywords: ['how to ask for date on tinder', 'transition chat to date', 'flirty tinder conversation', 'tinder texting rules'],
    tags: ['Tinder', 'Date Planning', 'Chat Flow'],
    intent: 'conversion_to_date'
  },
  {
    topic: 'The 3-Question Compatibility Test to Ask Before the First Date',
    keyword: 'compatibility questions before first date',
    cluster: 'icebreakers',
    seoKeywords: ['questions to check compatibility', 'screening online dates', 'dating value alignment', 'pre-date screening'],
    tags: ['Compatibility', 'Screening', 'Relationship Goals'],
    intent: 'compatibility_screening'
  },

  // 3. Profile Optimization & Psychological Triggers
  {
    topic: 'Dating Profile Bio Red Flags Guys Completely Overlook in 2026',
    keyword: 'dating profile bio red flags guys overlook',
    cluster: 'profile_optimization',
    seoKeywords: ['tinder bio mistakes men', 'instant swipe left triggers', 'profile bio red flags', 'attractive dating bio'],
    tags: ['Profile Review', 'Bio Mistakes', 'Men Dating Advice'],
    intent: 'profile_audit'
  },
  {
    topic: 'Optimal Photo Order for Dating Apps: The Psychological Anchor Rule',
    keyword: 'optimal photo order dating apps',
    cluster: 'profile_optimization',
    seoKeywords: ['best first photo tinder', 'dating photo sequence algorithm', 'hinge photo order psychology', 'increase match rate'],
    tags: ['Photo Order', 'Profile Photos', 'Match Rate'],
    intent: 'visual_optimization'
  },
  {
    topic: 'Why You Get Matches But No Dates: The Unspoken Dating App Bottleneck',
    keyword: 'matches but no dates bottleneck dating apps',
    cluster: 'profile_optimization',
    seoKeywords: ['fix dry dating conversations', 'matches ghosting before date', 'dating app conversion dropoff', 'messaging fixes'],
    tags: ['Dating Funnel', 'Match Conversion', 'Psychology'],
    intent: 'problem_solving'
  },
  {
    topic: 'How to Write a Bumble Bio That Filters Out Time-Wasters Immediately',
    keyword: 'bumble bio filter time wasters',
    cluster: 'profile_optimization',
    seoKeywords: ['serious dating profile bio', 'filter casual daters', 'high value dating bio', 'attract intentional partners'],
    tags: ['Bumble Bio', 'Intentional Dating', 'Boundary Setting'],
    intent: 'intent_filtering'
  },

  // 4. Safety & Identity Verification
  {
    topic: 'Dating Safety Checklist Before Meeting IRL: 6 Non-Negotiable Rules',
    keyword: 'dating safety checklist before meeting IRL',
    cluster: 'dating_safety',
    seoKeywords: ['first date safety checklist', 'online dating meeting safety', 'public meetup protocol', 'safe dating tips 2026'],
    tags: ['IRL Safety', 'Checklists', 'First Date', 'Personal Security'],
    intent: 'safety_protocol'
  },
  {
    topic: 'How to Do a Background Safety Check on an Online Date Without Being Creepy',
    keyword: 'background safety check online date',
    cluster: 'dating_safety',
    seoKeywords: ['verify identity before date', 'public records dating check', 'dating safety lookup', 'safe dating verification'],
    tags: ['Background Check', 'Identity Verification', 'Safety Protocol'],
    intent: 'identity_verification'
  },
  {
    topic: 'Location Sharing & Emergency Signal Apps Every Solo Dater Needs',
    keyword: 'emergency safety apps solo dating',
    cluster: 'dating_safety',
    seoKeywords: ['date safety apps', 'share location first date', 'emergency fake call dating', 'solo dating protection'],
    tags: ['Safety Tech', 'Mobile Apps', 'Emergency Protocols'],
    intent: 'safety_tech'
  },
  {
    topic: 'Safe Rideshare and Venue Selection Protocols for Online Meetups',
    keyword: 'safe venue selection online dating meetups',
    cluster: 'dating_safety',
    seoKeywords: ['where to meet online date safely', 'public date venues', 'rideshare safety first date', 'exit strategy dating'],
    tags: ['Venue Selection', 'Safety', 'Date Logistics'],
    intent: 'logistics_safety'
  }
];

export function getNextKeywordBatch(count: number = 10, offset: number = 0): KeywordIntent[] {
  const safeOffset = offset % DATING_KEYWORD_POOL.length;
  const batch: KeywordIntent[] = [];
  
  for (let i = 0; i < count; i++) {
    const idx = (safeOffset + i) % DATING_KEYWORD_POOL.length;
    batch.push(DATING_KEYWORD_POOL[idx]);
  }
  
  return batch;
}
