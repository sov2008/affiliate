/**
 * Credits Monitor Service Tests
 * Проверка функциональности мониторинга расходования кредитов
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { CreditsMonitorService } from '../services/credits-monitor.service';

describe('CreditsMonitorService', () => {
  let service: CreditsMonitorService;

  beforeAll(() => {
    service = new CreditsMonitorService({
      groqApiKey: process.env.GROQ_API_KEY || '',
      openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
      checkInterval: 60000,
    });
  });

  it('should initialize without error', () => {
    expect(service).toBeDefined();
  });

  it('should check credits successfully', async () => {
    const snapshot = await service.checkCredits();
    expect(snapshot).toBeDefined();
    expect(snapshot.timestamp).toBeInstanceOf(Date);
  });

  it('should provide dashboard status', async () => {
    const status = await service.getDashboardStatus();
    expect(status).toBeDefined();
    expect(status.lastChecked).toBeDefined();
    expect(Array.isArray(status.alerts)).toBe(true);
  });

  it('should calculate metrics correctly', async () => {
    const metrics = await service.getMetrics();
    expect(metrics).toBeDefined();
    expect(metrics.current).toBeDefined();
    expect(Array.isArray(metrics.dailyTrend)).toBe(true);
    expect(metrics.dailyBurn).toBeDefined();
    expect(metrics.estimatedRunoutDate).toBeDefined();
  });

  it('should generate CSV report', async () => {
    const csv = await service.getCSVReport();
    expect(typeof csv).toBe('string');
    expect(csv).toContain('Timestamp');
    expect(csv).toContain('Provider');
  });

  it('should handle missing API keys gracefully', async () => {
    const emptyService = new CreditsMonitorService({
      groqApiKey: '',
      openRouterApiKey: '',
      checkInterval: 60000,
    });

    const status = await emptyService.getDashboardStatus();
    expect(status).toBeDefined();
  });
});
