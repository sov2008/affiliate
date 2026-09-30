import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import dns from 'dns/promises';
import { URL } from 'url';

export interface UrlValidationResult {
  isValid: boolean;
  statusCode?: number;
  latencyMs: number;
  hops: string[];
  warnings: string[];
  errors: string[];
}

export interface PostTrackingValidationResult {
  isValid: boolean;
  trackingUrl: string;
  campaignId: string;
  hasClickIdMacro: boolean;
  hasCampaignAttribution: boolean;
  missingMacros: string[];
  errors: string[];
}

export interface LandingPageIntegrityReport {
  isValid: boolean;
  campaignId: string;
  variant: string;
  checkedCount: number;
  brokenLinks: string[];
  missingMacros: string[];
  latencyMs: number;
  hops: string[];
  hasUmamiTracking: boolean;
  hasNofollowSponsored: boolean;
  hasTargetBlank: boolean;
  hasCyrillicChars: boolean;
  details: string[];
}

export interface BlogAuditReport {
  isValid: boolean;
  scannedFiles: number;
  brokenLinks: string[];
  cyrillicViolations: string[];
  missingComplianceLinks: string[];
}

export class LinkIntegrityService {
  private static instance: LinkIntegrityService;
  private readonly defaultTimeoutMs: number = 5000;
  private readonly latencyWarningThresholdMs: number = 2500;

  public static getInstance(): LinkIntegrityService {
    if (!LinkIntegrityService.instance) {
      LinkIntegrityService.instance = new LinkIntegrityService();
    }
    return LinkIntegrityService.instance;
  }

  /**
   * 1. Validates CPA Offer URL:
   * - DNS resolution
   * - SSL validity
   * - Follows redirects up to maxHops (5 hops)
   * - Validates status codes (no 404/500 drops)
   * - Latency measurement (>2500ms warning)
   */
  public async validateCpaUrl(targetUrl: string, maxHops = 5): Promise<UrlValidationResult> {
    const hops: string[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];
    let currentUrl = targetUrl;
    let statusCode: number | undefined;
    const startTime = performance.now();

    try {
      // 1. URL syntax validation
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(currentUrl);
      } catch (err: any) {
        errors.push(`Invalid URL format: ${err.message}`);
        return { isValid: false, latencyMs: 0, hops: [targetUrl], warnings, errors };
      }

      // 2. DNS check
      try {
        await dns.lookup(parsedUrl.hostname);
      } catch (dnsErr: any) {
        errors.push(`DNS resolution failed for ${parsedUrl.hostname}: ${dnsErr.message}`);
        return { isValid: false, latencyMs: 0, hops: [targetUrl], warnings, errors };
      }

      // 3. HTTP / HTTPS redirect resolution loop
      let hopCount = 0;
      while (hopCount < maxHops) {
        hops.push(currentUrl);
        hopCount++;

        const response = await this.executeHeadOrGet(currentUrl);
        statusCode = response.statusCode;

        if (response.error) {
          errors.push(`Request failed on hop ${hopCount} (${currentUrl}): ${response.error}`);
          break;
        }

        // Check redirect (301, 302, 307, 308)
        if (statusCode && [301, 302, 303, 307, 308].includes(statusCode) && response.redirectUrl) {
          const nextUrl = new URL(response.redirectUrl, currentUrl).toString();
          currentUrl = nextUrl;
          continue;
        }

        // Terminal status code checks
        if (statusCode && statusCode >= 400) {
          errors.push(`HTTP status error ${statusCode} received at ${currentUrl}`);
        }
        break;
      }

      if (hopCount >= maxHops) {
        warnings.push(`Maximum redirect hops (${maxHops}) reached.`);
      }
    } catch (globalErr: any) {
      errors.push(`Validation exception: ${globalErr.message}`);
    }

    const elapsedMs = Math.round(performance.now() - startTime);
    if (elapsedMs > this.latencyWarningThresholdMs) {
      warnings.push(`High network latency detected: ${elapsedMs}ms (threshold: ${this.latencyWarningThresholdMs}ms)`);
    }

    const isValid = errors.length === 0 && (statusCode !== undefined && statusCode < 400);

