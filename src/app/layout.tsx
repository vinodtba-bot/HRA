import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PLAN_NAME } from '@/lib/config';

export const metadata: Metadata = {
  title: `${PLAN_NAME} check-in`,
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="plan">
          <span className="logo" aria-hidden="true">{PLAN_NAME.charAt(0)}</span>
          <span>{PLAN_NAME}</span>
        </header>
        {children}
      </body>
    </html>
  );
}
