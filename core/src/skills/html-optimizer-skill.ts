export async function optimizeHtml(html: string): Promise<string> {
  console.log('[HTML Optimizer Skill] Minifying HTML and removing redundancies...');
  
  let optimized = html;
  
  // Basic minification: remove newlines and extra spaces between tags
  optimized = optimized.replace(/>\s+</g, '><');
  
  // Remove redundant Tailwind class repetitions (simple regex fallback)
  // E.g., 'flex flex' -> 'flex'
  // Note: A real implementation would use PurgeCSS or a robust AST parser.
  optimized = optimized.replace(/class="([^"]+)"/g, (match, classList) => {
    const uniqueClasses = Array.from(new Set(classList.split(/\s+/))).join(' ');
    return `class="${uniqueClasses}"`;
  });
  
  return optimized;
}
