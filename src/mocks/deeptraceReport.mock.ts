import { DeepTraceReportDTO } from '../types/deeptrace';

export const mockHighRiskRomanceScamReport: DeepTraceReportDTO = {
  reportId: 'c7b91e84-5f21-4d1a-8c76-32d9a5b6f014',
  caseReference: 'DT-2026-X892',
  analyzedAt: '2026-09-24T08:15:30Z',

  inputMetadata: {
    declaredLocation: 'Chicago, Illinois, USA',
    declaredTimezone: 'America/Chicago (UTC-5)',
    claimedAge: 29,
    claimedGender: 'FEMALE',
    platformType: 'TINDER',
    targetHandle: 'elena_v_wealth',
    suspectDisplayName: 'Elena Vance',
    contextNotes: 'Matched on Tinder 3 days ago. Insisted on moving to WhatsApp immediately. Mentioned foreign exchange and commodities trading.'
  },

  extractionSummary: {
    conversationId: '4b3d8819-21b7-4a5e-9f01-71e8609a3dc8',
    detectedPlatform: 'WHATSAPP',
    totalMessagesExtracted: 18,
    suspectMessageCount: 10,
    userMessageCount: 8,
    conversationTimespanMinutes: 1440,
    averageSuspectLatencySeconds: 14.5,
    detectedLanguages: ['en'],
    extractedUrls: ['https://secure-coinex-global.vip/trade'],
    extractedPhoneNumbers: ['+1 (773) 555-0194'],
    extractedCryptoAddresses: ['0x71C...392A'],
    parsedMessages: [
      {
        id: '91f24d8b-b892-4f31-8bc6-559dc9210001',
        sequenceIndex: 0,
        timestamp: '2026-09-23T19:30:15Z',
        rawTimestampText: '2:30 PM',
        author: 'USER',
        text: 'Hey Elena, how was your day at the boutique in downtown?',
        detectedLanguage: 'en',
        confidence: 0.98,
        anomalies: []
      },
      {
        id: '91f24d8b-b892-4f31-8bc6-559dc9210002',
        sequenceIndex: 1,
        timestamp: '2026-09-23T19:30:28Z',
        rawTimestampText: '2:30 PM',
        author: 'SUSPECT',
        text: 'Hello dear! Today is very busy. But thinking of meeting you gives my heart peaceful warmth. Fate brought us together on this small planet.',
        detectedLanguage: 'en',
        confidence: 0.95,
        anomalies: ['PREMATURE_AFFECTION', 'UNUSUAL_FORMALITY', 'SCRIPT_TOKEN_MATCH']
      },
      {
        id: '91f24d8b-b892-4f31-8bc6-559dc9210003',
        sequenceIndex: 2,
        timestamp: '2026-09-24T03:14:02Z',
        rawTimestampText: '10:14 PM',
        author: 'SUSPECT',
        text: 'Are you still awake, honey? I am just analyzing the London gold market trends with my uncle. He is a senior analyst in Singapore and guides my nodes.',
        detectedLanguage: 'en',
        confidence: 0.94,
        anomalies: ['TIMEZONE_MISMATCH', 'CRYPTO_TERMINAL_MENTION', 'SCRIPT_TOKEN_MATCH']
      },
      {
        id: '91f24d8b-b892-4f31-8bc6-559dc9210004',
        sequenceIndex: 3,
        timestamp: '2026-09-24T03:15:10Z',
        rawTimestampText: '10:15 PM',
        author: 'USER',
        text: 'At 10 PM? Isn’t the Chicago boutique closed? I thought you worked in fashion design.',
        detectedLanguage: 'en',
        confidence: 0.97,
        anomalies: []
      },
      {
        id: '91f24d8b-b892-4f31-8bc6-559dc9210005',
        sequenceIndex: 4,
        timestamp: '2026-09-24T03:15:22Z',
        rawTimestampText: '10:15 PM',
        author: 'SUSPECT',
        text: 'Fashion is my passion, but passive financial freedom allows me to build our future together without worries. Open this platform link I sent, I can teach you the 60-second option node.',
        detectedLanguage: 'en',
        confidence: 0.96,
        anomalies: ['VAGUELY_EVASIVE', 'DEFENSIVE_REVERSAL', 'MONEY_REDIRECT_ATTEMPT', 'SUSPICIOUS_LINK']
      }
    ]
  },

  overallTrustIndex: {
    score: 11.4,
    riskLevel: 'CRITICAL',
    confidence: 0.96,
    executiveVerdict: 'CRITICAL WARNING: Profile exhibits textbook signatures of an industrial Sha Zhu Pan (Pig Butchering) syndicate operating out of the Indochina / GMT+7 economic corridor. Discontinue communication immediately; do not transfer assets or register on third-party URLs.',
    primaryRiskDrivers: [
      'High-confidence Sha Zhu Pan script pattern match ("Singapore Uncle / Financial Analyst")',
      'Diurnal activity distribution contradicts declared Chicago timezone by +12 hours (GMT+7 activity clustering)',
      'Profile photograph exhibits 91.2% synthetic diffusion artifacts (GAN/FLUX LoRA face rendering)',
      'Unsolicited invitation to deposit collateral into an unindexed spoofed trading terminal (secure-coinex-global.vip)',
      'Refusal of synchronous verification protocols combined with premature emotional bonding (Love Bombing)'
    ]
  },

  timezoneBioRhythmAnomalies: {
    claimedTimezone: 'America/Chicago (UTC-5)',
    inferredTimezone: 'Asia/Bangkok / Asia/Phnom_Penh (UTC+7)',
    timezoneOffsetDeltaHours: 12.0,
    nightShiftFlag: true,
    activeHoursDistributionSuspect: [
      2, 1, 0, 0, 0, 0, 1, 4, 12, 18, 22, 25, 28, 30, 24, 18, 10, 4, 2, 1, 1, 1, 2, 2
    ],
    latencyPatternMismatchScore: 92.5,
    diurnalConsistencyScore: 14.0,
    diagnosticObservations: [
      'Suspect maintains intense messaging activity between 02:00 AM and 06:00 AM Central Time (Chicago local time), corresponding precisely to 14:00 - 18:00 Indochina Time.',
      'Message response latency drops below 15 seconds consistently during Southeast Asian business hours, indicating live shift work in a syndicate fraud park rather than an American retail workday.',
      'Complete radio silence between 18:00 and 23:00 Chicago local time (06:00 - 11:00 UTC+7), reflecting natural human sleep cycles in the Eastern hemisphere.'
    ]
  },

  stylometricBreakdown: {
    formalityScore: 88.4,
    machineTranslationScore: 84.1,
    sentimentVolatilityScore: 76.5,
    vocabularyEntropyScore: 32.8,
    scriptTokenSimilarityIndex: 94.6,
    syntaxAnomalyCount: 7,
    detectedRomanceScamPatterns: [
      {
        patternId: 'SZP-PHASE2-UNCLE',
        category: 'PIG_BUTCHERING',
        matchedPhrase: 'analyzing the London gold market trends with my uncle. He is a senior analyst in Singapore',
        confidence: 0.99,
        severity: 'CRITICAL',
        contextExplanation: 'Verbatim script archetype: Introduction of an authoritative offshore family member who provides privileged insider financial guidance.',
        knownScriptVariant: 'Sha Zhu Pan Phase 2: Family Wealth Narrative & High-Status Grooming'
      },
      {
        patternId: 'SZP-PHASE3-PLATFORM',
        category: 'CRYPTO_INVESTMENT',
        matchedPhrase: 'Open this platform link I sent, I can teach you the 60-second option node',
        confidence: 0.98,
        severity: 'CRITICAL',
        contextExplanation: 'Direct solicitation to deposit funds onto an unvetted custom trading dApp controlled by the threat syndicate.',
        knownScriptVariant: 'Sha Zhu Pan Phase 3: Simulated Yield Lure'
      },
      {
        patternId: 'LOVEBOMB-DESTINY',
        category: 'MODEL_CATFISH',
        matchedPhrase: 'Fate brought us together on this small planet',
        confidence: 0.91,
        severity: 'HIGH',
        contextExplanation: 'Psychological compliance pre-framing: Elevating a casual match into a cosmic destiny to suppress critical scrutiny.',
        knownScriptVariant: 'Emotional Flooding / Accelerated Intimacy Trap'
      }
    ],
    translationArtifacts: [
      'Literal translation of East Asian relational honorifics ("small planet", "peaceful warmth")',
      'Absence of Midwestern American regional colloquialisms despite claimed Chicago residency',
      'Abnormal phrase structure: "guides my nodes" (machine translation error for trading terminals / orders)'
    ]
  },

  visualAvatarForensics: {
    syntheticFaceLikelihood: 91.2,
    generativeModelFamily: 'FLUX',
    compressionArtifactScore: 78.4,
    stockPhotoFlags: {
      isFlagged: true,
      matchDatabases: ['PIMEYES', 'FACECHECK_ID', 'INTERNAL_BLACKLIST'],
      similarityScore: 94.8,
      matchedProfileUrl: 'https://vk.com/albums/id84192031',
      originalModelIdentity: 'Alena K. (St. Petersburg Fashion Catalog Model, 2021 Harvest)'
    },
    biologicalConsistency: {
      irisPupilSymmetryScore: 42.0,
      earGeometryConsistencyScore: 38.5,
      backgroundDiffusionArtifactsDetected: true,
      lightingDirectionConsistencyScore: 48.0
    },
    imageHash: {
      perceptualHash: 'a7c4f1e839b20d41',
      dHash: '1f8e9a2b3c4d5e6f'
    }
  },

  actionableDefenseMatrix: [
    {
      id: 'e1a3b5c7-9d2f-481a-bb01-289456710001',
      category: 'LIVENESS_CHALLENGE',
      priority: 'URGENT',
      questionText: 'Can you send a quick 10-second video note waving your left hand with three fingers up while saying today is Thursday?',
      tacticalRationale: 'Defeats pre-recorded video loops and static avatar face-swapping engines. Dynamic micro-gestures cannot be synthesized in real-time by scripted scam call centers.',
      expectedTruthfulBehavior: 'Genuine match will comply playfully or laugh at the quirky request without emotional hostility.',
      redFlagResponsePattern: 'Claiming sudden broken smartphone camera, emotional trauma around video calls, strict company security NDA, or accusing you of having trust issues.'
    },
    {
      id: 'e1a3b5c7-9d2f-481a-bb01-289456710002',
      category: 'GEO_LOCAL_ANCHOR',
      priority: 'URGENT',
      questionText: 'Which exit do you usually take off the Kennedy Expressway when you commute back to Lincoln Park during evening rush hour?',
      tacticalRationale: 'Tests authentic somatic knowledge of local Chicago infrastructure. Scammers relying on Google Maps struggle with colloquial highway terminology and real commuter experience.',
      expectedTruthfulBehavior: 'Immediate casual answer naming specific streets (Armitage, Fullerton) or complaining about Chicago gridlock.',
      redFlagResponsePattern: 'Vague generic reply ("I just take the main road haha"), long delay while researching, or sudden deflection back to trading.'
    },
    {
      id: 'e1a3b5c7-9d2f-481a-bb01-289456710003',
      category: 'DIGITAL_BOUNDARIES_TEST',
      priority: 'RECOMMENDED',
      questionText: 'I have a strict rule never to register on foreign investment sites or discuss finances with people I haven’t met in person. Let’s focus strictly on getting coffee in Chicago this weekend.',
      tacticalRationale: 'Tests commercial intent. An authentic romantic suitor will immediately respect the boundary. A threat syndicate will become agitated, diminish the boundary, or slowly ghost.',
      expectedTruthfulBehavior: 'Complete agreement to drop the investment topic and enthusiastic confirmation of an offline coffee date.',
      redFlagResponsePattern: 'Insisting that you lack ambition, calling you closed-minded, claiming the trading opportunity expires tonight, or terminating the conversation.'
    }
  ],

  rawTelemetrySignature: 'SHA256:8f4b23c91a0e8d7742119ef5c830a618420b92d6e4a187f59d04b611894d3ce8'
};
