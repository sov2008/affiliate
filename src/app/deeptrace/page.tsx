'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileImage,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Scan,
  Sparkles,
  MapPin,
  Clock,
  Layers,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Lock,
  X
} from 'lucide-react';
import { DeepTraceReportDTO, PlatformType } from '../../types/deeptrace';
import { DeepTraceRadarDashboard } from '../../components/deeptrace';
import {
  trackScanStarted,
  trackScanCompleted,
  trackScanFailed,
  trackMonetizationClicked,
  getOrCreateClickId
} from '../../services/telemetry';

type ScanStage = 'IDLE' | 'PARSING_BUBBLES' | 'CORRELATING_BIORHYTHMS' | 'STYLOMETRIC_FORENSICS' | 'COMPLETED' | 'ERROR' | 'RATE_LIMITED';

export interface PaywallData {
  title: string;
  description: string;
  ctaText: string;
  monetizationUrl: string;
  resetInSeconds: number;
  remaining: number;
}

const SCAN_STAGES: Array<{ key: ScanStage; label: string; description: string }> = [
  {
    key: 'PARSING_BUBBLES',
    label: '1. Multimodal OCR & Chat Bubble Extraction',
    description: 'Dialogue bubble segmentation, OCR transcription, and precise timestamp extraction...'
  },
  {
    key: 'CORRELATING_BIORHYTHMS',
    label: '2. Chrono-Telemetry & Geo-Sync Correlation',
    description: 'Correlating circadian dispatch rhythms with claimed geography and timezone offsets...'
  },
  {
    key: 'STYLOMETRIC_FORENSICS',
    label: '3. Stylometric & Deep Learning Synthetics Sweep',
    description: 'Auditing Sha Zhu Pan deception scripts, machine translation LLR, and biometric artifacts...'
  }
];

