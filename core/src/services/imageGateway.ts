import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface ImageGenerationOptions {
  width?: number;
  height?: number;
  seed?: number;
  model?: 'flux' | 'turbo';
  nologo?: boolean;
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
      const contentType = response.headers['content-type'] || 'image/jpeg';

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
}
