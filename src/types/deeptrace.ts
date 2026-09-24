import { z } from 'zod';

// ============================================================================
// 1. Core Forensic Enums
// ============================================================================

export const PlatformTypeEnum = z.enum([
  'TINDER',
  'BUMBLE',
  'HINGE',
  'TELEGRAM',
  'WHATSAPP',
  'INSTAGRAM',
  'IMESSAGE',
  'SIGNAL',
  'OTHER'
]);
export type PlatformType = z.infer<typeof PlatformTypeEnum>;

export const ClaimedGenderEnum = z.enum([
  'MALE',
  'FEMALE',
  'NON_BINARY',
  'OTHER'
]);
export type ClaimedGender = z.infer<typeof ClaimedGenderEnum>;

export const MessageAuthorEnum = z.enum([
  'USER',
  'SUSPECT',
  'SYSTEM'
]);
export type MessageAuthor = z.infer<typeof MessageAuthorEnum>;

export const RiskLevelEnum = z.enum([
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
]);
export type RiskLevel = z.infer<typeof RiskLevelEnum>;

export const ChatAnomalyEnum = z.enum([
  'SCRIPT_TOKEN_MATCH',
  'RAPID_FIRE_BURST',
  'TIMEZONE_MISMATCH',
  'MONEY_REDIRECT_ATTEMPT',
  'CRYPTO_TERMINAL_MENTION',
  'OFF_PLATFORM_PRESSURE',
  'UNUSUAL_FORMALITY',
  'VAGUELY_EVASIVE',
  'PREMATURE_AFFECTION',
  'EMOJI_OVERLOAD',
  'PHONE_NUMBER_SOLICITATION',
  'SUSPICIOUS_LINK',
  'DEFENSIVE_REVERSAL'
]);
export type ChatAnomaly = z.infer<typeof ChatAnomalyEnum>;

export const RomanceScamCategoryEnum = z.enum([
  'PIG_BUTCHERING',
  'MILITARY_ROMANCE',
  'CRYPTO_INVESTMENT',
  'EMERGENCY_WIRE',
  'GIFT_CARD_FRAUD',
  'MODEL_CATFISH',
  'INHERITANCE_COURIER'
]);
export type RomanceScamCategory = z.infer<typeof RomanceScamCategoryEnum>;

export const GenerativeModelFamilyEnum = z.enum([
  'STABLE_DIFFUSION',
  'FLUX',
  'MIDJOURNEY',
  'STYLEGAN',
  'DALL_E',
  'UNKNOWN'
]);
export type GenerativeModelFamily = z.infer<typeof GenerativeModelFamilyEnum>;

export const OSINTDatabaseSourceEnum = z.enum([
  'PIMEYES',
  'FACECHECK_ID',
  'YANDEX',
  'GOOGLE_LENS',
  'SEARCH4FACES',
  'INTERNAL_BLACKLIST'
]);
export type OSINTDatabaseSource = z.infer<typeof OSINTDatabaseSourceEnum>;

export const DefenseChallengeCategoryEnum = z.enum([
  'LIVENESS_CHALLENGE',
  'GEO_LOCAL_ANCHOR',
  'PROFESSIONAL_KNOWLEDGE',
  'TEMPORAL_CHECK',
  'DIGITAL_BOUNDARIES_TEST'
]);
export type DefenseChallengeCategory = z.infer<typeof DefenseChallengeCategoryEnum>;

export const DefensePriorityEnum = z.enum([
  'URGENT',
  'RECOMMENDED',
  'OPTIONAL'
]);
export type DefensePriority = z.infer<typeof DefensePriorityEnum>;

export const ForensicDepthEnum = z.enum([
  'STANDARD',
  'DEEP',
  'CRIMINAL_SYNDICATE_SWEEP'
]);
export type ForensicDepth = z.infer<typeof ForensicDepthEnum>;

