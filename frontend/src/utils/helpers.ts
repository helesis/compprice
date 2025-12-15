export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function calculatePriceDifference(
  currentPrice: number,
  previousPrice: number
): { percentage: number; direction: 'up' | 'down' | 'stable' } {
  const percentage = ((currentPrice - previousPrice) / previousPrice) * 100;
  const direction = percentage > 1 ? 'up' : percentage < -1 ? 'down' : 'stable';
  return { percentage: Math.abs(percentage), direction };
}

export function getLowestPrice(prices: { platform: string; price: number }[]): string {
  if (prices.length === 0) return 'N/A';
  return prices.reduce((min, p) => (p.price < min.price ? p : min)).platform;
}

export function getAveragePrice(prices: { price: number }[]): number {
  if (prices.length === 0) return 0;
  const sum = prices.reduce((acc, p) => acc + p.price, 0);
  return sum / prices.length;
}
