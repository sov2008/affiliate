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
   * Hashes string into a positive 32-bit integer for deterministic variation selection
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }

  /**
   * Builds high-precision prompt with extensive camera angles, perspectives,
   * lighting conditions, and category-specific documentary scenes.
   */
  public buildForensicPrompt(
    topic: string,
    category?: string,
    motto?: string,
    seedKey?: string
  ): { prompt: string; negativePrompt: string } {
    const cleanTopic = topic.replace(/["\n\r]/g, ' ').trim();
    const cat = (category || '').toLowerCase();
    const seed = this.hashString((seedKey || '') + cleanTopic + cat);

    // 1. Diverse Camera Angles & Framing Perspectives
    const CAMERA_PERSPECTIVES = [
      '90-degree overhead flatlay perspective, strict geometric layout, bird-eye documentary framing',
      'Tactile close-up shot with 85mm f/1.8 lens, shallow depth of field, razor-sharp foreground focus with soft bokeh',
      'Low-angle cinematic perspective, eye-level desktop alignment emphasizing depth and realistic textures',
      'Over-the-shoulder POV perspective of an intelligence analyst examining physical evidence',
      'Wide environmental documentary angle with architectural framing and subtle Dutch tilt',
      'Extreme macro close-up (100mm f/2.8 lens) capturing minute paper fibers, ink stamps, micro-textures, and tactile hardware edges',
      'Isometric three-quarters perspective table arrangement with intentional negative space',
      'Ambient candid 50mm documentary street photography view through rainy frosted window glass'
    ];

    // 2. Varied Atmospheric Lighting Scenarios
    const LIGHTING_SCENARIOS = [
      'warm directional tungsten desk lamp casting soft long diagonal shadows across dark walnut wood',
      'diffused cold overcast morning London daylight spilling through venetian blinds',
      'golden hour warm amber sidelight with dramatic contrast and rich deep shadow gradients',
      'moody late-night investigative ambiance, single focused pool of warm light surrounded by deep vignette',
      'sterile cool fluorescent laboratory lighting with balanced neutral color grading',
      'cinematic atmospheric morning haze with subtle volumetric light rays and desaturated shadows',
      'natural soft twilight illumination through antique frosted glass window panes'
    ];

    // 3. Analog Film Emulation Profiles
    const FILM_PROFILES = [
      'Kodak Portra 400 35mm film grain, authentic color response, subtle highlight halation',
      'Fujifilm Pro 400H aesthetic, desaturated greens, muted cool shadow tones, organic analog grain',
      'Ilford Delta 100 fine grain clarity, crisp tactile tonal gradation, desaturated muted documentary palette',
      'Vintage 1990s 35mm surveillance negative, authentic analog film micro-grain and realistic texture',
      'Leica Summicron documentary glass rendering, rich micro-contrast and natural non-digital look'
    ];

    // 4. Category-Specific Physical Evidence Subject Scenes (7+ per category)
    const SAFETY_DOSSIER_SCENES = [
      'Top-down desk flatlay of a cyber intelligence investigator in Cheltenham UK. Printed blockchain transaction ledgers, highlighted crypto wallet addresses with yellow marker, redacted dossier folders with black tape, forensic tweezers, vintage ThinkPad laptop on a dark oak wooden desk',
      'Heavy steel fireproof safe door open, revealing classified case folders marked CONFIDENTIAL 2026, encrypted hardware security key with digital keypad, brass vintage key ring, forensic magnifying glass resting on ledger',
      'Archive storage shelf with organized cardboard dossier boxes labeled DECLASSIFIED, red stamp ink pad, rubber document stamp, stack of printed Telegram chat transcript logs with highlighted user IDs',
      'Macro table shot of an illuminated counterfeit identification card under an ultraviolet blacklight lamp, showing hidden security fibers, micro-print flaws, digital calliper tool lying nearby',
      'Late-night financial forensics workstation. Dual dark matte monitors showing cryptocurrency mixer transaction flowcharts, cooling porcelain coffee mug, fountain pen resting on an open Moleskine notebook filled with wallet hashes',
      'Investigator desk with an open leather portfolio containing passport verification photocopies, black censor tape across sensitive credentials, forensic evidence tag with handwritten barcode FC-892',
      'Macro shot of a high-security encrypted IronKey USB flash drive plugged into a ruggedized military-grade field laptop, green activity LED glow, blurred background of legal court evidence binders'
    ];

    const ALGO_MECHANICS_SCENES = [
      'Macro laboratory photograph in a radio-frequency hardware lab. An engineering prototype smartphone disassembled on a blue anti-static mat, matte display showing terminal telemetry and spectrum analysis graphs, digital oscilloscope probes, open notebook with probability distribution formulas',
      'Reverse-engineering workstation: matte 4K display showing Ghidra decompiler disassembly hex code and IDA Pro control flow graphs, Hakko temperature-controlled soldering iron station, precision tweezers holding a surface-mount chip',
      'Radio frequency test bench: Rohde & Schwarz digital spectrum analyzer screen displaying pulsed signal waveforms, high-frequency coaxial BNC cables, copper RF shielding box',
      'Electronics inspection bench: stereo optical inspection microscope focused on an illuminated bare smartphone logic board, silicon die and NAND flash storage chips visible under ring light',
      'Automated device testing farm: aluminum multi-device rack holding multiple benchmark smartphones connected via braided USB-C cables, real-time API latency monitor console in the background',
      'Desk of an algorithm research scientist: stack of printed academic preprints on Gale-Shapley stable matching algorithms, handwritten Bayesian probability formulas on engineering grid paper, mechanical pencil',
      'Server rack room corridor in an enterprise datacenter: blinking amber and green server LEDs, neatly dressed fiber optic patch cables, portable diagnostic crash-cart terminal displaying network traffic throughput graphs'
    ];

    const DIGITAL_DIALOGUE_SCENES = [
      'Audio forensics investigation desk. Vintage magnetic reel-to-reel tape recorder connected to a digital spectrum analyzer, printed acoustic voice spectrogram sheets with red pen markings on anomaly peaks, studio monitor headphones resting on walnut wood',
      'Macro shot of voice biometric acoustic print analysis: printed 3D frequency waterfall spectrogram on millimeter grid paper with handwritten red margin notes pointing out vocoder synthesis artifacts',
      'Radio signal interception table: professional audio interface with illuminated VU meters, heavy cast-iron vintage microphone on a broadcast boom arm, sound spectrum oscilloscope monitor',
      'Sound laboratory workstation: open acoustic spectral editor on a high-resolution dark mode screen displaying vocal formant harmonics, vintage studio headphones folded beside an analog stopwatch',
      'Close-up shot of an interrogation transcript desk: typed verbatim interview transcript sheets, yellow highlighter marks over automated chatbot response patterns, cassette tape labeled EVIDENCE #4',
      'Acoustic test chamber: soundproof wedge foam walls, high-precision measurement microphone positioned on a carbon fiber tripod, digital decibel analyzer display glowing in low light',
      'Investigative smartphone desk: mobile phone lying on dark slate stone surface with chat message bubbles illuminated, forensic notebook alongside noting exact millisecond timestamp intervals of synthetic replies'
    ];

    const MODERN_PSYCHOLOGY_SCENES = [
      'Forensic cork evidence board. Archived index cards with handwritten behavioral psychology notes and user conversion diagrams linked with taut red threads, date-stamped evidence labels, side lighting with subtle realistic shadows',
      'Academic behavioral laboratory desk: open leatherbound textbook on cognitive psychology and dopamine reinforcement schedules, Rorschach inkblot test card, brass fountain pen with dark sepia ink',
      'Visual thinking artist sketchbook: hand-drawn flowcharts of variable reward mechanisms and emotional attachment loops, colorful Post-it notes with handwritten behavioral archetypes, colored pencils',
      'Conceptual narrative still life: dark carved wooden chessboard with a tense endgame layout, antique brass hourglass with dark flowing sand, warm directional spotlight emphasizing tactile textures',
      'Archival library catalog cabinet: dark mahogany filing cabinet with polished brass drawer pulls, one drawer pulled open displaying typed index cards of psychological profile taxonomies',
      'Investigator reading desk: porcelain cup of Earl Grey tea, vintage brass magnifying loupe resting over an open case report analyzing manipulative conversational framing techniques',
      'Behavioral research pinboard: wall-mounted visual board with annotated psychological interaction charts, monochrome street portraits pinned with pushpins, yarn connecting behavioral triggers to outcomes'
    ];

    const ROMANTIC_ESSAYS_SCENES = [
      '35mm contact sheet candid observation. Ambient scene in a classic quiet European cafe or London underground concourse, authentic human interaction, natural directional cafe lighting, shallow depth of field, archival field observation notes folder',
      'Intimate corner table set for two in a quiet vintage European bistro at dusk: two crystal glasses of sparkling water with lemon slices, worn leatherbound dinner menu, flickering small beeswax candle creating warm bokeh',
      'Atmospheric documentary street photograph: rainy evening reflection on the wet pavement outside an old London Underground station entrance, blurry silhouettes of people walking with umbrellas under streetlamps',
      'Cafe observation table: vintage Leica 35mm rangefinder camera resting on a white Carrara marble tabletop, small ceramic espresso cup with rich crema, spiral notebook containing handwritten body language field sketches',
      'Outdoor cafe terrace table top-down view: tiny ceramic vase with a single dried wildflower, handwritten vintage postcard with elegant fountain pen script, antique pocket watch ticking on rustic wood',
      'Cozy independent bookstore corner in Bloomsbury: wooden bookshelf lined with classic literature, small leather armchair, soft warm lamplight illuminating a notebook resting on an antique side table',
      'Quiet evening subway train car interior through glass window: reflections of warm interior lights, wet window glass with rain droplets, quiet moody urban documentary atmosphere, no posed models'
    ];

    const GENERAL_BUREAU_SCENES = [
      'Classic British intelligence research desk: heavy green banker desk lamp, stack of typed analytical dossiers with red classification ribbons, brass paperweight, tactile paper textures',
      'Investigative library archive table: large open atlas of London, vintage brass desk compass, microfiche reader glass screen glowing softly in an otherwise dim archive room',
      'Analyst workstation at daybreak: clean oak desktop, stack of newly declassified research papers, mechanical pencil, fresh morning daylight casting long diagonal window shadows',
      'Tactile paperwork and technical dossier binders on a dark desktop, natural moody morning light, shallow depth of field, authentic British investigative journalism aesthetic',
      'Old map table in a government archive: unfolded cartographic survey map with brass magnifying glass, pencil compass, field observation ledger'
    ];

    // Select category scene list
    let scenes = GENERAL_BUREAU_SCENES;
    if (cat.includes('safety') || cat.includes('scam') || cat.includes('dossier')) {
      scenes = SAFETY_DOSSIER_SCENES;
    } else if (cat.includes('algo') || cat.includes('mechanic') || cat.includes('code') || cat.includes('telemetry')) {
      scenes = ALGO_MECHANICS_SCENES;
    } else if (cat.includes('dialogue') || cat.includes('voice') || cat.includes('audio') || cat.includes('deepfake')) {
      scenes = DIGITAL_DIALOGUE_SCENES;
    } else if (cat.includes('psychology') || cat.includes('behavior') || cat.includes('manipulation')) {
      scenes = MODERN_PSYCHOLOGY_SCENES;
    } else if (cat.includes('date') || cat.includes('romantic') || cat.includes('first-date') || cat.includes('offline')) {
      scenes = ROMANTIC_ESSAYS_SCENES;
    }

    // Deterministically pick components based on hash seeds
    const chosenScene = scenes[seed % scenes.length];
    const chosenPerspective = CAMERA_PERSPECTIVES[(seed >> 2) % CAMERA_PERSPECTIVES.length];
    const chosenLighting = LIGHTING_SCENARIOS[(seed >> 4) % LIGHTING_SCENARIOS.length];
    const chosenFilm = FILM_PROFILES[(seed >> 6) % FILM_PROFILES.length];

    const masterPrompt = `Editorial documentary photograph, ${chosenFilm}, ${chosenPerspective}, ${chosenLighting}. ${chosenScene}. High textural fidelity, tactile paper and hardware surfaces, desaturated muted color palette with rich realistic shadows, analog surveillance aesthetic, no anime, no cartoons, photorealistic 8k, aspect ratio 16:9. Subject context: ${cleanTopic}. ${motto ? `Investigation focus: ${motto}.` : ''}`.trim();

    const negativePrompt = `anime, manga, cartoon, illustration, drawing, painting, 3d render, cgi, smooth plastic skin, smiling glamorous model, romantic couple stock photo, neon glow cyberpunk, oversaturated vibrant colors, watermark, text logo overlay, typography, low resolution, blurry, distorted, artificial`;

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
   * Generates a photorealistic editorial cover image using NVIDIA NIM (FLUX.1-dev / SD 3.5 Large),
   * post-processes it to WebP 1200x675 via Sharp, and saves locally to blog/public/images/posts/${slug}.webp.
   * Multi-tier fallback: NVIDIA FLUX.1-dev -> NVIDIA SD 3.5 Large -> Editorial SVG Badge.
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

    const { prompt, negativePrompt } = this.buildForensicPrompt(promptTheme, options.category, options.motto, slug);
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
          console.warn(`⚠️ [ImageGenerator] NVIDIA SD 3.5 failed: ${sdErr.message}.`);
        }
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