    return {
      isValid,
      statusCode,
      latencyMs: elapsedMs,
      hops,
      warnings,
      errors,
    };
  }

  /**
   * 2. Validates Social Post Outbound Tracking URL:
   * - Points to edge worker router or landing page domain
   * - Checks presence of click_id macro and campaign_id parameter
   */
  public validatePostTrackingUrl(trackingUrl: string, campaignId: string): PostTrackingValidationResult {
    const errors: string[] = [];
    const missingMacros: string[] = [];

    let parsed: URL;
    try {
      parsed = new URL(trackingUrl);
    } catch {
      return {
        isValid: false,
        trackingUrl,
        campaignId,
        hasClickIdMacro: false,
        hasCampaignAttribution: false,
        missingMacros: ['click_id', 'campaign_id'],
        errors: ['Invalid tracking URL format'],
      };
    }

    const searchParams = parsed.searchParams;
    const urlString = trackingUrl.toLowerCase();

    // Check click_id macro presence
    const hasClickId =
      urlString.includes('{click_id}') ||
      urlString.includes('[click_id]') ||
      searchParams.has('click_id') ||
      searchParams.has('s2') ||
      searchParams.has('ml_sub1');

    if (!hasClickId) {
      missingMacros.push('click_id');
      errors.push('Tracking URL lacks required click_id macro template ({click_id} or s2/ml_sub1)');
    }

    // Check campaign attribution
    const hasCampParam =
      searchParams.get('campaign_id') === campaignId ||
      urlString.includes(campaignId.toLowerCase()) ||
      searchParams.has('campaign_id');

    if (!hasCampParam) {
      missingMacros.push('campaign_id');
      errors.push(`Tracking URL lacks campaign attribution matching '${campaignId}'`);
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      trackingUrl,
      campaignId,
      hasClickIdMacro: hasClickId,
      hasCampaignAttribution: hasCampParam,
      missingMacros,
      errors,
    };
  }

  /**
   * 3. Validates Landing Page Links & Macro Preservation:
   * - Reads campaigns/{campaign_id}/{variant}/index.html
   * - Parses all <a href="..."> and <button onclick="..."> CTA triggers
   * - Ensures macro preservation ([ml_sub1], s1/s2, click_id, etc.)
   * - Verifies Umami tracking event bindings
   */
  public validateLandingPageLinks(campaignId: string, variant: string): LandingPageIntegrityReport {
    const brokenLinks: string[] = [];
    const missingMacros: string[] = [];
    const details: string[] = [];

    const candidatePaths = [
      path.resolve(process.cwd(), `campaigns/${campaignId}/${variant}/index.html`),
      path.resolve(process.cwd(), `../campaigns/${campaignId}/${variant}/index.html`),
      path.resolve(__dirname, `../../../campaigns/${campaignId}/${variant}/index.html`),
    ];

    let htmlContent = '';
    let foundPath = '';

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        htmlContent = fs.readFileSync(p, 'utf8');
        foundPath = p;
        break;
      }
    }

    if (!htmlContent) {
      return {
        isValid: false,
        campaignId,
        variant,
        checkedCount: 0,
        brokenLinks: [`HTML template not found for ${campaignId}/${variant}`],
        missingMacros: ['ALL'],
        latencyMs: 0,
        hops: [],
        hasUmamiTracking: false,
        hasNofollowSponsored: false,
        hasTargetBlank: false,
        hasCyrillicChars: false,
        details: [`Search paths: ${candidatePaths.join(', ')}`],
      };
    }

    // 1. Strict English Policy: check for illegal Cyrillic characters in public landing page
    const hasCyrillicChars = /[\u0400-\u04FF]/.test(htmlContent);
    if (hasCyrillicChars) {
      brokenLinks.push(`Strict English violation: Cyrillic characters detected in landing page ${campaignId}/${variant}`);
    }

    // 2. Check Umami / Analytics event tracking binding
    const hasUmamiTracking =
      htmlContent.includes('umami.track') ||
      htmlContent.includes('trackQuizEvent') ||
      htmlContent.includes('data-umami-event') ||
      htmlContent.includes('sendTelemetry');

    if (!hasUmamiTracking) {
      details.push('Warning: No Umami custom event tracker binding found in HTML.');
    }

    // 3. Parse <a ...> tags: href, target, rel, macros
    const anchorTagRegex = /<a\s+([^>]*?)>/gi;
    let match: RegExpExecArray | null;
    let checkedCount = 0;
    let hasNofollowSponsored = true;
    let hasTargetBlank = true;

    while ((match = anchorTagRegex.exec(htmlContent)) !== null) {
      const fullAttrs = match[1];
      const hrefMatch = /href=["']([^"']*)["']/i.exec(fullAttrs);
      const rawHref = hrefMatch ? hrefMatch[1] : '';

      if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:')) continue;

      checkedCount++;
      const isExternalCta =
        rawHref.includes('http://') ||
        rawHref.includes('https://') ||
        rawHref.includes('/click') ||
        rawHref.includes('cpa') ||
        fullAttrs.includes('ctaLink');

      if (isExternalCta) {
        // Validate target="_blank"
        const isTargetBlank = /target=["']_blank["']/i.test(fullAttrs);
        if (!isTargetBlank) {
          hasTargetBlank = false;
          brokenLinks.push(`External link missing target="_blank": ${rawHref.slice(0, 60)}`);
        }

        // Validate rel="nofollow sponsored"
        const relMatch = /rel=["']([^"']*)["']/i.exec(fullAttrs);
        const relValue = relMatch ? relMatch[1].toLowerCase() : '';
        const isNofollowSponsored = relValue.includes('nofollow') && relValue.includes('sponsored');
        if (!isNofollowSponsored) {
          hasNofollowSponsored = false;
          brokenLinks.push(`External link missing rel="nofollow sponsored": ${rawHref.slice(0, 60)}`);
        }

        // Validate macro preservation
        const hasSub1 = rawHref.includes('ml_sub1=') || rawHref.includes('sub1=') || rawHref.includes('s1=') || rawHref.includes('click_id=');
        const hasSub2 = rawHref.includes('ml_sub2=') || rawHref.includes('sub2=') || rawHref.includes('s2=');
        const hasSub3 = rawHref.includes('ml_sub3=') || rawHref.includes('sub3=') || rawHref.includes('s3=');

        if (!hasSub1 && !rawHref.includes('/click?')) {
          missingMacros.push(`ml_sub1 missing in ${rawHref.slice(0, 60)}`);
        }
        if (!hasSub2 && !rawHref.includes('/click?') && !rawHref.includes('lospollos')) {
          missingMacros.push(`ml_sub2 missing in ${rawHref.slice(0, 60)}`);
        }
        if (!hasSub3 && !rawHref.includes('/click?') && !rawHref.includes('lospollos')) {
          missingMacros.push(`ml_sub3 missing in ${rawHref.slice(0, 60)}`);
        }
      }
    }

    // 4. Parse <button onclick="..."> or action triggers
    const buttonRegex = /<button\s+[^>]*onclick=["']([^"']*)["'][^>]*>/gi;
    while ((match = buttonRegex.exec(htmlContent)) !== null) {
      const clickHandler = match[1];
      if (clickHandler.includes('location.href') || clickHandler.includes('window.open') || clickHandler.includes('redirect')) {
        checkedCount++;
      }
    }

    if (checkedCount === 0) {
      brokenLinks.push(`No outbound CTA links found in template (${foundPath})`);
    }

    const isValid = brokenLinks.length === 0 && missingMacros.length === 0 && !hasCyrillicChars;

    return {
      isValid,
      campaignId,
      variant,
      checkedCount,
      brokenLinks,
      missingMacros,
      latencyMs: 1,
      hops: [foundPath],
      hasUmamiTracking,
      hasNofollowSponsored,
      hasTargetBlank,
      hasCyrillicChars,
      details,
    };
  }

  /**
   * 4. Validates Blog Distribution & Content Compliance:
   * - Scans all compiled HTML files in blog/dist (or specified directory)
   * - Ensures strict English (zero Cyrillic characters)
   * - Ensures all outbound links have rel="nofollow sponsored" and target="_blank"
   */
  public validateBlogPages(distOrSrcDir?: string): BlogAuditReport {
    const candidateDirs = [
      distOrSrcDir,
      path.resolve(process.cwd(), 'blog/dist'),
      path.resolve(process.cwd(), '../blog/dist'),
      path.resolve(__dirname, '../../../blog/dist'),
    ].filter(Boolean) as string[];

    let targetDir = '';
    for (const d of candidateDirs) {
      if (fs.existsSync(d) && fs.statSync(d).isDirectory()) {
        targetDir = d;
        break;
      }
    }

    if (!targetDir) {
      return {
        isValid: false,
        scannedFiles: 0,
        brokenLinks: ['blog/dist directory not found; run blog build first'],
        cyrillicViolations: [],
        missingComplianceLinks: [],
      };
    }

    const htmlFiles: string[] = [];
    const findHtml = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          findHtml(full);
        } else if (entry.name.endsWith('.html')) {
          htmlFiles.push(full);
        }
      }
    };
    findHtml(targetDir);

    const cyrillicViolations: string[] = [];
    const missingComplianceLinks: string[] = [];
    const brokenLinks: string[] = [];

    for (const filePath of htmlFiles) {
      const content = fs.readFileSync(filePath, 'utf8');

      // Check Cyrillic violations
      if (/[\u0400-\u04FF]/.test(content)) {
        cyrillicViolations.push(filePath);
      }

      // Check external affiliate links in blog post HTML
      const aRegex = /<a\s+([^>]*?)>/gi;
      let m: RegExpExecArray | null;
      while ((m = aRegex.exec(content)) !== null) {
        const attrs = m[1];
        const hrefMatch = /href=["']([^"']*)["']/i.exec(attrs);
        const href = hrefMatch ? hrefMatch[1] : '';

        // Check if external or monetization smartlink (/go, /click, cpa networks)
        const isMonetizationOrCpaLink =
          href.startsWith('/go') ||
          href.includes('postback-engine') ||
          href.includes('/click') ||
          href.includes('lospollos') ||
          href.includes('mylead') ||
          href.includes('cpa');

        if (isMonetizationOrCpaLink) {
          const hasTarget = /target=["']_blank["']/i.test(attrs);
          const hasRel =
            /rel=["'][^"']*nofollow[^"']*sponsored[^"']*["']/i.test(attrs) ||
            /rel=["'][^"']*sponsored[^"']*nofollow[^"']*["']/i.test(attrs);

          if (!hasTarget || !hasRel) {
            missingComplianceLinks.push(`${path.basename(filePath)} -> ${href.slice(0, 40)}`);
          }
        }
      }
    }

    const isValid = cyrillicViolations.length === 0 && missingComplianceLinks.length === 0 && brokenLinks.length === 0;

    return {
      isValid,
      scannedFiles: htmlFiles.length,
      brokenLinks,
      cyrillicViolations,
      missingComplianceLinks,
    };
  }

  /**
   * Internal helper to execute HEAD or GET request with follow-up redirection discovery
   */
  private executeHeadOrGet(targetUrl: string): Promise<{ statusCode?: number; redirectUrl?: string; error?: string }> {
    return new Promise((resolve) => {
      let parsed: URL;
      try {
        parsed = new URL(targetUrl);
      } catch (err: any) {
        return resolve({ error: err.message });
      }

      const isHttps = parsed.protocol === 'https:';
      const client = isHttps ? https : http;

      const req = client.request(
        targetUrl,
        {
          method: 'GET',
          timeout: this.defaultTimeoutMs,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 AntigravityIntegrityBot/1.0',
            Accept: '*/*',
          },
        },
        (res) => {
          const statusCode = res.statusCode;
          const redirectUrl = res.headers.location;

          // Consume stream to free memory
          res.on('data', () => {});
          res.on('end', () => {
            resolve({ statusCode, redirectUrl });
          });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        resolve({ error: `Connection timed out after ${this.defaultTimeoutMs}ms` });
      });

      req.on('error', (err) => {
        resolve({ error: err.message });
      });

      req.end();
    });
  }
}
