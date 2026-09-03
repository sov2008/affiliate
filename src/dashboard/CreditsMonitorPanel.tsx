/**
 * Credits Monitor Dashboard Component
 * Отображает в реальном времени расходование кредитов Groq и OpenRouter
 */

import React, { useEffect, useState } from 'react';

interface CreditsStatus {
  groq: {
    remaining: number;
    totalUsed: number;
    limit: number;
    percentUsed: string;
    dailyBurn: number;
    requestsCount: number;
    runoutDate: string | null;
    status: 'green' | 'yellow' | 'red';
  } | null;
  openRouter: {
    remaining: number;
    totalUsed: number;
    limit: number;
    percentUsed: string;
    dailyBurn: number;
    runoutDate: string | null;
    status: 'green' | 'yellow' | 'red';
  } | null;
  alerts: string[];
  lastChecked: string;
}

export function CreditsMonitorPanel(): React.ReactElement {
  const [credits, setCredits] = useState<CreditsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Загрузить данные сразу
    fetchCreditsStatus();

    // Обновлять каждые 5 минут
    const interval = setInterval(fetchCreditsStatus, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchCreditsStatus = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/credits/status');
      if (response.ok) {
        const data = await response.json();
        setCredits(data);
      }
    } catch (error) {
      console.error('Failed to fetch credits status:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return <div className="credits-loading">⏳ Загрузка информации о кредитах...</div>;
  }

  if (!credits) {
    return <div className="credits-error">❌ Не удалось загрузить информацию о кредитах</div>;
  }

  return (
    <div className="credits-monitor-panel">
      <div className="credits-header">
        <h2>🔋 Мониторинг кредитов</h2>
        <button
          onClick={fetchCreditsStatus}
          disabled={refreshing}
          className="refresh-button"
        >
          {refreshing ? '⟳ Обновление...' : '🔄 Обновить'}
        </button>
        <span className="last-checked">
          Обновлено: {new Date(credits.lastChecked).toLocaleTimeString('ru-RU')}
        </span>
      </div>

      {/* Алерты */}
      {credits.alerts.length > 0 && (
        <div className="credits-alerts">
          {credits.alerts.map((alert, idx) => (
            <div key={idx} className="alert-item">
              {alert}
            </div>
          ))}
        </div>
      )}

      <div className="credits-grid">
        {/* Groq */}
        {credits.groq && (
          <div className={`credit-card groq status-${credits.groq.status}`}>
            <h3>Groq API</h3>
            
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className={`progress-fill status-${credits.groq.status}`}
                  style={{ width: `${Math.min(parseFloat(credits.groq.percentUsed), 100)}%` }}
                />
              </div>
              <span className="percent-label">{credits.groq.percentUsed}%</span>
            </div>

            <div className="stats-grid">
              <div className="stat">
                <span className="label">Осталось:</span>
                <span className="value">${credits.groq.remaining.toLocaleString('ru-RU')}</span>
              </div>
              
              <div className="stat">
                <span className="label">Использовано:</span>
                <span className="value">${credits.groq.totalUsed.toLocaleString('ru-RU')}</span>
              </div>

              <div className="stat">
                <span className="label">Лимит:</span>
                <span className="value">${credits.groq.limit.toLocaleString('ru-RU')}</span>
              </div>

              <div className="stat">
                <span className="label">Дневное потребление:</span>
                <span className="value">${credits.groq.dailyBurn.toLocaleString('ru-RU')}</span>
              </div>

              <div className="stat">
                <span className="label">Запросов:</span>
                <span className="value">{credits.groq.requestsCount.toLocaleString('ru-RU')}</span>
              </div>

              {credits.groq.runoutDate && (
                <div className="stat">
                  <span className="label">Кредиты закончатся:</span>
                  <span className="value">{new Date(credits.groq.runoutDate).toLocaleDateString('ru-RU')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* OpenRouter */}
        {credits.openRouter && (
          <div className={`credit-card openrouter status-${credits.openRouter.status}`}>
            <h3>OpenRouter API</h3>
            
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className={`progress-fill status-${credits.openRouter.status}`}
                  style={{ width: `${Math.min(parseFloat(credits.openRouter.percentUsed), 100)}%` }}
                />
              </div>
              <span className="percent-label">{credits.openRouter.percentUsed}%</span>
            </div>

            <div className="stats-grid">
              <div className="stat">
                <span className="label">Осталось:</span>
                <span className="value">${credits.openRouter.remaining.toLocaleString('ru-RU')}</span>
              </div>
              
              <div className="stat">
                <span className="label">Использовано:</span>
                <span className="value">${credits.openRouter.totalUsed.toLocaleString('ru-RU')}</span>
              </div>

              <div className="stat">
                <span className="label">Лимит:</span>
                <span className="value">${credits.openRouter.limit.toLocaleString('ru-RU')}</span>
              </div>

              <div className="stat">
                <span className="label">Дневное потребление:</span>
                <span className="value">${credits.openRouter.dailyBurn.toLocaleString('ru-RU')}</span>
              </div>

              {credits.openRouter.runoutDate && (
                <div className="stat">
                  <span className="label">Кредиты закончатся:</span>
                  <span className="value">{new Date(credits.openRouter.runoutDate).toLocaleDateString('ru-RU')}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .credits-monitor-panel {
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .credits-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid rgba(255, 255, 255, 0.2);
        }

        .credits-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }

        .refresh-button {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 6px;
          color: white;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s;
        }

        .refresh-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
        }

        .refresh-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .last-checked {
          font-size: 12px;
          opacity: 0.8;
          margin-left: auto;
          padding-left: 20px;
        }

        .credits-alerts {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .alert-item {
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.15);
          border-left: 4px solid #ff6b6b;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
        }

        .credits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
        }

        .credit-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s;
        }

        .credit-card:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .credit-card h3 {
          margin: 0 0 15px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .credit-card.status-red {
          border-left: 4px solid #ff6b6b;
        }

        .credit-card.status-yellow {
          border-left: 4px solid #ffd93d;
        }

        .credit-card.status-green {
          border-left: 4px solid #6bcf7f;
        }

        .progress-container {
          margin-bottom: 20px;
          position: relative;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
          border-radius: 4px;
        }

        .progress-fill.status-green {
          background: linear-gradient(90deg, #6bcf7f, #4caf50);
        }

        .progress-fill.status-yellow {
          background: linear-gradient(90deg, #ffd93d, #ffb700);
        }

        .progress-fill.status-red {
          background: linear-gradient(90deg, #ff6b6b, #ff4444);
        }

        .percent-label {
          font-size: 12px;
          opacity: 0.8;
          display: inline-block;
          margin-top: 4px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat .label {
          font-size: 11px;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat .value {
          font-size: 16px;
          font-weight: 600;
          font-family: 'Monaco', 'Courier New', monospace;
        }

        .credits-loading,
        .credits-error {
          padding: 20px;
          text-align: center;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
