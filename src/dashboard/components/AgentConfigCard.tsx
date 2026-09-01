import React, { useState, useEffect } from 'react';
import { AgentConfig, AgentRole, ClearanceTier, ToolPermission } from '../../types/agent-config.js';

const AVAILABLE_TOOLS: { id: ToolPermission; label: string; icon: string }[] = [
  { id: 'PLAYWRIGHT_AUTOMATION', label: 'Playwright Browser Automation', icon: '🎭' },
  { id: 'UMAMI_ANALYTICS', label: 'Umami Analytics & Telemetry API', icon: '📊' },
  { id: 'EVIDENCE_WRITER', label: 'Evidence Bundle Disk Writer (/runs/)', icon: '💾' },
  { id: 'DIRECT_HTTP_POST', label: 'Direct HTTP Postback & API Dispatch', icon: '⚡' },
  { id: 'PROXIES_ROTATION', label: 'Residential Proxy Rotator & Anti-Ban', icon: '🛡️' },
];

export const AgentConfigCard: React.FC = () => {
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [activeConfig, setActiveConfig] = useState<AgentConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/agents');
      const data = await res.json();
      if (data.success && Array.isArray(data.agents)) {
        setAgents(data.agents);
        if (!selectedAgentId && data.agents.length > 0) {
          setSelectedAgentId(data.agents[0].id);
          setActiveConfig({ ...data.agents[0] });
        } else if (selectedAgentId) {
          const current = data.agents.find((a: AgentConfig) => a.id === selectedAgentId);
          if (current) setActiveConfig({ ...current });
        }
      }
    } catch (err: unknown) {
      showToast(`Ошибка загрузки реестра агентов`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleSelectAgent = (agent: AgentConfig) => {
    setSelectedAgentId(agent.id);
    setActiveConfig({ ...agent });
  };

  const handleToggleTool = (tool: ToolPermission) => {
    if (!activeConfig) return;
    const exists = activeConfig.allowedTools.includes(tool);
    const updatedTools = exists
      ? activeConfig.allowedTools.filter((t) => t !== tool)
      : [...activeConfig.allowedTools, tool];
    setActiveConfig({ ...activeConfig, allowedTools: updatedTools });
  };

  const handleSave = async () => {
    if (!activeConfig) return;
    try {
      setIsSaving(true);
      const res = await fetch(`/api/agents/${activeConfig.id}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activeConfig),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Конфигурация "${activeConfig.name}" успешно сохранена!`, 'success');
        await fetchAgents();
      } else {
        showToast(`❌ Ошибка сохранения: ${data.error}`, 'error');
      }
    } catch (err: unknown) {
      showToast('❌ Ошибка сетевого запроса', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!activeConfig) return;
    if (!confirm(`Сбросить настройки агента "${activeConfig.name}" к золотому пресету?`)) return;
    try {
      setIsSaving(true);
      const res = await fetch(`/api/agents/${activeConfig.id}/reset`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.agent) {
        setActiveConfig({ ...data.agent });
        showToast(`✨ Настройки агента сброшены к золотому пресету!`, 'success');
        await fetchAgents();
      }
    } catch (err: unknown) {
      showToast('❌ Ошибка сброса настроек', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && agents.length === 0) {
    return (
      <div className="p-8 bg-[#0a0e14] border border-[#1e293b] rounded-2xl text-center font-mono text-xs text-sky-400">
        <span className="animate-spin inline-block mr-2">⚙️</span> Загрузка реестра агентов и конфигураций...
      </div>
    );
  }

  return (
    <div className="bg-[#0a0e14] text-slate-100 font-mono text-xs rounded-2xl border border-[#1e293b] shadow-2xl p-4 sm:p-6 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-2.5 rounded-lg border font-mono text-xs shadow-xl transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 text-[#00FF66] border-[#00FF66]/50'
              : 'bg-rose-950/90 text-[#FF3366] border-[#FF3366]/50'
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#1e293b]">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🤖</span>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold tracking-wider text-slate-100 uppercase">
                Реестр Агентов & Терминал Рекрутинга (Agent Control Terminal)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#121820] text-[#00E5FF] border border-[#00E5FF]/40">
                6 РОЛЕЙ АКТИВНО
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Управление промптами, разграничение прав доступа инструментов, лимиты токенов и выбор LLM-ядер
            </p>
          </div>
        </div>

        <button
          onClick={fetchAgents}
          className="px-3 py-1.5 rounded-lg bg-[#121820] hover:bg-[#1e293b] text-[#00E5FF] border border-[#1e293b] transition flex items-center"
        >
          <span className="mr-1.5">🔄</span> Обновить
        </button>
      </div>

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Roles List */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-bold mb-1">
            Доступные роли в пайплайне
          </div>
          <div className="space-y-2">
            {agents.map((agent) => {
              const isSelected = agent.id === selectedAgentId;
              const statusColor = agent.isPaused ? 'text-[#FFB800]' : 'text-[#00FF66]';
              const statusBadge = agent.isPaused ? 'ПАУЗА' : 'АКТИВЕН';

              return (
                <div
                  key={agent.id}
                  onClick={() => handleSelectAgent(agent)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'bg-[#121820] border-[#00E5FF]/60 shadow-[0_0_15px_rgba(0,229,255,0.12)]'
                      : 'bg-[#0e141c] border-[#1e293b] hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-200 text-xs">{agent.name}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                        agent.isPaused
                          ? 'bg-amber-950/60 text-[#FFB800] border-[#FFB800]/40'
                          : 'bg-emerald-950/60 text-[#00FF66] border-[#00FF66]/40'
                      }`}
                    >
                      {statusBadge}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="text-sky-400 uppercase">{agent.clearanceTier}</span>
                    <span className="text-slate-500">
                      {Math.round((agent.tokensConsumedToday / agent.tokenBudgetDaily) * 100)}% бюджета
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Agent Configuration Terminal */}
        {activeConfig && (
          <div className="lg:col-span-8 bg-[#121820] border border-[#1e293b] rounded-xl p-5 space-y-5">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-[#1e293b]">
              <div>
                <span className="text-xs text-sky-400 uppercase font-bold">{activeConfig.role}</span>
                <h3 className="text-base font-bold text-slate-100">{activeConfig.name}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-slate-400">ID:</span>
                <code className="text-[10px] text-[#00E5FF] bg-[#0a0e14] px-2 py-0.5 rounded border border-[#1e293b]">
                  {activeConfig.id}
                </code>
              </div>
            </div>

            {/* Brain & Clearance Tier Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 uppercase mb-1">Уровень мощности (Tier)</label>
                <select
                  value={activeConfig.clearanceTier}
                  onChange={(e) =>
                    setActiveConfig({ ...activeConfig, clearanceTier: e.target.value as ClearanceTier })
                  }
                  className="w-full bg-[#0a0e14] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-sky-300 focus:border-[#00E5FF] focus:outline-none"
                >
                  <option value="FAST_LPU">⚡ FAST_LPU (Groq LPU)</option>
                  <option value="BALANCED">⚖️ BALANCED (Оптимальный)</option>
                  <option value="DEEP_REASONING">🧠 DEEP_REASONING (R1 / Sonnet)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 uppercase mb-1">Основная LLM-модель</label>
                <input
                  type="text"
                  value={activeConfig.primaryModel}
                  onChange={(e) => setActiveConfig({ ...activeConfig, primaryModel: e.target.value })}
                  className="w-full bg-[#0a0e14] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-[#00FF66] focus:border-[#00FF66] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 uppercase mb-1">Резервная LLM-модель</label>
                <input
                  type="text"
                  value={activeConfig.fallbackModel}
                  onChange={(e) => setActiveConfig({ ...activeConfig, fallbackModel: e.target.value })}
                  className="w-full bg-[#0a0e14] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-[#FFB800] focus:border-[#FFB800] focus:outline-none"
                />
              </div>
            </div>

            {/* System Prompt Directive */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] text-slate-300 uppercase font-bold">
                  Системная директива и промпт (System Directive)
                </label>
                <span className="text-[10px] text-slate-500">{activeConfig.systemPrompt.length} символов</span>
              </div>
              <textarea
                rows={5}
                value={activeConfig.systemPrompt}
                onChange={(e) => setActiveConfig({ ...activeConfig, systemPrompt: e.target.value })}
                className="w-full bg-[#0a0e14] border border-[#1e293b] rounded-lg p-3 text-xs text-emerald-300 leading-relaxed focus:border-[#00FF66] focus:outline-none font-mono resize-y"
              />
            </div>

            {/* Safety & Flow Switches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#0a0e14] border border-[#1e293b] rounded-xl">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeConfig.requireHumanReview}
                  onChange={(e) => setActiveConfig({ ...activeConfig, requireHumanReview: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0"
                />
                <div>
                  <div className="text-xs font-bold text-slate-200">Требовать HITL-проверку оператора</div>
                  <div className="text-[10px] text-slate-500">Пост попадает в очередь до ручного одобрения</div>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeConfig.isPaused}
                  onChange={(e) => setActiveConfig({ ...activeConfig, isPaused: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
                />
                <div>
                  <div className="text-xs font-bold text-[#FFB800]">Приостановить воркера (Изолировать)</div>
                  <div className="text-[10px] text-slate-500">Блокирует выполнение без глобального E-STOP</div>
                </div>
              </label>
            </div>

            {/* Tool Permissions Grid */}
            <div>
              <label className="block text-[11px] text-slate-300 uppercase font-bold mb-2">
                Разрешения инструментов (Tool Permissions)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AVAILABLE_TOOLS.map((tool) => {
                  const isChecked = activeConfig.allowedTools.includes(tool.id);
                  return (
                    <div
                      key={tool.id}
                      onClick={() => handleToggleTool(tool.id)}
                      className={`p-2.5 rounded-lg border flex items-center space-x-2.5 cursor-pointer transition ${
                        isChecked
                          ? 'bg-[#00E5FF]/10 border-[#00E5FF]/40 text-slate-100'
                          : 'bg-[#0a0e14] border-[#1e293b] text-slate-500'
                      }`}
                    >
                      <span className="text-sm">{tool.icon}</span>
                      <div className="flex-1">
                        <div className={`text-xs font-medium ${isChecked ? 'text-[#00E5FF]' : 'text-slate-400'}`}>
                          {tool.label}
                        </div>
                        <div className="text-[9px] text-slate-500">{tool.id}</div>
                      </div>
                      <span className="text-xs">{isChecked ? '✅' : '⬜'}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Telemetry Strip */}
            <div className="p-3 bg-[#0a0e14] border border-[#1e293b] rounded-xl space-y-2">
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>
                  Расход суточного бюджета токенов ({activeConfig.tokensConsumedToday.toLocaleString()} /{' '}
                  {activeConfig.tokenBudgetDaily.toLocaleString()})
                </span>
                <span className="text-[#00E5FF] font-bold">
                  {Math.round((activeConfig.tokensConsumedToday / activeConfig.tokenBudgetDaily) * 100)}%
                </span>
              </div>
              <div className="w-full bg-[#121820] h-2 rounded-full overflow-hidden border border-[#1e293b]">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#00FF66] via-[#00E5FF] to-[#FFB800]"
                  style={{
                    width: `${Math.min(100, (activeConfig.tokensConsumedToday / activeConfig.tokenBudgetDaily) * 100)}%`,
                  }}
                />
              </div>

              {/* Metrics Strip */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1e293b] text-[10px]">
                <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-[#00FF66] border border-[#00FF66]/30">
                  Успешность: {activeConfig.metrics.passRate.toFixed(1)}%
                </span>
                <span className="px-2 py-0.5 rounded bg-sky-950/60 text-[#00E5FF] border border-[#00E5FF]/30">
                  Средняя задержка: {activeConfig.metrics.avgLatencyMs} ms
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">
                  Всего запусков: {activeConfig.metrics.totalRuns}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-2">
              <button
                onClick={handleReset}
                disabled={isSaving}
                className="w-full sm:w-auto px-4 py-2 bg-[#121820] hover:bg-[#1e293b] text-slate-300 hover:text-white rounded-lg text-xs transition border border-[#1e293b]"
              >
                🔄 Сбросить к золотому пресету
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto px-5 py-2 bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black font-bold rounded-lg text-xs transition shadow-[0_0_15px_rgba(0,229,255,0.25)] flex items-center justify-center"
              >
                {isSaving ? '⏳ Сохранение...' : '💾 Сохранить конфигурацию'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
