import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { STRINGS, LANGS, localizeForm, missingFormText, toLang } from '../src/lib/i18n';
import { formSchema } from '../src/lib/questionnaire';

const forms = fs.readdirSync(path.join(__dirname, '..', 'forms')).filter(f => f.endsWith('-hra.json'))
  .map(f => formSchema.parse(JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'forms', f), 'utf8'))));

// GSM-7 basic set: texts outside it are sent as UCS-2, at 70 characters per segment instead of 160.
const GSM7 = /^[A-Za-z0-9 \n\r@£$¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ!"#¤%&'()*+,\-./:;<=>?¡ÄÖÑÜ§¿äöñüà]*$/;
const link = 'https://hraapp.ayuhealth.io/r/AbCdEfGhIjKlMnOpQrStUv';

describe('languages', () => {
  it('maps member file values to a language', () => {
    expect(toLang('es')).toBe('es');
    expect(toLang('SPA')).toBe('es');
    expect(toLang('Spanish')).toBe('es');
    expect(toLang('en')).toBe('en');
    expect(toLang('')).toBe('en');
    expect(toLang(null)).toBe('en');
  });

  it('every sample form is fully translated to Spanish', () => {
    for (const f of forms) expect(missingFormText(f, 'es'), f.id).toEqual([]);
  });

  it('translating a form changes text only, never logic', () => {
    for (const f of forms) {
      const es = localizeForm(f, 'es');
      expect(es.items.map(i => [i.linkId, i.type, i.required, i.enableWhen, i.options?.map(o => o.value)]))
        .toEqual(f.items.map(i => [i.linkId, i.type, i.required, i.enableWhen, i.options?.map(o => o.value)]));
      expect(es.items[0].text).not.toBe(f.items[0].text);
    }
  });

  // Length depends on the plan's name, so only the encoding is checked here.
  it('every text uses the standard SMS character set in every language', () => {
    for (const lang of LANGS) {
      const sms = STRINGS[lang].sms;
      for (const body of [sms.invite(link), sms.reminder(link), sms.resume(link), sms.relink(link), sms.confirm('Health Risk Assessment', link)]) {
        expect(body, `${lang}: ${body}`).toMatch(GSM7);
      }
    }
  });

  it('care plan text exists in every language for every rule', async () => {
    const { rules } = await import('../src/lib/careplan');
    for (const lang of LANGS) for (const r of rules) expect(STRINGS[lang].carePlan[r.id], `${lang} ${r.id}`).toBeTruthy();
  });
});
