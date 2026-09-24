import React, { useState } from 'react';
import {
  MessageSquareWarning,
  AlertCircle,
  HelpCircle,
  User,
  ShieldAlert,
  Info,
  ExternalLink,
  Lock
} from 'lucide-react';
import { ExtractionDTO, ParsedChatMessage, ChatAnomaly, DeepTraceReportDTO } from '../../types/deeptrace';

export interface AnnotatedChatViewerProps {
  report?: DeepTraceReportDTO;
  extraction?: ExtractionDTO;
  suspectName?: string;
}

const ANOMALY_HUMAN_LABELS: Record<ChatAnomaly, { label: string; explanation: string; color: string }> = {
  SCRIPT_TOKEN_MATCH: {
    label: 'Scam Script Match',
    explanation: 'Matches known organized crime call-center fraud scripts (e.g. Sha Zhu Pan).',
    color: 'bg-rose-950/80 text-rose-300 border-rose-700/60'
  },
  RAPID_FIRE_BURST: {
    label: 'Automated Burst',
    explanation: 'Sub-second response latency indicating copy-paste or automated bot dispatch.',
    color: 'bg-amber-950/80 text-amber-300 border-amber-700/60'
  },
  TIMEZONE_MISMATCH: {
    label: 'Timezone Anomaly',
    explanation: 'Message sent during deep sleep hours for their claimed geographic location.',
    color: 'bg-amber-950/80 text-amber-300 border-amber-700/60'
  },
  MONEY_REDIRECT_ATTEMPT: {
    label: 'Financial Solicitation',
    explanation: 'Direct or indirect attempt to lure victim into depositing funds or buying crypto.',
    color: 'bg-rose-950/80 text-rose-300 border-rose-700/60'
  },
  CRYPTO_TERMINAL_MENTION: {
    label: 'Crypto Node/Lure',
    explanation: 'Reference to high-yield gold, forex, or decentralized options arbitrage.',
    color: 'bg-rose-950/80 text-rose-300 border-rose-700/60'
  },
  OFF_PLATFORM_PRESSURE: {
    label: 'Channel Migration',
    explanation: 'Urgent push to move to WhatsApp/Telegram to bypass dating app fraud filters.',
    color: 'bg-orange-950/80 text-orange-300 border-orange-700/60'
  },
  UNUSUAL_FORMALITY: {
    label: 'Machine Syntax',
    explanation: 'Stiff, translation-dictionary grammar uncommon in informal native texting.',
    color: 'bg-slate-800 text-slate-300 border-slate-700'
  },
  VAGUELY_EVASIVE: {
    label: 'Evasive Deflection',
    explanation: 'Refusal to answer direct questions about local lifestyle or background.',
    color: 'bg-yellow-950/80 text-yellow-300 border-yellow-700/60'
  },
  PREMATURE_AFFECTION: {
    label: 'Love Bombing',
    explanation: 'Accelerated romantic declaration and cosmic destiny framing.',
    color: 'bg-rose-950/80 text-rose-300 border-rose-700/60'
  },
  EMOJI_OVERLOAD: {
    label: 'Syntactic Camouflage',
    explanation: 'Excessive emojis deployed to conceal artificial or translated sentence structure.',
    color: 'bg-slate-800 text-slate-300 border-slate-700'
  },
  PHONE_NUMBER_SOLICITATION: {
    label: 'PII Extraction',
    explanation: 'Premature extraction of victim personal phone number.',
    color: 'bg-orange-950/80 text-orange-300 border-orange-700/60'
  },
  SUSPICIOUS_LINK: {
    label: 'Malicious Link',
    explanation: 'Unverified external domain hosted on phishing or unindexed TLDs.',
    color: 'bg-rose-950/90 text-rose-200 border-rose-600 shadow-rose-950/50'
  },
  DEFENSIVE_REVERSAL: {
    label: 'Gaslighting Reversal',
    explanation: 'Deflecting suspicion by accusing the victim of paranoia or lack of trust.',
    color: 'bg-purple-950/80 text-purple-300 border-purple-700/60'
  }
};

