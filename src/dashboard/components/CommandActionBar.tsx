import React, { useState, useEffect } from 'react';

export interface CommandActionBarProps {
  isEstopHalted?: boolean;
  onEstopToggle?: (isHalted: boolean) => void;
  onActionTriggered?: (actionName: string, payload: any) => void;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

export const CommandActionBar: React.FC<CommandActionBarProps> = ({
  isEstopHalted = false,
  onEstopToggle,
  onActionTriggered,
}) => {
  const [isHalted, setIsHalted] = useState<boolean>(isEstopHalted);
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [isScaffoldModalOpen, setIsScaffoldModalOpen] = useState<boolean>(false);

  // Batch Form
  const [batchCount, setBatchCount] = useState<number>(3);
  const [batchCampaign, setBatchCampaign] = useState<string>('cmp_trading_au');
  const [batchPlatform, setBatchPlatform] = useState<string>('reddit');
  const [batchNiche, setBatchNiche] = useState<string>('finance');

  // Scaffold Form
  const [scaffoldOfferId, setScaffoldOfferId] = useState<string>('crypto_alpha_v1');
  const [scaffoldVertical, setScaffoldVertical] = useState<string>('finance');
  const [scaffoldGeos, setScaffoldGeos] = useState<string>('US,DE,AU');

  useEffect(() => {
    setIsHalted(isEstopHalted);
  }, [isEstopHalted]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const executeApiAction = async (endpoint: string, actionName: string, body: any = {}) => {
    setExecutingAction(actionName);
    try {
      const res = await fetch(`/api/actions/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok && data.success !== false) {
        addToast('success', `${actionName} Выполнено`, data.message || 'Операция успешно завершена');
        if (onActionTriggered) onActionTriggered(actionName, data);
        return data;
      } else {
        addToast('error', `${actionName} Ошибка`, data.error || data.message || 'Сбой выполнения');
        return null;
      }
    } catch (err: any) {
      addToast('error', `${actionName} Ошибка Сети`, err.message);
      return null;
    } finally {
      setExecutingAction(null);
    }
  };

  // 1. Generate Batch
  const handleGenerateBatch = async () => {
    setIsBatchModalOpen(false);
    await executeApiAction('generate-batch', '⚡ Генерация Батча', {
      count: batchCount,
      campaignId: batchCampaign,
      platform: batchPlatform,
      niche: batchNiche,
    });
  };

  // 2. Force Dispatch
  const handleForceDispatch = async () => {
    await executeApiAction('force-dispatch', '🚀 Форсировать Постинг');
  };

  // 3. Trigger Scout
  const handleTriggerScout = async () => {
    await executeApiAction('trigger-scout', '🛰️ Запуск Скаута', { network: 'both', platform: 'reddit' });
  };

  // 4. MAB Evolution / Prompt Calibration
  const handleCalibratePrompts = async () => {
    await executeApiAction('calibrate-prompts', '🧬 MAB Эволюция & Калибровка');
  };

  // 5. Scaffold Campaign
  const handleScaffoldCampaign = async () => {
    setIsScaffoldModalOpen(false);
    const geos = scaffoldGeos.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
    await executeApiAction('scaffold-campaign', '🎯 Мульти-ГЕО Скаффолдинг', {
      offerId: scaffoldOfferId,
      vertical: scaffoldVertical,
      geos,
    });
  };

  // 6. E-STOP Toggle
  const handleEstopToggle = async () => {
    if (isHalted) {
      const data = await executeApiAction('estop/reset', '🚨 Сброс E-STOP');
      if (data) {
        setIsHalted(false);
        if (onEstopToggle) onEstopToggle(false);
      }
    } else {
      const data = await executeApiAction('estop/trigger', '🚨 Аварийный СТОП', {
        reason: 'Operator clicked E-STOP in Command Action Bar',
        operator: 'COMMAND_ACTION_BAR',
      });
      if (data) {
        setIsHalted(true);
        if (onEstopToggle) onEstopToggle(true);
      }
    }
  };

  return (
    <>
      {/* Toast Notifications */}
      <div className="fixed top-6 right-6 z-50 space-y-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-3.5 rounded-xl border backdrop-blur-md shadow-2xl font-mono text-xs max-w-sm pointer-events-auto transition-all transform duration-300 ${
              t.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : t.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : 'bg-slate-900/90 border-sky-500/50 text-sky-200'
            }`}
          >
            <div className="font-bold flex items-center justify-between">
              <span>{t.title}</span>
            </div>
            <div className="text-[11px] opacity-90 mt-1">{t.message}</div>
          </div>
        ))}
      </div>

      {/* Action Deck Bar */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-700/80 bg-slate-900/90 backdrop-blur-xl shadow-2xl mb-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Status badge */}
          <div className="flex items-center space-x-2.5 px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isHalted ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 status-pulse'
              }`}
            />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300">
              DECK: <span className={isHalted ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>{isHalted ? 'HALTED' : 'ACTIVE'}</span>
            </span>
          </div>

          {/* Quick Triggers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 flex-1">
            {/* 1. Generate Batch */}
            <button
              onClick={() => setIsBatchModalOpen(true)}
              disabled={!!executingAction || isHalted}
              className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 hover:border-indigo-400 text-indigo-300 transition-all disabled:opacity-40"
            >
              {executingAction === '⚡ Генерация Батча' ? (
                <span className="inline-block w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>⚡ Батч</span>
              )}
            </button>

            {/* 2. Force Dispatch */}
            <button
              onClick={handleForceDispatch}
              disabled={!!executingAction || isHalted}
              className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 hover:border-sky-400 text-sky-300 transition-all disabled:opacity-40"
            >
              {executingAction === '🚀 Форсировать Постинг' ? (
                <span className="inline-block w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>🚀 Постинг</span>
              )}
            </button>

            {/* 3. Scout */}
            <button
              onClick={handleTriggerScout}
              disabled={!!executingAction || isHalted}
              className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 hover:border-amber-400 text-amber-300 transition-all disabled:opacity-40"
            >
              {executingAction === '🛰️ Запуск Скаута' ? (
                <span className="inline-block w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>🛰️ Скаут</span>
              )}
            </button>

            {/* 4. MAB Evolution */}
            <button
              onClick={handleCalibratePrompts}
              disabled={!!executingAction || isHalted}
              className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 hover:border-purple-400 text-purple-300 transition-all disabled:opacity-40"
            >
              {executingAction === '🧬 MAB Эволюция & Калибровка' ? (
                <span className="inline-block w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>🧬 Эволюция</span>
              )}
            </button>

            {/* 5. Scaffold Multi-GEO */}
            <button
              onClick={() => setIsScaffoldModalOpen(true)}
              disabled={!!executingAction || isHalted}
              className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 transition-all disabled:opacity-40"
            >
              {executingAction === '🎯 Мульти-ГЕО Скаффолдинг' ? (
                <span className="inline-block w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>🎯 Скаффолд</span>
              )}
            </button>

            {/* 6. Emergency Stop */}
            <button
              onClick={handleEstopToggle}
              disabled={!!executingAction}
              className={`flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                isHalted
                  ? 'bg-rose-600 hover:bg-rose-500 border-rose-400 text-white animate-pulse'
                  : 'bg-rose-950/80 hover:bg-rose-900 border-rose-500/50 hover:border-rose-400 text-rose-300'
              }`}
            >
              {executingAction?.includes('E-STOP') ? (
                <span className="inline-block w-3.5 h-3.5 border-2 border-rose-300 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{isHalted ? '🚨 СБРОС СТОП' : '🚨 E-STOP'}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Generate Batch */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-4 font-mono">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-base text-indigo-400 flex items-center">
                <span className="mr-2">⚡</span> Пакетная Генерация Промо-Контента
              </h3>
              <button onClick={() => setIsBatchModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">ID целевой кампании</label>
                <input
                  type="text"
                  value={batchCampaign}
                  onChange={(e) => setBatchCampaign(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sky-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Площадка</label>
                  <select
                    value={batchPlatform}
                    onChange={(e) => setBatchPlatform(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-indigo-300"
                  >
                    <option value="reddit">Reddit</option>
                    <option value="quora">Quora</option>
                    <option value="medium">Medium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Количество (1-10)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={batchCount}
                    onChange={(e) => setBatchCount(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Ниша / Направление</label>
                <input
                  type="text"
                  value={batchNiche}
                  onChange={(e) => setBatchNiche(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-300"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Отмена
              </button>
              <button
                onClick={handleGenerateBatch}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs"
              >
                🚀 Запустить Генерацию
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Scaffold Campaign */}
      {isScaffoldModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-4 font-mono">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-base text-emerald-400 flex items-center">
                <span className="mr-2">🎯</span> Скаффолдинг Мульти-ГЕО Связки
              </h3>
              <button onClick={() => setIsScaffoldModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">ID Оффера</label>
                <input
                  type="text"
                  value={scaffoldOfferId}
                  onChange={(e) => setScaffoldOfferId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-emerald-400"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Вертикаль</label>
                <select
                  value={scaffoldVertical}
                  onChange={(e) => setScaffoldVertical(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sky-300"
                >
                  <option value="finance">Финансы / Трейдинг</option>
                  <option value="crypto">Crypto & Web3</option>
                  <option value="vpn">VPN & Privacy</option>
                  <option value="dating">Dating Smartlink</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Целевые ГЕО (через запятую)</label>
                <input
                  type="text"
                  value={scaffoldGeos}
                  onChange={(e) => setScaffoldGeos(e.target.value)}
                  placeholder="US, DE, AU, FR, ES, IT"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-amber-300"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setIsScaffoldModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Отмена
              </button>
              <button
                onClick={handleScaffoldCampaign}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
              >
                ⚡ Развернуть Связки
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CommandActionBar;
