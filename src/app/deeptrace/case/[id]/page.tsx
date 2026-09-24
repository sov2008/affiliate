import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { caseRepository } from '../../../../db/caseRepository';
import { DeepTraceRadarDashboard } from '../../../../components/deeptrace';
import { Lock, Calendar, Eye, ArrowRight, ShieldCheck } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export const dynamic = 'force-dynamic';

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(props.params);
  const caseRef = decodeURIComponent(resolvedParams.id || '').trim();
  const caseRecord = caseRepository.getCaseRecord(caseRef);

  if (!caseRecord) {
    return {
      title: `Forensic Case Not Found | FlirtCheck DeepTrace™`,
      description: 'The requested forensic chat audit case does not exist or has expired.'
    };
  }

  const score = caseRecord.trust_score;
  const level = caseRecord.risk_level;
  const platform = caseRecord.platform;
  const title = `Forensic Case ${caseRef} (${score}/100 - ${level}) | FlirtCheck DeepTrace™`;
  const description = `Verified chat screenshot forensic audit for ${caseRef}. Overall Trust Index: ${score}/100 (${level} Risk). Platform: ${platform}. Neural check against romance scam scripts & synthetic avatars.`;
  const ogImageUrl = `/api/v1/deeptrace/og?caseId=${encodeURIComponent(caseRef)}&trustScore=${score}&riskLevel=${encodeURIComponent(level)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `FlirtCheck DeepTrace Case ${caseRef}`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl]
    }
  };
}

export default async function PublicCasePage(props: PageProps) {
  const resolvedParams = await Promise.resolve(props.params);
  const caseRef = decodeURIComponent(resolvedParams.id || '').trim();

  if (!caseRef) {
    notFound();
  }

  const caseRecord = caseRepository.getCaseRecord(caseRef);
  if (!caseRecord) {
    notFound();
  }

  // Increment view counter for public archive telemetry
  try {
    caseRepository.incrementViews(caseRef);
  } catch (err) {
    console.warn(`[PublicCasePage] Failed to increment views for ${caseRef}:`, err);
  }

  const report = caseRecord.report;
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(caseRecord.created_at));

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 pb-16">
      {/* Dynamic Background Noise / Glow */}
      <div className="fixed inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      {/* Top Read-Only Verification Banner */}
      <div className="sticky top-0 z-50 bg-slate-900/95 border-b border-cyan-500/30 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-700/60 font-mono font-bold tracking-widest text-cyan-300 uppercase">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              [VERIFIED FORENSIC AUDIT ARCHIVE // READ-ONLY]
            </span>
            <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                {formattedDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-slate-500" />
                {caseRecord.views_count + 1} views
              </span>
              <span>•</span>
              <span className="text-cyan-400 font-semibold">{caseRecord.platform}</span>
            </div>
          </div>

          <Link
            href="/deeptrace"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-500/20 active:scale-[0.98] shrink-0"
          >
            <span>Audit Your Own Chat Screenshot Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* DeepTrace Radar Dashboard */}
      <div className="relative z-10 pt-4">
        <DeepTraceRadarDashboard report={report} />
      </div>
    </main>
  );
}
