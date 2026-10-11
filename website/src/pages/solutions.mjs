import { packGrid, ctaBand } from '../components.mjs';
import { segments } from '../solutions.mjs';
import { esc, statusPill } from '../layout.mjs';

export const path = 'solutions.html';
export const title = 'Solutions';
export const description =
  'Outreach solutions for health plans and providers, starting with health risk assessments for Medicaid, Medicare Advantage and D-SNP.';

export const body = `
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Solutions</p>
    <h1>Outreach surveys for health plans and providers, starting with the HRA.</h1>
    <p class="lede">Each solution is a ready-made set of forms, outreach rules, referrals and reports. They all run on the same engagement core, so members see one trusted link and your team learns one tool.</p>
  </div>
</section>

<section class="section" style="padding-top:1rem">
  <div class="wrap">
    <div class="section__head"><p class="eyebrow">By use case</p><h2>Available now, and what’s next.</h2></div>
    ${packGrid()}
  </div>
</section>

<section class="section section--tint">
  <div class="wrap">
    <div class="section__head"><p class="eyebrow">By organization</p><h2>Built around how your program is regulated.</h2></div>
    <div class="grid grid--3">
      ${segments
        .map(
          (g) => `<div class="feature card anchor" id="${g.id}"><div>${statusPill(g.status)}</div><h3>${esc(g.name)}</h3><p>${esc(g.text)}</p></div>`,
        )
        .join('')}
    </div>
  </div>
</section>

<section class="section anchor" id="roadmap">
  <div class="wrap split">
    <div class="stack">
      <p class="eyebrow">What’s next</p>
      <h2>Have a survey your members never finish?</h2>
      <p class="lede">New solutions start from real programs. Tell us which outreach survey costs your team the most calls, and we’ll show how it would run on the platform.</p>
      <div class="btn-row"><a class="btn btn--primary" href="demo.html">Tell us about your use case</a></div>
    </div>
    <div class="card stack">
      <h3>Every new solution reuses</h3>
      <ul class="checklist">
        <li><span>The secure link and identity check members already trust</span></li>
        <li><span>The one-question-per-screen member app</span></li>
        <li><span>Form approvals, versions and audit trail</span></li>
        <li><span>Outreach cadence, quiet hours and opt-outs</span></li>
        <li><span>Rules, referrals and reporting</span></li>
      </ul>
    </div>
  </div>
</section>

${ctaBand()}
`;
