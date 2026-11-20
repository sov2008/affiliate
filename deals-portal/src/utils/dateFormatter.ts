// deals-portal/src/utils/dateFormatter.ts
export function getCurrentMonthYear(format: 'long' | 'upper' = 'long'): string {
  const now = new Date();
  const str = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  return format === 'upper' ? str.toUpperCase() : str;
}

