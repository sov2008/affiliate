import crypto from 'crypto';
import { CommentsRepository, SubmissionStatus } from '../db/comments.repository.js';

export interface ModerationInput {
  callsign: string;
  incidentType: string;
  evidenceText: string;
  honeypot?: string;
  ip: string;
  userAgent?: string;
}

export interface ModerationResult {
  status: SubmissionStatus;
  riskScore: number;
  flags: string[];
  ipHash: string;
  userAgentHash: string;
}

// Heuristic stop patterns
const LINK_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/i;
const MONEY_MESSENGERS_REGEX = /(t\.me\/|wa\.me\/|@cashapp|t\.me\/invest|telegram\.me\/)/i;
const CRYPTO_ADDR_REGEX = /(\b(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,39}\b|\b0x[a-fA-F0-9]{40}\b|\bT[a-zA-HJ-NP-Z0-9]{33}\b)/i;
const SPAM_KEYWORDS_REGEX = /\b(casino|slots|bonus|adult|porn|sex|viagra|loan|crypto\s*pump|investment\s*profit|double\s*your\s*btc|easy\s*money)\b/i;

export class AutoModerationService {
  private static instance: AutoModerationService | null = null;
  private commentsRepo: CommentsRepository;

  private constructor() {
    this.commentsRepo = CommentsRepository.getInstance();
  }

  public static getInstance(): AutoModerationService {
    if (!this.instance) {
      this.instance = new AutoModerationService();
    }
    return this.instance;
  }

  public static hashSha256(value: string): string {
    return crypto.createHash('sha256').update(value || '').digest('hex');
  }

  public evaluate(input: ModerationInput): ModerationResult {
    let riskScore = 0;
    const flags: string[] = [];

    const ipHash = AutoModerationService.hashSha256(input.ip || '127.0.0.1');
    const userAgentHash = AutoModerationService.hashSha256(input.userAgent || 'unknown');

    const text = (input.evidenceText || '').trim();
    const callsign = (input.callsign || '').trim();

    // 1. Honeypot Trap (+100 points -> REJECTED)
    if (input.honeypot && input.honeypot.trim().length > 0) {
      riskScore += 100;
      flags.push('HONEYPOT_TRIGGERED');
    }

    // 2. Links, Money Messengers & Crypto (+100 points -> REJECTED)
    if (LINK_REGEX.test(text) || LINK_REGEX.test(callsign)) {
      riskScore += 100;
      flags.push('EXTERNAL_LINK_DETECTED');
    }

    if (MONEY_MESSENGERS_REGEX.test(text) || MONEY_MESSENGERS_REGEX.test(callsign)) {
      riskScore += 100;
      flags.push('MONEY_MESSENGER_DETECTED');
    }

    if (CRYPTO_ADDR_REGEX.test(text) || CRYPTO_ADDR_REGEX.test(callsign)) {
      riskScore += 100;
      flags.push('CRYPTO_ADDRESS_DETECTED');
    }

    if (SPAM_KEYWORDS_REGEX.test(text) || SPAM_KEYWORDS_REGEX.test(callsign)) {
      riskScore += 100;
      flags.push('SPAM_KEYWORDS_TRIGGERED');
    }

    // 3. Text Ergonomics & Length
    if (text.length < 20) {
      riskScore += 40;
      flags.push('TEXT_TOO_SHORT');
    }

    if (text.length > 1200) {
      riskScore += 30;
      flags.push('TEXT_TOO_LONG');
    }

    // Excessive CAPS LOCK (> 35% uppercase letters if letter count > 15)
    const lettersOnly = text.replace(/[^a-zA-Zа-яА-Я]/g, '');
    if (lettersOnly.length > 15) {
      const upperCount = (text.match(/[A-ZА-Я]/g) || []).length;
      const upperRatio = upperCount / lettersOnly.length;
      if (upperRatio > 0.35) {
        riskScore += 40;
        flags.push('EXCESSIVE_CAPS_LOCK');
      }
    }

    // Callsign sanity check
    if (callsign.length < 3) {
      riskScore += 20;
      flags.push('CALLSIGN_TOO_SHORT');
    }

    // 4. Rate-limiting by IP Hash (> 3 submissions in 10 minutes)
    const recentSubmissions = this.commentsRepo.getRecentCountByIp(ipHash, 600);
    if (recentSubmissions >= 3) {
      riskScore += 80;
      flags.push('RATE_LIMIT_EXCEEDED');
    }

    // 5. Verdict determination
    let status: SubmissionStatus;
    if (riskScore < 30) {
      status = 'VERIFIED';
    } else if (riskScore < 70) {
      status = 'FLAGGED_AUTO';
    } else {
      status = 'REJECTED';
    }

    return {
      status,
      riskScore,
      flags,
      ipHash,
      userAgentHash,
    };
  }
}