// ============================================================================
// 2. Input Schemas & Inferred Types
// ============================================================================

export const DeepTraceInputMetadataSchema = z.object({
  declaredLocation: z.string().trim().max(120).optional(),
  declaredTimezone: z.string().trim().max(60).optional(),
  claimedAge: z.number().int().min(18).max(99).optional(),
  claimedGender: ClaimedGenderEnum.optional(),
  platformType: PlatformTypeEnum.default('OTHER'),
  targetHandle: z.string().trim().max(80).optional(),
  suspectDisplayName: z.string().trim().max(100).optional(),
  contextNotes: z.string().trim().max(1000).optional()
});
export type DeepTraceInputMetadata = z.infer<typeof DeepTraceInputMetadataSchema>;

export const DeepTraceAnalysisInputSchema = z.object({
  imageBuffer: z.string().min(64, 'Image buffer or base64 payload is required'),
  imageMimeType: z.enum(['image/png', 'image/jpeg', 'image/webp', 'image/heic']).default('image/png'),
  metadata: DeepTraceInputMetadataSchema.optional(),
  requestedForensicDepth: ForensicDepthEnum.default('STANDARD')
});
export type DeepTraceAnalysisInput = z.infer<typeof DeepTraceAnalysisInputSchema>;

// ============================================================================
// 3. Extraction DTO Schemas
// ============================================================================

export const ParsedChatMessageSchema = z.object({
  id: z.string().uuid(),
  sequenceIndex: z.number().int().min(0),
  timestamp: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)),
  rawTimestampText: z.string().max(30).optional(),
  author: MessageAuthorEnum,
  text: z.string().min(1),
  detectedLanguage: z.string().length(2), // ISO-639-1 (e.g., 'en', 'ru')
  confidence: z.number().min(0).max(1),
  anomalies: z.array(ChatAnomalyEnum)
});
export type ParsedChatMessage = z.infer<typeof ParsedChatMessageSchema>;

export const ExtractionDTOSchema = z.object({
  conversationId: z.string().uuid(),
  detectedPlatform: PlatformTypeEnum,
  totalMessagesExtracted: z.number().int().min(0),
  suspectMessageCount: z.number().int().min(0),
  userMessageCount: z.number().int().min(0),
  parsedMessages: z.array(ParsedChatMessageSchema),
  conversationTimespanMinutes: z.number().min(0),
  averageSuspectLatencySeconds: z.number().min(0),
  detectedLanguages: z.array(z.string()),
  extractedUrls: z.array(z.string().url()),
  extractedPhoneNumbers: z.array(z.string()),
  extractedCryptoAddresses: z.array(z.string())
});
export type ExtractionDTO = z.infer<typeof ExtractionDTOSchema>;

// ============================================================================
// 4. Sub-Analytics Schemas (Trust, Timezone, Stylometry, Avatar)
// ============================================================================

export const OverallTrustIndexSchema = z.object({
  score: z.number().min(0).max(100),
  riskLevel: RiskLevelEnum,
  confidence: z.number().min(0).max(1),
  executiveVerdict: z.string().min(10),
  primaryRiskDrivers: z.array(z.string()).min(1)
});
export type OverallTrustIndex = z.infer<typeof OverallTrustIndexSchema>;

export const TimezoneBioRhythmAnomaliesSchema = z.object({
  claimedTimezone: z.string(),
  inferredTimezone: z.string(),
  timezoneOffsetDeltaHours: z.number(),
  nightShiftFlag: z.boolean(),
  activeHoursDistributionSuspect: z.array(z.number().min(0).max(100)).length(24),
  latencyPatternMismatchScore: z.number().min(0).max(100),
  diurnalConsistencyScore: z.number().min(0).max(100),
  diagnosticObservations: z.array(z.string())
});
export type TimezoneBioRhythmAnomalies = z.infer<typeof TimezoneBioRhythmAnomaliesSchema>;

