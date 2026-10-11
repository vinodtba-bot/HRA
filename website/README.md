# Marketing website

Marketing website for the HRA outreach platform. It lives in the HRA repo; the AyuHealth company website (ayuhealth.io) is separate, in vinodtba-bot/ayuhealth-site. Plain HTML and CSS, no framework and no npm dependencies.

```bash
node build.mjs          # writes dist/
npx serve dist          # or any static file server; opening dist/index.html directly also works
```

Deploy `dist/` to any static host (S3 + CloudFront, Netlify, Vercel, GitHub Pages).

## Layout

| Path | What it holds |
| --- | --- |
| `src/config.mjs` | Brand name, domain, contact email, form endpoint and the top navigation |
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

## Contact and demo forms

Both forms post JSON to `site.formEndpoint` in `src/config.mjs`, which is set to FormSubmit
(`https://formsubmit.co/ajax/info@ayuhealth.io`). FormSubmit emails each submission to info@ayuhealth.io.
It needs no account, but:

1. The info@ayuhealth.io mailbox must exist and receive mail.
2. After the site is live, send one test message from the Contact page. FormSubmit emails an activation
   link to info@ayuhealth.io; click it. Until then submissions are held and the form shows an error.
3. Optional: the activation email also gives a random alias. Put it in place of the address in
   `formEndpoint` so the inbox address isn't visible in the page source.

To use HubSpot, Formspree or your own API instead, change `formEndpoint`; the page sends
`{ name, email, organization, message, ... }` as JSON and treats any 2xx response as success.

## Going live

`.github/workflows/website.yml` builds the site on every pull request and publishes it to GitHub Pages
on every push to `main`, at https://vinodtba-bot.github.io/HRA. One-time setup: in the repository,
**Settings → Pages → Source: GitHub Actions**.

To serve it on a domain of your own, set `customDomain` and `url` in `src/config.mjs` (the build then writes
a `CNAME` file) and point that domain's DNS at GitHub Pages. Don't use ayuhealth.io: that domain belongs to
the AyuHealth website.

## Before launch

- **Placeholders.** Customer logos and stories, leadership, open roles and certifications are marked
  `[Placeholder]` on the page. Fill them only with real, approved content. Guides on the Resources page are titles only.
- **Legal pages.** `privacy.html` and `terms.html` are drafts. Have counsel review them, then remove
  "Draft pending legal review" from `src/pages/privacy.mjs` and `src/pages/terms.mjs`.
- **Claims to confirm.** Product statements follow the requirements spec and the MVP. Confirm these are true at launch:
  SSO, encryption at rest, voice and email fallback, multi-language forms, FHIR export, the headless API,
  care-management integrations, and signing a BAA with every plan.
- **Sample data.** Product screens use the fictional "Sunrise Health Plan" and made-up numbers, labeled as samples.
