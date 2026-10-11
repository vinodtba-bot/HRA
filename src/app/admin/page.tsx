import { prisma } from '@/lib/db';
import { audit } from '@/lib/audit';
import { slaOverdue, NIGHTLY_EXPORTS } from '@/lib/exports';

export const dynamic = 'force-dynamic';


export default async function AdminPage() {
  await audit('admin_view', null, { actor: 'admin' });
  const campaigns = await prisma.campaign.findMany({ orderBy: { createdAt: 'desc' } });
  const funnel = await prisma.$queryRaw<Record<string, bigint | string>[]>`
    select c.name as campaign,
      count(distinct i.id) as invited,
      count(distinct i.id) filter (where exists (select 1 from message m where m.invitation_id = i.id and m.sent_at is not null)) as texted,
      count(distinct i.id) filter (where exists (select 1 from message m where m.invitation_id = i.id and m.status = 'delivered')) as delivered,
      count(distinct i.id) filter (where i.first_opened_at is not null) as opened,
      count(distinct i.id) filter (where i.verified_at is not null) as verified,
      count(distinct a.id) filter (where a.status = 'in_progress') as in_progress,
      count(distinct a.id) filter (where a.status = 'completed') as completed,
      count(distinct a.id) filter (where a.status = 'partial') as partial,
      count(distinct a.id) filter (where a.status = 'declined') as declined,
      count(distinct a.id) filter (where a.status = 'reported_complete') as reported_complete,
      count(distinct i.id) filter (where mb.opted_out_at is not null) as opted_out,
      count(distinct i.id) filter (where mb.bad_number_at is not null) as bad_number,
      count(distinct i.id) filter (where i.locked_until > now()) as locked_now
    from campaign c
    join invitation i on i.campaign_id = c.id
    join member mb on mb.id = i.member_id
    left join assessment a on a.invitation_id = i.id
    group by c.id, c.name, c.created_at
    order by c.created_at desc`;
  const byForm = await prisma.$queryRaw<{ form: string; started: bigint; completed: bigint }[]>`
    select questionnaire_id || '@' || questionnaire_version as form, count(*) as started,
      count(*) filter (where status = 'completed') as completed
    from assessment group by 1 order by 1`;
  const referrals = await prisma.referral.groupBy({ by: ['program'], _count: true });
  const overdue = await slaOverdue();
  const cols = funnel[0] ? Object.keys(funnel[0]).filter(k => k !== 'campaign') : [];

  return (
    <main style={{ maxWidth: 1100 }}>
      <h1>HRA outreach funnel</h1>
      <p className="muted">{campaigns.length} campaign(s). Counts only, no member details. Exports below contain PHI.</p>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead><tr><th>Campaign</th>{cols.map(c => <th key={c}>{c.replace(/_/g, ' ')}</th>)}</tr></thead>
          <tbody>{funnel.map(r => (
            <tr key={String(r.campaign)}><td>{String(r.campaign)}</td>{cols.map(c => <td className="n" key={c}>{String(r[c])}</td>)}</tr>
          ))}</tbody>
        </table>
      </div>
      <h2>By form</h2>
      <div className="card"><table>
        <thead><tr><th>Form</th><th>Started</th><th>Completed</th></tr></thead>
        <tbody>{byForm.map(f => <tr key={f.form}><td>{f.form}</td><td className="n">{String(f.started)}</td><td className="n">{String(f.completed)}</td></tr>)}</tbody>
      </table></div>
      <h2>Referrals</h2>
      <div className="card"><table>
        <tbody>{referrals.map(r => <tr key={r.program}><td>{r.program}</td><td className="n">{r._count}</td></tr>)}</tbody>
      </table></div>
      <h2>First-outreach SLA</h2>
      <div className="card">
        <p className={overdue.length ? 'error' : ''}>{overdue.length} member(s) not texted within their risk tier&apos;s deadline (3 business days for tier 3, 5 for others).</p>
      </div>
      <h2>Exports (CSV)</h2>
      <div className="card" style={{ display: 'grid', gap: 8 }}>
        {NIGHTLY_EXPORTS.map(k => <a key={k} href={`/admin/export/${k}`}>{k.replace(/_/g, ' ')}</a>)}
      </div>
    </main>
  );
}
