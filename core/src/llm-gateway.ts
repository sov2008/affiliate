import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Ensure environment variables are loaded
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export async function generateContent(prompt: string): Promise<string> {
  const provider = process.env.LLM_PROVIDER || 'direct';
  const apiKey = process.env.LLM_API_KEY || process.env.GEMINI_API_KEY || '';
  const baseUrl = process.env.LLM_BASE_URL || 'http://localhost:3000/v1';
  const model = process.env.LLM_MODEL || 'gemini-2.0-flash';
  const maxOutputTokens = process.env.MAX_OUTPUT_TOKENS ? parseInt(process.env.MAX_OUTPUT_TOKENS, 10) : 2048;

  if (provider === 'omniroute') {
    let retries = 3;
    let delay = 1000;

    while (retries > 0) {
      try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (!response.ok) {
          if (response.status === 429 || response.status >= 500) {
            throw new Error(`Gateway returned status ${response.status}`);
          }
          const errData = await response.text();
          throw new Error(`Gateway error: ${errData}`);
        }

        const data: any = await response.json();
        
        if (data?.choices?.[0]?.message?.content) {
          return data.choices[0].message.content;
        } else {
          throw new Error("No text returned from OmniRoute API");
        }
      } catch (err: any) {
        console.warn(`[OmniRoute] Request failed: ${err.message}. Retries left: ${retries - 1}`);
        retries--;
        if (retries === 0) {
          console.warn("[OmniRoute] Max retries reached. Falling back to direct.");
          break; // Exit loop to trigger fallback
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  // Fallback / gemini_direct execution
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        maxOutputTokens: maxOutputTokens,
        // enablePromptCaching: process.env.ENABLE_PROMPT_CACHING === 'true' // hypothetical SDK feature
      }
    });

    if (!response.text) {
      throw new Error("No text returned from Gemini API");
    }

    return response.text;
  } catch (err: any) {
    if (err.status === 429 || err.status === 404 || (err.message && (err.message.includes('429') || err.message.includes('404')))) {
      console.error('[LLM Gateway] Rate limit or model error hit. Failing pipeline strictly for production verification.');
      throw err;
    }
    throw err;
  }
}
