import { ctaBand } from '../components.mjs';
import { site } from '../config.mjs';
import { brandName } from '../layout.mjs';

export const path = 'company.html';
export const title = 'About us';
export const description = 'Why we build member outreach for health plans, what we believe, and how to work with us.';

export const body = `
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Company</p>
    <h1>Outreach a member can finish while waiting for the bus.</h1>
    <p class="lede">Health plans ask members important questions about falls, housing, pregnancy and mood, and then struggle to get the answers in time to help. We build the shortest path from a plan’s question to a member’s answer, and from that answer to help.</p>
  </div>
</section>

<section class="section" style="padding-top:1rem">
  <div class="wrap">
    <div class="section__head"><p class="eyebrow">What we believe</p><h2>Four rules we build by.</h2></div>
    <div class="grid grid--2">
      <div class="feature"><h3>Respect the member’s time</h3><p>One link, one question per screen, and answers saved on every tap. If a member has to start over, we failed.</p></div>
      <div class="feature"><h3>Follow the plan’s rules exactly</h3><p>The approved form, the state’s identity check, the contract’s timeline. Compliance is a feature, not a review step.</p></div>
      <div class="feature"><h3>An answer should lead somewhere</h3><p>A survey that ends in a spreadsheet is a missed chance. Every HRA should end with a care plan and the right referral.</p></div>
      <div class="feature"><h3>Show results with the method</h3><p>We report outcomes against a holdout group, with the time period and sample, or we don’t report them.</p></div>
    </div>
  </div>
</section>

<section class="section section--tint">
  <div class="wrap">
    <div class="section__head"><p class="eyebrow">Leadership</p><h2>The team.</h2></div>
    <div class="grid grid--3">
      <div class="placeholder"><span class="placeholder__label">Placeholder</span><b>[Name]</b><span>[Title], [one line on background]</span></div>
      <div class="placeholder"><span class="placeholder__label">Placeholder</span><b>[Name]</b><span>[Title], [one line on background]</span></div>
      <div class="placeholder"><span class="placeholder__label">Placeholder</span><b>[Name]</b><span>[Title], [one line on background]</span></div>
    </div>
  </div>
</section>

<section class="section anchor" id="careers">
  <div class="wrap split split--top">
    <div class="stack">
      <p class="eyebrow">Careers</p>
      <h2>Build software members actually use.</h2>
      <p class="lede">We look for people who care about getting the details right for the member on the other end of the text.</p>
    </div>
    <div class="placeholder"><span class="placeholder__label">Placeholder</span><b>[Open roles]</b><span>[List roles here, or link to the careers board when it exists.]</span></div>
  </div>
</section>

<section class="section section--tint">
  <div class="wrap split">
    <div class="stack">
      <p class="eyebrow">Contact</p>
      <h2>Talk to ${brandName()}.</h2>
      <p class="lede">For demos and pilots, use the request form. For anything else, email us.</p>
    </div>
    <div class="stack">
      <p class="mono" style="font-size:1.05rem">${site.contactEmail}</p>
      <p class="muted" style="font-size:.85rem">Placeholder address until a company inbox is set up.</p>
      <div class="btn-row"><a class="btn btn--primary" href="demo.html">Request a demo</a></div>
    </div>
  </div>
</section>
`;
