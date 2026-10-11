import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { loadForm } from '@/lib/forms';
import { isEnabled, nextItem, previousItem, progress, type Answers, type Item } from '@/lib/questionnaire';
import { answer } from './actions';

export const dynamic = 'force-dynamic';

// The page always asks the engine for the next unanswered question, so resuming from the same link
// lands on the exact question with no extra code.
export default async function QuestionPage({ searchParams }: { searchParams: Promise<{ edit?: string; error?: string }> }) {
  const { assessment } = await requireSession();
  if (assessment.status !== 'in_progress') redirect('/done');
  const { edit, error } = await searchParams;
  const form = await loadForm(assessment);
  const rows = await prisma.answer.findMany({ where: { assessmentId: assessment.id } });
  const answers: Answers = Object.fromEntries(rows.map(r => [r.linkId, r.value]));

  const editing = edit ? form.items.find(i => i.linkId === edit && isEnabled(i, answers)) : undefined;
  const item = editing ?? nextItem(form.items, answers);
  if (!item) redirect('/done');

  const sections = [...new Set(form.items.filter(i => isEnabled(i, answers)).map(i => i.section))];
  const sectionNo = sections.indexOf(item.section) + 1;
  const pct = Math.round(progress(form.items, answers) * 100);
  const back = previousItem(form.items, answers, item.linkId);
  const current = answers[item.linkId];

  return (
    <main>
      <div className="muted">{form.displayName}</div>
      <div className="row muted" style={{ fontSize: 15 }}>
        <span>Part {sectionNo} of {sections.length}: {item.section}</span>
        <span>{pct}%</span>
      </div>
      <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progress">
        <span style={{ width: `${pct}%` }} />
      </div>

      <form action={answer} className="card">
        <input type="hidden" name="linkId" value={item.linkId} />
        <h1 id="q">{item.text}</h1>
        {item.help && <p className="muted">{item.help}</p>}
        {error && <p className="error" role="alert">Please choose an answer.</p>}
        <Control item={item} current={current} />
        {!item.required && (
          <button type="submit" name="value" value="" className="secondary" formNoValidate>Skip this question</button>
        )}
      </form>

      <div className="links">
        {back && <a href={`/q?edit=${back.linkId}`}>← Back</a>}
        <span className="muted">Your answers save as you go. You can stop and come back with the same link.</span>
        <a href="/decline">No thanks, I don&apos;t want to do this</a>
      </div>
    </main>
  );
}

function Control({ item, current }: { item: Item; current: unknown }) {
  switch (item.type) {
    case 'boolean':
      return (
        <div role="group" aria-labelledby="q">
          <button type="submit" name="value" value="true" className="choice" aria-pressed={current === true}>Yes</button>
          <button type="submit" name="value" value="false" className="choice" aria-pressed={current === false}>No</button>
        </div>
      );
    case 'choice':
      return (
        <div role="group" aria-labelledby="q">
          {item.options!.map(o => (
            <button key={o.value} type="submit" name="value" value={o.value} className="choice" aria-pressed={current === o.value}>{o.label}</button>
          ))}
        </div>
      );
    case 'integer':
      return (
        <>
          <label htmlFor="value" className="muted" style={{ fontWeight: 400 }}>Enter a number</label>
          <input id="value" name="value" type="number" inputMode="numeric" min={item.min} max={item.max}
            required={item.required} defaultValue={typeof current === 'number' ? current : undefined} />
          <button type="submit">Continue</button>
        </>
      );
    case 'date':
      return (
        <>
          <input aria-labelledby="q" name="value" type="date" required={item.required} defaultValue={typeof current === 'string' ? current : undefined} />
          <button type="submit">Continue</button>
        </>
      );
    case 'text':
      return (
        <>
          <textarea aria-labelledby="q" name="value" maxLength={500} required={item.required} defaultValue={typeof current === 'string' ? current : undefined} />
          <button type="submit">Continue</button>
        </>
      );
  }
}
