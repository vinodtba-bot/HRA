import { strings, toLang } from './i18n';

// SMS bodies never carry the member's name or anything health related. The text itself lives in i18n.ts.
export const smsFor = (language?: string | null) => strings(toLang(language)).sms;
export const sms = smsFor('en');
