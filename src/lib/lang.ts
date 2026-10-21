import { cookies } from 'next/headers';
import { currentInvitation } from './invitation';
import { toLang, strings, type Lang } from './i18n';

export const LANG_COOKIE = 'lang';

/** The member's choice from the language switch, else the language on their member file, else English. */
export async function currentLang(): Promise<Lang> {
  const chosen = (await cookies()).get(LANG_COOKIE)?.value;
  if (chosen) return toLang(chosen);
  const ci = await currentInvitation().catch(() => null);
  return toLang(ci?.inv.member.language);
}

export async function t() {
  const lang = await currentLang();
  return { lang, s: strings(lang) };
}
