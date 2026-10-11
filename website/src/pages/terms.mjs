import { site } from '../config.mjs';

export const path = 'terms.html';
export const title = 'Terms of use';
export const description = 'Terms for using the AyuHealth website.';

export const body = `
<section class="section">
  <div class="wrap legal">
    <p class="eyebrow">Legal</p>
    <h1>Terms of use</h1>
    <p class="muted">Last updated October 11, 2026. Draft pending legal review.</p>

    <p>These terms apply to your use of ${site.domain}. Use of the AyuHealth platform is governed by a separate written agreement between AyuHealth and each customer.</p>

    <h2>Website content</h2>
    <p>The content on this website is for general information about AyuHealth products. It is not medical, legal or regulatory advice. Product screens show fictional sample plans and data.</p>

    <h2>Acceptable use</h2>
    <ul>
      <li>Don’t attempt to disrupt, probe or gain unauthorized access to the website.</li>
      <li>Don’t submit unlawful content, spam, or member or patient health information through our forms.</li>
    </ul>

    <h2>Intellectual property</h2>
    <p>The AyuHealth name, logo and website content belong to AyuHealth. You may share links to the website, but please don’t copy or reuse its content without permission.</p>

    <h2>No warranty</h2>
    <p>The website is provided “as is.” We work to keep it accurate and available but don’t guarantee that it will be error-free or uninterrupted. To the extent the law allows, AyuHealth is not liable for damages arising from use of the website.</p>

    <h2>Changes</h2>
    <p>We may update these terms. The date at the top shows when they last changed.</p>

    <h2>Contact</h2>
    <p><a href="mailto:${site.contactEmail}">${site.contactEmail}</a></p>
  </div>
</section>
`;
