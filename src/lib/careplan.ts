import type { Answers } from './questionnaire';

export type CarePlanItem = { rule: string; title: string; detail: string; action?: { label: string; href: string } };
type Rule = { id: string; when: (a: Answers) => boolean; item: Omit<CarePlanItem, 'rule'> };

const phq2 = (a: Answers) => Number(a.phq2_interest ?? 0) + Number(a.phq2_down ?? 0);

/**
 * Placeholder definition of high risk. The plan's care management team owns this rule:
 * replace it with their definition and keep the unit tests in step.
 */
export const isHighRisk = (a: Answers) =>
  Number(a.er_visits ?? 0) >= 2 ||
  (['fair', 'poor'].includes(String(a.general_health)) && a.chronic_condition === true) ||
  phq2(a) >= 3;

// Rules are plain functions over the effective answers; each produces one care plan item.
export const rules: Rule[] = [
  { id: 'falls', when: a => a.fell === true,
    item: { title: 'Lower your risk of falling', detail: 'A free home safety check and balance program are covered by your plan.',
      action: { label: 'Request a call about this', href: '/callback?topic=falls' } } },
  { id: 'food', when: a => ['often', 'sometimes'].includes(String(a.food_worry)),
    item: { title: 'Help with food', detail: 'You may qualify for healthy meal delivery and local food programs.',
      action: { label: 'Call me about it', href: '/callback?topic=food' } } },
  { id: 'housing', when: a => a.housing_unstable === true,
    item: { title: 'Help with housing', detail: 'A care coordinator can connect you with housing support near you.',
      action: { label: 'Call me about it', href: '/callback?topic=housing' } } },
  { id: 'rides', when: a => a.transport_barrier === true,
    item: { title: 'Free rides to appointments', detail: 'Your plan covers rides to medical visits.',
      action: { label: 'Call me about rides', href: '/callback?topic=rides' } } },
  { id: 'mood', when: a => phq2(a) >= 3,
    item: { title: 'Talk with a care manager', detail: 'Your answers suggest a call with someone could help.',
      action: { label: 'Request a call', href: '/callback?topic=mood' } } },
  { id: 'pcp', when: a => a.has_pcp === false,
    item: { title: 'Choose a regular doctor', detail: 'Having one doctor who knows you makes care easier. We can help you pick one.',
      action: { label: 'Help me choose', href: '/callback?topic=pcp' } } },
  { id: 'prenatal', when: a => a.pregnant === true,
    item: { title: 'Care for you and your baby', detail: 'Our maternity team will reach out about prenatal visits and extra benefits.' } },
  { id: 'tobacco', when: a => a.smoker === true,
    item: { title: 'Free help to quit tobacco', detail: 'Coaching and medicines to quit are covered by your plan.',
      action: { label: 'Call me about it', href: '/callback?topic=tobacco' } } },
  { id: 'daily_help', when: a => a.adl_help === true,
    item: { title: 'Help at home', detail: 'You may qualify for in-home help with daily tasks.',
      action: { label: 'Call me about it', href: '/callback?topic=daily_help' } } },
];

export const buildCarePlan = (answers: Answers): CarePlanItem[] =>
  rules.filter(r => r.when(answers)).map(r => ({ rule: r.id, ...r.item }));

// Referrals open work for a plan team on top of the care plan item the member sees.
export type ReferralProgram = 'maternity' | 'care_management' | 'sdoh_outreach' | 'crisis';
type ReferralRule = { program: ReferralProgram; priority: number; when: (a: Answers) => boolean; reason: string };

export const referralRules: ReferralRule[] = [
  { program: 'care_management', priority: 1, when: isHighRisk, reason: 'High risk: comprehensive assessment needed' },
  { program: 'maternity', priority: 2, when: a => a.pregnant === true, reason: 'Member reports pregnancy' },
  { program: 'sdoh_outreach', priority: 3, reason: 'Social needs reported',
    when: a => ['often', 'sometimes'].includes(String(a.food_worry)) || a.housing_unstable === true || a.transport_barrier === true },
];

export const buildReferrals = (answers: Answers) =>
  referralRules.filter(r => r.when(answers)).map(({ program, priority, reason }) => ({ program, priority, reason }));
