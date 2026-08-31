export function auditTrackingLinks(html: string): { passed: boolean; errors: string[] } {
  console.log('[Tracking Audit Skill] Validating CTA parameters...');
  const errors: string[] = [];
  
  // Regex to extract all hrefs in anchor tags
  const hrefRegex = /href="([^"]*)"/g;
  let match;
  let linkFound = false;

  while ((match = hrefRegex.exec(html)) !== null) {
    const link = match[1];
    if (link.startsWith('#') || link.startsWith('javascript:')) continue; // Ignore anchors and JS
    
    linkFound = true;
    const hasClickId = link.includes('click_id');
    const hasSub1 = link.includes('sub1');
    const hasSub2 = link.includes('sub2');
    const hasSubId = link.includes('sub_id');

    if (!hasClickId && !hasSub1 && !hasSub2 && !hasSubId) {
      errors.push(`CTA Link missing required tracking parameters: ${link}`);
    }
  }

  if (!linkFound) {
    errors.push('No CTA links found in the document.');
  }

  const passed = errors.length === 0;
  if (passed) {
    console.log('[Tracking Audit Skill] ✅ Audit passed. All links are valid.');
  } else {
    console.error(`[Tracking Audit Skill] ❌ Audit failed with ${errors.length} errors.`);
  }

  return { passed, errors };
}
