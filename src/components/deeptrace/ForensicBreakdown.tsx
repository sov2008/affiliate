import React from 'react';
import {
  Clock,
  Fingerprint,
  ScanEye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Globe2,
  Sparkles,
  Bot,
  Database,
  Layers,
  ArrowRight
} from 'lucide-react';
import { DeepTraceReportDTO, RomanceScamCategory } from '../../types/deeptrace';

export interface ForensicBreakdownProps {
  report: DeepTraceReportDTO;
}

export const ForensicBreakdown: React.FC<ForensicBreakdownProps> = ({ report }) => {
  const { timezoneBioRhythmAnomalies, stylometricBreakdown, visualAvatarForensics } = report;

  // Formatting helpers
  const formatScamCategoryLabel = (category: RomanceScamCategory): string => {
    switch (category) {
      case 'SHA_ZHU_PAN_CORE':
        return 'Sha Zhu Pan (Pig Butchering)';
      case 'CRYPTO_INVESTMENT_LURE':
        return 'Crypto Investment Hook';
      case 'OFF_PLATFORM_ESCALATION':
        return 'Off-Platform Urgent Push';
      case 'FALSE_FINANCIAL_SUCCESS':
        return 'Fabricated Luxury Lifestyle';
      case 'EMOTIONAL_DEPENDENCY_ACCELERATION':
        return 'Love Bombing & Fast Bonding';
      case 'MEDICAL_EMERGENCY_FABRICATION':
        return 'Fabricated Crisis / Wire Lure';
      case 'FAMILY_BUSINESS_NEPOTISM':
        return 'Elite Uncle / Insider Secret';
      default:
        return category;
    }
  };

  return (
    <div className="w-full space-y-6 font-sans">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Layers className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-slate-100 tracking-wide uppercase">
            Forensic Evidence Matrix // Cyber Threat Breakdown
          </h2>
        </div>
        <span className="text-xs font-mono text-slate-400">
          CASE: {report.caseReference} // DEEP_TRACE_ENGINE v2.4
        </span>
      </div>

      {/* 3 Inspection Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CARD 1: Bio-Rhythms & Geo-Sync */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between backdrop-blur-md shadow-xl hover:border-slate-700/80 transition-all">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-700/50 text-cyan-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                    Bio-Rhythms & Geo-Sync
                  </h3>
                  <p className="text-xs text-slate-400">Circadian response telemetry & timezone shift</p>
                </div>
              </div>
              {timezoneBioRhythmAnomalies.nightShiftFlag ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-700/60 animate-pulse">
                  NIGHT_SHIFT_ALERT
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                  NORMAL_CYCLE
                </span>
              )}
            </div>

            {/* Timezone Comparison Stats */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Claimed Location</span>
                <span className="text-slate-200 font-semibold truncate block">
                  {timezoneBioRhythmAnomalies.claimedTimezone}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Inferred Origin</span>
                <span className="text-amber-400 font-semibold truncate block">
                  {timezoneBioRhythmAnomalies.inferredTimezone}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Timezone Variance:</span>
                <span
                  className={`font-bold ${
                    Math.abs(timezoneBioRhythmAnomalies.timezoneOffsetDeltaHours) >= 3
                      ? 'text-rose-400'
                      : 'text-slate-300'
                  }`}
                >
                  {timezoneBioRhythmAnomalies.timezoneOffsetDeltaHours > 0 ? '+' : ''}
                  {timezoneBioRhythmAnomalies.timezoneOffsetDeltaHours} hrs
                </span>
              </div>
            </div>

            {/* 24-Hour Activity Heatmap / Bar Distribution */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>24-Hour Dispatch Heatmap (00:00 - 23:00)</span>
                <span className="font-mono text-[10px] text-slate-500">24H_BURST</span>
              </div>
              <div className="h-16 flex items-end gap-1 p-2 rounded-xl bg-slate-950/80 border border-slate-800/70">
                {timezoneBioRhythmAnomalies.activeHoursDistributionSuspect.map((intensity, hour) => {
                  const isNightHour = hour >= 2 && hour <= 6;
                  const isCriticalActivity = isNightHour && intensity > 20;

                  return (
                    <div
                      key={hour}
                      className="group relative flex-1 flex flex-col items-center h-full justify-end"
                    >
                      <div
                        style={{ height: `${Math.max(intensity, 6)}%` }}
                        className={`w-full rounded-t-sm transition-all duration-300 ${
                          isCriticalActivity
                            ? 'bg-rose-500 hover:bg-rose-400 shadow-sm shadow-rose-500/50'
                            : intensity > 40
                            ? 'bg-cyan-500 hover:bg-cyan-400'
                            : 'bg-slate-700/60 hover:bg-slate-500'
                        }`}
                      />
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center pointer-events-none z-20">
                        <div className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[9px] font-mono text-slate-200 whitespace-nowrap shadow-lg">
                          {hour}:00 - {intensity}%
                          {isNightHour && ' (Night)'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1 px-1">
                <span>00:00</span>
                <span className="text-rose-400/80 font-bold">03:00 (Anomaly)</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:00</span>
              </div>
            </div>

            {/* Diagnostic Observations List */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">
                Detected Circadian Discrepancies:
              </span>
              <ul className="space-y-1">
                {timezoneBioRhythmAnomalies.diagnosticObservations.map((obs, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-1.5 text-xs text-slate-400 leading-relaxed"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Metric */}
          <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Latency Mismatch:</span>
            <span className="font-bold text-amber-400">
              {timezoneBioRhythmAnomalies.latencyPatternMismatchScore}%
            </span>
          </div>
        </div>

        {/* CARD 2: Linguistic Fingerprint */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between backdrop-blur-md shadow-xl hover:border-slate-700/80 transition-all">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-700/50 text-purple-400">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                    Linguistic Fingerprint
                  </h3>
                  <p className="text-xs text-slate-400">Stylometrics & deception lexicon signatures</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-700/60">
                {stylometricBreakdown.detectedRomanceScamPatterns.length} PATTERNS
              </span>
            </div>

            {/* Stylometric Gauge Meters */}
            <div className="space-y-2.5">
              {/* Formality */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Formality Score:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {stylometricBreakdown.formalityScore}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${stylometricBreakdown.formalityScore}%` }}
                    className="h-full rounded-full bg-cyan-400"
                  />
                </div>
              </div>

              {/* Machine Translation */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Machine Translation / LLR Score:</span>
                  <span
                    className={`font-mono font-bold ${
                      stylometricBreakdown.machineTranslationScore > 60
                        ? 'text-rose-400'
                        : 'text-slate-200'
                    }`}
                  >
                    {stylometricBreakdown.machineTranslationScore}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${stylometricBreakdown.machineTranslationScore}%` }}
                    className={`h-full rounded-full ${
                      stylometricBreakdown.machineTranslationScore > 60
                        ? 'bg-rose-500'
                        : 'bg-amber-400'
                    }`}
                  />
                </div>
              </div>

              {/* Script Similarity */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Syndicate Script Similarity:</span>
                  <span
                    className={`font-mono font-bold ${
                      stylometricBreakdown.scriptTokenSimilarityIndex > 50
                        ? 'text-rose-400'
                        : 'text-slate-200'
                    }`}
                  >
                    {stylometricBreakdown.scriptTokenSimilarityIndex}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${stylometricBreakdown.scriptTokenSimilarityIndex}%` }}
                    className="h-full rounded-full bg-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Matched Romance Scam Patterns */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide block">
                Matched Deception Lexicon Signatures:
              </span>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1 select-text">
                {stylometricBreakdown.detectedRomanceScamPatterns.map((pat) => (
                  <div
                    key={pat.patternId}
                    className="p-2.5 rounded-xl bg-slate-950/70 border border-rose-900/40 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-rose-300 uppercase truncate">
                        {formatScamCategoryLabel(pat.category)}
                      </span>
                      <span className="text-[10px] font-mono text-rose-400 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-800/60">
                        {pat.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 italic font-serif">
                      "{pat.matchedPhrase}"
                    </p>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {pat.contextExplanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Translation Artifacts List */}
            {stylometricBreakdown.translationArtifacts.length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                  Machine Translation Artifact Traces:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {stylometricBreakdown.translationArtifacts.map((art, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-[10px] font-mono text-slate-300"
                    >
                      {art}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Metric */}
          <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Syntax Anomalies:</span>
            <span className="font-bold text-slate-200">
              {stylometricBreakdown.syntaxAnomalyCount} detected
            </span>
          </div>
        </div>

        {/* CARD 3: Visual Integrity (Avatar Forensics) */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between backdrop-blur-md shadow-xl hover:border-slate-700/80 transition-all">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-700/50 text-amber-400">
                  <ScanEye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                    Visual Integrity
                  </h3>
                  <p className="text-xs text-slate-400">OSINT & avatar biometric inspection</p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  visualAvatarForensics.syntheticFaceLikelihood > 70
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-700/60'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                }`}
              >
                AI_SCORE {visualAvatarForensics.syntheticFaceLikelihood}%
              </span>
            </div>

            {/* Synthetic Face Probability Gauge */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-semibold text-slate-200">
                    Synthetic Face Probability (GAN/Diffusion):
                  </span>
                </div>
                <span className="text-sm font-mono font-black text-rose-400">
                  {visualAvatarForensics.syntheticFaceLikelihood}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${visualAvatarForensics.syntheticFaceLikelihood}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500"
                />
              </div>
              {visualAvatarForensics.generativeModelFamily && (
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-400">Inferred Model Architecture:</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {visualAvatarForensics.generativeModelFamily}
                  </span>
                </div>
              )}
            </div>

            {/* Biometric Consistency Parameters */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide block">
                Generative Biometric Synthesis Flaws:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-500 uppercase">Pupil / Iris Symmetry:</span>
                  <div className="flex items-center justify-between mt-1">
                    <span
                      className={`font-bold ${
                        visualAvatarForensics.biologicalConsistency.irisPupilSymmetryScore < 50
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {visualAvatarForensics.biologicalConsistency.irisPupilSymmetryScore}%
                    </span>
                    {visualAvatarForensics.biologicalConsistency.irisPupilSymmetryScore < 50 ? (
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-500 uppercase">Ear Geometry:</span>
                  <div className="flex items-center justify-between mt-1">
                    <span
                      className={`font-bold ${
                        visualAvatarForensics.biologicalConsistency.earGeometryConsistencyScore < 50
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {visualAvatarForensics.biologicalConsistency.earGeometryConsistencyScore}%
                    </span>
                    {visualAvatarForensics.biologicalConsistency.earGeometryConsistencyScore < 50 ? (
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-500 uppercase">Lighting Coherence:</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-amber-400">
                      {visualAvatarForensics.biologicalConsistency.lightingDirectionConsistencyScore}%
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-500 uppercase">Diffusion Noise:</span>
                  <div className="flex items-center justify-between mt-1">
                    <span
                      className={`font-bold ${
                        visualAvatarForensics.biologicalConsistency.backgroundDiffusionArtifactsDetected
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {visualAvatarForensics.biologicalConsistency.backgroundDiffusionArtifactsDetected
                        ? 'ARTIFACTS'
                        : 'CLEAN'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* OSINT Database Matches */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  OSINT & Facial Registry Cross-Reference:
                </span>
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                    visualAvatarForensics.stockPhotoFlags.isFlagged
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {visualAvatarForensics.stockPhotoFlags.isFlagged ? 'MATCH_FOUND' : 'NO_DIRECT_MATCH'}
                </span>
              </div>
              {visualAvatarForensics.stockPhotoFlags.isFlagged ? (
                <div className="text-[11px] space-y-1 text-slate-400 pt-1">
                  <p>
                    Database matches identified:{' '}
                    <span className="text-slate-200 font-mono">
                      {visualAvatarForensics.stockPhotoFlags.matchDatabases.join(', ')}
                    </span>
                  </p>
                  {visualAvatarForensics.stockPhotoFlags.originalModelIdentity && (
                    <p className="text-amber-300">
                      Original identity:{' '}
                      <span className="font-semibold">
                        {visualAvatarForensics.stockPhotoFlags.originalModelIdentity}
                      </span>
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">
                  No direct stock/social matches found (consistent with novel synthetic generation).
                </p>
              )}
            </div>
          </div>

          {/* Bottom Metric: Hashes */}
          <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>pHash: {visualAvatarForensics.imageHash.perceptualHash.slice(0, 16)}...</span>
            <span className="text-cyan-400">VERIFIED_HASH</span>
          </div>
        </div>
      </div>
    </div>
  );
};
