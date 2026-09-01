/**
 * @deprecated Use LlmGatewayService from './services/llm-gateway.service.js' instead.
 * This module is kept for backward-compatibility and delegates to LlmGatewayService.
 */

import { LlmGatewayService } from './services/llm-gateway.service.js';

export async function generateContent(prompt: string): Promise<string> {
  const gateway = LlmGatewayService.getInstance();
  const result = await gateway.executeInference('agent-context-copywriter-02', {
    systemPrompt: 'You are an autonomous affiliate intelligence agent.',
    userPrompt: prompt,
    temperature: 0.7,
  });
  return result.rawText;
}
