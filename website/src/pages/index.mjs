import { smsPhone, questionPhone, ctaBand, packGrid, comparisonTable } from '../components.mjs';

export const path = 'index.html';
export const title = 'Home';
export const description =
  'Text members a secure link to the HRA their state approved. One question per screen, no app, no password, and answers that become referrals the moment the member finishes.';

const diffs = [
  {
    title: 'One link, not a chat thread',
    text: 'Members get a single short link. It opens a clean mobile page with one question per screen, a progress bar and a Back button, and every tap saves.',
    vs: ['Typical approach', 'Chat-style SMS asks question after question by text, and a 40-item HRA gets lost among the member’s other messages.'],
  },
  {
    title: 'The form your state approved',
    text: 'A library of HRA forms by state and line of business, each version carrying its approvals. Campaigns can only launch with a form approved for their scope.',
    vs: ['Typical approach', 'One national digital HRA, with state differences handled in spreadsheets and scripts.'],
  },
  {
    title: 'Identity rules that follow state policy',
    text: 'Medicaid ID and date of birth in one state, date of birth and ZIP in another. No health information appears until the member is verified.',
    vs: ['Typical approach', 'An app account and password, or no check at all before questions start.'],
  },
  {
    title: 'Answers that trigger action',
    text: 'The member sees a care plan the moment they finish. Pregnancy, high risk and social needs route to the right team by your rules, the same day.',
    vs: ['Typical approach', 'Answers land in a batch file and wait for someone to read them.'],
  },
  {
    title: 'Outreach operations built in',
    text: 'High-risk members first, retries at different times of day, a 90-day pause after three attempts, standard dispositions and a partial-HRA queue ranked by risk.',
    vs: ['Typical approach', 'Send-and-report messaging, with the follow-up rules living in a call-center binder.'],
  },
  {
    title: 'One platform for every outreach survey',
    text: 'HRAs are the first solution. Care gaps, social needs screens and other payer and provider surveys reuse the same links, member app, form library and rules.',
    vs: ['Typical approach', 'A separate vendor, contract and member experience for each program.'],
  },
];