export const RomanceScamPatternMatchSchema = z.object({
  patternId: z.string(),
  category: RomanceScamCategoryEnum,
  matchedPhrase: z.string(),
  confidence: z.number().min(0).max(1),
  severity: RiskLevelEnum,
  contextExplanation: z.string(),
  knownScriptVariant: z.string()
});
export type RomanceScamPatternMatch = z.infer<typeof RomanceScamPatternMatchSchema>;

export const StylometricBreakdownSchema = z.object({
  formalityScore: z.number().min(0).max(100),
  machineTranslationScore: z.number().min(0).max(100),
  sentimentVolatilityScore: z.number().min(0).max(100),
  vocabularyEntropyScore: z.number().min(0).max(100),
  scriptTokenSimilarityIndex: z.number().min(0).max(100),
  syntaxAnomalyCount: z.number().int().min(0),
  detectedRomanceScamPatterns: z.array(RomanceScamPatternMatchSchema),
  translationArtifacts: z.array(z.string())
});
export type StylometricBreakdown = z.infer<typeof StylometricBreakdownSchema>;

export const StockPhotoMatchSchema = z.object({
  isFlagged: z.boolean(),
  matchDatabases: z.array(OSINTDatabaseSourceEnum),
  similarityScore: z.number().min(0).max(100),
  matchedProfileUrl: z.string().url().optional(),
  originalModelIdentity: z.string().optional()
});
export type StockPhotoMatch = z.infer<typeof StockPhotoMatchSchema>;

export const BiologicalConsistencySchema = z.object({
  irisPupilSymmetryScore: z.number().min(0).max(100),
  earGeometryConsistencyScore: z.number().min(0).max(100),
  backgroundDiffusionArtifactsDetected: z.boolean(),
  lightingDirectionConsistencyScore: z.number().min(0).max(100)
});
export type BiologicalConsistency = z.infer<typeof BiologicalConsistencySchema>;

export const VisualAvatarForensicsSchema = z.object({
  syntheticFaceLikelihood: z.number().min(0).max(100),
  generativeModelFamily: GenerativeModelFamilyEnum.optional(),
  compressionArtifactScore: z.number().min(0).max(100),
  stockPhotoFlags: StockPhotoMatchSchema,
  biologicalConsistency: BiologicalConsistencySchema,
  imageHash: z.object({
    perceptualHash: z.string(),
    dHash: z.string()
  })
});
export type VisualAvatarForensics = z.infer<typeof VisualAvatarForensicsSchema>;

export const ActionableDefenseItemSchema = z.object({
  id: z.string().uuid(),
  category: DefenseChallengeCategoryEnum,
  priority: DefensePriorityEnum,
  questionText: z.string().min(5),
  tacticalRationale: z.string().min(10),
  expectedTruthfulBehavior: z.string().min(10),
  redFlagResponsePattern: z.string().min(10)
});
export type ActionableDefenseItem = z.infer<typeof ActionableDefenseItemSchema>;

// ============================================================================
// 5. Master DeepTrace Report DTO Schema
// ============================================================================

export const DeepTraceReportDTOSchema = z.object({
  reportId: z.string().uuid(),
  caseReference: z.string().regex(/^DT-\d{4}-[A-Z0-9]{4,10}$/),
  analyzedAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)),
  inputMetadata: DeepTraceInputMetadataSchema,
  extractionSummary: ExtractionDTOSchema,
  overallTrustIndex: OverallTrustIndexSchema,
  timezoneBioRhythmAnomalies: TimezoneBioRhythmAnomaliesSchema,
  stylometricBreakdown: StylometricBreakdownSchema,
  visualAvatarForensics: VisualAvatarForensicsSchema,
  actionableDefenseMatrix: z.array(ActionableDefenseItemSchema).min(1),
  rawTelemetrySignature: z.string()
});
export type DeepTraceReportDTO = z.infer<typeof DeepTraceReportDTOSchema>;
