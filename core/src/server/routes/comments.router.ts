import { Router, Request, Response } from 'express';
import { CommentsRepository } from '../../db/comments.repository.js';
import { AutoModerationService } from '../../services/automod.service.js';

export const commentsRouter = Router();

const commentsRepo = CommentsRepository.getInstance();
const automod = AutoModerationService.getInstance();

function extractClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string') {
    return realIp.trim();
  }
  return req.ip || req.socket.remoteAddress || '127.0.0.1';
}

/**
 * GET /api/comments/:postSlug
 * Returns verified case submissions for the given post slug
 */
commentsRouter.get('/api/comments/:postSlug', (req: Request, res: Response): void => {
  try {
    const rawSlug = req.params.postSlug;
    const postSlug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
    if (!postSlug) {
      res.status(400).json({ error: 'Post slug parameter is required' });
      return;
    }

    const verified = commentsRepo.getVerifiedBySlug(postSlug);
    const sanitized = verified.map((item) => ({
      id: item.id,
      author_callsign: item.author_callsign,
      incident_type: item.incident_type,
      evidence_text: item.evidence_text,
      created_at: item.created_at,
    }));

    res.json({
      success: true,
      postSlug,
      total: sanitized.length,
      comments: sanitized,
    });
  } catch (err: any) {
    console.error(`[commentsRouter] GET error: ${err.message}`);
    res.status(500).json({ error: 'Internal telemetry retrieval failure' });
  }
});

/**
 * POST /api/comments/:postSlug
 * Evaluates, automoderates, and records an incident submission
 */
commentsRouter.post('/api/comments/:postSlug', (req: Request, res: Response): void => {
  try {
    const rawSlug = req.params.postSlug;
    const postSlug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
    if (!postSlug) {
      res.status(400).json({ success: false, error: 'Post slug parameter is required' });
      return;
    }

    const body = req.body || {};
    const callsign = String(body.callsign || body.author_callsign || 'Observer_Anonymous').trim();
    const incidentType = String(body.incidentType || body.incident_type || 'Other').trim();
    const evidenceText = String(body.evidenceText || body.evidence_text || '').trim();
    const honeypot = String(body.telemetry_token_field || body.honeypot || '').trim();

    const clientIp = extractClientIp(req);
    const userAgent = String(req.headers['user-agent'] || '');

    // Heuristic Auto-Moderation Evaluation
    const evalResult = automod.evaluate({
      callsign,
      incidentType,
      evidenceText,
      honeypot,
      ip: clientIp,
      userAgent,
    });

    if (evalResult.status === 'REJECTED') {
      res.status(400).json({
        success: false,
        status: 'REJECTED',
        error: `Submission rejected by security heuristics protocol: ${evalResult.flags.join(', ')}`,
        riskScore: evalResult.riskScore,
        flags: evalResult.flags,
      });
      return;
    }

    // Persist into SQLite
    const inserted = commentsRepo.insertSubmission({
      post_slug: postSlug,
      author_callsign: callsign,
      incident_type: incidentType,
      evidence_text: evidenceText,
      status: evalResult.status,
      risk_score: evalResult.riskScore,
      moderation_flags: evalResult.flags.join('; '),
      ip_hash: evalResult.ipHash,
      user_agent_hash: evalResult.userAgentHash,
    });

    if (evalResult.status === 'VERIFIED') {
      res.status(201).json({
        success: true,
        status: 'VERIFIED',
        message: 'Field incident record verified and published.',
        comment: {
          id: inserted.id,
          author_callsign: inserted.author_callsign,
          incident_type: inserted.incident_type,
          evidence_text: inserted.evidence_text,
          created_at: inserted.created_at,
        },
      });
      return;
    }

    // FLAGGED_AUTO (held for editorial queue)
    res.status(202).json({
      success: true,
      status: 'FLAGGED_AUTO',
      message: 'Field submission queued for manual editorial review.',
      id: inserted.id,
    });
  } catch (err: any) {
    console.error(`[commentsRouter] POST error: ${err.message}`);
    res.status(500).json({ success: false, error: 'Failed to record case submission telemetry' });
  }
});
