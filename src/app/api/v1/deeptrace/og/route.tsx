import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * GET /api/v1/deeptrace/og
 * Dynamic Open Graph / Forensic Social Card Generator (1200x630)
 * Query parameters:
 *  - caseId: string (e.g. DT-2026-X892)
 *  - trustScore: number (0-100)
 *  - riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
 *  - flagsCount: number (count of identified scam triggers)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const caseId = searchParams.get('caseId') || 'DT-2026-X892';
    const trustScore = Math.min(100, Math.max(0, parseFloat(searchParams.get('trustScore') || '18')));
    const rawRisk = (searchParams.get('riskLevel') || 'CRITICAL').toUpperCase();
    const flagsCount = parseInt(searchParams.get('flagsCount') || '5', 10);

    const riskLevel = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(rawRisk)
      ? rawRisk
      : trustScore < 40
      ? 'CRITICAL'
      : trustScore <= 70
      ? 'MEDIUM'
      : 'LOW';

    // Tactical color mapping
    const isCritical = riskLevel === 'CRITICAL' || riskLevel === 'HIGH';
    const isMedium = riskLevel === 'MEDIUM';

    const accentColor = isCritical ? '#f43f5e' : isMedium ? '#fbbf24' : '#34d399';
    const badgeBg = isCritical ? 'rgba(76, 5, 25, 0.9)' : isMedium ? 'rgba(69, 26, 3, 0.9)' : 'rgba(6, 78, 59, 0.9)';
    const badgeBorder = isCritical ? '#be123c' : isMedium ? '#b45309' : '#047857';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#020617',
            padding: '60px 70px',
            fontFamily: 'sans-serif',
            color: '#f8fafc',
            position: 'relative'
          }}
        >
          {/* Subtle Cyber Grid Lines */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'radial-gradient(circle, #1e293b 1.5px, transparent 1.5px)',
              backgroundSize: '28px 28px',
              opacity: 0.5
            }}
          />

          {/* Top Bar: Brand & Case Reference */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              zIndex: 10
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: accentColor,
                  boxShadow: `0 0 20px ${accentColor}`
                }}
              />
              <span
                style={{
                  fontSize: '24px',
                  fontWeight: 900,
                  letterSpacing: '3px',
                  color: '#38bdf8',
                  textTransform: 'uppercase'
                }}
              >
                FlirtCheck DeepTrace™
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                padding: '8px 20px',
                borderRadius: '9999px',
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#94a3b8'
              }}
            >
              CASE // {caseId}
            </div>
          </div>

          {/* Center Main Stage */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              zIndex: 10
            }}
          >
            {/* Left: Tactical Risk Metrics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '650px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: badgeBg,
                  border: `2px solid ${badgeBorder}`,
                  padding: '8px 22px',
                  borderRadius: '9999px',
                  width: 'fit-content'
                }}
              >
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 900,
                    letterSpacing: '2px',
                    color: accentColor,
                    fontFamily: 'monospace'
                  }}
                >
                  RISK TIER: {riskLevel}
                </span>
              </div>

              <div
                style={{
                  fontSize: '44px',
                  fontWeight: 900,
                  lineHeight: 1.1,
                  letterSpacing: '-1px',
                  color: '#f1f5f9'
                }}
              >
                {isCritical
                  ? 'Catfishing & Syndicate Fraud Patterns Detected'
                  : isMedium
                  ? 'Moderate Behavioral Inconsistencies Found'
                  : 'High Authenticity & Verified Somatic Baseline'}
              </div>

              <div style={{ display: 'flex', gap: '30px', marginTop: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '14px', color: '#64748b', textTransform: 'uppercase' }}>
                    Threat Markers
                  </span>
                  <span style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', fontFamily: 'monospace' }}>
                    {flagsCount} Identified
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '14px', color: '#64748b', textTransform: 'uppercase' }}>
                    Inspection Engine
                  </span>
                  <span style={{ fontSize: '28px', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>
                    v2.4 Multimodal
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Circular Score Gauge Callout */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '260px',
                height: '260px',
                borderRadius: '50%',
                backgroundColor: '#090d16',
                border: `8px solid ${accentColor}`,
                boxShadow: `0 0 50px ${accentColor}40`
              }}
            >
              <span
                style={{
                  fontSize: '84px',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  color: accentColor,
                  lineHeight: 1
                }}
              >
                {Math.round(trustScore)}
              </span>
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  letterSpacing: '2px',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  marginTop: '4px'
                }}
              >
                TRUST SCORE
              </span>
            </div>
          </div>

          {/* Bottom Watermark Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              borderTop: '1px solid #1e293b',
              paddingTop: '20px',
              zIndex: 10
            }}
          >
            <div style={{ fontSize: '16px', color: '#64748b', fontFamily: 'monospace' }}>
              flirtcheck.site // Digital Forensic Chat Audit & Catfish Defense
            </div>
            <div style={{ fontSize: '14px', color: '#475569', fontFamily: 'monospace' }}>
              SHA-256 VERIFIED EVIDENCE
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630
      }
    );
  } catch (err: any) {
    console.error('[DeepTrace OG] Generator error:', err);
    return new Response('Failed to generate Open Graph card', { status: 500 });
  }
}
