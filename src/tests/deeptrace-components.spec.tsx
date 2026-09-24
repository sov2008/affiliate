import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { mockHighRiskRomanceScamReport } from '../mocks/deeptraceReport.mock';
import {
  RadarScoreHeader,
  AnnotatedChatViewer,
  ForensicBreakdown,
  DefenseActionPanel,
  DeepTraceRadarDashboard
} from '../components/deeptrace';

function runComponentRenderTests() {
  console.log('🧪 Starting DeepTrace Radar React Component Tests...');

  // 1. RadarScoreHeader
  const headerHtml = renderToStaticMarkup(<RadarScoreHeader report={mockHighRiskRomanceScamReport} />);
  if (!headerHtml.includes('Risk Tier: CRITICAL') || !headerHtml.includes('11.4')) {
    throw new Error('RadarScoreHeader failed to render score or risk badge');
  }
  console.log('✅ RadarScoreHeader rendered successfully');

  // 2. AnnotatedChatViewer
  const viewerHtml = renderToStaticMarkup(<AnnotatedChatViewer report={mockHighRiskRomanceScamReport} />);
  if (!viewerHtml.includes('WHATSAPP Session') || !viewerHtml.includes('Annotated Chat Telemetry')) {
    throw new Error('AnnotatedChatViewer failed to render chat bubbles or header');
  }
  console.log('✅ AnnotatedChatViewer rendered successfully');

  // 3. ForensicBreakdown
  const breakdownHtml = renderToStaticMarkup(<ForensicBreakdown report={mockHighRiskRomanceScamReport} />);
  if (!breakdownHtml.includes('Bio-Rhythms &amp; Geo-Sync') && !breakdownHtml.includes('Bio-Rhythms & Geo-Sync')) {
    throw new Error('ForensicBreakdown failed to render bio-rhythm section');
  }
  if (!breakdownHtml.includes('Visual Integrity') || !breakdownHtml.includes('Linguistic Fingerprint')) {
    throw new Error('ForensicBreakdown missing inspection cards');
  }
  console.log('✅ ForensicBreakdown rendered successfully');

  // 4. DefenseActionPanel
  const defenseHtml = renderToStaticMarkup(<DefenseActionPanel report={mockHighRiskRomanceScamReport} />);
  if (!defenseHtml.includes('Матрица активной защиты') || !defenseHtml.includes('Поделиться отчетом')) {
    throw new Error('DefenseActionPanel failed to render defense matrix');
  }
  console.log('✅ DefenseActionPanel rendered successfully');

  // 5. Master DeepTraceRadarDashboard
  const dashboardHtml = renderToStaticMarkup(<DeepTraceRadarDashboard report={mockHighRiskRomanceScamReport} />);
  if (!dashboardHtml.includes('FlirtCheck DeepTrace™ Radar')) {
    throw new Error('DeepTraceRadarDashboard master layout failed to render');
  }
  console.log('✅ DeepTraceRadarDashboard rendered full layout successfully');

  console.log('🎉 All DeepTrace Radar UI Components PASSED static SSR verification!');
}

runComponentRenderTests();
