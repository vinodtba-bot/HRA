import { mailForm } from '../components.mjs';
import { site } from '../config.mjs';

export const path = 'contact.html';
export const title = 'Contact us';
export const description = `Contact AyuHealth about HRA outreach, partnerships, press or careers. Email ${site.contactEmail}.`;

const fields = `
  <div class="form__row">
    <div class="field"><label for="c-name">Full name</label><input id="c-name" name="name" required autocomplete="name"></div>
    <div class="field"><label for="c-email">Email</label><input id="c-email" name="email" type="email" required autocomplete="email"></div>
  </div>
  <div class="form__row">
    <div class="field"><label for="c-org">Organization</label><input id="c-org" name="organization" autocomplete="organization"></div>
    <div class="field"><label for="c-topic">Topic</label>
      <select id="c-topic" name="topic"><option>General question</option><option>Product demo</option><option>Partnership</option><option>Press</option><option>Careers</option><option>Something else</option></select></div>
  </div>
  <div class="field"><label for="c-message">Message</label><textarea id="c-message" name="message" rows="6" required></textarea></div>`;

export const body = `
<section class="section">
  <div class="wrap split split--top">
    <div class="stack" style="gap:1.4rem">
      <p class="eyebrow">Contact</p>
      <h1>Talk to us.</h1>
      <p class="lede">Questions about HRA outreach, a partnership idea or anything else. Send a message and it goes straight to our team’s inbox.</p>
      <div class="stack" style="gap:.5rem">
        <p class="eyebrow" style="color:var(--ink-2)">Email</p>
        <div class="contact-line"><span class="mono">${site.contactEmail}</span><button class="btn btn--ghost btn--small" type="button" data-copy="${site.contactEmail}">Copy</button></div>
      </div>
      <div class="stack" style="gap:.5rem">
        <p class="eyebrow" style="color:var(--ink-2)">Looking for a demo?</p>
        <p>The <a href="demo.html">demo request</a> asks a few questions about your program so we can show your own state’s HRA.</p>
      </div>
    </div>
    <div class="card">
      ${mailForm({
        id: 'contact-form',
        subject: 'Website contact: AyuHealth',
        fields,
        button: 'Send message',
        doneTitle: 'Thanks. Your message is on its way.',
        doneText: `We read every message and reply from ${site.contactEmail}.`,
      })}
    </div>
  </div>
</section>
`;
