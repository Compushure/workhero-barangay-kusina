export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Masks sensitive ID by showing only the last 4 characters
 * Example: "123-45-6789" becomes "xxx-xx-6789"
 */
export function maskSensitiveId(id: string | undefined): string {
  if (!id || id.length <= 4) return id || 'N/A';
  
  const lastFour = id.slice(-4);
  const maskedPart = 'x'.repeat(Math.min(id.length - 4, 10));
  
  return `${maskedPart}${lastFour}`;
}
