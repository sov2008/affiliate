import React from 'react';
import { DeepTraceReportDTO } from '../../types/deeptrace';
import { ShieldAlert, ShieldCheck, Activity } from 'lucide-react';

export interface ForensicRadarChartProps {
  report: DeepTraceReportDTO;
  className?: string;
}

interface AxisMetric {
  key: string;
  label: string;
  shortLabel: string;
  value: number; // 0 - 100
  weight: number;
}

export const ForensicRadarChart: React.FC<ForensicRadarChartProps> = ({ report, className = '' }) => {
  const { timezoneBioRhythmAnomalies, stylometricBreakdown, visualAvatarForensics } = report;

  // Calculate normalized 0-100 values for the 5 forensic axes (Bklit-style telemetry)
  const chronoRisk = timezoneBioRhythmAnomalies.nightShiftFlag
    ? 90
    : timezoneBioRhythmAnomalies.claimedVsActualShiftHours > 3
    ? Math.min(85, timezoneBioRhythmAnomalies.claimedVsActualShiftHours * 12)
    : 15;

  const nlpRisk = Math.min(
    100,
    Math.max(
      stylometricBreakdown.machineTranslationScore,
      stylometricBreakdown.syntaxAnomalyCount * 14
    )
  );

  const scriptRisk = stylometricBreakdown.scriptTokenSimilarityIndex || 10;

  const visualRisk = Math.min(
    100,
    (visualAvatarForensics.diffusionArtifactDensity || 0) * 10 +
      (visualAvatarForensics.pupilAsymmetryDetected ? 40 : 0) +
      (visualAvatarForensics.reverseImageMatchesCount > 0 ? 35 : 0)
  );

  const offPlatformRisk = stylometricBreakdown.detectedRomanceScamPatterns.some(
    (p) => p.category === 'OFF_PLATFORM_ESCALATION' || p.matchedPhrase.toLowerCase().includes('whatsapp')
  )
    ? 92
    : 20;

  const metrics: AxisMetric[] = [
    { key: 'chrono', label: 'Chrono-Shift', shortLabel: 'TIMEZONE', value: chronoRisk, weight: 1 },
    { key: 'nlp', label: 'Stylometrics', shortLabel: 'SYNTAX', value: nlpRisk, weight: 1 },
    { key: 'script', label: 'Script Proximity', shortLabel: 'LEXICON', value: scriptRisk, weight: 1 },
    { key: 'visual', label: 'GAN Biometrics', shortLabel: 'AVATAR', value: visualRisk, weight: 1 },
    { key: 'pressure', label: 'Off-Platform Pressure', shortLabel: 'MIGRATION', value: offPlatformRisk, weight: 1 },
  ];

  // SVG Radar Geometry (Center: 210, 180, Radius: 120)
  const cx = 210;
  const cy = 175;
  const maxRadius = 115;
  const numAxes = metrics.length;
  const angleStep = (Math.PI * 2) / numAxes;
  const startAngle = -Math.PI / 2; // Start from top

  const getCoordinates = (index: number, valPercent: number, radiusOffset = 0) => {
    const angle = startAngle + index * angleStep;
    const r = ((valPercent / 100) * maxRadius) + radiusOffset;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Concentric polygon grids (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const gridPaths = gridLevels.map((lvl) => {
    return metrics
      .map((_, i) => {
        const { x, y } = getCoordinates(i, lvl * 100);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ') + ' Z';
  });

  // Data Polygon Path
  const dataPolygonPath =
    metrics
      .map((m, i) => {
        const { x, y } = getCoordinates(i, Math.max(8, m.value));
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ') + ' Z';

  const averageRisk = Math.round(
    metrics.reduce((acc, m) => acc + m.value, 0) / metrics.length
  );

  const isCritical = averageRisk >= 50;
  const themeColor = isCritical ? '#f43f5e' : '#06b6d4';
  const themeGlow = isCritical ? 'rgba(244, 63, 94, 0.35)' : 'rgba(6, 182, 212, 0.35)';

  return (
    <div
      className={`rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between backdrop-blur-md shadow-2xl relative overflow-hidden font-sans ${className}`}
    >
      {/* Background Ambience Glow */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 opacity-20"
        style={{ backgroundColor: themeColor }}
      />

      {/* Header Ledger */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4 z-10">
        <div className="flex items-center gap-2.5">
          <div
            className="p-2 rounded-xl border flex items-center justify-center"
            style={{
              borderColor: `${themeColor}60`,
              backgroundColor: `${themeColor}15`,
              color: themeColor,
            }}
          >
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <span>Bklit Radar // 5-Axis Threat Topology</span>
            </h3>
            <p className="text-xs text-slate-400">
              Multi-dimensional divergence matrix against industrial romance syndicates
            </p>
          </div>
        </div>

        {/* Composite Score Pill */}
        <div className="flex items-center gap-2">
          <div
            className="px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 shadow-sm"
            style={{
              borderColor: `${themeColor}80`,
              backgroundColor: `${themeColor}20`,
              color: themeColor,
            }}
          >
            {isCritical ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>RISK SCORE: {averageRisk}%</span>
            <span className="opacity-60">// {isCritical ? 'CRITICAL' : 'EVALUATED'}</span>
          </div>
        </div>
      </div>

      {/* Main SVG Radar Canvas */}
      <div className="w-full flex items-center justify-center py-2 z-10">
        <svg
          viewBox="0 0 420 350"
          className="w-full max-w-[440px] h-auto select-none overflow-visible"
        >
          <defs>
            <linearGradient id="bklitRadarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={themeColor} stopOpacity="0.45" />
              <stop offset="100%" stopColor={themeColor} stopOpacity="0.10" />
            </linearGradient>
            <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Concentric Web Grids */}
          {gridPaths.map((d, idx) => (
            <path
              key={idx}
              d={d}
              fill="none"
              stroke="#334155"
              strokeWidth="1"
              strokeDasharray={idx === gridPaths.length - 1 ? 'none' : '3 3'}
              opacity={0.5 + idx * 0.15}
            />
          ))}

          {/* Radial Spokes from Center to Edges */}
          {metrics.map((_, i) => {
            const edge = getCoordinates(i, 100);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={edge.x}
                y2={edge.y}
                stroke="#334155"
                strokeWidth="1"
                opacity="0.6"
              />
            );
          })}

          {/* Animated/Glowing Data Area */}
          <path
            d={dataPolygonPath}
            fill="url(#bklitRadarGradient)"
            stroke={themeColor}
            strokeWidth="2.25"
            strokeLinejoin="round"
            filter="url(#radarGlow)"
            style={{
              transition: 'all 0.5s ease-out',
            }}
          />

          {/* Data Vertices (Glowing Dots) */}
          {metrics.map((m, i) => {
            const pt = getCoordinates(i, Math.max(8, m.value));
            return (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill="#0f172a"
                  stroke={themeColor}
                  strokeWidth="2"
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="2"
                  fill={themeColor}
                />
              </g>
            );
          })}

          {/* Labels & Percentage Badges */}
          {metrics.map((m, i) => {
            const labelCoord = getCoordinates(i, 126);
            const isLeft = labelCoord.x < cx - 10;
            const isRight = labelCoord.x > cx + 10;
            const textAnchor = isRight ? 'start' : isLeft ? 'end' : 'middle';

            return (
              <g key={i} className="font-mono">
                <text
                  x={labelCoord.x}
                  y={labelCoord.y - 6}
                  textAnchor={textAnchor}
                  fill="#f1f5f9"
                  fontSize="10"
                  fontWeight="700"
                  letterSpacing="0.05em"
                >
                  {m.shortLabel}
                </text>
                <text
                  x={labelCoord.x}
                  y={labelCoord.y + 8}
                  textAnchor={textAnchor}
                  fill={m.value >= 50 ? '#f43f5e' : '#94a3b8'}
                  fontSize="11"
                  fontWeight="800"
                >
                  {m.value}%
                </text>
              </g>
            );
          })}

          {/* Center Point */}
          <circle cx={cx} cy={cy} r="3" fill="#64748b" />
        </svg>
      </div>

      {/* Bottom Telemetry Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 border-t border-slate-800/80 text-[10px] font-mono z-10">
        {metrics.map((m) => (
          <div key={m.key} className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/70">
            <span className="text-slate-400 block truncate">{m.label}</span>
            <span
              className={`font-bold text-xs ${
                m.value >= 50 ? 'text-rose-400' : 'text-cyan-400'
              }`}
            >
              {m.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
