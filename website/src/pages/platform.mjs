import { verifyPhone, questionPhone, carePlanPhone, ctaBand } from '../components.mjs';
import { solutions } from '../solutions.mjs';
import { esc } from '../layout.mjs';

export const path = 'platform.html';
export const title = 'Platform';
export const description =
  'One engagement core for health plan outreach surveys: secure text links, a mobile member app, an approved form library, outreach orchestration, rules, referrals and reporting.';

const layerPacks = solutions
  .map((s) => `<span class="layer__chip${s.status === 'available' ? ' layer__chip--live' : ''}">${esc(s.name)}</span>`)
  .join('');

export const body = `
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Platform</p>
    <h1>One engagement core. Every outreach survey on top of it.</h1>
    <p class="lede">The secure link, the member app, the form library, the outreach rules and the reporting are shared. Each solution adds its own forms, rules and reports, so the next survey launches on what you already run.</p>
    <nav class="toc" aria-label="On this page">
      <a href="#member-app">Member app</a><a href="#orchestration">Outreach orchestration</a><a href="#forms">Form library</a><a href="#rules">Rules and referrals</a><a href="#analytics">Analytics</a><a href="#integrations">Integrations</a>
    </nav>
  </div>
</section>

<section class="section" style="padding-top:1rem">
  <div class="wrap layers" aria-label="Platform layers">
    <div class="layer"><span class="layer__name">Solutions</span><div class="layer__items">${layerPacks}</div></div>
    <div class="layer layer--core"><span class="layer__name">Engagement core</span><div class="layer__items">
      <span class="layer__chip">Secure short links</span><span class="layer__chip">Mobile member app</span><span class="layer__chip">Identity rules by state</span><span class="layer__chip">Approved form library</span><span class="layer__chip">Outreach orchestration</span><span class="layer__chip">Rules and referrals</span><span class="layer__chip">Analytics</span><span class="layer__chip">Consent and audit</span>
    </div></div>
    <div class="layer"><span class="layer__name">Channels</span><div class="layer__items"><span class="layer__chip">SMS</span><span class="layer__chip">Voice and IVR</span><span class="layer__chip">Email</span><span class="layer__chip">Staff-assisted by phone</span><span class="layer__chip">QR code on mail</span></div></div>
    <div class="layer"><span class="layer__name">Your systems</span><div class="layer__items"><span class="layer__chip">Eligibility files</span><span class="layer__chip">Care management</span><span class="layer__chip">Data warehouse</span><span class="layer__chip">FHIR APIs</span></div></div>
  </div>
</section>

<section class="section section--tint anchor" id="member-app">
  <div class="wrap split">
    <div class="stack">
      <p class="eyebrow">Member app</p>
      <h2>Text, tap, answer.</h2>
      <p class="lede">A mobile web app that opens from the text message. Nothing to install and nothing to remember.</p>
      <ul class="checklist">
        <li><span>Identity check with the fields each state requires, before any health information shows.</span></li>
        <li><span>One question per screen, large tap targets, a progress bar and Back.</span></li>
        <li><span>Saves on every tap. The same link resumes at the same question.</span></li>
        <li><span>Questions branch on earlier answers, so members only see what applies to them.</span></li>
        <li><span>A personal care plan on completion, sent again by text so the member can find it later.</span></li>
        <li><span>“No thanks” with a reason, and “I already did this,” instead of silence.</span></li>
      </ul>
    </div>
    <div class="phone-row">${verifyPhone()}${questionPhone()}</div>
  </div>
</section>

<section class="section anchor" id="orchestration">
  <div class="wrap split">
    <div class="stack">
      <p class="eyebrow">Outreach orchestration</p>
      <h2>The outreach policy, run by software.</h2>
      <p class="lede">The rules your call center follows from a binder become campaign settings, applied the same way to every member.</p>
      <ul class="checklist">
        <li><span>High-risk members are contacted first, with a timeliness flag for first touch.</span></li>
        <li><span>Retries at a different time of day, then a 90-day pause after three attempts.</span></li>
        <li><span>Quiet hours in each member’s own time zone.</span></li>
        <li><span>Standard dispositions: completed, partial, declined, bad number, opted out, already done.</span></li>
        <li><span>Annual outreach that starts ahead of each member’s due date.</span></li>
        <li><span>Fallback to voice, email or a staff call when texts go unanswered.</span></li>
      </ul>
    </div>
    <div class="panel">
      <div class="panel__bar"><span>Partial HRA queue</span><span>Sample data</span></div>
      <div class="panel__body"><table class="rows">
        <thead><tr><th>Member</th><th>Risk</th><th>Answered</th><th>Attempts</th><th>Next step</th></tr></thead>
        <tbody>
          <tr><td>TX-0042</td><td><span class="tag tag--warn">Tier 3</span></td><td class="num">31 of 40</td><td class="num">2</td><td>Staff call today</td></tr>
          <tr><td>TX-0117</td><td><span class="tag tag--warn">Tier 3</span></td><td class="num">12 of 40</td><td class="num">1</td><td>Text at 6 PM</td></tr>
          <tr><td>FL-0208</td><td><span class="tag">Tier 2</span></td><td class="num">22 of 36</td><td class="num">3</td><td>Paused 90 days</td></tr>
          <tr><td>FL-0311</td><td><span class="tag">Tier 1</span></td><td class="num">5 of 36</td><td class="num">2</td><td>Text Sat 11 AM</td></tr>
        </tbody>
      </table></div>
      <div class="panel__note">Illustrative screen. Member IDs and counts are made up.</div>
    </div>
  </div>
</section>

<section class="section section--tint anchor" id="forms">
  <div class="wrap split">
    <div class="panel">
      <div class="panel__bar"><span>Form library</span><span>Sample data</span></div>
      <div class="panel__body"><table class="rows">
        <thead><tr><th>Form name members see</th><th>State</th><th>LOB</th><th>Version</th><th>Approval</th></tr></thead>
        <tbody>
          <tr><td>Care Needs Screening</td><td>TX</td><td>Medicaid</td><td class="num">v4</td><td><span class="tag tag--ok">Approved</span></td></tr>
          <tr><td>New Member Survey</td><td>FL</td><td>Medicaid</td><td class="num">v2</td><td><span class="tag tag--ok">Approved</span></td></tr>
          <tr><td>Health Needs Assessment</td><td>AZ</td><td>D-SNP</td><td class="num">v3</td><td><span class="tag tag--warn">Renews in 30 days</span></td></tr>
          <tr><td>Health Risk Assessment</td><td>All</td><td>MA</td><td class="num">v6</td><td><span class="tag">In review</span></td></tr>
        </tbody>
      </table></div>
      <div class="panel__note">Illustrative screen. Form names follow common state usage.</div>
    </div>
    <div class="stack">
      <p class="eyebrow">Approved form library</p>
      <h2>The right form for every member, every time.</h2>
      <p class="lede">Each form version carries its approvals by state and line of business, from NCQA, CMS, the state Medicaid agency and your own clinical sign-off.</p>
      <ul class="checklist">
        <li><span>A campaign can’t go live with a form that isn’t approved for its scope.</span></li>
        <li><span>Rules pick each member’s form by state, line of business and age, with every override audited.</span></li>
        <li><span>Members keep the version they started, even if a new one is published mid-campaign.</span></li>
        <li><span>Required questions are marked per form, so “complete” matches what your state counts.</span></li>
        <li><span>Forms are stored as FHIR Questionnaires, so your content stays portable.</span></li>
      </ul>
    </div>
  </div>
</section>

<section class="section anchor" id="rules">
  <div class="wrap split">
    <div class="stack">
      <p class="eyebrow">Rules and referrals</p>
      <h2>Answers become action while the member is still on the page.</h2>
      <p class="lede">Clinical and outreach teams write the rules. The platform applies them the moment an HRA is complete, and shows the member what happens next.</p>
      <ul class="checklist">
        <li><span>Referrals to maternity, care management, behavioral health and social-needs teams.</span></li>
        <li><span>A plain-language care plan with the benefits that match the member’s answers.</span></li>
        <li><span>“Call me about this” requests that land in your team’s queue.</span></li>
        <li><span>Rule changes go through review and sign-off, with versions kept for audit.</span></li>
      </ul>
    </div>
    <div class="panel">
      <div class="panel__bar"><span>Referral rules</span><span>Example</span></div>
      <div class="rule"><b>When</b><span>Member reports being pregnant</span><b>Then</b><span>Refer to maternity program and show prenatal benefits</span></div>
      <div class="rule"><b>When</b><span>Fall in the last 12 months, or fear of falling</span><b>Then</b><span>Offer home safety check and add to care plan</span></div>
      <div class="rule"><b>When</b><span>No stable place to live, or worried about losing it</span><b>Then</b><span>Refer to community outreach team for housing support</span></div>
      <div class="rule"><b>When</b><span>Risk score in the high tier</span><b>Then</b><span>Create care management referral and flag for a call</span></div>
    </div>
  </div>
</section>

<section class="section section--tint anchor" id="analytics">
  <div class="wrap split">
    <div class="panel">
      <div class="panel__bar"><span>Campaign funnel</span><span>Sample data</span></div>
      <div class="funnel">
        <div class="funnel__row"><span>Eligible members</span><div class="funnel__bar" style="width:100%"></div><span>1,000</span></div>
        <div class="funnel__row"><span>Texted</span><div class="funnel__bar" style="width:88%"></div><span>880</span></div>
        <div class="funnel__row"><span>Opened link</span><div class="funnel__bar" style="width:62%"></div><span>620</span></div>
        <div class="funnel__row"><span>Verified</span><div class="funnel__bar" style="width:55%"></div><span>550</span></div>
        <div class="funnel__row"><span>Completed</span><div class="funnel__bar" style="width:46%"></div><span>460</span></div>
      </div>
      <div class="panel__note">Illustrative numbers to show the report layout. Not a result from any plan.</div>
    </div>
    <div class="stack">
      <p class="eyebrow">Analytics</p>
      <h2>Every number your state report needs, and the reasons behind it.</h2>
      <p class="lede">From the first row of the eligibility file to the last referral, every step is counted the same way for every campaign.</p>
      <ul class="checklist">
        <li><span>Completion within the window by state, line of business and category of aid.</span></li>
        <li><span>Drop-off by question, so you can fix the item that loses members.</span></li>
        <li><span>Attempts and dispositions behind every member, ready for audit.</span></li>
        <li><span>Referrals created, accepted and closed.</span></li>
        <li><span>Results against a holdout group, so the lift is measured, not assumed.</span></li>
      </ul>
    </div>
  </div>
</section>

<section class="section anchor" id="integrations">
  <div class="wrap">
    <div class="section__head">
      <p class="eyebrow">Integrations</p>
      <h2>Fits the systems you already run.</h2>
    </div>
    <div class="grid grid--3">
      <div class="feature card"><span class="feature__tag">In</span><h3>Eligibility and member files</h3><p>Secure file drops or APIs for new enrollees, phone numbers, risk tiers and language.</p></div>
      <div class="feature card"><span class="feature__tag">Out</span><h3>Care management and CRM</h3><p>Referrals and completed HRAs sent to your care management platform, with a link back to the answers.</p></div>
      <div class="feature card"><span class="feature__tag">Out</span><h3>Data warehouse</h3><p>Daily exports of responses, attempts and dispositions in CSV, JSON or FHIR.</p></div>
      <div class="feature card"><span class="feature__tag">Standards</span><h3>FHIR Questionnaire</h3><p>Forms and answers as FHIR Questionnaire and QuestionnaireResponse, so content moves with you.</p></div>
      <div class="feature card"><span class="feature__tag">Channels</span><h3>Messaging providers</h3><p>Texts through a registered sender with delivery receipts, opt-out sync and number checks.</p></div>
      <div class="feature card"><span class="feature__tag">Headless</span><h3>Your own app or portal</h3><p>Embed the same HRA experience in your member app or portal through the API.</p></div>
    </div>
  </div>
</section>

${ctaBand('See the platform with your own state’s HRA.', 'Bring your form and outreach policy. We’ll show how it runs as a campaign.')}
`;
