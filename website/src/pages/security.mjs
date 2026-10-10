import { ctaBand, faqList } from '../components.mjs';

export const path = 'security.html';
export const title = 'Trust and security';
export const description = 'How member data is protected: secure links with no health information, identity checks by state, hashed secrets, consent and audit.';

export const body = `
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Trust and security</p>
    <h1>A text message is not a safe place for health information. So we don’t put any there.</h1>
    <p class="lede">The text carries a random link code. Everything else sits behind an identity check, and the secrets that would let someone in are never stored in readable form.</p>
  </div>
</section>

<section class="section" style="padding-top:1rem">
  <div class="wrap">
    <div class="section__head"><p class="eyebrow">The secure link</p><h2>What protects each member’s link.</h2></div>
    <div class="grid grid--3">
      <div class="feature card"><span class="feature__tag">No PHI in texts</span><h3>Nothing to read in the message</h3><p>Texts name the plan and the assessment, never a condition, answer or member ID.</p></div>
      <div class="feature card"><span class="feature__tag">Random codes</span><h3>Codes can’t be guessed</h3><p>Each link uses a long random code, and only a keyed hash of it is stored.</p></div>
      <div class="feature card"><span class="feature__tag">Bot-safe</span><h3>Link previews do nothing</h3><p>Opening the link changes nothing until a person acts, so messaging-app previews can’t use it up.</p></div>
      <div class="feature card"><span class="feature__tag">Identity first</span><h3>Verified before any health information</h3><p>The member confirms the fields their state requires. Dates of birth are compared as keyed hashes, not stored in plain text.</p></div>
      <div class="feature card"><span class="feature__tag">Lockout</span><h3>Guessing is stopped</h3><p>Five wrong answers lock the link for 30 minutes.</p></div>
      <div class="feature card"><span class="feature__tag">Short sessions</span><h3>Shared phones stay private</h3><p>Sessions end after 30 minutes idle or 4 hours in total.</p></div>
    </div>
  </div>
</section>

<section class="section section--tint">
  <div class="wrap split split--top">
    <div class="stack">
      <p class="eyebrow">Consent and messaging</p>
      <h2>Texting that follows the rules every time.</h2>
    </div>
    <ul class="checklist">
      <li><span>Texts go only to members with valid consent on file.</span></li>
      <li><span>Messages wait for quiet hours to end in the member’s own time zone.</span></li>
      <li><span>STOP takes effect at once and syncs back to your systems.</span></li>
      <li><span>Inbound delivery and reply webhooks are signature-checked before they are trusted.</span></li>
      <li><span>Sending numbers are registered with carriers for business texting.</span></li>
    </ul>
  </div>
</section>

<section class="section">
  <div class="wrap split split--top">
    <div class="stack">
      <p class="eyebrow">Platform controls</p>
      <h2>Controls your security review will ask about.</h2>
    </div>
    <ul class="checklist">
      <li><span>Encryption in transit and at rest.</span></li>
      <li><span>Role-based access scoped by plan, state and line of business, with single sign-on.</span></li>
      <li><span>Audit trail for form approvals, rule changes, overrides and data exports.</span></li>
      <li><span>Business associate agreement with every plan before any member data is shared.</span></li>
      <li><span>Full export of your data and configuration in open formats.</span></li>
    </ul>
  </div>
</section>

<section class="section section--line">
  <div class="wrap">
    <div class="section__head"><p class="eyebrow">Certifications</p><h2>Audits and attestations.</h2></div>
    <div class="grid grid--3">
      <div class="placeholder"><span class="placeholder__label">Placeholder</span><b>[SOC 2 Type II]</b><span>[Status and report date, once confirmed]</span></div>
      <div class="placeholder"><span class="placeholder__label">Placeholder</span><b>[HITRUST]</b><span>[Status, once confirmed]</span></div>
      <div class="placeholder"><span class="placeholder__label">Placeholder</span><b>[Penetration test]</b><span>[Most recent test date and firm]</span></div>
    </div>
    <p class="muted" style="font-size:.85rem;margin-top:1rem">List only certifications that are held, with dates.</p>
  </div>
</section>

${ctaBand('Need our security documentation?', 'We’ll share architecture and control details under NDA as part of your review.')}
`;
