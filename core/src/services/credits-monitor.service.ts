/**
 * Credits Monitor Service
 * Отслеживает расходование кредитов/токенов на Groq и OpenRouter API
 * Предоставляет real-time метрики использования и прогнозы
 */

import fs from 'fs';
import path from 'path';

interface CreditsConfig {
  groqApiKey: string;
  openRouterApiKey: string;
  checkInterval: number; // миллисекунды
}

interface GroqUsage {
  organization_id: string;
  organization_name: string;
  total_tokens_used: number;
  requests_count: number;
  remaining_credits: number;
  limit: number;
}

interface OpenRouterUsage {
  account_limit: number;
  account_usage: number;
  remaining: number;
  requests_count?: number;
}

interface CreditSnapshot {
  timestamp: Date;
  groq: {
    totalUsed: number;
    remaining: number;
    limit: number;
    requestsCount: number;
    percentUsed: number;
  } | null;
  openRouter: {
    totalUsed: number;
    remaining: number;
    limit: number;
    percentUsed: number;
  } | null;
}

interface CreditMetrics {
  current: CreditSnapshot;
  dailyTrend: CreditSnapshot[];
  dailyBurn: {
    groq: number;
    openRouter: number;
  };
  estimatedRunoutDate: {
    groq: string | null;
    openRouter: string | null;
  };
  alerts: string[];
}

class CreditsMonitorService {
  private config: CreditsConfig;
  private history: CreditSnapshot[] = [];
  private metricsFile: string;
  private lastCheckTime: number = 0;
  private checkInterval: number = 300000; // 5 минут по умолчанию

