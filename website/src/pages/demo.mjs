import { questionPhone } from '../components.mjs';

export const path = 'demo.html';
export const title = 'Request a demo';
export const description = 'See HRA outreach on your own phone and the admin side with your state’s form.';

export const body = `
<section class="section">
  <div class="wrap split split--top">
    <div class="stack" style="gap:1.4rem">
      <p class="eyebrow">Request a demo</p>
      <h1>See an HRA on your own phone in the first five minutes.</h1>
      <p class="lede">We’ll text you a sample HRA link during the call, then walk through the admin side with your state, line of business and outreach policy.</p>
      <ul class="checklist">
        <li><span>The member flow, from text to care plan</span></li>
        <li><span>Your state’s form in the library, with approvals</span></li>
        <li><span>Outreach cadence, the partial-HRA queue and reporting</span></li>
        <li><span>What a pilot would look like for your program</span></li>
      </ul>
      <div class="phones" style="min-height:0;justify-content:flex-start">${questionPhone()}</div>
    </div>

    <div class="card">
      <form class="form" id="demo-form" novalidate>
        <div class="form__row">
          <div class="field"><label for="f-name">Full name</label><input id="f-name" name="name" required autocomplete="name"></div>
          <div class="field"><label for="f-email">Work email</label><input id="f-email" name="email" type="email" required autocomplete="email"></div>
        </div>
        <div class="form__row">
          <div class="field"><label for="f-org">Organization</label><input id="f-org" name="organization" required autocomplete="organization"></div>
          <div class="field"><label for="f-role">Role</label>
            <select id="f-role" name="role"><option>Quality or Stars</option><option>Care management</option><option>Outreach or call center</option><option>Compliance</option><option>IT or data</option><option>Executive</option><option>Other</option></select></div>
        </div>
        <div class="form__row">
          <div class="field"><label for="f-lob">Main line of business</label>
            <select id="f-lob" name="lob"><option>Medicaid</option><option>Medicare Advantage</option><option>D-SNP</option><option>Several</option><option>Provider organization</option></select></div>
          <div class="field"><label for="f-states">States</label><input id="f-states" name="states" placeholder="For example TX, FL"></div>
        </div>
        <div class="field"><label for="f-members">Members due for an HRA each year (approximate)</label><input id="f-members" name="members" inputmode="numeric"></div>
        <div class="field"><label for="f-note">What would you like to see?</label><textarea id="f-note" name="note" rows="4"></textarea></div>
        <button class="btn btn--primary" type="submit">Request a demo</button>
        <p class="muted" style="font-size:.8rem">Please don’t include member information in this form.</p>
      </form>
      <div class="form__done" id="demo-done" hidden>
        <h3>Thanks. Your request is in.</h3>
        <p>We’ll email you to find a time. Preview note: this form isn’t connected to an inbox yet, so nothing was sent.</p>
      </div>
    </div>
  </div>
</section>
`;
