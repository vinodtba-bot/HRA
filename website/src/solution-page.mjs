// Renders solutions-<slug>.html for each entry in solutions.mjs.
import { esc, statusPill } from './layout.mjs';
import { smsPhone, verifyPhone, questionPhone, carePlanPhone, faqList, ctaBand } from './components.mjs';

const list = (items) => items.map((i) => `<li><span>${esc(i)}</span></li>`).join('');

function available(s) {
  return `
<section class="hero">
  <div class="wrap hero__grid">
    <div class="hero__copy">
      <p class="eyebrow">${esc(s.eyebrow)}</p>
      <h1>${esc(s.headline)}</h1>
      <p class="lede">${esc(s.lede)}</p>
      <div class="btn-row"><a class="btn btn--primary" href="demo.html">Request a demo</a><a class="btn btn--ghost" href="#experience">See the member experience</a></div>
      <p class="hero__fine">For ${esc(s.programs.join(', '))}.</p>
    </div>
    <div class="phones">${smsPhone()}${questionPhone()}</div>
  </div>
</section>

<section class="section section--line">
  <div class="wrap">
    <div class="section__head"><p class="eyebrow">Why HRAs stall</p><h2>The questions are the easy part.</h2></div>
    <div class="grid grid--2">${s.problems
      .map((p) => `<div class="feature"><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>`)
      .join('')}</div>
  </div>
</section>

<section class="section section--tint anchor" id="experience">
  <div class="wrap">
    <div class="section__head"><p class="eyebrow">The member experience</p><h2>What your member sees, screen by screen.</h2>
      <p class="lede">Redrawn from the working product with a sample plan. Every screen is sized for a phone held in one hand.</p></div>
    <div class="phone-row phone-row--four">${smsPhone()}${verifyPhone()}${questionPhone()}${carePlanPhone()}</div>
    <ol class="journey" style="margin-top:2.5rem">${s.steps
      .map((st) => `<li><h3>${esc(st.title)}</h3><p>${esc(st.text)}</p></li>`)
      .join('')}</ol>
  </div>
</section>

<section class="section">
  <div class="wrap split split--top">
    <div class="stack">
      <p class="eyebrow">Follow-up</p>
      <h2>${esc(s.followUp.title)}</h2>
      <p class="lede">Most of an HRA program is chasing the members who started and stopped. The platform runs that policy for you.</p>
    </div>
    <ul class="checklist">${list(s.followUp.points)}</ul>
  </div>
</section>

<section class="section section--tint">
  <div class="wrap">
    <div class="section__head"><p class="eyebrow">Built for HRA programs</p><h2>The details state contracts and CMS care about.</h2></div>
    <div class="grid grid--3">${s.features
      .map((f) => `<div class="feature card"><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p></div>`)
      .join('')}</div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section__head"><p class="eyebrow">Your numbers</p><h2>How far are you from your completion target?</h2>
      <p class="lede">Enter your own figures. Nothing leaves this page.</p></div>
    <div class="calc" id="gap-calc">
      <div class="calc__inputs">
        <div class="field"><label for="calc-members">Members due for an HRA each year</label><input id="calc-members" type="number" min="0" step="100" value="20000" inputmode="numeric"></div>
        <div class="field"><label for="calc-current">Completed within the window today (%)</label><input id="calc-current" type="number" min="0" max="100" value="35" inputmode="numeric"></div>
        <div class="field"><label for="calc-target">Your target (%)</label><input id="calc-target" type="number" min="0" max="100" value="50" inputmode="numeric"><small>Use your state contract minimum or your internal goal.</small></div>
      </div>
      <div class="calc__out" aria-live="polite">
        <span class="eyebrow" style="color:var(--signal)">Gap to target</span>
        <span class="calc__big" id="calc-short">3,000</span>
        <p id="calc-msg">members a year who need to finish an HRA they are not finishing today.</p>
        <p class="mono" style="font-size:.8rem">Completing today: <span id="calc-done">7,000</span> · Needed for target: <span id="calc-need">10,000</span></p>
      </div>
    </div>
  </div>
</section>

<section class="section section--line">
  <div class="wrap split split--top">
    <div class="stack">
      <p class="eyebrow">What you can measure</p>
      <h2>Reported the way regulators and your Stars team count.</h2>
    </div>
    <ul class="checklist">${list(s.measures)}</ul>
  </div>
</section>

<section class="section section--tint">
  <div class="wrap">
    <div class="section__head"><p class="eyebrow">Questions</p><h2>What HRA teams ask us first.</h2></div>
    ${faqList(s.faq)}
  </div>
</section>

${ctaBand()}
`;
}

function roadmap(s) {
  return `
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">${esc(s.name)}</p>
    <div>${statusPill(s.status)}</div>
    <h1>${esc(s.headline)}</h1>
    <p class="lede">${esc(s.lede)}</p>
  </div>
</section>

<section class="section" style="padding-top:1rem">
  <div class="wrap split split--top">
    <div class="card stack">
      <h3>What it will do</h3>
      <ul class="checklist">${list(s.bullets)}</ul>
      <p class="muted" style="font-size:.88rem">For ${esc(s.audience.join(' and ').toLowerCase())}. Scope is set with early partners and may change.</p>
    </div>
    <div class="stack">
      <h2>Built on the platform you’d already run for HRAs.</h2>
      <p class="lede">Same secure link, same member app, same form approvals, outreach rules and reporting. A new solution adds its own forms and rules, not a new vendor.</p>
      <div class="btn-row"><a class="btn btn--primary" href="demo.html">Tell us about your use case</a><a class="btn btn--ghost" href="solutions-hra.html">See HRA outreach</a></div>
    </div>
  </div>
</section>
`;
}

export function solutionPage(s) {
  return {
    path: `solutions-${s.slug}.html`,
    title: s.name,
    description: `${s.headline} ${s.lede}`,
    body: s.status === 'available' ? available(s) : roadmap(s),
  };
}
