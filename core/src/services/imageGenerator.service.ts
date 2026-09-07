import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

export interface ImageGeneratorOptions {
  width?: number;
  height?: number;
  quality?: number;
  timeoutMs?: number;
}

export class ImageGeneratorService {
  private static instance: ImageGeneratorService | null = null;
  private postsImagesDir: string;
  private defaultCoverRelPath = '/blog/images/posts/default-cover.webp';
  private defaultCoverAbsPath: string;

  private constructor() {
    this.postsImagesDir = this.resolvePostsImagesDir();
    this.defaultCoverAbsPath = path.join(this.postsImagesDir, 'default-cover.webp');
    this.ensureDefaultCoverExists();
  }

  public static getInstance(): ImageGeneratorService {
    if (!this.instance) {
      this.instance = new ImageGeneratorService();
    }
    return this.instance;
  }

  /**
   * Resolves absolute directory for blog/public/images/posts
   */
  private resolvePostsImagesDir(): string {
    const candidateDirs = [
      path.resolve(process.cwd(), 'blog/public/images/posts'),
      path.resolve(process.cwd(), '../blog/public/images/posts'),
      path.resolve(__dirname, '../../../blog/public/images/posts'),
      path.resolve(__dirname, '../../blog/public/images/posts'),
      '/var/www/affiliate/blog/public/images/posts',
      '/root/affiliate/blog/public/images/posts',
    ];

    for (const dir of candidateDirs) {
      if (fs.existsSync(dir)) {
        return dir;
      }
    }

    // Default to relative to cwd
    const defaultDir = path.resolve(process.cwd(), 'blog/public/images/posts');
    try {
      fs.mkdirSync(defaultDir, { recursive: true });
    } catch {}
    return defaultDir;
  }

  /**
   * Generates or ensures fallback cover exists
   */
  public async ensureDefaultCoverExists(): Promise<string> {
    try {
      if (fs.existsSync(this.defaultCoverAbsPath) && fs.statSync(this.defaultCoverAbsPath).size > 1000) {
        return this.defaultCoverRelPath;
      }

      if (!fs.existsSync(this.postsImagesDir)) {
        fs.mkdirSync(this.postsImagesDir, { recursive: true });
      }

      const svg = `
        <svg width="1200" height="675" viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#0b0f19"/>
              <stop offset="45%" stop-color="#151b2e"/>
              <stop offset="100%" stop-color="#2c113b"/>
            </linearGradient>
            <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#f43f5e"/>
              <stop offset="100%" stop-color="#8b5cf6"/>
            </linearGradient>
          </defs>
          <rect width="1200" height="675" fill="url(#bg)"/>
          <circle cx="960" cy="180" r="280" fill="#f43f5e" opacity="0.16"/>
          <circle cx="240" cy="480" r="320" fill="#8b5cf6" opacity="0.18"/>
          <rect x="120" y="240" width="80" height="6" rx="3" fill="#f43f5e"/>
          <rect x="120" y="520" width="960" height="2" fill="url(#glow)" opacity="0.6"/>
          <text x="120" y="290" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700" fill="#f43f5e" letter-spacing="4">FLIRTCHECK RESEARCH // VERIFIED EDITORIAL</text>
          <text x="120" y="375" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="56" font-weight="900" fill="#ffffff">DATING INTELLIGENCE &amp; PROFILE SAFETY</text>
          <text x="120" y="440" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" fill="#94a3b8">2026 Comprehensive Profile Verification, Scam Detection &amp; Dating Advice</text>
        </svg>
      `;

      await sharp(Buffer.from(svg))
        .webp({ quality: 88 })
        .toFile(this.defaultCoverAbsPath);

      console.log('🎨 [ImageGenerator] Generated default-cover.webp fallback asset:', this.defaultCoverAbsPath);
    } catch (err: any) {
      console.warn('⚠️ [ImageGenerator] Warning creating default cover:', err.message);
    }

    return this.defaultCoverRelPath;
  }

  /**
   * Generates an editorial cover image via Pollinations AI with a strict 10s timeout,
   * optimizes it with sharp to WebP and saves locally to blog/public/images/posts/${slug}.webp.
   * Returns fallback asset if Pollinations fails or times out.
   */
  public async generateArticleCover(
    slug: string,
    promptTheme: string,
    options: ImageGeneratorOptions = {}
  ): Promise<string> {
    const width = options.width || 1200;
    const height = options.height || 675;
    const quality = options.quality || 85;
    const timeoutMs = options.timeoutMs || 10000;

    const targetFileName = `${slug}.webp`;
    const targetAbsPath = path.join(this.postsImagesDir, targetFileName);
    const targetRelPath = `/blog/images/posts/${targetFileName}`;

    // If already generated and cached, reuse immediately
    if (fs.existsSync(targetAbsPath) && fs.statSync(targetAbsPath).size > 1000) {
      return targetRelPath;
    }

    const styledPrompt = `${promptTheme}, minimalist modern dating lifestyle, neon bokeh, cyber-aesthetic, high quality, photorealistic, cinematic lighting, 16:9, no text, no watermark`;
    const encodedPrompt = encodeURIComponent(styledPrompt);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;

    console.log(`🎨 [ImageGenerator] Fetching AI cover for "${slug}" (Timeout: ${timeoutMs}ms)...`);

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(pollinationsUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 FlirtCheck/2.0',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`Pollinations HTTP error: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const inputBuffer = Buffer.from(arrayBuffer);

      if (inputBuffer.length < 1000) {
        throw new Error('Downloaded image buffer is too small (likely error payload)');
      }

      // Convert & optimize to WebP via Sharp
      await sharp(inputBuffer)
        .resize(width, height, { fit: 'cover', position: 'attention' })
        .webp({ quality })
        .toFile(targetAbsPath);

      console.log(`✅ [ImageGenerator] Cover saved successfully: ${targetAbsPath} (${fs.statSync(targetAbsPath).size} bytes)`);
      return targetRelPath;
    } catch (err: any) {
      console.warn(`⚠️ [ImageGenerator] Pollinations fetch failed for "${slug}": ${err.message}. Falling back to default cover.`);
      await this.ensureDefaultCoverExists();
      return this.defaultCoverRelPath;
    }
  }
}

export const imageGeneratorService = ImageGeneratorService.getInstance();
