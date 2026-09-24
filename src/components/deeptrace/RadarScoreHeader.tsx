import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  AlertTriangle,
  Clock,
  UserCheck,
  Bot,
  Zap,
  Globe2
} from 'lucide-react';
import { DeepTraceReportDTO } from '../../types/deeptrace';

export interface RadarScoreHeaderProps {
  report: DeepTraceReportDTO;
}

export const RadarScoreHeader: React.FC<RadarScoreHeaderProps> = ({ report }) => {
  const { overallTrustIndex, inputMetadata, timezoneBioRhythmAnomalies, visualAvatarForensics, stylometricBreakdown } = report;
  const score = overallTrustIndex.score;
  const riskLevel = overallTrustIndex.riskLevel;

  // Color Mapping: Red < 40, Amber 40-70, Emerald > 70
  const isCriticalOrHigh = riskLevel === 'CRITICAL' || riskLevel === 'HIGH' || score < 40;
  const isMedium = (riskLevel === 'MEDIUM' || (score >= 40 && score <= 70)) && !isCriticalOrHigh;
  const isLow = score > 70 && !isCriticalOrHigh && !isMedium;

  const scoreColor = isCriticalOrHigh
    ? 'text-rose-500'
    : isMedium
    ? 'text-amber-400'
    : 'text-emerald-400';

  const strokeColor = isCriticalOrHigh
    ? '#f43f5e'
    : isMedium
    ? '#fbbf24'
    : '#34d399';

  const riskBadgeBg = isCriticalOrHigh
    ? 'bg-rose-950/80 text-rose-300 border-rose-700/60 shadow-rose-900/30'
    : isMedium
    ? 'bg-amber-950/80 text-amber-300 border-amber-700/60 shadow-amber-900/30'
    : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 shadow-emerald-900/30';

  // SVG Gauge calculations (circumference for radius 58 = 2 * PI * 58 ≈ 364.4)
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <header className="relative w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 backdrop-blur-xl shadow-2xl overflow-hidden font-sans">
      {/* Background Radar Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      {isCriticalOrHigh && (
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Top Telemetry Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 shadow-inner">
            <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-mono">FlirtCheck DeepTrace™</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
                {report.caseReference}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
              Digital Forensics Radar
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
            <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Platform: <strong className="text-slate-100">{inputMetadata.platformType}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{new Date(report.analyzedAt).toLocaleDateString()} {new Date(report.analyzedAt).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Main Radar Core (Gauge & Critical Flags) */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6">
        
        {/* Left Column: Radial Trust Gauge (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 shadow-inner">
          <div className="relative flex items-center justify-center w-40 h-40">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
              {/* Background circle track */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke="#1e293b"
                strokeWidth="12"
                fill="none"
              />
              {/* Animated Progress ring */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke={strokeColor}
                strokeWidth="12"
                strokeLinecap="round"
                fill="none"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset,
                  transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            </svg>

            {/* Inner Score Label */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className={`text-4xl font-extrabold font-mono tracking-tighter ${scoreColor}`}>
                {score.toFixed(1)}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Trust Index
              </span>
            </div>
          </div>

          <div className={`mt-4 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-md flex items-center gap-1.5 ${riskBadgeBg}`}>
            {isCriticalOrHigh ? (
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            ) : isMedium ? (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            )}
            Risk Tier: {riskLevel}
          </div>
        </div>

        {/* Right Column: Threat Dossier & Detected Badges (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col justify-center space-y-4">
          {/* Executive Verdict Box */}
          <div className={`p-4 rounded-xl border backdrop-blur-md ${
            isCriticalOrHigh
              ? 'bg-rose-950/20 border-rose-800/40 text-rose-200'
              : isMedium
              ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
              : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
          }`}>
            <div className="flex items-center gap-2 mb-1.5 text-xs font-black uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              Executive Forensic Verdict
            </div>
            <p className="text-sm font-medium leading-relaxed text-slate-200">
              {overallTrustIndex.executiveVerdict}
            </p>
          </div>

          {/* Critical Flag Badges */}
          <div>
            <div className="text-xs uppercase tracking-wider font-mono text-slate-400 mb-2 font-bold flex items-center gap-1.5">
              <span>Primary Anomaly Flags:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {visualAvatarForensics.syntheticFaceLikelihood > 40 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-rose-950/60 border border-rose-700/60 text-rose-300 shadow-sm">
                  <Bot className="w-3.5 h-3.5 text-rose-400" />
                  <span>Synthetic Avatar Risk: <strong>{visualAvatarForensics.syntheticFaceLikelihood}%</strong></span>
                </div>
              )}

              {timezoneBioRhythmAnomalies.nightShiftFlag && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-amber-950/60 border border-amber-700/60 text-amber-300 shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Timezone Shift: <strong>{timezoneBioRhythmAnomalies.timezoneOffsetDeltaHours > 0 ? `+${timezoneBioRhythmAnomalies.timezoneOffsetDeltaHours}h` : `${timezoneBioRhythmAnomalies.timezoneOffsetDeltaHours}h`}</strong></span>
                </div>
              )}

              {stylometricBreakdown.detectedRomanceScamPatterns.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-rose-950/60 border border-rose-700/60 text-rose-300 shadow-sm">
                  <ShieldOff className="w-3.5 h-3.5 text-rose-400" />
                  <span>Scripted Romance Pattern ({stylometricBreakdown.detectedRomanceScamPatterns[0].category})</span>
                </div>
              )}

              {inputMetadata.declaredLocation && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-800/80 border border-slate-700 text-slate-300">
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Target: {inputMetadata.suspectDisplayName || 'Suspect'} ({inputMetadata.declaredLocation})</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
