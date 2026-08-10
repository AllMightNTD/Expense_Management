export function formatVND(amount: bigint): string {
  const num = Number(amount);
  const formatted = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(num);
  return formatted;
}

export function parseVNDToMinorUnits(input: string): bigint {
  const cleaned = input.replace(/[^\d]/g, '');
  if (!cleaned) return BigInt(0);
  return BigInt(cleaned);
}

export function calculateDailySafeSpend(safeToSpendRemaining: bigint, daysRemaining: number): bigint {
  if (daysRemaining <= 0) return BigInt(0);
  return safeToSpendRemaining / BigInt(daysRemaining);
}
