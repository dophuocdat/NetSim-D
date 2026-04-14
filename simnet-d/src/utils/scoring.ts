export function calculateScore(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export function calculateXP(
  baseXP: number,
  scorePercent: number,
  streakMultiplier: number = 1.0
): number {
  const perfectBonus = scorePercent === 100 ? 50 : 0;
  return Math.floor((baseXP + perfectBonus) * streakMultiplier);
}
