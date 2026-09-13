import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

export interface ImageGenerationOptions {
  width?: number;
  height?: number;
  seed?: number;
  model?: 'flux' | 'turbo';
  nologo?: boolean;
}

export interface ComicCoverOptions {
  aspect_ratio?: '1:1' | '16:9' | '4:3' | '9:16' | string;
  mode?: 'text-to-image' | string;
  outputPath?: string;
  timeoutMs?: number;
  apiKey?: string;
  maxPollAttempts?: number;
}

export interface ComicCoverResult {
  buffer: Buffer;
  contentType: string;
  base64: string;
  latencyMs: number;
  outputPath?: string;
}

function extractBase64(data: any): string | null {
  if (!data) return null;
  if (data.artifacts && Array.isArray(data.artifacts) && data.artifacts.length > 0) {
    if (data.artifacts[0].finishReason === 'CONTENT_FILTERED') {
      throw new Error('Ответ отфильтрован системой безопасности NVIDIA NIM (CONTENT_FILTERED)');
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

async function pollNvcfQueue(reqId: string, apiKey: string, maxAttempts: number = 30): Promise<any> {
  const pollUrl = `https://api.nvcf.nvidia.com/v2/nvcf/pexec/status/${reqId}`;
  let attempts = 0;
  while (attempts < maxAttempts) {
    attempts++;
    await new Promise((r) => setTimeout(r, 3000));
    const pollRes = await axios.get(pollUrl, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
      validateStatus: () => true,
    });
    if (pollRes.status === 200) {
      return pollRes.data;
    }
    if (pollRes.status !== 202) {
      throw new Error(`Ошибка очереди NVIDIA NVCF (HTTP ${pollRes.status}): ${JSON.stringify(pollRes.data)}`);
    }
  }
  throw new Error(`Таймаут ожидания инференса в очереди NVIDIA NVCF (${reqId})`);
}

export class ImageGateway {
  /**
   * Generates high-quality promotional image creative via Pollinations.ai FLUX/Turbo engine.
   * Returns binary Buffer.
   */
  public static async generate(
    prompt: string,
    options: ImageGenerationOptions = {}
  ): Promise<{ buffer: Buffer; contentType: string; latencyMs: number }> {
    const width = options.width ?? 1024;
    const height = options.height ?? 1024;
    const seed = options.seed ?? Math.floor(Math.random() * 1000000);
    const nologo = options.nologo ?? true;
    const model = options.model ?? 'flux';
    const apiKey = process.env.POLLINATIONS_API_KEY;

    const encodedPrompt = encodeURIComponent(prompt.trim());
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=${nologo}&model=${model}`;

    const start = Date.now();
    const headers: Record<string, string> = {
      'User-Agent': 'AffiliateOps-CreativeEngine/2.0',
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    try {
      const response = await axios.get(url, {
        headers,
        responseType: 'arraybuffer',
        timeout: 45000,
        validateStatus: (status) => status >= 200 && status < 400,
      });

      const latencyMs = Date.now() - start;
      const buffer = Buffer.from(response.data);
      const contentType = String(response.headers['content-type'] || 'image/jpeg');

      console.log(`\x1b[2m[ImageGateway]\x1b[0m Generated ${buffer.byteLength} bytes image in \x1b[36m${latencyMs}ms\x1b[0m (seed: ${seed})`);
      return { buffer, contentType, latencyMs };
    } catch (err: any) {
      // Fallback to smaller dimension if high resolution timed out
      if (width > 512 || height > 512) {
        console.warn(`[ImageGateway] High-res generation failed (${err.message}). Retrying with optimized dimensions (512x512)...`);
        return this.generate(prompt, { ...options, width: 512, height: 512 });
      }
      throw new Error(`[ImageGateway] Failed to generate creative image: ${err.message}`);
    }
  }

  /**
   * Централизованная генерация обложек комиксов и карточек в ретро-стиле (Love is / Anime)
   * с использованием NVIDIA NIM (SD 3.5 Large / NVCF) и автоматическим fallback на FLUX.
   */
  public static async generateComicCover(
    prompt: string,
    negativePrompt: string = '',
    options: ComicCoverOptions = {}
  ): Promise<ComicCoverResult> {
    const start = Date.now();
    const apiKey =
      options.apiKey ||
      process.env.NVIDIA_API_KEY ||
      process.env.NVIDIA_SD35_API_KEY ||
      process.env.NVIDIA_FLUX_DEV_API_KEY ||
      '';

    const primaryEndpoint = 'https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3.5-large';
    const aspectRatio = options.aspect_ratio || '1:1';
    const mode = options.mode || 'text-to-image';
    const timeoutMs = options.timeoutMs || 45000;

    if (apiKey && apiKey.startsWith('nvapi-')) {
      try {
        const payload = {
          prompt,
          negative_prompt: negativePrompt,
          aspect_ratio: aspectRatio,
          mode,
        };

        const response = await axios.post(primaryEndpoint, payload, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          timeout: timeoutMs,
          validateStatus: () => true,
        });

        let responseData: any = null;
        if (response.status === 200) {
          responseData = response.data;
        } else if (response.status === 202) {
          const reqId = response.headers['nvcf-reqid'] as string;
          if (!reqId) {
            throw new Error('HTTP 202 получен от NVIDIA без заголовка nvcf-reqid');
          }
          responseData = await pollNvcfQueue(reqId, apiKey, options.maxPollAttempts || 30);
        } else {
          throw new Error(`NVIDIA NIM вернул HTTP ${response.status}: ${JSON.stringify(response.data)}`);
        }

        const b64 = extractBase64(responseData);
        if (!b64) {
          throw new Error('Не удалось извлечь base64 из ответа NVIDIA NIM');
        }

        const buffer = Buffer.from(b64, 'base64');
        const latencyMs = Date.now() - start;
        const contentType = 'image/png';

        if (options.outputPath) {
          const dir = path.dirname(options.outputPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(options.outputPath, buffer);
        }

        console.log(`\x1b[2m[ImageGateway]\x1b[0m Сгенерирована обложка комикса через NVIDIA NIM за \x1b[36m${latencyMs}ms\x1b[0m (${buffer.byteLength} байт)`);
        return {
          buffer,
          contentType,
          base64: b64,
          latencyMs,
          outputPath: options.outputPath,
        };
      } catch (nimErr: any) {
        console.warn(`[ImageGateway] Замечание инференса NVIDIA NIM (${nimErr.message}). Переключение на резервный движок...`);
      }
    }

    // Резервный путь: генерация через FLUX/Pollinations
    const combinedPrompt = negativePrompt ? `${prompt}. (negative: ${negativePrompt})` : prompt;
    const fallbackGen = await this.generate(combinedPrompt, {
      model: 'flux',
      width: 1024,
      height: 1024,
    });

    const b64 = fallbackGen.buffer.toString('base64');
    if (options.outputPath) {
      const dir = path.dirname(options.outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(options.outputPath, fallbackGen.buffer);
    }

    return {
      buffer: fallbackGen.buffer,
      contentType: fallbackGen.contentType,
      base64: b64,
      latencyMs: fallbackGen.latencyMs,
      outputPath: options.outputPath,
    };
  }
}

/**
 * Единый экспортируемый метод для вызова в cron/scheduler задачах и скриптах
 */
export async function generateComicCover(
  prompt: string,
  negativePrompt: string = '',
  options: ComicCoverOptions = {}
): Promise<ComicCoverResult> {
  return ImageGateway.generateComicCover(prompt, negativePrompt, options);
}
