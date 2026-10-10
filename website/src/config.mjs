// Site-wide settings. Change the brand here and every page picks it up.
// "Wayfold" is a working name only, until the product name is decided.
export const site = {
  brand: 'Wayfold',
  brandSuffix: 'Health',
  tagline: 'Member outreach that members finish.',
  // Shown in the footer and on the demo page. Placeholder until a real inbox exists.
  contactEmail: 'hello@example.com',
  year: 2026,
};

// Top navigation. Items with `menu` render as dropdowns; solution entries are
// filled in from solutions.mjs so a new solution appears in the menu automatically.
export const nav = [
  {
    label: 'Platform',
    href: 'platform.html',
    menu: [
      { label: 'Platform overview', href: 'platform.html', note: 'One engagement core for every outreach survey' },
      { label: 'Member app', href: 'platform.html#member-app', note: 'Text, tap, answer. No download, no password' },
      { label: 'Outreach orchestration', href: 'platform.html#orchestration', note: 'Risk-tier cadence, retries and fallbacks' },
      { label: 'Approved form library', href: 'platform.html#forms', note: 'Forms by state and line of business' },
      { label: 'Rules and referrals', href: 'platform.html#rules', note: 'Answers that trigger action' },
      { label: 'Analytics', href: 'platform.html#analytics', note: 'Funnel, timeliness and completion reporting' },
      { label: 'Integrations', href: 'platform.html#integrations', note: 'Files, APIs and FHIR' },
    ],
  },
  { label: 'Solutions', href: 'solutions.html', menu: 'solutions' },
  { label: 'Customers', href: 'customers.html' },
  {
    label: 'Resources',
    href: 'resources.html',
    menu: [
      { label: 'Guides', href: 'resources.html#guides', note: 'Practical playbooks for outreach teams' },
      { label: 'HRA glossary', href: 'resources.html#glossary', note: 'HEDIS, Stars, D-SNP and the rest' },
      { label: 'FAQ', href: 'resources.html#faq', note: 'Straight answers on texting, consent and setup' },
    ],
  },
  {
    label: 'Company',
    href: 'company.html',
    menu: [
      { label: 'About us', href: 'company.html', note: 'Why we build member outreach' },
      { label: 'Trust and security', href: 'security.html', note: 'How member data is protected' },
      { label: 'Careers', href: 'company.html#careers', note: 'Join the team' },
      { label: 'Contact', href: 'demo.html', note: 'Talk to us about your program' },
    ],
  },
];
