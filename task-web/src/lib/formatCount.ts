export function formatCount(count: number): string {
  return Intl.NumberFormat('en', { notation: 'compact' }).format(count);
}
