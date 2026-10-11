import { esc, solutionHref, statusPill } from './layout.mjs';
import { site } from './config.mjs';
import { solutions } from './solutions.mjs';

// Phone screens redrawn from the member app MVP (sample plan: "Sunrise Health Plan").
export const smsPhone = () => `<div class="phone phone--sms" aria-hidden="true"><div class="phone__screen">
  <div class="sms__top"><div class="sms__avatar">S</div><div class="sms__name">Sunrise Health Plan</div></div>
  <div class="sms__body">
    <div class="sms__time">Tue 10:02 AM</div>
    <div class="bubble bubble--new">Sunrise Health Plan: Hi, your yearly Care Needs Screening is ready. It takes about 8 minutes on your phone.<br><a>snrs.co/r/7Kq2Xa</a><br>Reply STOP to opt out.</div>
    <div class="sms__time">Tue 6:41 PM</div>
    <div class="bubble">You stopped at question 9. Pick up where you left off with the same link: <a>snrs.co/r/7Kq2Xa</a></div>
  </div>
</div></div>`;

export const questionPhone = () => `<div class="phone phone--app" aria-hidden="true"><div class="phone__screen">
  <div class="app__bar"><span class="app__logo">S</span>Sunrise Health Plan</div>
  <div class="app__meta"><span>Care Needs Screening</span><span class="app__meta-row"><span>Part 2 of 5: Safety</span><span>42%</span></span></div>
  <div class="app__progress"><span></span></div>
  <div class="app__card">
    <div class="app__q">Have you fallen in the last 12 months?</div>
    <div class="app__opt app__opt--on">Yes</div>
    <div class="app__opt">No</div>
  </div>
  <div class="app__foot"><a>← Back</a><span>Your answers save as you go. You can stop and come back with the same link.</span><a>No thanks, I don’t want to do this</a></div>
</div></div>`;

export const verifyPhone = () => `<div class="phone" aria-hidden="true"><div class="phone__screen">
  <div class="app__bar"><span class="app__logo">S</span>Sunrise Health Plan</div>
  <div class="app__plan">
    <h4>First, let’s make sure it’s you.</h4>
    <span style="font-size:.76rem;color:#4d5b5d;margin:0 .25rem">Texas members confirm with their Medicaid ID and date of birth.</span>
    <div class="verify__field">Medicaid ID<span class="verify__input">TX1234•••••</span></div>
    <div class="verify__field">Date of birth<span class="verify__input">04 / 12 / 1968</span></div>
    <div class="verify__btn">Continue</div>
    <span style="font-size:.7rem;color:#6f7c7e;margin:0 .25rem">We don’t show any health information until you confirm.</span>
  </div>
</div></div>`;

export const carePlanPhone = () => `<div class="phone" aria-hidden="true"><div class="phone__screen">
  <div class="app__bar"><span class="app__logo">S</span>Sunrise Health Plan</div>
  <div class="app__plan">
    <h4>Thank you. Your Care Needs Screening is complete.</h4>
    <div class="plan-card"><b>Lower your risk of falling</b><span>A free home safety check and balance program are covered by your plan.</span><i>Request a call about this</i></div>
    <div class="plan-card"><b>Help with housing</b><span>A care coordinator can connect you with housing support near you.</span><i>Call me about it</i></div>
    <div class="plan-card"><b>Free rides to appointments</b><span>Your plan covers rides to medical visits.</span></div>
  </div>
</div></div>`;

export const ctaBand = (title = 'See an HRA campaign from list to care plan.', text = 'We’ll walk through the member experience on your own phone, then the admin side with your state’s form.') => `<section class="cta-band">
  <div class="wrap">
    <div class="stack"><h2>${esc(title)}</h2><p>${esc(text)}</p></div>
    <div class="btn-row"><a class="btn btn--primary" href="demo.html">Request a demo</a><a class="btn btn--ghost" href="solutions-hra.html#experience">See the member experience</a></div>
  </div>
</section>`;

