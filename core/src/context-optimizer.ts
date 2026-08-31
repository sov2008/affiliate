interface OptimizerOptions {
  maxTokens?: number;
  preserveKeys?: string[];
}

export function optimizeContext(rawPrompt: string, options: OptimizerOptions = {}): string {
  const { preserveKeys = [] } = options;

  // Simple token estimator (roughly 1 token = 4 chars for English prose)
  const estimateTokens = (text: string) => Math.ceil(text.length / 4);

  const originalTokens = estimateTokens(rawPrompt);

  let optimized = rawPrompt;

  // Masking: protect preserveKeys by replacing them temporarily
  const masks: Record<string, string> = {};
  preserveKeys.forEach((key, index) => {
    const mask = `__PRESERVED_KEY_${index}__`;
    masks[mask] = key;
    // Replace global, case-insensitive
    optimized = optimized.replace(new RegExp(key, 'gi'), mask);
  });

  // 1. Remove HTML comments
  optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');
  
  // 2. Remove CSS comments
  optimized = optimized.replace(/\/\*[\s\S]*?\*\//g, '');

  // 3. Compress multiple whitespaces, tabs, and linebreaks
  // Turn multiple spaces/tabs into a single space
  optimized = optimized.replace(/[ \t]+/g, ' ');
  // Turn multiple newlines into a single newline
  optimized = optimized.replace(/\n\s*\n/g, '\n');
  
  // Restore masks
  for (const [mask, key] of Object.entries(masks)) {
    optimized = optimized.replace(new RegExp(mask, 'g'), key);
  }

  // Trim borders
  optimized = optimized.trim();

  const compressedTokens = estimateTokens(optimized);
  const savedPercent = originalTokens > 0 
    ? Math.round(((originalTokens - compressedTokens) / originalTokens) * 100) 
    : 0;

  console.log(`[Context Optimizer] Original: ${originalTokens} tokens -> Compressed: ${compressedTokens} tokens (${savedPercent}% saved)`);

  return optimized;
}