export default function DeepTracePage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [claimedLocation, setClaimedLocation] = useState<string>('');
  const [claimedAge, setClaimedAge] = useState<string>('');
  const [platform, setPlatform] = useState<PlatformType>('WHATSAPP');
  const [suspectDisplayName, setSuspectDisplayName] = useState<string>('');

  const [scanStage, setScanStage] = useState<ScanStage>('IDLE');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paywallData, setPaywallData] = useState<PaywallData | null>(null);
  const [report, setReport] = useState<DeepTraceReportDTO | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean preview URL on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Read preloaded state from DeepTraceScannerWidget in blog
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const queryPlatform = urlParams.get('platform') as PlatformType | null;
      const queryLocation = urlParams.get('location');
      const autoScan = urlParams.get('autoScan') === '1';

      if (queryPlatform) setPlatform(queryPlatform);
      if (queryLocation) setClaimedLocation(queryLocation);

      const savedDataUrl = sessionStorage.getItem('deeptrace_preloaded_image');
      const savedName = sessionStorage.getItem('deeptrace_preloaded_name') || 'screenshot.png';
      const savedPlatform = sessionStorage.getItem('deeptrace_preloaded_platform') as PlatformType | null;
      const savedLocation = sessionStorage.getItem('deeptrace_preloaded_location');

      if (savedPlatform) setPlatform(savedPlatform);
      if (savedLocation) setClaimedLocation(savedLocation);

      if (savedDataUrl) {
        // Clear sessionStorage to avoid re-triggering on subsequent reloads
        sessionStorage.removeItem('deeptrace_preloaded_image');
        sessionStorage.removeItem('deeptrace_preloaded_name');
        sessionStorage.removeItem('deeptrace_preloaded_platform');
        sessionStorage.removeItem('deeptrace_preloaded_location');

        fetch(savedDataUrl)
          .then((res) => res.blob())
          .then((blob) => {
            const reconstructedFile = new File([blob], savedName, { type: blob.type || 'image/png' });
            setFile(reconstructedFile);
            setPreviewUrl(savedDataUrl);
          })
          .catch((err) => console.warn('[DeepTrace] Error reconstructing preloaded file:', err));
      }
    } catch (e) {
      console.warn('[DeepTrace] Failed to parse URL/session state:', e);
    }
  }, []);

  const handleFileSelection = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (PNG, JPEG, WEBP).');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10 MB limit.');
      return;
    }

    setErrorMessage(null);
    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const resetUpload = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setReport(null);
    setScanStage('IDLE');
    setErrorMessage(null);
    setPaywallData(null);
  };

  const handlePaywallClick = () => {
    trackMonetizationClicked({
      destination: 'paywall_modal',
      riskLevel: 'PAYWALL_LIMIT',
      platform: platform || 'UNKNOWN'
    });
  };

  const effectivePaywallUrl = paywallData
    ? paywallData.monetizationUrl.replace('{click_id}', getOrCreateClickId())
    : '#';

  const handleStartAnalysis = async () => {
    if (!file) return;

    const startTime = Date.now();
    trackScanStarted({
      platform: platform || undefined,
      location: claimedLocation.trim() || undefined,
      source: 'web_uploader'
    });

    setScanStage('PARSING_BUBBLES');
    setCurrentStepIndex(0);
    setErrorMessage(null);
    setPaywallData(null);

    // Visual progression ticker
    const timer1 = setTimeout(() => {
      setScanStage('CORRELATING_BIORHYTHMS');
      setCurrentStepIndex(1);
    }, 1800);

    const timer2 = setTimeout(() => {
      setScanStage('STYLOMETRIC_FORENSICS');
      setCurrentStepIndex(2);
    }, 3800);

    try {
      const formData = new FormData();
      formData.append('screenshot', file);
      if (claimedLocation.trim()) formData.append('claimedLocation', claimedLocation.trim());
      if (claimedAge.trim()) formData.append('claimedAge', claimedAge.trim());
      if (platform) formData.append('platform', platform);
      if (suspectDisplayName.trim()) formData.append('suspectDisplayName', suspectDisplayName.trim());

      const res = await fetch('/api/v1/deeptrace/analyze', {
        method: 'POST',
        headers: {
          'x-flirtcheck-cid': getOrCreateClickId()
        },
        body: formData
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        if (res.status === 429 && errorJson.error?.paywall) {
          setPaywallData({
            ...errorJson.error.paywall,
            resetInSeconds: errorJson.error.resetInSeconds || 86400,
            remaining: errorJson.error.remaining || 0
          });
          setScanStage('RATE_LIMITED');
          trackScanFailed({
            errorCode: 'RATE_LIMIT_EXCEEDED',
            errorMessage: errorJson.error.message || 'Daily limit reached',
            platform: platform || undefined
          });
          return;
        }
        throw new Error(errorJson.error?.message || errorJson.message || `Audit analysis error: HTTP ${res.status}`);
      }

      const reportData: DeepTraceReportDTO = await res.json();
      const latencyMs = Date.now() - startTime;
      setReport(reportData);
      setScanStage('COMPLETED');

      trackScanCompleted({
        caseRef: reportData.caseReference,
        riskLevel: reportData.overallTrustIndex.riskLevel,
        trustScore: reportData.overallTrustIndex.score,
        latencyMs,
        platform: platform || undefined
      });
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      console.error('[DeepTrace] Audit execution failed:', err);
      setErrorMessage(err.message || 'Audit execution failed. Please try again with another screenshot.');
      setScanStage('ERROR');

      trackScanFailed({
        errorCode: err.name || 'AUDIT_FAILED',
        errorMessage: err.message || 'Audit execution failed',
        platform: platform || undefined
      });
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Dynamic Background Noise / Glow */}
      <div className="fixed inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation / Header Brand */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                CYBER THREAT INTELLIGENCE // OSINT PROTOCOL
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight flex items-center gap-2">
              FlirtCheck DeepTrace™ Radar
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Automated conversational cyber threat intelligence: detecting catfishing syndicates, Sha Zhu Pan romance scripts, circadian timezone mismatches, and synthetic GAN/diffusion avatars.
            </p>
          </div>

          {report && (
            <button
              onClick={resetUpload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono font-bold tracking-wide transition-all shadow-md self-start sm:self-center"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>NEW AUDIT</span>
            </button>
          )}
        </header>

        {/* ==================================================================== */}
        {/* STATE 1: UPLOAD & CONFIGURATION FORM */}
        {/* ==================================================================== */}
        {!report && scanStage === 'IDLE' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Cols: Dropzone Area */}
            <div className="lg:col-span-7 space-y-4">
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
                className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer overflow-hidden ${
                  file
                    ? 'border-cyan-500/50 bg-slate-900/60'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/70'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="relative w-full flex flex-col items-center space-y-4">
                    <div className="relative max-h-96 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                      <img
                        src={previewUrl}
                        alt="Screenshot Preview"
                        className="max-h-96 w-auto object-contain rounded-2xl"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resetUpload();
                        }}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-950/80 hover:bg-rose-900 text-slate-300 hover:text-white transition-colors border border-slate-700 shadow-md"
                        title="Remove screenshot"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      {file?.name} ({(file!.size / (1024 * 1024)).toFixed(2)} MB)
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-cyan-950/50 border border-cyan-800/40 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-950/40">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-200">
                        Drag & drop conversation screenshot here or click to browse
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Supports PNG, JPG, WEBP formats (up to 10 MB). Evaluated in volatile memory under strict Zero Data Retention.
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] font-mono text-slate-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      CLIENT-SIDE ZERO RETENTION
                    </div>
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Right 5 Cols: Context Inputs & Platform Selector */}
            <div className="lg:col-span-5 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-7 space-y-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Investigation Context Parameters
                </h3>
              </div>

              {/* AI Platform Auto-Classification Banner */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Platform Identification</span>
                  </span>
                  <span className="text-slate-500 font-bold">[ AI AUTO ]</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  NVIDIA Vision model automatically classifies WhatsApp, Telegram, Tinder, Bumble, or Instagram UI directly from visual markers and bubble styling.
                </p>
              </div>

              {/* Declared Location Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  Claimed Residence (Geo-Anchor):
                </label>
                <input
                  type="text"
                  value={claimedLocation}
                  onChange={(e) => setClaimedLocation(e.target.value)}
                  placeholder="e.g. London, New York, Zurich, Chicago"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <p className="text-[10px] text-slate-500 leading-tight">
                  Enables circadian response latency comparison and localized geographic verification.
                </p>
              </div>

              {/* Suspect Name / Handle */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Target Name / Social Handle:
                </label>
                <input
                  type="text"
                  value={suspectDisplayName}
                  onChange={(e) => setSuspectDisplayName(e.target.value)}
                  placeholder="e.g. Elena Vance / @elena_trade"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {/* Claimed Age */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Claimed Age:
                </label>
                <input
                  type="number"
                  min="18"
                  max="99"
                  value={claimedAge}
                  onChange={(e) => setClaimedAge(e.target.value)}
                  placeholder="28"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {/* Submit Button */}
              <button
                disabled={!file}
                onClick={handleStartAnalysis}
                className={`w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  file
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25 active:scale-[0.98]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                }`}
              >
                <Scan className="w-4 h-4" />
                <span>Execute Forensic Audit</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STATE 2: SCANNING TACTICAL LOADER */}
        {/* ==================================================================== */}
        {scanStage !== 'IDLE' && scanStage !== 'COMPLETED' && (
          <div className="max-w-2xl mx-auto py-16 px-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl text-center space-y-8">
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
              <div className="absolute inset-2 rounded-full border-2 border-dashed border-cyan-500/40 animate-spin [animation-duration:6s]" />
              <Scan className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black uppercase tracking-wider text-slate-100">
                Executing Forensic Analysis...
              </h2>
              <p className="text-xs font-mono text-cyan-400">
                FORENSIC ENGINE // EVALUATING TELEMETRY & STYLOMETRIC SIGNATURES
              </p>
            </div>

            {/* Stepper Display */}
            <div className="space-y-3 text-left max-w-lg mx-auto">
              {SCAN_STAGES.map((stg, idx) => {
                const isPassed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div
                    key={stg.key}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-cyan-950/60 border-cyan-500/60 shadow-md shadow-cyan-950/40'
                        : isPassed
                        ? 'bg-slate-950/80 border-slate-800 opacity-60'
                        : 'bg-slate-950/30 border-slate-900 opacity-30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-slate-200">
                        {stg.label}
                      </span>
                      {isCurrent && <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />}
                      {isPassed && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {stg.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs text-left flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div>
                  <strong className="block font-bold">Scanning Error:</strong>
                  {errorMessage}
                  <button
                    onClick={resetUpload}
                    className="mt-2 block px-3 py-1 rounded bg-rose-900 hover:bg-rose-800 text-white font-mono text-[10px]"
                  >
                    Try another screenshot
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* STATE 3: AUDIT RESULT DASHBOARD */}
        {/* ==================================================================== */}
        {report && scanStage === 'COMPLETED' && (
          <div className="animate-fadeIn">
            <DeepTraceRadarDashboard report={report} />
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* PAYWALL / DAILY QUOTA EXCEEDED MODAL */}
      {/* ==================================================================== */}
      {paywallData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-lg w-full rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-rose-500/50 p-6 sm:p-8 text-center shadow-2xl space-y-6">
            <button
              onClick={() => {
                setPaywallData(null);
                setScanStage('IDLE');
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-400 shadow-lg shadow-rose-900/30">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-700 text-[10px] font-mono uppercase tracking-widest text-rose-300">
                GPU COMPUTE QUOTA // EXCEEDED
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight">
                {paywallData.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                {paywallData.description}
              </p>
            </div>

            {/* Reset Timer / Usage Meter */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Quota Reset In:</span>
              </div>
              <span className="font-bold text-cyan-400">
                {Math.floor(paywallData.resetInSeconds / 3600)}h {Math.floor((paywallData.resetInSeconds % 3600) / 60)}m
              </span>
            </div>

            {/* Direct Monetization CTA Button */}
            <div className="space-y-3 pt-2">
              <a
                href={effectivePaywallUrl}
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                onClick={handlePaywallClick}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-cyan-500 hover:opacity-95 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl shadow-rose-500/25 active:scale-[0.98]"
              >
                <span>{paywallData.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={() => {
                  setPaywallData(null);
                  resetUpload();
                }}
                className="w-full py-2.5 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
              >
                Return to Terminal
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
