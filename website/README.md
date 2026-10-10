# Marketing website

Static marketing site for the HRA outreach platform. Plain HTML and CSS, no framework and no npm dependencies.

```bash
node build.mjs          # writes dist/
npx serve dist          # or any static file server; opening dist/index.html directly also works
```

Deploy `dist/` to any static host (S3 + CloudFront, Netlify, Vercel, GitHub Pages).

## Layout

| Path | What it holds |
| --- | --- |
| `src/config.mjs` | Brand name, tagline, contact email and the top navigation |
| `src/solutions.mjs` | Every solution (HRA today, roadmap items) and the "by organization" segments |
| `src/solution-page.mjs` | Template that turns each solution into `solutions-<slug>.html` |
| `src/pages/*.mjs` | One file per page: `path`, `title`, `description` and `body` HTML |
| `src/components.mjs` | Shared pieces: phone screens, comparison table, solution grid, FAQ, CTA band |
| `src/layout.mjs` | Header, dropdown menus, footer and the HTML document wrapper |
| `src/assets/` | `site.css`, `site.js`, favicon |

## Adding a new outreach survey

Add an entry to `src/solutions.mjs`. With `status: 'roadmap'` it needs only `slug`, `name`, `menuNote`,
`audience`, `headline`, `lede` and `bullets`, and it shows up as "On the roadmap" in the Solutions menu,
on `solutions.html` and on the home page. When it ships, set `status: 'available'` and fill in the same
fields the HRA entry has (`eyebrow`, `programs`, `problems`, `steps`, `followUp`, `features`, `measures`, `faq`).

## Before launch

- **Brand.** "Wayfold Health" is a working name. Change it in `src/config.mjs` and the logo mark in `layout.mjs` and `assets/favicon.svg`.
- **Placeholders.** Customer logos and stories, leadership, open roles, certifications and the contact email are marked
  `[Placeholder]` on the page. Fill them only with real, approved content. Guides on the Resources page are titles only.
- **Demo form.** `demo.html` validates and shows a thank-you message but sends nothing. Point it at a form backend
  (HubSpot, Formspree, or your own endpoint) in `src/assets/site.js`.
- **Claims to confirm.** Product statements follow the requirements spec and the MVP. Confirm these are true at launch:
  SSO, encryption at rest, voice and email fallback, multi-language forms, FHIR export, the headless API,
  care-management integrations, and signing a BAA with every plan.
- **Sample data.** Product screens use the fictional "Sunrise Health Plan" and made-up numbers, labeled as samples.
