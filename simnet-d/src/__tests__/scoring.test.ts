import { describe, it, expect } from 'vitest';
import { calculateScore, calculateXP } from '../utils/scoring';

describe('Score Calculation', () => {
  it('returns 100% for all correct', () => {
    expect(calculateScore(5, 5)).toBe(100);
  });
  it('returns 80% for 4/5', () => {
    expect(calculateScore(4, 5)).toBe(80);
  });
  it('returns 0% for none correct', () => {
    expect(calculateScore(0, 5)).toBe(0);
  });
  it('returns 0% for empty total', () => {
    expect(calculateScore(0, 0)).toBe(0);
  });
});

describe('XP Calculation', () => {
  it('gives base XP for lesson', () => {
    expect(calculateXP(100, 80, 1.0)).toBe(100);
  });
  it('gives bonus for perfect score', () => {
    expect(calculateXP(100, 100, 1.0)).toBe(150);
  });
  it('applies streak multiplier', () => {
    expect(calculateXP(100, 80, 1.5)).toBe(150);
  });
  it('applies streak + perfect bonus', () => {
    expect(calculateXP(100, 100, 1.5)).toBe(225);
  });
  it('defaults streak to 1.0', () => {
    expect(calculateXP(100, 80)).toBe(100);
  });
});