export const AnnotatedChatViewer: React.FC<AnnotatedChatViewerProps> = ({
  report,
  extraction,
  suspectName
}) => {
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  const effectiveExtraction = extraction || report?.extractionSummary;
  const effectiveSuspectName = suspectName || report?.inputMetadata.suspectDisplayName || 'Suspect';

  if (!effectiveExtraction) {
    return null;
  }

  const messages = effectiveExtraction.parsedMessages;

  return (
    <section className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-6 backdrop-blur-xl shadow-xl font-sans">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400">
            <MessageSquareWarning className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Annotated Chat Telemetry
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono font-normal">
                {effectiveExtraction.detectedPlatform} Session
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Hover over flagged messages to inspect behavioral and linguistic risk triggers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Client-Side Redacted & Indexed</span>
        </div>
      </div>

      {/* Mock Chat Viewport */}
      <div className="relative rounded-xl bg-slate-950/80 border border-slate-800/90 p-4 md:p-6 space-y-4 max-h-[560px] overflow-y-auto shadow-inner">
        {messages.map((msg: ParsedChatMessage) => {
          const isUser = msg.author === 'USER';
          const hasAnomalies = msg.anomalies.length > 0;
          const isTooltipActive = activeTooltipId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} transition-all`}
            >
              {/* Author name & raw timestamp header */}
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-mono text-slate-500">
                <span className="font-semibold text-slate-400">
                  {isUser ? 'You' : effectiveSuspectName}
                </span>
                <span>•</span>
                <span>{msg.rawTimestampText || 'Timestamp N/A'}</span>
              </div>

              {/* Chat Bubble Container */}
              <div
                className={`relative max-w-[85%] md:max-w-[70%] rounded-2xl p-3.5 text-sm transition-all duration-200 ${
                  isUser
                    ? 'bg-cyan-600 text-white rounded-tr-none shadow-md'
                    : hasAnomalies
                    ? 'bg-slate-900 text-slate-100 border-2 border-rose-500/80 shadow-lg shadow-rose-950/30 rounded-tl-none'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none'
                }`}
              >
                {/* Bubble Text */}
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {/* Anomalies Badge Ribbon (for Suspect) */}
                {hasAnomalies && (
                  <div className="mt-3 pt-2.5 border-t border-rose-900/40 flex flex-wrap items-center gap-1.5">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-rose-400 uppercase tracking-wider font-mono mr-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Flags:</span>
                    </div>

                    {msg.anomalies.map((anomaly: ChatAnomaly) => {
                      const meta = ANOMALY_HUMAN_LABELS[anomaly];
                      return (
                        <button
                          key={anomaly}
                          type="button"
                          onClick={() => setActiveTooltipId(isTooltipActive ? null : msg.id)}
                          onMouseEnter={() => setActiveTooltipId(msg.id)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold border transition-colors cursor-pointer ${meta.color}`}
                        >
                          <span>{meta.label}</span>
                          <HelpCircle className="w-3 h-3 opacity-70" />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Interactive Tooltip Card */}
                {hasAnomalies && isTooltipActive && (
                  <div
                    className="absolute z-30 left-0 -bottom-2 translate-y-full w-72 md:w-80 p-3.5 rounded-xl bg-slate-900 border border-rose-600/80 text-slate-100 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setActiveTooltipId(null)}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-black text-rose-400 uppercase font-mono mb-1.5 pb-1 border-b border-slate-800">
                      <AlertCircle className="w-4 h-4" />
                      Forensic Behavioral Assessment
                    </div>
                    <ul className="space-y-2 text-xs">
                      {msg.anomalies.map((anomaly: ChatAnomaly) => {
                        const meta = ANOMALY_HUMAN_LABELS[anomaly];
                        return (
                          <li key={anomaly} className="leading-snug">
                            <span className="font-bold text-rose-300 block">{meta.label}:</span>
                            <span className="text-slate-300">{meta.explanation}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400 pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cyan-600" />
            <span>User Outgoing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700" />
            <span>Suspect Baseline</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-900 border-2 border-rose-500" />
            <span>Flagged Threat Bubble</span>
          </div>
        </div>

        <div className="text-slate-500">
          Total Messages Extracted: <strong className="text-slate-300">{effectiveExtraction.totalMessagesExtracted}</strong>
        </div>
      </div>
    </section>
  );
};
