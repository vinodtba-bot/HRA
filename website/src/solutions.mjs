// Solution packs. Each entry becomes solutions-<slug>.html, a card on
// solutions.html and an item in the Solutions menu.
//
// To add a new outreach survey, add an entry here. Set status to 'available'
// and fill the full fields (problems, steps, features, measures, faq) once it ships;
// a 'roadmap' entry only needs the short fields.

export const solutions = [
  {
    slug: 'hra',
    name: 'Health risk assessments',
    menuNote: 'Medicaid, Medicare Advantage and D-SNP',
    status: 'available',
    audience: ['Health plans'],
    eyebrow: 'Health risk assessments',
    headline: 'Get HRAs done inside the window, without the call-center grind.',
    lede:
      'Text each member a secure link to the HRA their state approved. They answer one question per screen on their own phone, and any answer that needs follow-up becomes a referral before they close the page.',
    programs: ['Medicaid managed care', 'Medicare Advantage', 'D-SNP and other SNPs', 'CHIP, with a guardian completing'],
    problems: [
      {
        title: 'Calls land at the wrong time',
        text: 'Outbound calls reach members at work, at the pharmacy or not at all. Voicemail, wrong numbers and call-backs use up the attempts your policy allows.',
      },
      {
        title: 'Paper comes back late, or never',
        text: 'Mailed HRAs return weeks later, half finished, and someone still has to key them in before anyone can act on them.',
      },
      {
        title: 'Every state wants its own form',
        text: 'One state calls it a Care Needs Screening, another a New Member Survey. Wording, required questions and approvals differ by state and line of business.',
      },
      {
        title: 'Answers wait in a report',
        text: 'A member who says they fell last month, or has nowhere to live, often waits until a batch report is read. The need was known the day they answered.',
      },
    ],
    steps: [
      {
        title: 'Load the eligible list',
        text: 'Upload your eligibility file or connect a feed. Numbers are cleaned, landlines and reassigned numbers are flagged, and consent is checked before anything is sent.',
      },
      {
        title: 'Text one secure link',
        text: 'Each member gets a plan-branded short link. The text holds no health information, and it goes out inside quiet hours in the member’s own time zone. High-risk members are texted first.',
      },
      {
        title: 'Verify, then answer',
        text: 'The member confirms who they are with the fields their state requires, such as Medicaid ID and date of birth. Then it is one question per screen, and every tap saves.',
      },
      {
        title: 'Act on the answers',
        text: 'A personal care plan appears the moment they finish. Pregnancy, high risk and social needs route to maternity, care management and community outreach teams by your rules.',
      },
    ],
    followUp: {
      title: 'For members who don’t finish',
      points: [
        'Reminders go out at a different time of day on each attempt.',
        'After three unanswered attempts the member is paused for 90 days, or for the period your policy sets.',
        'Partial HRAs are queued for your team, ranked by risk, with attempt history alongside.',
        'Members can decline with a reason, or tell you they already did it, and the platform checks before texting again.',
        'Staff can finish an HRA with the member by phone in the same form, and the completion method is recorded.',
      ],
    },
    features: [
      {
        title: 'The form each state approved',
        text: 'Each form version carries its approvals by state and line of business. A campaign cannot go live with a form that is not approved for its scope, and each member keeps the version they started.',
      },
      {
        title: 'Due dates, not just send dates',
        text: 'Each member’s due date comes from enrollment and your state contract, 90 days by default. Annual outreach starts ahead of the anniversary, and first-touch timeliness for high-risk members is flagged.',
      },
      {
        title: '“Complete” means complete',
        text: 'Required questions are set per form. Anything less is tracked as partial and followed up, so your completion counts match what a state auditor will count.',
      },
      {
        title: 'Identity rules per state',
        text: 'Medicaid ID and date of birth in one state, date of birth and ZIP in another. No health information shows until the member is verified.',
      },
      {
        title: 'Built for small screens and plain words',
        text: 'Large tap targets, one question at a time, a progress bar and plain-language items. It loads quickly on an older Android phone with a weak signal.',
      },
      {
        title: 'Reports regulators ask for',
        text: 'Completion within window by state, line of business and category of aid, with outreach attempts and dispositions behind every number.',
      },
    ],
    measures: [
      'HRA completion within the regulatory window, by state, line of business and category of aid',
      'Days from enrollment to first contact for high-risk members',
      'Link opens, identity checks and drop-off by question',
      'Referrals created, accepted and closed',
      'Cost per completed HRA compared with calls and mail',
    ],
    faq: [
      {
        q: 'Do members need to download an app or create a password?',
        a: 'No. The link opens in the phone’s browser. The member confirms their identity with details they already know, such as Medicaid ID and date of birth, and starts answering.',
      },
      {
        q: 'What about members who don’t open the link or don’t have a smartphone?',
        a: 'Reminders retry at different times of day. Members who still don’t respond can be reached by phone, and staff complete the same form with them while the platform records how the HRA was completed.',
      },
      {
        q: 'Can we use our own approved HRA?',
        a: 'Yes. Load the HRA your state approved, or start from a template and send it through your own clinical and regulatory sign-off. The approval record stays attached to each form version.',
      },
      {
        q: 'How is the link kept secure?',
        a: 'The link carries a random code and no health information. Only a hash of the code is stored, link previews in messaging apps cannot use it up, identity is checked before any health information appears, and repeated wrong answers lock the link for 30 minutes.',
      },
      {
        q: 'How does texting stay within TCPA and carrier rules?',
        a: 'Texts go only to members with valid consent, inside quiet hours in their time zone, from a registered sender. STOP replies take effect at once and sync back to your systems. Your compliance team approves the message wording.',
      },
    ],
  },
  {
    slug: 'care-gaps',
    name: 'Care gap closure',
    menuNote: 'HEDIS screenings and visits',
    status: 'roadmap',
    audience: ['Health plans', 'Provider groups'],
    headline: 'Turn open HEDIS gaps into booked screenings.',
    lede: 'Text members with an open gap a link to book the visit, find a nearby lab or tell you it is already done.',
    bullets: [
      'Targets members by open measure, such as breast cancer screening or diabetes eye exams',
      'Captures self-reported completion for supplemental data review',
      'Hands booking requests to the provider’s scheduling team',
    ],
  },
  {
    slug: 'sdoh',
    name: 'Social needs screening',
    menuNote: 'Food, housing and transport',
    status: 'roadmap',
    audience: ['Health plans', 'Provider groups'],
    headline: 'Find social needs early and connect members to help.',
    lede: 'A short standardized screen for food, housing, transport, utilities and safety, with referrals to the partners you already work with.',
    bullets: [
      'Standard screening domains your care teams already recognize',
      'Referrals to community partners and your own outreach staff',
      'Repeat screens on a schedule, so needs are caught when they change',
    ],
  },
  {
    slug: 'wellness-visit',
    name: 'Annual wellness visit prep',
    menuNote: 'Pre-visit questionnaires',
    status: 'roadmap',
    audience: ['Provider groups', 'Health plans'],
    headline: 'Arrive at the wellness visit with the questions already answered.',
    lede: 'Send the pre-visit questionnaire a few days ahead so the visit time goes to care, not clipboards.',
    bullets: [
      'Health history, functional status and fall-risk questions before the visit',
      'Results ready for the care team ahead of the appointment',
      'Reminders tied to the scheduled visit date',
    ],
  },
  {
    slug: 'transitions',
    name: 'Transitions of care check-ins',
    menuNote: 'After a hospital discharge',
    status: 'roadmap',
    audience: ['Health plans', 'Provider groups'],
    headline: 'Check in after discharge before small problems become readmissions.',
    lede: 'A short check-in text in the days after a hospital stay, with symptoms, medicines and follow-up visits flagged to nurses.',
    bullets: [
      'Triggered from admission and discharge notifications',
      'Flags worsening symptoms and missing medicines to a nurse queue',
      'Confirms the follow-up visit is booked',
    ],
  },
  {
    slug: 'member-experience',
    name: 'Member experience pulse',
    menuNote: 'Find service problems early',
    status: 'roadmap',
    audience: ['Health plans'],
    headline: 'Hear about access and service problems while you can still fix them.',
    lede: 'Short pulse surveys after key moments, such as a first visit or a claim, so problems surface months before survey season.',
    bullets: [
      'Two or three questions after a visit, call or claim',
      'Routes unhappy responses to service recovery',
      'Trends by plan, region and provider group',
    ],
  },
  {
    slug: 'patient-intake',
    name: 'Patient intake and outcomes',
    menuNote: 'Forms before and after visits',
    status: 'roadmap',
    audience: ['Provider groups'],
    headline: 'Collect intake forms and patient-reported outcomes by text.',
    lede: 'Patients complete intake and outcome measures on their phone before and after visits, and results go to the chart.',
    bullets: [
      'Intake, consent and history forms before the appointment',
      'Patient-reported outcome measures on a schedule after treatment',
      'Results sent to the EHR in standard formats',
    ],
  },
];

// Who we serve, shown on solutions.html and in the Solutions menu.
export const segments = [
  {
    id: 'medicaid',
    name: 'Medicaid managed care',
    text: 'State-specific HRA forms, identity rules and timeliness windows, with completion reported by category of aid.',
    status: 'available',
  },
  {
    id: 'medicare',
    name: 'Medicare Advantage and D-SNP',
    text: 'Initial and annual HRAs on CMS timelines, with answers feeding care plans for special needs plan members.',
    status: 'available',
  },
  {
    id: 'providers',
    name: 'Provider groups and ACOs',
    text: 'Pre-visit questionnaires, social needs screens and patient outcomes on the same platform.',
    status: 'roadmap',
  },
];
