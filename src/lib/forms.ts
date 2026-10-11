import { prisma } from './db';
import type { FormDefinition } from './questionnaire';

type Assignable = { state: string; lineOfBusiness: string };
type AssignmentRow = { state: string | null; lineOfBusiness: string | null; questionnaireId: string; priority: number };

/** Picks the form for a member: exact matches beat wildcards, then the higher priority wins. Pure, for tests. */
export function pickAssignment(rows: AssignmentRow[], m: Assignable): AssignmentRow | undefined {
  const specificity = (r: AssignmentRow) => (r.state ? 2 : 0) + (r.lineOfBusiness ? 1 : 0);
  return rows
    .filter(r => (r.state == null || r.state === m.state) && (r.lineOfBusiness == null || r.lineOfBusiness === m.lineOfBusiness))
    .sort((a, b) => b.priority - a.priority || specificity(b) - specificity(a))[0];
}

/** The latest published version of the form assigned to this member's state and line of business, or null. */
export async function resolveForm(m: Assignable, at = new Date()) {
  const rows = await prisma.formAssignment.findMany({
    where: { effectiveFrom: { lte: at }, OR: [{ effectiveTo: null }, { effectiveTo: { gt: at } }] },
  });
  const a = pickAssignment(rows, m);
  if (!a) return null;
  return prisma.questionnaire.findFirst({
    where: { id: a.questionnaireId, status: 'published' },
    orderBy: { publishedAt: 'desc' },
  });
}

/** Loads the exact form version pinned on the assessment, so a member never switches versions mid-way. */
export async function loadForm(a: { questionnaireId: string; questionnaireVersion: string }) {
  const q = await prisma.questionnaire.findUniqueOrThrow({
    where: { id_version: { id: a.questionnaireId, version: a.questionnaireVersion } },
  });
  return q.definition as unknown as FormDefinition;
}
