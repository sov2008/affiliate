'use client';

import React from 'react';
import { DeepTraceReportDTO } from '../../types/deeptrace';
import { RadarScoreHeader } from './RadarScoreHeader';
import { AnnotatedChatViewer } from './AnnotatedChatViewer';
import { ForensicBreakdown } from './ForensicBreakdown';
import { DefenseActionPanel } from './DefenseActionPanel';
import { Shield, Sparkles } from 'lucide-react';

export interface DeepTraceRadarDashboardProps {
  report: DeepTraceReportDTO;
  onShareReport?: () => void;
  onDownloadReport?: () => void;
  className?: string;
}

export const DeepTraceRadarDashboard: React.FC<DeepTraceRadarDashboardProps> = ({
  report,
  onShareReport,
  onDownloadReport,
  className = ''
}) => {
  return (
    <div
      className={`w-full max-w-7xl mx-auto space-y-8 p-4 sm:p-6 md:p-8 bg-slate-950 text-slate-100 min-h-screen ${className}`}
    >
      {/* Top Banner Navigation / System Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-900 text-xs font-mono">
        <div className="flex items-center gap-2 text-cyan-400">
          <Shield className="w-4 h-4" />
          <span className="font-bold tracking-widest uppercase">
            FlirtCheck DeepTrace™ Radar // OSINT & Stylometric Engine
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            LIVE TELEMETRY
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span>CASE #{report.caseReference}</span>
        </div>
      </div>

      {/* 1. Radar Score Header */}
      <RadarScoreHeader report={report} />

      {/* 2. Annotated Chat Viewer (Visual Evidence Layer) */}
      <AnnotatedChatViewer report={report} />

      {/* 3. Forensic Breakdown (Bio-Rhythms, Stylometry, Visual Integrity) */}
      <ForensicBreakdown report={report} />

      {/* 4. Actionable Defense Matrix & High-Converting Share */}
      <DefenseActionPanel
        report={report}
        onShareReport={onShareReport}
        onDownloadReport={onDownloadReport}
      />

      {/* Footer Branding & Disclaimer */}
      <footer className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
        <div>
          © 2026 flirtcheck.site — Tactical Cybersecurity & Romance Fraud Prevention Engine.
        </div>
        <div className="flex items-center gap-4">
          <span>E-E-A-T DEFENSE PROTOCOL</span>
          <span>•</span>
          <span>ZERO DATA RETENTION</span>
        </div>
      </footer>
    </div>
  );
};
