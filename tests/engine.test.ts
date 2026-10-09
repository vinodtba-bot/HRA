import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  crisisTriggered, effectiveAnswers, formSchema, isEnabled, missingRequired, nextItem, parseValue, previousItem, type Item,
} from '@/lib/questionnaire';

const items: Item[] = [
  { linkId: 'fell', text: 'Fell?', section: 'Safety', type: 'boolean', required: true },
  { linkId: 'fall_injured', text: 'Hurt?', section: 'Safety', type: 'boolean', enableWhen: [{ question: 'fell', operator: '=', answer: true }] },
  { linkId: 'er_visits', text: 'ER?', section: 'Health', type: 'integer', min: 0, max: 99, required: true },
  { linkId: 'er_why', text: 'Why?', section: 'Health', type: 'text', enableWhen: [{ question: 'er_visits', operator: '>=', answer: 2 }] },
  { linkId: 'mood', text: 'Mood?', section: 'Feel', type: 'choice', options: [{ value: 'ok', label: 'OK' }, { value: 'low', label: 'Low' }],
    enableWhen: [{ question: 'fell', operator: '=', answer: true }, { question: 'er_visits', operator: '>', answer: 0 }], enableBehavior: 'any' },
  { linkId: 'harm', text: 'Harm?', section: 'Feel', type: 'choice', crisis: true,
    options: [{ value: 'not_at_all', label: 'No' }, { value: '1', label: 'Some days' }] },
];

describe('isEnabled', () => {
  it('enables items with no conditions', () => expect(isEnabled(items[0], {})).toBe(true));
  it('hides a follow-up until its parent is answered', () => expect(isEnabled(items[1], {})).toBe(false));
  it('shows a follow-up when the condition holds', () => expect(isEnabled(items[1], { fell: true })).toBe(true));
  it('hides a follow-up when the condition fails', () => expect(isEnabled(items[1], { fell: false })).toBe(false));
  it('compares numbers with >=', () => {
    expect(isEnabled(items[3], { er_visits: 2 })).toBe(true);
    expect(isEnabled(items[3], { er_visits: 1 })).toBe(false);
  });
  it('supports enableBehavior any', () => {
    expect(isEnabled(items[4], { fell: false, er_visits: 1 })).toBe(true);
    expect(isEnabled(items[4], { fell: false, er_visits: 0 })).toBe(false);
  });
});

describe('nextItem', () => {
  it('starts at the first question', () => expect(nextItem(items, {})?.linkId).toBe('fell'));
  it('skips disabled follow-ups', () => expect(nextItem(items, { fell: false })?.linkId).toBe('er_visits'));
  it('asks enabled follow-ups', () => expect(nextItem(items, { fell: true })?.linkId).toBe('fall_injured'));
  it('resumes at the first unanswered question', () =>
    expect(nextItem(items, { fell: true, fall_injured: false, er_visits: 0 })?.linkId).toBe('mood'));
  it('treats a skip (null) as answered', () =>
    expect(nextItem(items, { fell: true, fall_injured: null, er_visits: 0, mood: null })?.linkId).toBe('harm'));
  it('returns undefined when finished', () =>
    expect(nextItem(items, { fell: false, er_visits: 0, harm: 'not_at_all' })).toBeUndefined());
});

describe('previousItem', () => {
  it('goes back to the previous answered enabled question', () =>
    expect(previousItem(items, { fell: false, er_visits: 0 }, 'harm')?.linkId).toBe('er_visits'));
  it('has nothing before the first question', () => expect(previousItem(items, {}, 'fell')).toBeUndefined());
});

describe('effectiveAnswers and missingRequired', () => {
  it('drops answers to questions a later change disabled', () =>
    expect(effectiveAnswers(items, { fell: false, fall_injured: true, er_visits: 1 })).toEqual({ fell: false, er_visits: 1 }));
  it('drops skips', () => expect(effectiveAnswers(items, { fell: true, fall_injured: null })).toEqual({ fell: true }));
  it('lists unanswered required items', () => expect(missingRequired(items, { fell: true })).toEqual(['er_visits']));
  it('is empty when required items are answered', () => expect(missingRequired(items, { fell: false, er_visits: 3 })).toEqual([]));
});

describe('parseValue', () => {
  it('parses booleans', () => expect(parseValue(items[0], 'true')).toBe(true));
  it('rejects a skip on a required item', () => expect(() => parseValue(items[0], '')).toThrow());
  it('allows a skip on an optional item', () => expect(parseValue(items[1], '')).toBeNull());
  it('enforces integer bounds', () => {
    expect(parseValue(items[2], '4')).toBe(4);
    expect(() => parseValue(items[2], '-1')).toThrow();
    expect(() => parseValue(items[2], '1.5')).toThrow();
  });
  it('rejects choices that are not options', () => expect(() => parseValue(items[4], 'great')).toThrow());
});

describe('crisisTriggered', () => {
  it('fires on a positive self-harm answer', () => expect(crisisTriggered(items, { harm: '1' })).toBe(true));
  it('does not fire on "not at all"', () => expect(crisisTriggered(items, { harm: 'not_at_all' })).toBe(false));
  it('does not fire on a skip', () => expect(crisisTriggered(items, { harm: null })).toBe(false));
});

describe('shipped forms', () => {
  const dir = path.join(__dirname, '..', 'forms');
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('-hra.json'))) {
    it(`${f} is a valid form`, () => {
      const def = formSchema.parse(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
      // Every path through the form ends: answering "first option" to everything terminates.
      const answers: Record<string, unknown> = {};
      for (let i = 0; i < 200; i++) {
        const it2 = nextItem(def.items, answers);
        if (!it2) break;
        answers[it2.linkId] = it2.type === 'boolean' ? true : it2.type === 'choice' ? it2.options![0].value : it2.type === 'integer' ? 0 : 'x';
      }
      expect(nextItem(def.items, answers)).toBeUndefined();
      expect(missingRequired(def.items, answers)).toEqual([]);
    });
  }
  it('rejects a form whose condition points forward', () => {
    const bad = { id: 'x', version: '1.0.0', displayName: 'X', items: [items[1], items[0]] };
    expect(formSchema.safeParse(bad).success).toBe(false);
  });
});