export const faqList = (items) => `<div class="faq">${items
  .map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`)
  .join('')}</div>`;

export const packGrid = () => {
  const [first, ...rest] = solutions.filter((s) => s.status === 'available');
  const avail = first
    ? `<a class="pack pack--feature" href="${solutionHref(first)}">
        <div class="stack"><div>${statusPill('available')}</div><h3>${esc(first.name)}</h3><p>${esc(first.lede)}</p><span class="textlink" style="color:var(--signal)">Explore HRA outreach</span></div>
        <ul>${first.programs.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
      </a>`
    : '';
  const others = [...rest, ...solutions.filter((s) => s.status !== 'available')]
    .map(
      (s) => `<a class="pack" href="${solutionHref(s)}"><div>${statusPill(s.status)}</div><h3>${esc(s.name)}</h3><p>${esc(
        s.headline,
      )}</p><span class="pack__meta">For ${esc(s.audience.join(' and ').toLowerCase())}</span></a>`,
    )
    .join('');
  return `<div class="packs">${avail}${others}</div>`;
};

export const comparisonTable = () => `<div class="table-scroll"><table class="compare">
  <thead><tr><th scope="col">What matters for HRAs</th><th scope="col">Outbound calls and mail</th><th scope="col">Chat-style SMS bots</th><th scope="col">Portal or app HRAs</th><th scope="col" class="us">Text-to-web outreach</th></tr></thead>
  <tbody>
    <tr><th scope="row">What the member has to do</th><td>Be home, pick up, stay on the line</td><td>Reply to dozens of texts in a row</td><td>Download an app or remember a password</td><td class="us"><span class="yes">Tap one link.</span> Answer on their own time.</td></tr>
    <tr><th scope="row">Stopping and coming back</th><td>Start the call over</td><td>Thread gets lost among other texts</td><td>Depends on the session timeout</td><td class="us"><span class="yes">Same link resumes</span> at the same question</td></tr>
    <tr><th scope="row">Form each state approved</th><td>Script per state, kept by hand</td><td>Rewritten into chat prompts</td><td>Usually one national form</td><td class="us"><span class="yes">Versioned per state and LOB</span>, with approvals attached</td></tr>
    <tr><th scope="row">Identity check</th><td>Agent asks verification questions</td><td>Often none before questions start</td><td>Account login</td><td class="us"><span class="yes">State-specific fields</span>, before any health information</td></tr>
    <tr><th scope="row">When answers turn into action</th><td>After notes are reviewed</td><td>After a batch export</td><td>After a batch export</td><td class="us"><span class="yes">On completion</span>: care plan and referrals</td></tr>
    <tr><th scope="row">Cost per attempt</th><td>Agent minutes, postage, data entry</td><td>Many messages per HRA</td><td>Low, but few members log in</td><td class="us">An invite and a few reminders by text</td></tr>
  </tbody>
</table></div>
<p class="muted" style="font-size:.85rem;margin-top:.75rem">Comparison of common approaches, not of named vendors. Many vendors combine several of them.</p>`;

// A form that emails its contents to the company inbox through site.formEndpoint.
// `subject` becomes the email subject line.
export const mailForm = ({ id, subject, fields, button, doneTitle, doneText }) => `<form class="form" id="${id}" data-endpoint="${esc(
  site.formEndpoint,
)}" data-done="${id}-done" novalidate>
  <input type="hidden" name="_subject" value="${esc(subject)}">
  <input type="hidden" name="_template" value="table">
  <input type="hidden" name="_captcha" value="false">
  <input class="form__trap" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">
  ${fields}
  <p class="form__error" role="alert" hidden>That didn’t send. Please try again, or email us at <a href="mailto:${esc(
    site.contactEmail,
  )}">${esc(site.contactEmail)}</a>.</p>
  <button class="btn btn--primary" type="submit" data-label="${esc(button)}">${esc(button)}</button>
  <p class="muted" style="font-size:.8rem">Please don’t include member or patient health information. See our <a href="privacy.html">privacy policy</a>.</p>
</form>
<div class="form__done" id="${id}-done" tabindex="-1" hidden>
  <h3>${esc(doneTitle)}</h3>
  <p>${esc(doneText)}</p>
</div>`;
