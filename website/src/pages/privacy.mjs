import { site } from '../config.mjs';

export const path = 'privacy.html';
export const title = 'Privacy policy';
export const description = 'How AyuHealth handles information collected through this website.';

export const body = `
<section class="section">
  <div class="wrap legal">
    <p class="eyebrow">Legal</p>
    <h1>Privacy policy</h1>
    <p class="muted">Last updated October 11, 2026. Draft pending legal review.</p>

    <p>This policy covers this website (${site.url}). It does not cover member or patient information our customers process on the AyuHealth platform. That information is handled under each customer’s agreements with us, including a HIPAA business associate agreement, and under the customer’s own privacy notices.</p>

    <h2>What we collect</h2>
    <ul>
      <li><b>Information you send us.</b> When you use the contact or demo request forms, we receive what you enter: your name, email address, organization, role and message.</li>
      <li><b>Basic technical data.</b> Like most websites, our hosting provider records standard request data such as IP address, browser type and pages requested, to keep the site running and secure.</li>
    </ul>
    <p>We do not use advertising cookies or sell personal information. Please don’t send member or patient health information through this website.</p>

    <h2>How we use it</h2>
    <ul>
      <li>To answer your message or schedule a demo you asked for.</li>
      <li>To follow up about AyuHealth products, which you can opt out of at any time.</li>
      <li>To operate, secure and improve the website.</li>
    </ul>

    <h2>Who we share it with</h2>
    <p>We use service providers to run the website: a hosting provider, a form delivery service that forwards form submissions to our inbox, and Google Fonts for typefaces. They process data only to provide those services. We may disclose information when the law requires it.</p>

    <h2>How long we keep it</h2>
    <p>We keep form submissions for as long as needed to respond and follow up, and delete them when they are no longer needed for that purpose.</p>

    <h2>Your choices</h2>
    <p>You can ask us to access, correct or delete the information you sent us, or to stop contacting you. Depending on where you live, you may have additional rights under laws such as the California Consumer Privacy Act. Email <a href="mailto:${site.contactEmail}">${site.contactEmail}</a> and we will respond within the time the law requires.</p>

    <h2>Contact</h2>
    <p>Questions about this policy: <a href="mailto:${site.contactEmail}">${site.contactEmail}</a>.</p>
  </div>
</section>
`;