  constructor(config: CreditsConfig) {
    this.config = config;
    this.checkInterval = config.checkInterval || 300000;
    this.metricsFile = path.join(
      process.cwd(),
      '.antigravity',
      'credits-metrics.json'
    );
    
    // Создать директорию если её нет
    const dir = path.dirname(this.metricsFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.loadHistory();
  }

  /**
   * Запустить мониторинг в фоновом режиме
   */
  public startMonitoring(): void {
    console.log('🔋 Credits Monitor started');
    this.checkCredits(); // Первая проверка сразу
    
    setInterval(() => {
      this.checkCredits().catch(err => {
        console.error('❌ Credits check error:', err.message);
      });
    }, this.checkInterval);
  }

  /**
   * Проверить текущие кредиты обеих API
   */
  public async checkCredits(): Promise<CreditSnapshot> {
    const now = Date.now();
    if (now - this.lastCheckTime < 60000) {
      // Не проверять чаще, чем раз в минуту
      return this.history[this.history.length - 1] || this.createEmptySnapshot();
    }

    this.lastCheckTime = now;

    const snapshot: CreditSnapshot = {
      timestamp: new Date(),
      groq: await this.checkGroqCredits(),
      openRouter: await this.checkOpenRouterCredits(),
    };

    this.history.push(snapshot);
    
    // Хранить только последние 30 дней
    if (this.history.length > 4320) { // 30 дней * 24 часа * 6 проверок в час
      this.history.shift();
    }

    this.saveHistory();
    return snapshot;
  }

  /**
   * Получить метрики расходования кредитов
   */
  public async getMetrics(): Promise<CreditMetrics> {
    const current = await this.checkCredits();
    
    // История последних 24 часов
    const oneDayAgo = Date.now() - 86400000;
    const dailyTrend = this.history.filter(
      (s) => s.timestamp.getTime() > oneDayAgo
    );

    // Рассчитать дневное потребление
    const dailyBurn = {
      groq: 0,
      openRouter: 0,
    };

    if (dailyTrend.length >= 2) {
      const first = dailyTrend[0];
      const last = dailyTrend[dailyTrend.length - 1];
      
      if (first.groq && last.groq) {
        dailyBurn.groq = first.groq.totalUsed - last.groq.totalUsed;
      }
      if (first.openRouter && last.openRouter) {
        dailyBurn.openRouter = first.openRouter.totalUsed - last.openRouter.totalUsed;
      }
    }

    // Прогноз даты исчерпания кредитов
    const estimatedRunoutDate = {
      groq: this.estimateRunoutDate(current.groq, dailyBurn.groq),
      openRouter: this.estimateRunoutDate(current.openRouter, dailyBurn.openRouter),
    };

    // Генерировать алерты
    const alerts = this.generateAlerts(current, dailyBurn, estimatedRunoutDate);

    return {
      current,
      dailyTrend,
      dailyBurn,
      estimatedRunoutDate,
      alerts,
    };
  }

  /**
   * Получить статус для dashboard
   */
  public async getDashboardStatus(): Promise<Record<string, any>> {
    const metrics = await this.getMetrics();
    
    return {
      groq: metrics.current.groq ? {
        remaining: Math.round(metrics.current.groq.remaining),
        totalUsed: Math.round(metrics.current.groq.totalUsed),
        limit: Math.round(metrics.current.groq.limit),
        percentUsed: metrics.current.groq.percentUsed.toFixed(1),
        dailyBurn: Math.round(metrics.dailyBurn.groq),
        requestsCount: metrics.current.groq.requestsCount,
        runoutDate: metrics.estimatedRunoutDate.groq,
        status: this.getStatusColor(metrics.current.groq.percentUsed),
      } : null,
      
      openRouter: metrics.current.openRouter ? {
        remaining: Math.round(metrics.current.openRouter.remaining),
        totalUsed: Math.round(metrics.current.openRouter.totalUsed),
        limit: Math.round(metrics.current.openRouter.limit),
        percentUsed: metrics.current.openRouter.percentUsed.toFixed(1),
        dailyBurn: Math.round(metrics.dailyBurn.openRouter),
        runoutDate: metrics.estimatedRunoutDate.openRouter,
        status: this.getStatusColor(metrics.current.openRouter.percentUsed),
      } : null,

      alerts: metrics.alerts,
      lastChecked: metrics.current.timestamp.toISOString(),
    };
  }

  /**
   * Проверить кредиты Groq
   */
  private async checkGroqCredits(): Promise<CreditSnapshot['groq']> {
    if (!this.config.groqApiKey) {
      return null;
    }

    try {
      const response = await fetch('https://api.groq.com/usage', {
        headers: {
          Authorization: `Bearer ${this.config.groqApiKey}`,
        },
      });

      if (!response.ok) {
        console.warn('⚠️ Groq API response status:', response.status);
        return null;
      }

      const data = (await response.json()) as GroqUsage;

      return {
        totalUsed: data.total_tokens_used,
        remaining: data.remaining_credits,
        limit: data.limit,
        requestsCount: data.requests_count,
        percentUsed: (data.total_tokens_used / data.limit) * 100,
      };
    } catch (error) {
      console.error('❌ Groq API check failed:', (error as Error).message);
      return null;
    }
  }

  /**
   * Проверить кредиты OpenRouter
   */
  private async checkOpenRouterCredits(): Promise<CreditSnapshot['openRouter']> {
    if (!this.config.openRouterApiKey) {
      return null;
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/auth/key/limits', {
        headers: {
          Authorization: `Bearer ${this.config.openRouterApiKey}`,
        },
      });

      if (!response.ok) {
        console.warn('⚠️ OpenRouter API response status:', response.status);
        return null;
      }

      const data = (await response.json()) as OpenRouterUsage;

      return {
        totalUsed: data.account_usage,
        remaining: data.remaining,
        limit: data.account_limit,
        percentUsed: (data.account_usage / data.account_limit) * 100,
      };
    } catch (error) {
      console.error('❌ OpenRouter API check failed:', (error as Error).message);
      return null;
    }
  }

  /**
   * Рассчитать прогнозную дату исчерпания кредитов
   */
  private estimateRunoutDate(
    snapshot: CreditSnapshot['groq'] | CreditSnapshot['openRouter'] | null,
    dailyBurn: number
  ): string | null {
    if (!snapshot || dailyBurn <= 0) {
      return null;
    }

    const daysRemaining = snapshot.remaining / dailyBurn;
    if (!isFinite(daysRemaining) || daysRemaining < 0) {
      return null;
    }

    const runoutDate = new Date();
    runoutDate.setDate(runoutDate.getDate() + daysRemaining);
    return runoutDate.toISOString().split('T')[0];
  }

  /**
   * Генерировать алерты на основе метрик
   */
  private generateAlerts(
    current: CreditSnapshot,
    dailyBurn: { groq: number; openRouter: number },
    estimatedRunoutDate: { groq: string | null; openRouter: string | null }
  ): string[] {
    const alerts: string[] = [];

    // Groq алерты
    if (current.groq) {
      if (current.groq.percentUsed > 90) {
        alerts.push('🔴 Groq: используется более 90% кредитов!');
      } else if (current.groq.percentUsed > 75) {
        alerts.push('🟠 Groq: используется более 75% кредитов');
      }

      if (estimatedRunoutDate.groq) {
        const runoutDate = new Date(estimatedRunoutDate.groq);
        const daysUntilRunout = Math.ceil(
          (runoutDate.getTime() - Date.now()) / 86400000
        );
        
        if (daysUntilRunout <= 3) {
          alerts.push(
            `🔴 Groq: кредиты закончатся через ${daysUntilRunout} дней`
          );
        } else if (daysUntilRunout <= 7) {
          alerts.push(
            `🟠 Groq: кредиты закончатся через ${daysUntilRunout} дней`
          );
        }
      }
    }

    // OpenRouter алерты
    if (current.openRouter) {
      if (current.openRouter.percentUsed > 90) {
        alerts.push('🔴 OpenRouter: используется более 90% кредитов!');
      } else if (current.openRouter.percentUsed > 75) {
        alerts.push('🟠 OpenRouter: используется более 75% кредитов');
      }

      if (estimatedRunoutDate.openRouter) {
        const runoutDate = new Date(estimatedRunoutDate.openRouter);
        const daysUntilRunout = Math.ceil(
          (runoutDate.getTime() - Date.now()) / 86400000
        );
        
        if (daysUntilRunout <= 3) {
          alerts.push(
            `🔴 OpenRouter: кредиты закончатся через ${daysUntilRunout} дней`
          );
        } else if (daysUntilRunout <= 7) {
          alerts.push(
            `🟠 OpenRouter: кредиты закончатся через ${daysUntilRunout} дней`
          );
        }
      }
    }

    return alerts;
  }

  /**
   * Получить цвет статуса (зелёный/жёлтый/красный)
   */
  private getStatusColor(percentUsed: number): string {
    if (percentUsed > 90) return 'red';
    if (percentUsed > 75) return 'yellow';
    return 'green';
  }

  /**
   * Загрузить историю из файла
   */
  private loadHistory(): void {
    try {
      if (fs.existsSync(this.metricsFile)) {
        const data = fs.readFileSync(this.metricsFile, 'utf-8');
        const parsed = JSON.parse(data);
        this.history = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
      }
    } catch (error) {
      console.warn('⚠️ Could not load credits history:', (error as Error).message);
    }
  }

  /**
   * Сохранить историю в файл
   */
  private saveHistory(): void {
    try {
      fs.writeFileSync(
        this.metricsFile,
        JSON.stringify(this.history, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('❌ Could not save credits history:', (error as Error).message);
    }
  }

  /**
   * Создать пустой snapshot
   */
  private createEmptySnapshot(): CreditSnapshot {
    return {
      timestamp: new Date(),
      groq: null,
      openRouter: null,
    };
  }

  /**
   * Получить экспортируемый CSV отчёт
   */
  public async getCSVReport(): Promise<string> {
    const metrics = await this.getMetrics();
    
    let csv = 'Timestamp,Provider,Remaining,TotalUsed,Limit,PercentUsed,DailyBurn\n';

    metrics.dailyTrend.forEach((snapshot) => {
      if (snapshot.groq) {
        csv += `${snapshot.timestamp.toISOString()},Groq,${snapshot.groq.remaining},${snapshot.groq.totalUsed},${snapshot.groq.limit},${snapshot.groq.percentUsed.toFixed(2)},${metrics.dailyBurn.groq}\n`;
      }
      if (snapshot.openRouter) {
        csv += `${snapshot.timestamp.toISOString()},OpenRouter,${snapshot.openRouter.remaining},${snapshot.openRouter.totalUsed},${snapshot.openRouter.limit},${snapshot.openRouter.percentUsed.toFixed(2)},${metrics.dailyBurn.openRouter}\n`;
      }
    });

    return csv;
  }
}

export { CreditsMonitorService, CreditMetrics, CreditsConfig };
