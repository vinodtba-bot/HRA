import { ctaBand } from '../components.mjs';

export const path = 'customers.html';
export const title = 'Customers';
export const description = 'Who the platform is built for, what a pilot looks like, and customer stories as they are published.';

const story = (lob) => `<article class="placeholder">
  <span class="placeholder__label">Placeholder story</span>
  <b>[Health plan name], ${lob}</b>
  <span><b>Challenge:</b> [What was hard about their HRA program, in their words]</span>
  <span><b>Approach:</b> [States, lines of business and channels in scope]</span>
  <span><b>Result:</b> [Measured outcome against a holdout group, with dates and method]</span>
</article>`;

export const body = `
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Customers</p>
    <h1>Built with the teams who own HRA completion.</h1>
    <p class="lede">Quality and Stars leads, care management, outreach call centers and compliance all touch an HRA program. Each one gets something different from the platform.</p>
  </div>
</section>

<section class="section" style="padding-top:1rem">
  <div class="wrap">
    <div class="section__head"><p class="eyebrow">Customer stories</p><h2>Results, as our customers publish them.</h2>
      <p class="lede">We only share outcomes a customer has approved, with the method and time period alongside.</p></div>
    <div class="grid grid--3">${story('Medicaid')}${story('D-SNP')}${story('Medicare Advantage')}</div>
    <div class="logo-row" style="margin-top:1.5rem" aria-label="Customer logo placeholders">
      <div class="logo-slot">[Customer logo]</div><div class="logo-slot">[Customer logo]</div><div class="logo-slot">[Customer logo]</div><div class="logo-slot">[Customer logo]</div><div class="logo-slot">[Customer logo]</div>
    </div>
  </div>
</section>

<section class="section section--tint">
  <div class="wrap">
    <div class="section__head"><p class="eyebrow">Who uses it</p><h2>One platform, five teams.</h2></div>
    <div class="grid grid--3">
      <div class="feature card"><span class="feature__tag">Quality and Stars</span><h3>Hit the completion target</h3><p>Campaigns by state and line of business, with completion inside the window tracked every day.</p></div>
      <div class="feature card"><span class="feature__tag">Care management</span><h3>Get to high-risk members sooner</h3><p>Referrals arrive the day the member answers, with their responses attached.</p></div>
      <div class="feature card"><span class="feature__tag">Outreach center</span><h3>Spend calls where they matter</h3><p>Agents work a queue of partial HRAs ranked by risk, instead of cold-dialing the whole list.</p></div>
      <div class="feature card"><span class="feature__tag">Compliance</span><h3>Show your work</h3><p>Approved forms, consent, quiet hours, attempts and dispositions on record for every member.</p></div>
      <div class="feature card"><span class="feature__tag">IT and data</span><h3>Fit what you run</h3><p>File and API intake, FHIR exports and a headless API for your own app or portal.</p></div>
      <div class="feature card"><span class="feature__tag">Members</span><h3>Finish in one sitting, or three</h3><p>No download, no password, and their answers wait for them when they come back.</p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap split split--top">
    <div class="stack">
      <p class="eyebrow">How a pilot works</p>
      <h2>Prove the lift on one program before you scale.</h2>
      <p class="lede">A pilot starts small enough to launch quickly and is measured against a holdout group, so the result stands up to your finance and quality teams.</p>
    </div>
    <ol class="journey" style="grid-template-columns:1fr 1fr">
      <li><h3>Pick the scope</h3><p>One state and one or two lines of business, with a clear completion target.</p></li>
      <li><h3>Configure</h3><p>Load your approved form, identity rules, outreach cadence and referral rules.</p></li>
      <li><h3>Launch to a cohort</h3><p>Text a first group of members while a matched group continues with current outreach.</p></li>
      <li><h3>Measure and decide</h3><p>Compare completion, timeliness, referrals and cost per completed HRA.</p></li>
    </ol>
  </div>
</section>

${ctaBand('Talk to us about a pilot.', 'Tell us your state, line of business and target. We’ll outline what a pilot would look like.')}
`;