export const body = `
<section class="hero">
  <div class="wrap hero__grid">
    <div class="hero__copy">
      <p class="eyebrow">HRA outreach for Medicaid and Medicare plans</p>
      <h1>Health risk assessments members <em>actually finish.</em></h1>
      <p class="lede">Text each member a secure link to the HRA their state approved. They answer on their own phone, one question at a time, and anything that needs follow-up becomes a referral before they close the page.</p>
      <div class="btn-row">
        <a class="btn btn--primary" href="demo.html">Request a demo</a>
        <a class="btn btn--ghost" href="solutions-hra.html#experience">See the member experience</a>
      </div>
      <p class="hero__fine">No app to download. No password. Built for Medicaid managed care, Medicare Advantage and D-SNP.</p>
    </div>
    <div class="phones">${smsPhone()}${questionPhone()}</div>
  </div>
</section>

<section class="wrap" aria-label="How the member app works">
  <div class="facts">
    <div class="fact"><span class="fact__value">0</span><span class="fact__label">apps to download or passwords to remember</span></div>
    <div class="fact"><span class="fact__value">1</span><span class="fact__label">question per screen, sized for a thumb</span></div>
    <div class="fact"><span class="fact__value">Every tap</span><span class="fact__label">saved, so the same link resumes where they stopped</span></div>
    <div class="fact"><span class="fact__value">By state</span><span class="fact__label">forms, identity checks and due dates</span></div>
  </div>
</section>

<section class="section">
  <div class="wrap split split--top">
    <div class="stack">
      <p class="eyebrow">The problem</p>
      <h2>An HRA is a deadline with a survey attached.</h2>
      <p class="lede">State contracts and CMS give you a window to complete each member’s assessment. Most of that window goes to reaching people, not to the questions.</p>
    </div>
    <div class="grid grid--2">
      <div class="feature"><h3>Calls land at the wrong time</h3><p>Voicemail, wrong numbers and call-backs use up the attempts your policy allows.</p></div>
      <div class="feature"><h3>Paper comes back late</h3><p>Mailed forms return weeks later, half finished, and still need keying in.</p></div>
      <div class="feature"><h3>Every state wants its own form</h3><p>Different names, wording, required questions and approvals by state and line of business.</p></div>
      <div class="feature"><h3>Answers wait in a report</h3><p>A member who needs help today is found when someone reads next week’s batch file.</p></div>
    </div>
  </div>
</section>

<section class="section section--tint">
  <div class="wrap">
    <div class="section__head">
      <p class="eyebrow">How it works</p>
      <h2>From eligibility file to care plan, on the member’s phone.</h2>
    </div>
    <ol class="journey">
      <li><h3>Load the eligible list</h3><p>Numbers are cleaned, landlines and reassigned numbers flagged, and consent checked before anything goes out.</p></li>
      <li><h3>Text one secure link</h3><p>Plan-branded, no health information in the text, sent inside quiet hours in the member’s time zone.</p></li>
      <li><h3>Verify, then answer</h3><p>The member confirms identity the way their state requires, then answers one question per screen.</p></li>
      <li><h3>Act on the answers</h3><p>A care plan on completion, and referrals to maternity, care management and social-needs teams.</p></li>
    </ol>
    <p style="margin-top:2rem"><a class="textlink" href="solutions-hra.html">How HRA outreach works in detail</a></p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section__head">
      <p class="eyebrow">Why plans choose it</p>
      <h2>Built around the HRA rules your team already works to.</h2>
      <p class="lede">Most engagement tools send messages. This one is built for the whole job: the right form, the right member, inside the window, with something done about the answers.</p>
    </div>
    <div class="diffs">
      ${diffs
        .map(
          (d) => `<div class="diff"><h3>${d.title}</h3><p>${d.text}</p><p class="diff__vs"><b>${d.vs[0]}</b>${d.vs[1]}</p></div>`,
        )
        .join('')}
    </div>
  </div>
</section>

<section class="section section--line">
  <div class="wrap">
    <div class="section__head">
      <p class="eyebrow">Compared with the usual options</p>
      <h2>What changes for the member, and for your team.</h2>
    </div>
    ${comparisonTable()}
  </div>
</section>

<section class="section section--tint">
  <div class="wrap">
    <div class="section__head">
      <p class="eyebrow">Solutions</p>
      <h2>Start with HRAs. Add the next survey on the same platform.</h2>
      <p class="lede">Each solution is a pack of forms, rules and reports on one shared core, so your members see the same trusted link and your team learns one tool.</p>
    </div>
    ${packGrid()}
  </div>
</section>

<section class="section">
  <div class="wrap split">
    <div class="stack">
      <p class="eyebrow">Trust and security</p>
      <h2>Designed so a forwarded text exposes nothing.</h2>
      <p class="lede">Member data stays behind an identity check, and the link itself is worthless to anyone else.</p>
      <p><a class="textlink" href="security.html">How member data is protected</a></p>
    </div>
    <ul class="checklist">
      <li><span>Texts carry a random link code and no health information.</span></li>
      <li><span>Only a hash of each link code is stored, never the code itself.</span></li>
      <li><span>Link previews in messaging apps can’t open or use up the link.</span></li>
      <li><span>Five wrong identity answers lock the link for 30 minutes.</span></li>
      <li><span>STOP replies take effect at once, and texts respect each member’s quiet hours.</span></li>
    </ul>
  </div>
</section>

<section class="section section--line">
  <div class="wrap stack" style="gap:1.5rem">
    <div class="section__head" style="margin-bottom:0">
      <p class="eyebrow">Customers</p>
      <h2>Health plan teams we work with.</h2>
    </div>
    <div class="logo-row" aria-label="Customer logo placeholders">
      <div class="logo-slot">[Customer logo]</div><div class="logo-slot">[Customer logo]</div><div class="logo-slot">[Customer logo]</div><div class="logo-slot">[Customer logo]</div><div class="logo-slot">[Customer logo]</div>
    </div>
    <p class="muted" style="font-size:.85rem">Placeholder. Add customer logos here only with each customer’s written permission. <a href="customers.html">See the customers page</a>.</p>
  </div>
</section>

${ctaBand()}
`;
