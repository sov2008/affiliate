/**
 * Credits Monitor API Router
 * Endpoints для получения информации о расходовании кредитов
 */

import { Router, Request, Response } from 'express';
import { CreditsMonitorService, CreditsConfig } from '../services/credits-monitor.service';

const router = Router();

let creditsMonitor: CreditsMonitorService | null = null;

/**
 * Инициализировать Credits Monitor
 */
export function initializeCreditsMonitor(
  groqApiKey?: string,
  openRouterApiKey?: string
): CreditsMonitorService | null {
  if (!groqApiKey && !openRouterApiKey) {
    console.warn(
      '⚠️ Credits Monitor: No API keys provided (GROQ_API_KEY or OPENROUTER_API_KEY)'
    );
    return null;
  }

  const config: CreditsConfig = {
    groqApiKey: groqApiKey || '',
    openRouterApiKey: openRouterApiKey || '',
    checkInterval: 300000, // 5 минут
  };

  creditsMonitor = new CreditsMonitorService(config);
  creditsMonitor.startMonitoring();

  return creditsMonitor;
}

/**
 * GET /api/credits/status
 * Получить текущий статус кредитов
 */
router.get('/status', async (req: Request, res: Response) => {
  if (!creditsMonitor) {
    return res.status(503).json({
      error: 'Credits monitor not initialized',
      message: 'API keys not configured',
    });
  }

  try {
    const status = await creditsMonitor.getDashboardStatus();
    res.json(status);
  } catch (error) {
    console.error('Credits status error:', error);
    res.status(500).json({
      error: 'Failed to fetch credits status',
      message: (error as Error).message,
    });
  }
});

/**
 * GET /api/credits/metrics
 * Получить полные метрики с историей и прогнозами
 */
router.get('/metrics', async (req: Request, res: Response) => {
  if (!creditsMonitor) {
    return res.status(503).json({
      error: 'Credits monitor not initialized',
    });
  }

  try {
    const metrics = await creditsMonitor.getMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Credits metrics error:', error);
    res.status(500).json({
      error: 'Failed to fetch credits metrics',
      message: (error as Error).message,
    });
  }
});

/**
 * GET /api/credits/export/csv
 * Экспортировать отчёт в CSV
 */
router.get('/export/csv', async (req: Request, res: Response) => {
  if (!creditsMonitor) {
    return res.status(503).json({
      error: 'Credits monitor not initialized',
    });
  }

  try {
    const csv = await creditsMonitor.getCSVReport();
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="credits-report-${new Date().toISOString().split('T')[0]}.csv"`
    );
    res.send(csv);
  } catch (error) {
    console.error('Credits export error:', error);
    res.status(500).json({
      error: 'Failed to export credits report',
      message: (error as Error).message,
    });
  }
});

/**
 * POST /api/credits/refresh
 * Принудительно обновить статус кредитов
 */
router.post('/refresh', async (req: Request, res: Response) => {
  if (!creditsMonitor) {
    return res.status(503).json({
      error: 'Credits monitor not initialized',
    });
  }

  try {
    const snapshot = await creditsMonitor.checkCredits();
    res.json({
      success: true,
      snapshot,
    });
  } catch (error) {
    console.error('Credits refresh error:', error);
    res.status(500).json({
      error: 'Failed to refresh credits',
      message: (error as Error).message,
    });
  }
});

export default router;
