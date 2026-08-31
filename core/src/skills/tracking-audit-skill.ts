export function auditTrackingLinks(html: string): { passed: boolean; errors: string[] } {
  console.log('[Tracking Audit Skill] Validating CTA parameters...');
  const errors: string[] = [];
  
  // Regex to extract all hrefs specifically in <a> tags
  const anchorRegex = /<a\s+[^>]*href="([^"]*)"[^>]*>/gi;
  let match;
  let linkFound = false;

  while ((match = anchorRegex.exec(html)) !== null) {
    const link = match[1];
    if (link.startsWith('#') || link.startsWith('javascript:')) continue;
    
    linkFound = true;
    const hasMlSub1 = link.includes('ml_sub1=');
    const hasMlSub2 = link.includes('ml_sub2=');
    const hasMlSub3 = link.includes('ml_sub3=');

    if (!hasMlSub1 || !hasMlSub2 || !hasMlSub3) {
      errors.push(`CTA Link missing required MyLead macros (ml_sub1, ml_sub2, ml_sub3): ${link}`);
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
