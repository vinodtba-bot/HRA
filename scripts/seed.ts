// Loads forms, form assignments and state policies from the versioned JSON files in /forms.
// A published form version is never edited: changing a form means bumping its version.
import fs from 'node:fs';
import path from 'node:path';
import type { Prisma } from '@prisma/client';
import { prisma } from '../src/lib/db';
import { formSchema } from '../src/lib/questionnaire';

const dir = path.join(__dirname, '..', 'forms');

// Postgres jsonb reorders keys, so compare with sorted keys.
const canon = (v: unknown): string =>
  Array.isArray(v) ? `[${v.map(canon).join(',')}]`
  : v && typeof v === 'object' ? `{${Object.keys(v).sort().map(k => `${JSON.stringify(k)}:${canon((v as Record<string, unknown>)[k])}`).join(',')}}`
  : JSON.stringify(v);

async function main() {
  const formFiles = fs.readdirSync(dir).filter(f => f.endsWith('-hra.json'));
  for (const f of formFiles) {
    const def = formSchema.parse(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
    const existing = await prisma.questionnaire.findUnique({ where: { id_version: { id: def.id, version: def.version } } });
    if (existing) {
      if (canon(existing.definition) !== canon(def))
        throw new Error(`${def.id} ${def.version} is published and differs from ${f}. Bump the version instead of editing it.`);
      console.log(`form ${def.id}@${def.version}: unchanged`);
      continue;
    }
    await prisma.questionnaire.create({
      data: { id: def.id, version: def.version, displayName: def.displayName, definition: def as unknown as Prisma.InputJsonValue, status: 'published', publishedAt: new Date() },
    });
    console.log(`form ${def.id}@${def.version}: published (${def.items.length} questions)`);
  }

  const assignments = JSON.parse(fs.readFileSync(path.join(dir, 'assignments.json'), 'utf8')) as
    { state: string | null; lineOfBusiness: string | null; questionnaireId: string; priority: number }[];
  await prisma.$transaction([
    prisma.formAssignment.deleteMany({}),
    ...assignments.map(a => prisma.formAssignment.create({ data: { ...a, effectiveFrom: new Date(0) } })),
  ]);
  console.log(`form assignments: ${assignments.length}`);

  const policies = JSON.parse(fs.readFileSync(path.join(dir, 'state-policies.json'), 'utf8')) as
    { state: string; verifyFields: string[]; partialFollowupDays: number; timezone: string }[];
  for (const p of policies) await prisma.statePolicy.upsert({ where: { state: p.state }, create: p, update: p });
  console.log(`state policies: ${policies.map(p => `${p.state}=${p.verifyFields.join('+')}`).join(', ')}`);
}

main().finally(() => prisma.$disconnect());
