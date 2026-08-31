import { z } from 'zod';

export const OfferSchema = z.object({
  id: z.string(),
  name: z.string(),
  vertical: z.string(),
  payout: z.number(),
  targetGeo: z.array(z.string()),
  affiliateUrlTemplate: z.string(),
  variantAngle: z.string().optional(),
});

export type Offer = z.infer<typeof OfferSchema>;

export const CampaignConfigSchema = z.object({
  campaignId: z.string(),
  offerId: z.string(),
  templateName: z.string(),
  subIds: z.record(z.string(), z.string()).optional(),
  trafficSource: z.string(),
});

export type CampaignConfig = z.infer<typeof CampaignConfigSchema>;

export const PostbackPayloadSchema = z.object({
  clickId: z.string(),
  payout: z.number(),
  status: z.enum(['pending', 'approved', 'rejected']),
  campaignId: z.string(),
});

export type PostbackPayload = z.infer<typeof PostbackPayloadSchema>;
