// Site-wide settings. Change the brand here and every page picks it up.
export const site = {
  brand: 'Ayu',
  brandSuffix: 'Health',
  tagline: 'Member outreach that members finish.',
  // Shown on the contact page and in the footer; the forms deliver here too.
  contactEmail: 'info@ayuhealth.io',
  // Public address of this site, used for canonical links and the sitemap. It runs on
  // GitHub Pages for the HRA repo; ayuhealth.io is the separate AyuHealth website.
  url: 'https://vinodtba-bot.github.io/HRA',
  // Set to a domain you own to serve the site there instead (writes a CNAME file).
  customDomain: '',
  // Where the contact and demo forms post. FormSubmit forwards each submission to
  // contactEmail; the first one sends an activation email to that inbox that must be confirmed.
  // Swap for any endpoint that accepts JSON (HubSpot, Formspree, your own API).
  formEndpoint: 'https://formsubmit.co/ajax/info@ayuhealth.io',
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
      { label: 'Contact', href: 'contact.html', note: 'Email or message our team' },
    ],
  },
];
