import { site, nav } from './config.mjs';
import { solutions, segments } from './solutions.mjs';

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const brandName = () => `${site.brand}${site.brandSuffix}`;

export const solutionHref = (s) => `solutions-${s.slug}.html`;

const statusPill = (status) =>
  status === 'available'
    ? '<span class="pill pill--live">Available</span>'
    : '<span class="pill pill--soon">On the roadmap</span>';

export { statusPill };

function solutionsMenu() {
  const items = solutions
    .map(
      (s) => `<li><a href="${solutionHref(s)}"><span class="menu__label">${esc(s.name)}${
        s.status === 'available' ? '' : ' <span class="menu__soon">Soon</span>'
      }</span><span class="menu__note">${esc(s.menuNote)}</span></a></li>`,
    )
    .join('');
  const segs = segments
    .map(
      (g) => `<li><a href="solutions.html#${g.id}"><span class="menu__label">${esc(g.name)}${
        g.status === 'available' ? '' : ' <span class="menu__soon">Soon</span>'
      }</span></a></li>`,
    )
    .join('');
  return `<div class="menu menu--wide" role="group">
      <div><p class="menu__head">By use case</p><ul>${items}</ul></div>
      <div><p class="menu__head">By organization</p><ul>${segs}</ul>
        <a class="menu__all" href="solutions.html">All solutions</a></div>
    </div>`;
}

function header(current) {
  const items = nav
    .map((item, i) => {
      const base = item.href.replace('.html', '');
      const active = current && (current === item.href || current.startsWith(`${base}-`) || (base === 'company' && current === 'security.html'));
      const aria = active ? ' aria-current="page"' : '';
      if (!item.menu) {
        return `<li class="nav__item"><a class="nav__link" href="${item.href}"${aria}>${esc(item.label)}</a></li>`;
      }
      const menu =
        item.menu === 'solutions'
          ? solutionsMenu()
          : `<div class="menu" role="group"><ul>${item.menu
              .map(
                (m) =>
                  `<li><a href="${m.href}"><span class="menu__label">${esc(m.label)}</span><span class="menu__note">${esc(
                    m.note,
                  )}</span></a></li>`,
              )
              .join('')}</ul></div>`;
      return `<li class="nav__item nav__item--has-menu">
        <a class="nav__link" href="${item.href}"${aria}>${esc(item.label)}</a>
        <button class="nav__expand" type="button" aria-expanded="false" aria-controls="menu-${i}" aria-label="Show ${esc(
          item.label,
        )} menu"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></button>
        <div class="nav__menu" id="menu-${i}">${menu}</div>
      </li>`;
    })
    .join('');

  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap site-header__row">
    <a class="logo" href="index.html" aria-label="${esc(brandName())} home">${logoMark()}<span>${esc(
      site.brand,
    )}<span class="logo__suffix">${esc(site.brandSuffix)}</span></span></a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
      <span class="nav-toggle__bars" aria-hidden="true"></span><span class="nav-toggle__text">Menu</span>
    </button>
    <nav class="nav" id="site-nav" aria-label="Main">
      <ul class="nav__list">${items}</ul>
      <a class="btn btn--primary nav__cta" href="demo.html">Request a demo</a>
    </nav>
  </div>
</header>`;
}

export function logoMark() {
  // A folded path: a text bubble whose tail turns into a check.
  return `<svg class="logo__mark" width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
    <rect x="1" y="1" width="26" height="22" rx="7" fill="var(--accent)"/>
    <path d="M7 27l3-5h6" fill="var(--accent)"/>
    <path d="M8.5 12.5l3.5 3.5 7.5-7.5" fill="none" stroke="var(--on-accent)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function footer() {
  const available = solutions.filter((s) => s.status === 'available');
  const col = (title, links) =>
    `<div><p class="footer__head">${esc(title)}</p><ul>${links
      .map(([label, href]) => `<li><a href="${href}">${esc(label)}</a></li>`)
      .join('')}</ul></div>`;
  return `<footer class="site-footer">
  <div class="wrap footer__grid">
    <div class="footer__brand">
      <a class="logo" href="index.html">${logoMark()}<span>${esc(site.brand)}<span class="logo__suffix">${esc(site.brandSuffix)}</span></span></a>
      <p>${esc(site.tagline)} Secure text-to-web outreach for health plans, starting with health risk assessments.</p>
    </div>
    ${col('Platform', [
      ['Overview', 'platform.html'],
      ['Member app', 'platform.html#member-app'],
      ['Form library', 'platform.html#forms'],
      ['Analytics', 'platform.html#analytics'],
      ['Integrations', 'platform.html#integrations'],
    ])}
    ${col('Solutions', [
      ...available.map((s) => [s.name, solutionHref(s)]),
      ['Medicaid managed care', 'solutions.html#medicaid'],
      ['Medicare Advantage and D-SNP', 'solutions.html#medicare'],
      ['What’s next', 'solutions.html#roadmap'],
    ])}
    ${col('Resources', [
      ['Guides', 'resources.html#guides'],
      ['HRA glossary', 'resources.html#glossary'],
      ['FAQ', 'resources.html#faq'],
      ['Customers', 'customers.html'],
    ])}
    ${col('Company', [
      ['About us', 'company.html'],
      ['Trust and security', 'security.html'],
      ['Careers', 'company.html#careers'],
      ['Contact', 'contact.html'],
      ['Request a demo', 'demo.html'],
    ])}
  </div>
  <div class="wrap footer__base">
    <p>© ${site.year} ${esc(brandName())}. All rights reserved.</p>
    <p class="footer__links"><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a><a href="mailto:${esc(site.contactEmail)}">${esc(site.contactEmail)}</a></p>
    <p class="footer__note">Plan names and member details shown in product screens are fictional samples.</p>
  </div>
</footer>`;
}

const fonts =
  'https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600&family=Public+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap';

// `fragment` drops the document wrapper (doctype, html, head, body) for hosts
// that supply their own, such as the Claude artifact preview of the home page.
export function renderPage({ path, title, description, body, fragment = false }) {
  const fullTitle = path === 'index.html' ? brandName() : `${title} | ${brandName()}`;
  const head = `<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${site.url}/${path === 'index.html' ? '' : path}">
<meta property="og:type" content="website">
<meta property="og:url" content="${site.url}/${path === 'index.html' ? '' : path}">
<meta property="og:site_name" content="${esc(brandName())}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fonts}">
<link rel="stylesheet" href="assets/site.css">`;
  const content = `${header(path)}
<main id="main">
${body}
</main>
${footer()}
<script src="assets/site.js"></script>`;
  if (fragment) return `${head}\n${content}\n`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${head}
</head>
<body>
${content}
</body>
</html>
`;
}
