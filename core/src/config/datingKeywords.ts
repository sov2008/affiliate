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
  {
    topic: 'Pig Butchering Scams Exposed: How Fraudsters Exploit Dating Apps',
    keyword: 'pig butchering scam dating apps',
    cluster: 'scam_detection',
    seoKeywords: ['sha zhu pan scam', 'whatsapp investment scam dating', 'fake crypto exchange romance', 'dating financial trap'],
    tags: ['Crypto Scams', 'Pig Butchering', 'Financial Security'],
    intent: 'fraud_education'
  },
  {
    topic: 'Military Romance Scams: Warning Signs You Are Talking to an Imposter',
    keyword: 'military romance scam signs',
    cluster: 'scam_detection',
    seoKeywords: ['deployed soldier dating scam', 'fake military photos dating', 'romance scam overseas soldier', 'military id check dating'],
    tags: ['Military Scams', 'Impersonation', 'Catfishing Signs'],
    intent: 'identity_verification'
  },
  {
    topic: 'How to Detect Stolen LinkedIn & Instagram Photos on Dating Apps',
    keyword: 'detect stolen instagram photos dating profile',
    cluster: 'scam_detection',
    seoKeywords: ['fake model tinder photos', 'stolen influencer pictures bumble', 'stolen photos detector', 'find source of dating photo'],
    tags: ['Image Verification', 'Instagram Catfish', 'Safety Tools'],
    intent: 'image_sleuthing'
  },
  {
    topic: 'The Voice Note Verification Trick: Spotting Audio Deepfakes in Online Dating',
    keyword: 'audio deepfake voice verification dating',
    cluster: 'scam_detection',
    seoKeywords: ['ai cloned voice scam', 'voice note verification tinder', 'fake phone call romance scam', 'synthetic voice detection'],
    tags: ['AI Voice', 'Audio Deepfakes', 'Verification Tactics'],
    intent: 'voice_verification'
  },

  // 2. First Message & AI Icebreakers
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
  {
    topic: 'AI Generated Openers vs Human Humor: What Actually Converts on Tinder in 2026',
    keyword: 'ai openers vs human humor tinder',
    cluster: 'icebreakers',
    seoKeywords: ['chatgpt tinder openers test', 'ai pickup lines conversion rate', 'authentic dating banter', 'dating response rate benchmark'],
    tags: ['AI Openers', 'Tinder Data', 'Conversion Benchmark'],
    intent: 'ab_testing_dating'
  },
  {
    topic: 'How to Revive Dead Tinder Conversations: 5 Psychological Pattern Interrupts',
    keyword: 'revive dead tinder conversations pattern interrupts',
    cluster: 'icebreakers',
    seoKeywords: ['save dry dating chat', 'reignite bumble conversation', 'pattern interrupt texting', 'get ghosted match to respond'],
    tags: ['Conversation Hacks', 'Pattern Interrupt', 'Ghosting Recovery'],
    intent: 're_engagement'
  },
  {
    topic: 'Micro-Flirting Over Text: How to Build Subconscious Attraction Fast',
    keyword: 'micro flirting texting attraction psychology',
    cluster: 'icebreakers',
    seoKeywords: ['subtle flirting texts', 'build sexual tension over text', 'flirting psychology dating apps', 'banter calibration'],
    tags: ['Psychology', 'Flirting', 'Attraction Signals'],
    intent: 'attraction_building'
  },
  {
    topic: 'How to Politely Decline a Date Request Without Burning the Bridge',
    keyword: 'politely decline date request online dating',
    cluster: 'icebreakers',
    seoKeywords: ['how to say no to second date', 'graceful dating rejection text', 'boundary setting online dating', 'turning down match kindly'],
    tags: ['Boundaries', 'Polite Communication', 'Dating Etiquette'],
    intent: 'boundary_management'
  },

  // 3. Profile Optimization & Red Flags in Bios
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
  {
    topic: 'Subtle Narcissist Red Flags in Online Dating Bios and Photos',
    keyword: 'narcissist red flags online dating bios',
    cluster: 'profile_optimization',
    seoKeywords: ['spot narcissist tinder profile', 'covert narcissist dating prompts', 'love bombing warnings online', 'toxic dater signals'],
    tags: ['Red Flags', 'Narcissist Signs', 'Mental Health Safety'],
    intent: 'toxic_profile_detection'
  },
  {
    topic: '7 High-Status Hobbies That Double Inbound Likes on Men Profiles',
    keyword: 'high status hobbies dating profile photos',
    cluster: 'profile_optimization',
    seoKeywords: ['attractive hobby photos tinder', 'lifestyle signaling dating apps', 'what hobbies women like on men', 'bumble photo ideas men'],
    tags: ['Lifestyle Signaling', 'Photo Hacks', 'Status Triggers'],
    intent: 'status_signaling'
  },
  {
    topic: 'Voice Prompts on Hinge: What Vocal Tone Triggers Attraction or Repulsion',
    keyword: 'voice prompts hinge vocal tone attraction',
    cluster: 'profile_optimization',
    seoKeywords: ['hinge voice prompt ideas', 'attractive voice recording tips', 'vocal fry dating app impact', 'hinge audio prompt secrets'],
    tags: ['Voice Prompts', 'Hinge Hacks', 'Vocal Attraction'],
    intent: 'audio_optimization'
  },
  {
    topic: 'How to Style Group Photos on Dating Apps Without Looking Deceitful',
    keyword: 'group photos on dating apps rules',
    cluster: 'profile_optimization',
    seoKeywords: ['cheerleader effect dating apps', 'should i use group photos on tinder', 'which one is you tinder problem', 'social proof photo advice'],
    tags: ['Group Photos', 'Social Proof', 'Profile Design'],
    intent: 'social_proof_optimization'
  },

  // 4. Algorithm Secrets: Tinder, Bumble & Hinge 2026
  {
    topic: 'How the 2026 Tinder ELO Algorithm Ranks Your Profile: The Reset Myth',
    keyword: 'tinder elo algorithm 2026 ranking reset',
    cluster: 'profile_optimization',
    seoKeywords: ['tinder elo score explained', 'how to boost tinder elo', 'tinder shadowban fix 2026', 'algorithm match reset myth'],
    tags: ['Tinder ELO', 'Algorithm', 'Shadowban Fix'],
    intent: 'technical_algorithm_audit'
  },
  {
    topic: 'Bumble Compliments & Spotlight: Are Paid Features Worth Your Money?',
    keyword: 'bumble compliments spotlight worth it review',
    cluster: 'profile_optimization',
    seoKeywords: ['does bumble spotlight work', 'bumble boost vs premium 2026', 'best time to use bumble spotlight', 'bumble paid features roi'],
    tags: ['Bumble Premium', 'ROI Audit', 'Spotlight Test'],
    intent: 'feature_roi_evaluation'
  },
  {
    topic: 'Hinge Most Compatible Algorithm: How the AI Pairs You Every 24 Hours',
    keyword: 'hinge most compatible algorithm explained',
    cluster: 'profile_optimization',
    seoKeywords: ['how hinge pairs matches', 'gale shapley algorithm dating', 'improve hinge standout feed', 'why hinge gives bad matches'],
    tags: ['Hinge AI', 'Matchmaking Algorithm', 'Standouts Feed'],
    intent: 'ai_matchmaking_understanding'
  },
  {
    topic: 'Dating App Shadowbans: 5 Hidden Indicators and How to Appeal Safely',
    keyword: 'dating app shadowban indicators appeal guide',
    cluster: 'profile_optimization',
    seoKeywords: ['am i shadowbanned on tinder', 'bumble shadowban symptoms', 'clean device account reset', 'fix zero likes dating app'],
    tags: ['Shadowban', 'Account Health', 'Recovery Guide'],
    intent: 'account_recovery'
  },

  // 5. Safety Protocols & First Date Security
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
  },
  {
    topic: 'Drink Spiking Prevention: Covert Tools and Tactics for Nightlife Dating',
    keyword: 'drink spiking prevention online dating nightlife',
    cluster: 'dating_safety',
    seoKeywords: ['test drink for spikes date', 'drink cover scrunchie date safety', 'protect drink on first date', 'bar safety rules dating'],
    tags: ['Nightlife Safety', 'Drink Protection', 'Physical Security'],
    intent: 'physical_protection'
  },
  {
    topic: 'The Stealth Exit Strategy: How to Escape an Uncomfortable Date Safely',
    keyword: 'stealth exit strategy uncomfortable first date',
    cluster: 'dating_safety',
    seoKeywords: ['how to end a bad date early', 'angel shot bar code meaning', 'emergency fake phone call app', 'leave date safely'],
    tags: ['Exit Strategies', 'Angel Shot', 'Boundary Enforcement'],
    intent: 'emergency_disengagement'
  },
  {
    topic: 'Digital Footprint Hygiene: What Strangers Can Learn from Your Dating Profile',
    keyword: 'digital footprint privacy risks dating profiles',
    cluster: 'dating_safety',
    seoKeywords: ['osint dating profile risk', 'can someone find my address from tinder', 'protect personal info dating apps', 'dating metadata privacy'],
    tags: ['OSINT Defense', 'Privacy Hygiene', 'Doxxing Prevention'],
    intent: 'privacy_hardening'
  },
  {
    topic: 'Safe Travel & Dating Abroad: Solo Expat Security Protocol for Tinder Passport',
    keyword: 'solo expat dating security tinder passport',
    cluster: 'dating_safety',
    seoKeywords: ['dating safely while traveling', 'foreign romance scams warning', 'tinder passport travel tips', 'tourist dating scam trap'],
    tags: ['Travel Safety', 'Tinder Passport', 'Expat Dating'],
    intent: 'international_dating_safety'
  },

  // 6. Psychological Red Flags & Relationship Health
  {
    topic: 'Love Bombing vs Healthy Enthusiasm: How to Tell the Difference in Week 1',
    keyword: 'love bombing vs healthy enthusiasm online dating',
    cluster: 'dating_safety',
    seoKeywords: ['signs of love bombing texts', 'too fast too soon dating warning', 'narcissist love bombing cycle', 'healthy early dating pace'],
    tags: ['Love Bombing', 'Attachment Style', 'Relationship Health'],
    intent: 'psychological_evaluation'
  },
  {
    topic: 'Future Faking Signs: When Their Grand Dating Plans Are Pure Deception',
    keyword: 'future faking signs online dating promises',
    cluster: 'dating_safety',
    seoKeywords: ['what is future faking dating', 'fake promises early dating', 'narcissist future faking examples', 'protect your hopes dating'],
    tags: ['Future Faking', 'Emotional Safety', 'Red Flag Guide'],
    intent: 'emotional_protection'
  },
  {
    topic: 'Breadcrumbing and Benching: How to Stop Being Kept as an Option',
    keyword: 'breadcrumbing benching online dating meaning',
    cluster: 'icebreakers',
    seoKeywords: ['signs someone is breadcrumbing you', 'benching in modern dating', 'how to confront a breadcrumber', 'high self esteem dating rules'],
    tags: ['Breadcrumbing', 'Benching', 'Dating Self Worth'],
    intent: 'self_worth_empowerment'
  },
  {
    topic: 'Situationship Exit Playbook: Transitioning to Commitment or Walking Away',
    keyword: 'situationship to relationship transition playbook',
    cluster: 'icebreakers',
    seoKeywords: ['how to define relationship conversation', 'break free from situationship', 'ask what are we without fear', 'dating commitment ultimatum'],
    tags: ['Situationship', 'Commitment', 'Dating Playbook'],
    intent: 'relationship_clarity'
  },
  {
    topic: 'Ghosting Psychology: Why Matches Vanish and Why You Should Never Double Text',
    keyword: 'ghosting psychology online dating double text rules',
    cluster: 'icebreakers',
    seoKeywords: ['why people ghost on tinder', 'psychology of ghosting', 'should i send double text', 'heal from sudden ghosting'],
    tags: ['Ghosting', 'Mental Resilience', 'Texting Etiquette'],
    intent: 'resilience_building'
  },
  {
    topic: 'Dating App Burnout: 5 Signs It Is Time for a Digital Detox',
    keyword: 'dating app burnout digital detox recovery',
    cluster: 'profile_optimization',
    seoKeywords: ['tinder fatigue recovery', 'dating app depression symptoms', 'healthy dating app break', 'dating app addiction psychology'],
    tags: ['App Fatigue', 'Mental Wellbeing', 'Digital Detox'],
    intent: 'wellbeing_restoration'
  },
  {
    topic: 'Catfishing Psychology: Inside the Mind of Fake Profile Creators',
    keyword: 'catfishing psychology why people create fake profiles',
    cluster: 'scam_detection',
    seoKeywords: ['why do catfish do it', 'catfish psychology case studies', 'confronting a catfish safely', 'loneliness and fake identities'],
    tags: ['Catfish Psychology', 'Behavioral Science', 'Deep Dive'],
    intent: 'behavioral_analysis'
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
