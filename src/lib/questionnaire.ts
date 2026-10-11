import { z } from 'zod';

// A form is a versioned JSON definition shaped like a FHIR Questionnaire, so it can move into Medplum later.

export type Operator = '=' | '!=' | '>=' | '<=' | '>' | '<' | 'exists';
export type EnableWhen = { question: string; operator: Operator; answer?: unknown };
export type Option = { value: string; label: string };
export type ItemType = 'boolean' | 'choice' | 'integer' | 'date' | 'text';

export type Item = {
  linkId: string;
  text: string;
  section: string;
  type: ItemType;
  options?: Option[];
  required?: boolean;
  help?: string;
  min?: number;
  max?: number;
  enableWhen?: EnableWhen[];
  enableBehavior?: 'all' | 'any';
  /** Marks a self-harm item. Any positive answer triggers the crisis protocol. */
  crisis?: boolean;
};

export type FormDefinition = { id: string; version: string; displayName: string; items: Item[] };
export type Answers = Record<string, unknown>;

const test = (op: Operator, a: unknown, b: unknown): boolean => {
  switch (op) {
    case '=': return a === b;
    case '!=': return a !== b;
    case '>=': return Number(a) >= Number(b);
    case '<=': return Number(a) <= Number(b);
    case '>': return Number(a) > Number(b);
    case '<': return Number(a) < Number(b);
    case 'exists': return (a !== null && a !== undefined) === (b ?? true);
  }
};

export function isEnabled(item: Item, answers: Answers): boolean {
  if (!item.enableWhen?.length) return true;
  const results = item.enableWhen.map(c => c.question in answers && test(c.operator, answers[c.question], c.answer));
  return item.enableBehavior === 'any' ? results.some(Boolean) : results.every(Boolean);
}

/** The next question is the first enabled one without an answer, which also makes resume free. */
export const nextItem = (items: Item[], answers: Answers) =>
  items.find(i => isEnabled(i, answers) && !(i.linkId in answers));

/** The enabled question answered just before `linkId` (or the last answered one), for the Back link. */
export function previousItem(items: Item[], answers: Answers, linkId?: string): Item | undefined {
  const enabled = items.filter(i => isEnabled(i, answers) && i.linkId in answers);
  if (!linkId) return enabled.at(-1);
  const idx = items.findIndex(i => i.linkId === linkId);
  return enabled.filter(i => items.indexOf(i) < idx).at(-1);
}

/** Answers to questions that a later change disabled are ignored at scoring time. Skipped (null) answers are dropped too. */
export const effectiveAnswers = (items: Item[], answers: Answers): Answers =>
  Object.fromEntries(
    items.filter(i => isEnabled(i, answers) && i.linkId in answers && answers[i.linkId] !== null)
      .map(i => [i.linkId, answers[i.linkId]]),
  );

/** "Complete" means every enabled required question has an answer. */
export const missingRequired = (items: Item[], answers: Answers) =>
  items.filter(i => i.required && isEnabled(i, answers) && (answers[i.linkId] === undefined || answers[i.linkId] === null))
    .map(i => i.linkId);

export function progress(items: Item[], answers: Answers) {
  const enabled = items.filter(i => isEnabled(i, answers));
  return enabled.length ? enabled.filter(i => i.linkId in answers).length / enabled.length : 1;
}

/** Validates a raw form value against the item's type and options. Throws on anything unexpected. */
export function parseValue(item: Item, raw: string | null): unknown {
  if (raw === null || raw === '') {
    if (item.required) throw new Error('answer required');
    return null; // a skip
  }
  switch (item.type) {
    case 'boolean':
      return z.enum(['true', 'false']).parse(raw) === 'true';
    case 'choice':
      return z.enum(item.options!.map(o => o.value) as [string, ...string[]]).parse(raw);
    case 'integer':
      return z.coerce.number().int().min(item.min ?? -1e9).max(item.max ?? 1e9).parse(raw);
    case 'date':
      return z.string().regex(/^\d{4}-\d{2}-\d{2}$/).parse(raw);
    case 'text':
      return z.string().max(500).parse(raw.trim());
  }
}

/** True when a crisis item has a positive answer (anything but "no" / 0 / false). */
export function crisisTriggered(items: Item[], answers: Answers): boolean {
  return items.some(i => i.crisis && isEnabled(i, answers) && i.linkId in answers && isPositive(answers[i.linkId]));
}
const isPositive = (v: unknown) => !(v === null || v === false || v === 0 || v === '0' || v === 'no' || v === 'not_at_all');

const itemSchema: z.ZodType<Item> = z.object({
  linkId: z.string().regex(/^[a-z0-9_]+$/),
  text: z.string().min(1),
  section: z.string().min(1),
  type: z.enum(['boolean', 'choice', 'integer', 'date', 'text']),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  required: z.boolean().optional(),
  help: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  enableWhen: z.array(z.object({
    question: z.string(),
    operator: z.enum(['=', '!=', '>=', '<=', '>', '<', 'exists']),
    answer: z.unknown().optional(),
  })).optional(),
  enableBehavior: z.enum(['all', 'any']).optional(),
  crisis: z.boolean().optional(),
}) as z.ZodType<Item>;

export const formSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  displayName: z.string().min(1),
  items: z.array(itemSchema).min(1),
}).superRefine((f, ctx) => {
  const ids = new Set<string>();
  f.items.forEach((it, idx) => {
    if (ids.has(it.linkId)) ctx.addIssue({ code: 'custom', message: `duplicate linkId ${it.linkId}` });
    if (it.type === 'choice' && !it.options?.length) ctx.addIssue({ code: 'custom', message: `${it.linkId} needs options` });
    for (const c of it.enableWhen ?? []) {
      // enableWhen may only point backwards, otherwise the one-question-per-screen order breaks.
      if (!f.items.slice(0, idx).some(p => p.linkId === c.question))
        ctx.addIssue({ code: 'custom', message: `${it.linkId} depends on ${c.question}, which is not an earlier question` });
    }
    ids.add(it.linkId);
  });
});
