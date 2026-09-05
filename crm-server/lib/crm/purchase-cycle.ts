export function computePurchaseCycle(
  orderDates: Date[]
): { avg: number | null; stdDev: number | null } {
  if (orderDates.length < 2) return { avg: null, stdDev: null };

  const sorted = [...orderDates].sort((a, b) => a.getTime() - b.getTime());
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    gaps.push((sorted[i].getTime() - sorted[i - 1].getTime()) / 86_400_000);
  }

  const avg = gaps.reduce((s, g) => s + g, 0) / gaps.length;
  const variance = gaps.reduce((s, g) => s + (g - avg) ** 2, 0) / gaps.length;
  return { avg, stdDev: Math.sqrt(variance) };
}

export function predictNextOrder(lastOrderDate: Date, avgCycleDays: number | null): Date | null {
  if (avgCycleDays === null) return null;
  return new Date(lastOrderDate.getTime() + avgCycleDays * 86_400_000);
}

export function isOverdue(predictedNextOrderDate: Date | null, now = new Date()): boolean {
  return !!predictedNextOrderDate && predictedNextOrderDate.getTime() < now.getTime();
}

export function isDueSoon(
  predictedNextOrderDate: Date | null,
  bufferDays = 3,
  now = new Date()
): boolean {
  if (!predictedNextOrderDate) return false;
  const threshold = new Date(now.getTime() + bufferDays * 86_400_000);
  return predictedNextOrderDate.getTime() <= threshold.getTime();
}

// ---------------- RFM ----------------

export interface RFMRawInput {
  customerId: string;
  recencyDays: number; // أيام منذ آخر طلب
  orderCount: number;
  totalSpend: number;
}

export interface RFMResult {
  customerId: string;
  rScore: number;
  fScore: number;
  mScore: number;
  segment: "VIP" | "REGULAR" | "AT_RISK" | "NEW";
}

function quintileScore(value: number, sortedAsc: number[], reverse = false): number {
  if (sortedAsc.length === 0) return 1;
  const rank = sortedAsc.filter((v) => v <= value).length / sortedAsc.length;
  const score = Math.min(5, Math.max(1, Math.ceil(rank * 5)));
  return reverse ? 6 - score : score;
}

/** يحسب RFM لكل الزبائن دفعة واحدة (يحتاج توزيع القاعدة الكاملة لحساب الأخماس) */
export function computeRFMBatch(inputs: RFMRawInput[]): RFMResult[] {
  const recencies = inputs.map((i) => i.recencyDays).sort((a, b) => a - b);
  const frequencies = inputs.map((i) => i.orderCount).sort((a, b) => a - b);
  const monetary = inputs.map((i) => i.totalSpend).sort((a, b) => a - b);

  return inputs.map((i) => {
    const rScore = quintileScore(i.recencyDays, recencies, true); // أقل أيام = أفضل
    const fScore = quintileScore(i.orderCount, frequencies);
    const mScore = quintileScore(i.totalSpend, monetary);
    const total = rScore + fScore + mScore;

    let segment: RFMResult["segment"] = "REGULAR";
    if (i.orderCount <= 1) segment = "NEW";
    else if (total >= 13) segment = "VIP";
    else if (rScore <= 2 && fScore >= 3) segment = "AT_RISK";

    return { customerId: i.customerId, rScore, fScore, mScore, segment };
  });
}
