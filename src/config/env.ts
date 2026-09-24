import { z } from 'zod';
import dotenv from 'dotenv';

// Ensure .env is loaded if running in Node CLI or tests
if (typeof process !== 'undefined' && process.env) {
  dotenv.config();
}

const EnvSchema = z.object({
  // NVIDIA NIM API Configuration
  NVIDIA_NIM_BASE_URL: z
    .string()
    .url()
    .default('https://integrate.api.nvidia.com/v1'),
  NVIDIA_NIM_API_KEY: z
    .string()
    .optional()
    .default(() => process.env.NVIDIA_NIM_API_KEY || process.env.NVIDIA_API_KEY || ''),
  NVIDIA_VISION_MODEL: z
    .string()
    .default('meta/llama-3.2-11b-vision-instruct'),

  // Production App URLs & Rate Limits
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default('https://flirtcheck.site'),
  MAX_UPLOAD_SIZE_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .default(10 * 1024 * 1024), // 10MB
  ANALYSIS_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(25000), // 25 seconds

  // Runtime Environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000)
});

export type Env = z.infer<typeof EnvSchema>;

function loadEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Invalid environment variables configuration:', parsed.error.format());
    throw new Error('Environment configuration validation failed');
  }
  return parsed.data;
}

export const env = loadEnv();
