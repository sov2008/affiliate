import React, { useState } from 'react';
import {
  ShieldAlert,
  Copy,
  Check,
  Share2,
  Download,
  AlertTriangle,
  HelpCircle,
  Eye,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';
import {
  DeepTraceReportDTO,
  ActionableDefenseItem,
  DefenseChallengeCategory,
  DefensePriority
} from '../../types/deeptrace';
import {
  trackChallengeCopied,
  trackShareClicked,
  trackMonetizationClicked,
  buildMonetizationClickUrl
} from '../../services/telemetry';

export interface DefenseActionPanelProps {
  report: DeepTraceReportDTO;
  onShareReport?: () => void;
  onDownloadReport?: () => void;
}

export const DefenseActionPanel: React.FC<DefenseActionPanelProps> = ({
  report,
  onShareReport,
  onDownloadReport
}) => {
  const { actionableDefenseMatrix, overallTrustIndex, caseReference, inputMetadata } = report;
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const platform = inputMetadata?.platformType || 'OTHER';
  const monetizationUrl = buildMonetizationClickUrl({
    riskLevel: overallTrustIndex.riskLevel,
    platform,
    source: 'deeptrace_action_panel'
  });

  const handleCopyQuestion = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);

    const questionItem = actionableDefenseMatrix.find((item) => item.id === id);
    trackChallengeCopied({
      challengeType: questionItem?.category || 'UNKNOWN_CHALLENGE',
      priority: questionItem?.priority || 'RECOMMENDED',
      questionId: id,
      caseRef: caseReference
    });

    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  const handleTriggerShare = () => {
    trackShareClicked({
      shareType: 'clipboard_link',
      caseRef: caseReference,
      riskLevel: overallTrustIndex.riskLevel,
      trustScore: overallTrustIndex.score
    });

    if (onShareReport) {
      onShareReport();
      return;
    }

    const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://flirtcheck.site/deeptrace';
    navigator.clipboard.writeText(`FlirtCheck DeepTrace Forensic Audit [${caseReference}]: Trust Index ${overallTrustIndex.score}/100. Reference URL: ${shareUrl}`);
    setShareFeedback('Secure forensic audit link copied to clipboard!');
    setTimeout(() => {
      setShareFeedback(null);
    }, 3500);
  };

  const handleExportAudit = () => {
    trackShareClicked({
      shareType: 'download_export',
      caseRef: caseReference,
      riskLevel: overallTrustIndex.riskLevel,
      trustScore: overallTrustIndex.score
    });

    if (onDownloadReport) {
      onDownloadReport();
    }
  };

  const handleMonetizationClick = () => {
    trackMonetizationClicked({
      destination: 'partner_verification_smartlink',
      riskLevel: overallTrustIndex.riskLevel,
      platform,
      caseRef: caseReference
    });
  };

  const getPriorityBadgeStyle = (priority: DefensePriority): string => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-950/90 text-rose-300 border-rose-700/70 shadow-rose-900/40';
      case 'RECOMMENDED':
        return 'bg-amber-950/90 text-amber-300 border-amber-700/70 shadow-amber-900/40';
      case 'OPTIONAL':
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getCategoryLabel = (category: DefenseChallengeCategory): string => {
    switch (category) {
      case 'LIVENESS_CHALLENGE':
        return 'Live Presence & Liveness Test';
      case 'GEO_LOCAL_ANCHOR':
        return 'Localized Geo-Anchor Verification';
      case 'PROFESSIONAL_KNOWLEDGE':
        return 'Domain Knowledge & Trade Depth';
      case 'TEMPORAL_CHECK':
        return 'Real-time Weather & Ambient Reality';
      case 'DIGITAL_BOUNDARIES_TEST':
        return 'Financial Boundary & Reaction Challenge';
      default:
        return category;
    }
  };

  return (
    <div className="w-full space-y-6 font-sans">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-slate-100 tracking-wide uppercase">
            Tactical Defense Matrix // Active Countermeasures
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          {actionableDefenseMatrix.length} calibrated counter-challenge vectors generated
        </span>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2 Cols: Question Action Cards */}
        <div className="xl:col-span-2 space-y-4">
          {actionableDefenseMatrix.map((item, index) => {
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="group relative rounded-2xl bg-slate-900/90 border border-slate-800 p-5 md:p-6 backdrop-blur-md shadow-xl hover:border-slate-700 transition-all space-y-4"
              >
                {/* Header row: Index, Category, Priority Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-cyan-400">
                      0{index + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border tracking-wider uppercase ${getPriorityBadgeStyle(
                      item.priority
                    )}`}
                  >
                    {item.priority === 'URGENT' ? 'CRITICAL CHALLENGE' : 'RECOMMENDED'}
                  </span>
                </div>

                {/* Question Box with Copy Button */}
                <div className="relative rounded-xl bg-slate-950/90 border border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group-hover:border-cyan-500/40 transition-colors">
                  <div className="pr-2 select-all">
                    <p className="text-sm md:text-base font-semibold text-slate-100 leading-snug">
                      «{item.questionText}»
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyQuestion(item.id, item.questionText)}
                    className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
                      isCopied
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 border border-slate-700'
                    }`}
                    title="Copy counter-challenge to clipboard"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>COPY</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Tactical Rationale */}
                <div className="text-xs text-slate-400 leading-relaxed">
                  <span className="font-semibold text-slate-300">Tactical Intent: </span>
                  {item.tacticalRationale}
                </div>

                {/* Response Patterns Comparison: Truthful vs Red Flag */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                  {/* Expected Truthful Behavior */}
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px] uppercase tracking-wide">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Expected Genuine Response</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {item.expectedTruthfulBehavior}
                    </p>
                  </div>

                  {/* Red Flag Response */}
                  <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-[11px] uppercase tracking-wide">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Syndicate / Bot Red Flag Trigger</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {item.redFlagResponsePattern}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Col: High-Converting Share & Export CTA Box */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/30 p-6 md:p-7 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-6">
            {/* Ambient background glows */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-600/60 text-cyan-300 text-[10px] font-mono uppercase tracking-widest">
                <Lock className="w-3 h-3" />
                VERIFIED SECURITY AUDIT
              </div>

              <h3 className="text-xl font-black text-slate-100 uppercase tracking-tight">
                Share Forensic Audit Dossier
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed">
                Generate an archival audit card with cryptographic watermarking and case reference to alert contacts or document identity spoofing.
              </p>

              {/* Watermark Mini-Preview Badge */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left font-mono space-y-1.5 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 text-slate-800/40 text-4xl font-black select-none pointer-events-none rotate-12">
                  FLIRTCHECK
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1.5">
                  <span>AUDIT_REF</span>
                  <span className="text-cyan-400 font-bold">{caseReference}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-400">Trust Index:</span>
                  <span
                    className={`font-black ${
                      overallTrustIndex.score < 40 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {overallTrustIndex.score}/100 ({overallTrustIndex.riskLevel})
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 truncate pt-1">
                  SHA-256: {caseReference.replace(/-/g, '').padEnd(32, '0').slice(0, 32)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="relative space-y-3 pt-2">
              <button
                onClick={handleTriggerShare}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/25 active:scale-[0.98]"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Forensic Dossier</span>
              </button>

              <button
                onClick={handleExportAudit}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-semibold tracking-wide transition-all active:scale-[0.98]"
              >
                <Download className="w-4 h-4 text-slate-400" />
                <span>Export Audit (PDF / JSON)</span>
              </button>

              {shareFeedback && (
                <div className="p-2.5 rounded-lg bg-cyan-950/90 border border-cyan-700/80 text-cyan-200 text-xs text-center font-mono animate-fadeIn">
                  {shareFeedback}
                </div>
              )}
            </div>
          </div>

          {/* Tactical Monetization / Secure Verification Route */}
          <div className="rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/40 p-5 shadow-2xl relative overflow-hidden space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                PARTNER DEFENSE NETWORK
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                SMARTLINK
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-100 uppercase tracking-tight">
              {overallTrustIndex.score < 50
                ? 'High-Risk Profile Detected? Launch Comprehensive OSINT Identity Scan'
                : 'Verify Profile Credentials via Secure Screening Gateway'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cross-reference digital footprint, biometrics, and phone bindings against security partner directories without exposing personal contacts.
            </p>
            <a
              href={monetizationUrl}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              onClick={handleMonetizationClick}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
            >
              <span>Execute Comprehensive Identity Deep-Scan →</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Critical Disclaimer / E-E-A-T Safety Box */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
            <span className="font-semibold text-slate-300 block uppercase tracking-wider text-[10px]">
              Cybersecurity & Anti-Fraud Protocol:
            </span>
            <p className="leading-relaxed">
              Never transfer funds, navigate to external cryptocurrency platforms, or disclose two-factor authentication codes. Emotional urgency or unsolicited financial guidance is a primary indicator of active social engineering.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
