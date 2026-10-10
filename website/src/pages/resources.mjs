import { faqList, ctaBand } from '../components.mjs';

export const path = 'resources.html';
export const title = 'Resources';
export const description = 'Guides, an HRA glossary and answers to common questions about text-based member outreach.';

const guides = [
  ['Checklist', 'HRA timeliness rules by program', 'Initial and annual HRA windows for Medicaid managed care and special needs plans, and how to track them per member.'],
  ['Guide', 'Texting members within TCPA and carrier rules', 'Consent, quiet hours, opt-outs and 10DLC registration, in the order you’ll need them.'],
  ['Guide', 'Writing HRA questions members can answer', 'Plain language, one idea per question and answer choices that work on a small screen.'],
  ['Playbook', 'Measuring outreach against a holdout group', 'How to set up a fair comparison so completion lift holds up in review.'],
  ['Checklist', 'Getting a state-specific HRA approved', 'What to gather before submitting a form for state Medicaid or NCQA review.'],
  ['Guide', 'Following up partial HRAs by risk', 'How to rank and work the members who started but didn’t finish.'],
];

const glossary = [
  ['HRA', 'Health risk assessment', 'A questionnaire about a member’s health, risks and needs. Medicaid managed care contracts and Medicare special needs plans require them within set windows.'],
  ['SNP', 'Special needs plan', 'A Medicare Advantage plan for people with specific needs. SNPs must complete an HRA within 90 days of enrollment and at least once a year after that.'],
  ['D-SNP', 'Dual eligible special needs plan', 'A special needs plan for people who have both Medicare and Medicaid.'],
  ['ICP', 'Individualized care plan', 'The care plan a special needs plan builds for each member, informed by their HRA.'],
  ['HEDIS', 'Healthcare Effectiveness Data and Information Set', 'NCQA’s set of quality measures that health plans report, such as screening and follow-up rates.'],
  ['Stars', 'Medicare Star Ratings', 'CMS’s one-to-five-star rating of Medicare Advantage and Part D plans, built from quality, member experience and other measures.'],
  ['CAHPS', 'Consumer Assessment of Healthcare Providers and Systems', 'Standardized surveys of patient and member experience, used in Star Ratings.'],
  ['NCQA', 'National Committee for Quality Assurance', 'The organization that accredits health plans, maintains HEDIS and certifies some HRA tools.'],
  ['LOB', 'Line of business', 'A plan product such as Medicaid, Medicare Advantage, D-SNP or commercial. Forms and rules often differ by LOB.'],
  ['Category of aid', '', 'The Medicaid eligibility group a member qualifies under. Some states ask for HRA completion reported by category of aid.'],
  ['SDOH', 'Social determinants of health', 'Non-medical needs such as food, housing, transport and safety that affect health.'],
  ['Care gap', '', 'A recommended service, such as a screening or eye exam, that a member has not received.'],
  ['TCPA', 'Telephone Consumer Protection Act', 'The US law that governs automated calls and texts, including when consent is required.'],
  ['10DLC', '10-digit long code', 'The US carrier registration system for business texting from standard phone numbers.'],
  ['BAA', 'Business associate agreement', 'The HIPAA contract a vendor signs before it handles a plan’s protected health information.'],
  ['FHIR Questionnaire', '', 'The HL7 FHIR standard for forms. Answers are stored as a QuestionnaireResponse.'],
];

const faq = [
  { q: 'Who is the platform for?', a: 'Health plans that run outreach surveys, starting with Medicaid managed care, Medicare Advantage and D-SNP teams responsible for HRAs. Provider-facing solutions are on the roadmap.' },
  { q: 'Do members need a smartphone?', a: 'The link works in any modern phone browser. Members without a smartphone, or who don’t open the link, can be reached by phone, email or mail, and staff can complete the same form with them.' },
  { q: 'Which languages are supported?', a: 'Forms can be published in each language your state approves, and members see the version that matches their language preference.' },
  { q: 'Can we embed the HRA in our own member app?', a: 'Yes. The member experience is headless, so the same forms, identity rules and care plans can run inside your app or portal through the API.' },
  { q: 'How do you handle members who text back instead of tapping the link?', a: 'Replies are read for opt-out and help keywords and acted on at once. Other replies can go to your team’s inbox or trigger a fresh link.' },
];

export const body = `
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Resources</p>
    <h1>Practical help for teams that run member outreach.</h1>
    <p class="lede">Guides written for quality, outreach and compliance teams, a glossary of the terms that come up in every HRA meeting, and straight answers to common questions.</p>
    <nav class="toc" aria-label="On this page"><a href="#guides">Guides</a><a href="#glossary">HRA glossary</a><a href="#faq">FAQ</a></nav>
  </div>
</section>

<section class="section anchor" id="guides" style="padding-top:1rem">
  <div class="wrap">
    <div class="section__head"><p class="eyebrow">Guides</p><h2>Playbooks and checklists.</h2>
      <p class="muted">Placeholder: these guides are planned and not yet written. Titles show the intended library.</p></div>
    <div class="grid grid--3">
      ${guides
        .map(
          ([kind, t, d]) => `<article class="feature card"><span class="feature__tag">${kind} · Coming soon</span><h3>${t}</h3><p>${d}</p></article>`,
        )
        .join('')}
    </div>
  </div>
</section>

<section class="section section--tint anchor" id="glossary">
  <div class="wrap">
    <div class="section__head"><p class="eyebrow">HRA glossary</p><h2>The acronyms, in plain words.</h2></div>
    <dl class="glossary">
      ${glossary
        .map(([term, long, def]) => `<div><dt>${term}${long ? `<span>${long}</span>` : ''}</dt><dd>${def}</dd></div>`)
        .join('')}
    </dl>
  </div>
</section>

<section class="section anchor" id="faq">
  <div class="wrap">
    <div class="section__head"><p class="eyebrow">FAQ</p><h2>Common questions.</h2>
      <p class="muted">HRA-specific questions are on the <a href="solutions-hra.html">HRA page</a>, and security questions on <a href="security.html">Trust and security</a>.</p></div>
    ${faqList(faq)}
  </div>
</section>

${ctaBand()}
`;
