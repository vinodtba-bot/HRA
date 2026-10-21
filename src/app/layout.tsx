import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PLAN_NAME } from '@/lib/config';
import { LANG_NAMES } from '@/lib/i18n';
import { t } from '@/lib/lang';
import LangSwitch from '@/components/LangSwitch';

export async function generateMetadata(): Promise<Metadata> {
  const { s } = await t();
  return { title: s.title, robots: { index: false, follow: false }, referrer: 'no-referrer' };
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { lang } = await t();
  const other = lang === 'en' ? 'es' : 'en';
  return (
    <html lang={lang}>
      <body>
        <header className="plan">
          <span className="logo" aria-hidden="true">{PLAN_NAME.charAt(0)}</span>
          <span>{PLAN_NAME}</span>
          <LangSwitch to={other} label={LANG_NAMES[other]} />
        </header>
        {children}
      </body>
    </html>
  );
}
