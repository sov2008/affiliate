import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables from all standard hierarchy paths
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

export interface ImageGeneratorOptions {
  width?: number;
  height?: number;
  quality?: number;
  timeoutMs?: number;
  category?: string;
  motto?: string;
  forceRefresh?: boolean;
}

export class ImageGeneratorService {
  private static instance: ImageGeneratorService | null = null;
  private postsImagesDir: string;
  private defaultCoverRelPath = '/images/posts/default-cover.webp';
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

    const defaultDir = path.resolve(process.cwd(), 'blog/public/images/posts');
    try {
      fs.mkdirSync(defaultDir, { recursive: true });
    } catch {}
    return defaultDir;
  }

  /**
   * Polls NVIDIA Cloud Functions (NVCF) queue until completed or timeout
   */
  private async pollNvcfQueue(reqId: string, apiKey: string, maxAttempts: number = 20): Promise<any> {
    const pollUrl = `https://api.nvcf.nvidia.com/v2/nvcf/pexec/status/${reqId}`;
    let attempts = 0;
    while (attempts < maxAttempts) {
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 2500));
      try {
        const pollRes = await axios.get(pollUrl, {
          headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
          validateStatus: () => true,
        });

        if (pollRes.status === 200) {
          return pollRes.data;
        }
        if (pollRes.status !== 202) {
          throw new Error(`NVCF queue error (HTTP ${pollRes.status}): ${JSON.stringify(pollRes.data)}`);
        }
      } catch (err: any) {
        if (attempts >= maxAttempts) throw err;
      }
    }
    throw new Error(`NVCF inference queue timeout for reqId: ${reqId}`);
  }

  /**
   * Extracts base64 image payload from various NVIDIA response formats
   */
  private extractBase64(data: any): string | null {
    if (!data) return null;
    if (data.artifacts && Array.isArray(data.artifacts) && data.artifacts.length > 0) {
      if (data.artifacts[0].finishReason === 'CONTENT_FILTERED') {
        throw new Error('NVIDIA NIM safety filter triggered (CONTENT_FILTERED)');
      }
      return data.artifacts[0].base64 || data.artifacts[0].b64_json || null;
    }
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      return data.data[0].b64_json || data.data[0].base64 || data.data[0].image || null;
    }
    if (data.image) return data.image;
    if (data.b64_json) return data.b64_json;
    return null;
  }

  /**
   * Builds high-precision prompt based on Forensic Evidence Photography taxonomy (.agents/skills/ai_gateway_invoker)
   */
  public buildForensicPrompt(
    topic: string,
    category?: string,
    motto?: string
  ): { prompt: string; negativePrompt: string } {
    const cleanTopic = topic.replace(/["\n\r]/g, ' ').trim();
    const cat = (category || '').toLowerCase();

    let subjectScene = '';

    if (cat.includes('safety') || cat.includes('scam') || cat.includes('dossier')) {
      subjectScene = `Top-down desk flatlay of a cyber intelligence investigator in Cheltenham UK. Printed blockchain transaction ledgers, highlighted crypto wallet addresses with yellow marker, redacted dossier folders, forensic tweezers, vintage ThinkPad laptop on a dark oak wooden desk, warm directional desk lamp lighting`;
    } else if (cat.includes('algo') || cat.includes('mechanic') || cat.includes('code') || cat.includes('telemetry')) {
      subjectScene = `Macro laboratory photograph in a radio-frequency hardware lab. An engineering prototype smartphone disassembled on a blue anti-static mat, matte display showing terminal telemetry and spectrum analysis graphs, digital oscilloscope probes, open notebook with probability distribution formulas`;
    } else if (cat.includes('dialogue') || cat.includes('voice') || cat.includes('audio') || cat.includes('deepfake')) {
      subjectScene = `Audio forensics investigation desk. Vintage magnetic reel-to-reel tape recorder connected to a digital spectrum analyzer, printed acoustic voice spectrogram sheets with red pen markings on anomaly peaks, studio monitor headphones resting on walnut wood`;
    } else if (cat.includes('psychology') || cat.includes('behavior') || cat.includes('manipulation')) {
      subjectScene = `Forensic cork evidence board. Archived index cards with handwritten behavioral psychology notes and user conversion diagrams linked with taut red threads, date-stamped evidence labels, side lighting with subtle realistic shadows`;
    } else if (cat.includes('date') || cat.includes('romantic') || cat.includes('first-date') || cat.includes('offline')) {
      subjectScene = `35mm contact sheet candid observation. Ambient scene in a classic quiet European cafe or London underground concourse, authentic human interaction, natural directional cafe lighting, shallow depth of field, archival field observation notes folder`;
    } else {
      subjectScene = `Investigative technical bureau desk scene. Tactile paperwork, technical dossier binders, dark desktop, natural moody morning light, shallow depth of field, authentic British investigative journalism aesthetic`;
    }

    const masterPrompt = `Editorial documentary photograph, 35mm film grain, analog surveillance aesthetic, forensic evidence shot, ${subjectScene}, tactile paper and hardware textures, desaturated muted color palette with cold shadows, no anime, no cartoons, photorealistic 8k, aspect ratio 16:9. Context: ${cleanTopic}. ${motto ? `Detail: ${motto}.` : ''}`.trim();

    const negativePrompt = `anime, manga, cartoon, illustration, drawing, painting, 3d render, cgi, smooth plastic skin, smiling glamorous model, romantic couple stock photo, neon glow cyberpunk, oversaturated vibrant colors, watermark, text logo overlay, low resolution, blurry, artifact`;

    return { prompt: masterPrompt, negativePrompt };
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
   * Primary inference via NVIDIA NIM FLUX.1-dev
   */
  private async generateViaNvidiaFlux(
    prompt: string,
    apiKey: string,
    timeoutMs: number = 30000
  ): Promise<Buffer | null> {
    const fluxUrl = 'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-dev';
    console.log(`⚡ [ImageGenerator] Invoking NVIDIA NIM FLUX.1-dev...`);

    const response = await axios.post(
      fluxUrl,
      { prompt, mode: 'base' },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: timeoutMs,
        validateStatus: () => true,
      }
    );

    let responseData: any = null;
    if (response.status === 200) {
      responseData = response.data;
    } else if (response.status === 202) {
      const reqId = response.headers['nvcf-reqid'] as string;
      if (!reqId) {
        throw new Error('NVIDIA returned 202 without nvcf-reqid header');
      }
      console.log(`⏳ [ImageGenerator] Queued in NVIDIA NVCF (${reqId}), polling status...`);
      responseData = await this.pollNvcfQueue(reqId, apiKey, 20);
    } else {
      throw new Error(`NVIDIA FLUX.1-dev HTTP ${response.status}: ${JSON.stringify(response.data)}`);
    }

    const b64 = this.extractBase64(responseData);
    if (!b64) {
      throw new Error('Failed to extract base64 from NVIDIA FLUX.1-dev response');
    }

    return Buffer.from(b64, 'base64');
  }

  /**
   * Secondary inference via NVIDIA NIM Stable Diffusion 3.5 Large
   */
  private async generateViaNvidiaSD35(
    prompt: string,
    negativePrompt: string,
    apiKey: string,
    timeoutMs: number = 30000
  ): Promise<Buffer | null> {
    const sd35Url = 'https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3.5-large';
    console.log(`⚡ [ImageGenerator] Invoking NVIDIA NIM SD 3.5 Large fallback...`);

    const response = await axios.post(
      sd35Url,
      {
        prompt,
        negative_prompt: negativePrompt,
        aspect_ratio: '16:9',
        mode: 'text-to-image',
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: timeoutMs,
        validateStatus: () => true,
      }
    );

    let responseData: any = null;
    if (response.status === 200) {
      responseData = response.data;
    } else if (response.status === 202) {
      const reqId = response.headers['nvcf-reqid'] as string;
      if (!reqId) {
        throw new Error('NVIDIA SD 3.5 returned 202 without nvcf-reqid');
      }
      responseData = await this.pollNvcfQueue(reqId, apiKey, 20);
    } else {
      throw new Error(`NVIDIA SD 3.5 HTTP ${response.status}: ${JSON.stringify(response.data)}`);
    }

    const b64 = this.extractBase64(responseData);
    if (!b64) {
      throw new Error('Failed to extract base64 from NVIDIA SD 3.5 response');
    }

    return Buffer.from(b64, 'base64');
  }

  /**
   * Tertiary fallback via Pollinations AI FLUX engine
   */
  private async generateViaPollinations(
    prompt: string,
    width: number,
    height: number,
    timeoutMs: number = 20000
  ): Promise<Buffer | null> {
    console.log(`🌐 [ImageGenerator] Invoking Pollinations FLUX fallback...`);
    const encodedPrompt = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 1000000);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=flux&nologo=true&seed=${seed}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(pollinationsUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) FlirtCheck/2.0',
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
    });

    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`Pollinations HTTP error: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length < 2000) {
      throw new Error('Pollinations returned undersized image payload');
    }

    return buffer;
  }

  /**
   * Generates a photorealistic editorial cover image using NVIDIA NIM (FLUX.1-dev),
   * post-processes it to WebP 1200x675 via Sharp, and saves locally to blog/public/images/posts/${slug}.webp.
   * Multi-tier fallback: NVIDIA FLUX.1-dev -> NVIDIA SD 3.5 Large -> Pollinations FLUX -> Editorial SVG Badge.
   */
  public async generateArticleCover(
    slug: string,
    promptTheme: string,
    options: ImageGeneratorOptions = {}
  ): Promise<string> {
    const width = options.width || 1200;
    const height = options.height || 675;
    const quality = options.quality || 86;
    const timeoutMs = options.timeoutMs || 40000;

    const targetFileName = `${slug}.webp`;
    const targetAbsPath = path.join(this.postsImagesDir, targetFileName);
    const targetRelPath = `/images/posts/${targetFileName}`;

    // Reuse existing cover if cached and healthy (unless forceRefresh is true)
    if (!options.forceRefresh && fs.existsSync(targetAbsPath) && fs.statSync(targetAbsPath).size > 5000) {
      return targetRelPath;
    }

    const { prompt, negativePrompt } = this.buildForensicPrompt(promptTheme, options.category, options.motto);
    const nvidiaKey =
      process.env.NVIDIA_FLUX_DEV_API_KEY ||
      process.env.NVIDIA_API_KEY ||
      process.env.NVIDIA_SD35_API_KEY ||
      '';

    let rawImageBuffer: Buffer | null = null;
    const startTime = Date.now();

    // 1. Tier 1: NVIDIA NIM FLUX.1-dev
    if (nvidiaKey && nvidiaKey.startsWith('nvapi-')) {
      try {
        rawImageBuffer = await this.generateViaNvidiaFlux(prompt, nvidiaKey, timeoutMs);
        console.log(`✅ [ImageGenerator] NVIDIA NIM FLUX.1-dev generated cover in ${Date.now() - startTime}ms`);
      } catch (err: any) {
        console.warn(`⚠️ [ImageGenerator] NVIDIA FLUX.1-dev failed: ${err.message}. Trying Tier 2 (SD 3.5 Large)...`);
      }

      // 2. Tier 2: NVIDIA NIM SD 3.5 Large
      if (!rawImageBuffer) {
        try {
          rawImageBuffer = await this.generateViaNvidiaSD35(prompt, negativePrompt, nvidiaKey, timeoutMs);
          console.log(`✅ [ImageGenerator] NVIDIA NIM SD 3.5 generated cover in ${Date.now() - startTime}ms`);
        } catch (sdErr: any) {
          console.warn(`⚠️ [ImageGenerator] NVIDIA SD 3.5 failed: ${sdErr.message}. Falling back to Tier 3...`);
        }
      }
    }

    // 3. Tier 3: Pollinations AI FLUX
    if (!rawImageBuffer) {
      try {
        rawImageBuffer = await this.generateViaPollinations(prompt, width, height, 25000);
        console.log(`✅ [ImageGenerator] Pollinations FLUX generated cover in ${Date.now() - startTime}ms`);
      } catch (pollErr: any) {
        console.warn(`⚠️ [ImageGenerator] Pollinations FLUX failed: ${pollErr.message}`);
      }
    }

    // 4. Post-processing with Sharp into WebP
    if (rawImageBuffer && rawImageBuffer.length > 2000) {
      try {
        await sharp(rawImageBuffer)
          .resize(width, height, { fit: 'cover', position: 'attention' })
          .webp({ quality, effort: 6 })
          .toFile(targetAbsPath);

        const fileSize = fs.statSync(targetAbsPath).size;
        console.log(`📸 [ImageGenerator] Forensic cover saved: ${targetAbsPath} (${fileSize} bytes WebP)`);
        return targetRelPath;
      } catch (sharpErr: any) {
        console.error(`❌ [ImageGenerator] Sharp processing failed: ${sharpErr.message}`);
      }
    }

    // 5. Tier 4: Editorial SVG fallback
    console.warn(`⚠️ [ImageGenerator] All generative tiers failed for "${slug}". Falling back to default cover.`);
    await this.ensureDefaultCoverExists();
    return this.defaultCoverRelPath;
  }
}

export const imageGeneratorService = ImageGeneratorService.getInstance();

