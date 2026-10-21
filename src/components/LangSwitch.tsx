'use client';
import { usePathname } from 'next/navigation';

/** Link to the other language, back to the same page. Hidden on staff pages. */
export default function LangSwitch({ to, label }: { to: string; label: string }) {
  const path = usePathname();
  if (path.startsWith('/admin')) return null;
  return <a className="lang" lang={to} href={`/lang?to=${to}&back=${encodeURIComponent(path)}`}>{label}</a>;
}
