import { AffiliateAdapterFactory } from '../adapters/adapterFactory.js';
import { PrelanderType, TrackingParams } from '../adapters/affiliateAdapter.interface.js';

export interface PrelanderConfigOptions {
  campaignId: string;
  niche: string;
  headline?: string;
  targetPlatform?: string;
  geo?: string;
  clickId?: string;
  variant?: string;
}

export interface QuizStep {
  step: number;
  question: string;
  options: string[];
}

export interface ReviewAuthor {
  name: string;
  role: string;
  avatar: string;
  verified: boolean;
}

export interface PrelanderMetadataPayload {
  campaignId: string;
  niche: string;
  prelanderType: PrelanderType;
  network: string;
  outboundUrl: string;
  meta: {
    title: string;
    description: string;
    badge: string;
    ctaButtonText: string;
  };
  tracking: {
    clickId: string;
    subParams: Record<string, string>;
    forwardingUrlPattern: string;
  };
  quiz?: {
    steps: QuizStep[];
    passingThresholdNote: string;
  };
  editorial?: {
    author: ReviewAuthor;
    rating: number;
    ratingCount: number;
    highlights: string[];
    readTimeMinutes: number;
  };
  createdAt: string;
}

export class PrelanderService {
  /**
   * Generates dynamic pre-lander metadata and tracking configuration
   * consumed by Cloudflare Workers and Edge HTML renderers.
   */
  public static generatePrelanderConfig(options: PrelanderConfigOptions): PrelanderMetadataPayload {
    const adapter = AffiliateAdapterFactory.getAdapterForCampaign(options.campaignId);
    const prelanderType = adapter.getPrelanderType(options.niche);
    const clickId = options.clickId || `clk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const geo = options.geo || 'US';
    const variant = options.variant || 'v1';

    const trackingParams: TrackingParams = {
      clickId,
      campaignId: options.campaignId,
      source: options.targetPlatform || 'reddit',
      variant,
      geo,
    };

    const outboundUrl = adapter.buildTrackingUrl(trackingParams);

    let title = '';
    let description = '';
    let badge = '';
    let ctaButtonText = '';

    if (prelanderType === 'quiz_gate') {
      title = options.headline || 'Exclusive Community Match & Compatibility Verification';
      description = 'Complete the 30-second lifestyle check to unlock verified verified singles in your region.';
      badge = '⚡ 100% VERIFIED COMMUNITY PROFILES';
      ctaButtonText = 'Unlock My Matches Now →';
    } else {
      title = options.headline || 'Independent Editorial Benchmark & Performance Review (2026 Edition)';
      description = 'An in-depth breakdown of features, reliability metrics, security audits, and user sentiment.';
      badge = '🛡️ INDEPENDENT EDITORIAL AUDIT';
      ctaButtonText = 'Claim Exclusive Access / Free Trial →';
    }

    const payload: PrelanderMetadataPayload = {
      campaignId: options.campaignId,
      niche: options.niche,
      prelanderType,
      network: adapter.name,
      outboundUrl,
      meta: {
        title,
        description,
        badge,
        ctaButtonText,
      },
      tracking: {
        clickId,
        subParams: {
          click_id: clickId,
          campaign: options.campaignId,
          source: options.targetPlatform || 'reddit',
          geo,
          variant,
        },
        forwardingUrlPattern: outboundUrl,
      },
      createdAt: new Date().toISOString(),
    };

    if (prelanderType === 'quiz_gate') {
      payload.quiz = {
        steps: [
          {
            step: 1,
            question: 'What is your primary relationship preference for 2026?',
            options: ['Meaningful Long-Term Connection', 'Casual Dating & Lifestyle Meetups', 'Expanding Social Circle'],
          },
          {
            step: 2,
            question: 'Are you looking for verified professionals in your local area?',
            options: ['Yes, exclusively within 25 miles', 'Open to travel & regional matches', 'Flexible / Remote'],
          },
          {
            step: 3,
            question: 'Do you agree to respect community guidelines & genuine communication?',
            options: ['I Agree — Show My Compatible Matches', 'Review Guidelines'],
          },
        ],
        passingThresholdNote: 'Verification Score: 100% Compatible with Active Regional Pool',
      };
    } else {
      payload.editorial = {
        author: {
          name: 'Alex Mercer',
          role: 'Senior Tech & Platform Analyst',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          verified: true,
        },
        rating: 4.9,
        ratingCount: 1420,
        highlights: [
          'Military-grade security and zero-log architecture verified',
          'Instant setup with automated AI assisted onboarding',
          'Top-tier payout efficiency and real-time response rates',
        ],
        readTimeMinutes: 3,
      };
    }

    return payload;
  }

  /**
   * Helper utility to append and forward SubIDs across pre-lander redirects.
   */
  public static injectTrackingSubIDs(targetUrl: string, params: Record<string, string>): string {
    const url = new URL(targetUrl);
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        url.searchParams.set(key, value);
      }
    }
    return url.toString();
  }
}
