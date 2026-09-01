import { Router, Request, Response } from 'express';
import { PipelineOrchestrator } from '../../orchestrator/pipeline.js';
import { SocialPostingWorker } from '../../automation/postingWorker.js';
import { ScoutCoordinator } from '../../scouts/scoutCoordinator.js';
import { EmergencyStopController, RawContext, Platform } from '../../types/pipeline.js';
import { PromptDriftCalibrator } from '../../services/prompt-drift-calibrator.service.js';
import { CampaignScaffolder } from '../../services/campaign-scaffolder.service.js';
import { ContentQueueRepository } from '../../db/queueRepository.js';

export const actionsRouter = Router();

/**
 * 1. POST /api/actions/generate-batch
 * Generates copy and compliance evidence bundles through PipelineOrchestrator
 */
actionsRouter.post('/generate-batch', async (req: Request, res: Response) => {
  try {
    const count = Math.max(1, Math.min(parseInt(req.body.count, 10) || 3, 10));
    const campaignId = req.body.campaignId || 'cmp_trading_au';
    const platform = ((req.body.platform || 'reddit').toLowerCase() === 'quora' ? 'quora' : 'reddit') as Platform;
    const niche = req.body.niche || 'finance';

    console.log(`\n🎯 [ActionsRouter] Generating batch of ${count} items for campaign: ${campaignId} (${platform}/${niche})`);

    const orchestrator = new PipelineOrchestrator();
    const batchItems: RawContext[] = [];

    for (let i = 0; i < count; i++) {
      const topicIndex = i + 1;
      batchItems.push({
        platform,
        sourceUrl: `https://${platform}.com/r/${niche}/discussion_${Date.now()}_${topicIndex}`,
        topicTitle: `Automated Quant Trading and Arbitrage Strategies 2026 (Angle ${topicIndex})`,
        sourceText: `Looking for low-latency institutional execution algorithms to minimize slippage on high-volatility pairs.`,
        targetAudiencePain: 'High transaction costs and manual slippage',
        metadata: { niche, batchIndex: topicIndex, generatedVia: 'dashboard_action_dispatcher' },
      });
    }

    // Run batch in background/async
    const bundles = await orchestrator.processBatch(batchItems, campaignId, { concurrency: 2 });

    // Also register approved items in ContentQueueRepository for dispatch
    const queueRepo = ContentQueueRepository.getInstance();
    for (const b of bundles) {
      if (b.status === 'APPROVED' || (b.compliance && b.compliance.passed)) {
        queueRepo.enqueue({
          id: b.id,
          campaign_id: campaignId,
          network: campaignId.includes('lospollos') ? 'lospollos' : 'mylead',
          target_platform: platform === 'quora' ? 'quora' : 'reddit',
          hook: b.creative?.headline || 'High Performance Automated Arbitrage 2026',
          body: b.creative?.body || 'Verified quantitative execution framework.',
          stealth_cta: b.creative?.callToAction || 'Access Strategy Overview',
          tracking_url: `https://postback-engine.sov7.workers.dev/click?campaign_id=${campaignId}&click_id={click_id}`,
          image_path: '',
          risk_score: b.compliance?.score ? Math.round((100 - b.compliance.score) / 10) : 2,
          status: 'PENDING_APPROVAL',
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully generated ${bundles.length} evidence bundles`,
      count: bundles.length,
      bundles: bundles.map((b) => ({
        id: b.id,
        status: b.status,
        headline: b.creative?.headline,
        complianceScore: b.compliance?.score,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('❌ [ActionsRouter:generate-batch] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * 2. POST /api/actions/force-dispatch
 * Bypasses scheduler cooldown and immediately dispatches next approved item
 */
actionsRouter.post('/force-dispatch', async (req: Request, res: Response) => {
  try {
    const eStop = EmergencyStopController.getInstance();
    if (eStop.isHalted()) {
      return res.status(403).json({
        success: false,
        error: 'Cannot dispatch: Emergency Stop (E-STOP) is currently active.',
      });
    }

    const dryRun = req.body.dryRun === true;
    console.log(`\n🚀 [ActionsRouter] Force dispatch triggered (dryRun: ${dryRun})...`);

    const result = await SocialPostingWorker.dispatchNextApproved({
      headless: true,
    });

    if (!result) {
      return res.status(200).json({
        success: false,
        message: 'No APPROVED posts waiting in queue to dispatch.',
      });
    }

    return res.status(200).json({
      success: result.success,
      message: result.success ? 'Post dispatched successfully' : 'Dispatch failed with error',
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('❌ [ActionsRouter:force-dispatch] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * 3. POST /api/actions/trigger-scout
 * Runs multi-network scout discovery across LosPollos and MyLead
 */
actionsRouter.post('/trigger-scout', async (req: Request, res: Response) => {
  try {
    const network = req.body.network || 'both';
    const targetPlatform = req.body.platform || 'reddit';

    console.log(`\n📡 [ActionsRouter] Triggering Scout Coordinator (${network}/${targetPlatform})...`);

    const scoutResult = await ScoutCoordinator.runScoutAndPipeline({
      network,
      targetPlatform,
      executePipeline: false,
    });

    return res.status(200).json({
      success: true,
      message: `Scouted ${scoutResult.scoutedCount} offers from ${scoutResult.networkUsed.toUpperCase()}`,
      result: scoutResult,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('❌ [ActionsRouter:trigger-scout] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * 4. POST /api/actions/estop/trigger
 * Activates Emergency Stop circuit breaker
 */
actionsRouter.post('/estop/trigger', (req: Request, res: Response) => {
  try {
    const reason = req.body.reason || 'Operator triggered manual E-STOP via Dashboard';
    const operator = req.body.operator || 'DASHBOARD_OPERATOR';

    const eStop = EmergencyStopController.getInstance();
    eStop.trigger(reason, operator);

    return res.status(200).json({
      success: true,
      isHalted: true,
      message: 'EMERGENCY STOP ACTIVATED: All automated dispatches and workers halted.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 5. POST /api/actions/estop/reset
 * Clears Emergency Stop circuit breaker
 */
actionsRouter.post('/estop/reset', (req: Request, res: Response) => {
  try {
    const operator = req.body.operator || 'DASHBOARD_OPERATOR';

    const eStop = EmergencyStopController.getInstance();
    eStop.clear(operator);

    return res.status(200).json({
      success: true,
      isHalted: false,
      message: 'EMERGENCY STOP CLEARED: Pipeline and workers resumed.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 6. POST /api/actions/calibrate-prompts
 * Triggers AI Prompt Drift Calibrator
 */
actionsRouter.post('/calibrate-prompts', async (req: Request, res: Response) => {
  try {
    const calibrator = PromptDriftCalibrator.getInstance();
    const result = await calibrator.calibrate(req.body.stats);

    return res.status(200).json({
      success: true,
      message: `Prompt calibration complete: [${result.actionTaken}] Recommended Temp: ${result.recommendedTemperature}`,
      calibration: result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 7. POST /api/actions/scaffold-campaign
 * Auto-scaffolds localized landing pages and MAB router across target GEOs
 */
actionsRouter.post('/scaffold-campaign', async (req: Request, res: Response) => {
  try {
    const offerId = req.body.offerId;
    if (!offerId) {
      return res.status(400).json({ success: false, error: 'Missing required parameter: offerId' });
    }

    const vertical = (req.body.vertical || 'finance') as 'dating' | 'finance' | 'vpn' | 'crypto';
    const targetGeos = Array.isArray(req.body.geos) ? req.body.geos : ['US', 'DE', 'AU'];
    const basePayout = parseFloat(req.body.basePayout) || 120.0;
    const network = req.body.network || 'mylead';

    console.log(`\n🏗️ [ActionsRouter] Scaffolding multi-GEO campaign for ${offerId} [${targetGeos.join(', ')}]...`);

    const scaffolder = CampaignScaffolder.getInstance();
    const result = await scaffolder.scaffoldMultiGeo({
      offerId,
      vertical,
      targetGeos,
      basePayout,
      network,
    });

    return res.status(200).json({
      success: result.success,
      message: `Scaffolded ${result.scaffoldedCampaigns.length} GEO campaigns (${result.totalGeneratedVariants} variants)`,
      scaffold: result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 8. POST /api/actions/validate-links
 * Runs an end-to-end audit of landing page links, macros, and post tracking routes across active campaigns
 */
actionsRouter.post('/validate-links', async (req: Request, res: Response) => {
  try {
    const { LinkIntegrityService } = await import('../../services/link-integrity.service.js');
    const linkService = LinkIntegrityService.getInstance();

    const activeCampaigns = [
      { id: 'cmp_trading_au', variants: ['v1', 'v2'] },
      { id: 'cmp_elite_de', variants: ['v1', 'v2'] },
      { id: 'cmp_vpn_us', variants: ['v1', 'v2'] },
      { id: 'cmp_lospollos_dating', variants: ['v1', 'v2'] },
    ];

    const landingReports = [];
    let totalCheckedLinks = 0;
    let allValid = true;

    for (const c of activeCampaigns) {
      for (const v of c.variants) {
        const report = linkService.validateLandingPageLinks(c.id, v);
        landingReports.push(report);
        totalCheckedLinks += report.checkedCount;
        if (!report.isValid) allValid = false;
      }
    }

    // Also validate primary edge worker tracking endpoint
    const edgeProbe = await linkService.validateCpaUrl('https://postback-engine.sov7.workers.dev/click?campaign_id=cmp_trading_au&click_id=health_probe', 3);

    return res.status(200).json({
      success: true,
      isValid: allValid,
      totalCheckedTemplates: landingReports.length,
      totalCheckedLinks,
      edgeRouterHealth: {
        isValid: edgeProbe.isValid,
        statusCode: edgeProbe.statusCode,
        latencyMs: edgeProbe.latencyMs,
        hops: edgeProbe.hops,
      },
      reports: landingReports,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
