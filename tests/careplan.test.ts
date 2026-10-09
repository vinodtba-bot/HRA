import { describe, expect, it } from 'vitest';
import { buildCarePlan, buildReferrals, isHighRisk } from '@/lib/careplan';

describe('care plan rules', () => {
  it('adds a falls item for a fall', () => expect(buildCarePlan({ fell: true }).map(i => i.rule)).toEqual(['falls']));
  it('adds a food item for sometimes or often', () => {
    expect(buildCarePlan({ food_worry: 'sometimes' }).map(i => i.rule)).toContain('food');
    expect(buildCarePlan({ food_worry: 'never' }).map(i => i.rule)).not.toContain('food');
  });
  it('adds a mood item at PHQ-2 >= 3', () => {
    expect(buildCarePlan({ phq2_interest: '2', phq2_down: '1' }).map(i => i.rule)).toContain('mood');
    expect(buildCarePlan({ phq2_interest: '1', phq2_down: '1' }).map(i => i.rule)).not.toContain('mood');
  });
  it('is empty with no needs', () =>
    expect(buildCarePlan({ fell: false, food_worry: 'never', has_pcp: true, phq2_interest: '0', phq2_down: '0' })).toEqual([]));
});

describe('isHighRisk (placeholder until the plan defines it)', () => {
  it('2 or more ER visits', () => expect(isHighRisk({ er_visits: 2 })).toBe(true));
  it('poor health plus a chronic condition', () => expect(isHighRisk({ general_health: 'poor', chronic_condition: true })).toBe(true));
  it('poor health alone is not enough', () => expect(isHighRisk({ general_health: 'poor', chronic_condition: false })).toBe(false));
  it('positive PHQ-2', () => expect(isHighRisk({ phq2_interest: '3', phq2_down: '0' })).toBe(true));
  it('low risk', () => expect(isHighRisk({ er_visits: 0, general_health: 'good', phq2_interest: '0', phq2_down: '0' })).toBe(false));
});

describe('referrals', () => {
  it('maternity on pregnancy', () => expect(buildReferrals({ pregnant: true }).map(r => r.program)).toEqual(['maternity']));
  it('sdoh on housing', () => expect(buildReferrals({ housing_unstable: true }).map(r => r.program)).toEqual(['sdoh_outreach']));
  it('care management when high risk', () => expect(buildReferrals({ er_visits: 5 }).map(r => r.program)).toEqual(['care_management']));
  it('none when no needs', () => expect(buildReferrals({ er_visits: 0, food_worry: 'never' })).toEqual([]));
});
