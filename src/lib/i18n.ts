import { PLAN_NAME } from './config';
import formsEs from '../../forms/i18n/es.json';
import type { FormDefinition } from './questionnaire';

// Member-facing text in every supported language. English is the source; each other language must cover
// every key (the type enforces it). Have the plan's certified translator review before real members.

export type Lang = 'en' | 'es';
export const LANGS: Lang[] = ['en', 'es'];
export const LANG_NAMES: Record<Lang, string> = { en: 'English', es: 'Español' };
/** Member file values like "es", "spa", "Spanish" map to Spanish; anything else to English. */
export const toLang = (v?: string | null): Lang => (/^(es|spa|spanish|español)/i.test(v?.trim() ?? '') ? 'es' : 'en');

const en = {
  sms: {
    invite: (link: string) => `${PLAN_NAME}: you have a short health check-in waiting. It takes about 10 minutes. ${link} Reply STOP to opt out.`,
    reminder: (link: string) => `${PLAN_NAME}: a reminder that your health check-in is still waiting. ${link} Reply STOP to opt out.`,
    resume: (link: string) => `${PLAN_NAME}: pick up your check-in where you left off. ${link} Reply STOP to opt out.`,
    relink: (link: string) => `${PLAN_NAME}: here is your new check-in link. ${link}`,
    confirm: (formName: string, link: string) => `${PLAN_NAME}: thanks, your ${formName} is complete. See your plan: ${link}`,
  },
  title: `${PLAN_NAME} check-in`,
  home: { h1: 'Health check-in', body: 'Please open the link in the text message we sent you to start your check-in.' },
  notFound: { h1: 'We could not find that link', body: 'Please check that you opened the full link from your text message.' },
  memberServices: (phone: string) => `Need help? Call member services at ${phone}.`,
  questionsMemberServices: (phone: string) => `Questions? Call member services at ${phone}.`,
  questionsNurse: (phone: string) => `Questions? Call our 24/7 nurse line at ${phone}.`,
  start: {
    h1: 'Your health check-in',
    intro: 'A few questions about your health and daily life, so your plan can offer the right help. It takes about 10 minutes and saves as you go.',
    confirm: 'First, please confirm it is you.',
    submit: 'Start my check-in',
    checking: 'Checking…',
    alreadyDone: 'I already did this check-in',
    noThanks: "No thanks, I don't want to do this",
  },
  fields: {
    dob: { label: 'Date of birth', hint: '' },
    zip: { label: 'ZIP code', hint: '5 digits' },
    medicaid_id: { label: 'Medicaid ID', hint: 'On your member ID card' },
  },
  verify: {
    tooFast: 'Too many tries. Please wait a minute and try again.',
    locked: (min: number) => `Too many tries. Please wait ${min} minutes and try again.`,
    noMatch: "That doesn't match our records. Please check and try again.",
  },
  q: {
    part: (n: number, of: number, section: string) => `Part ${n} of ${of}: ${section}`,
    progress: 'Progress',
    chooseAnswer: 'Please choose an answer.',
    skip: 'Skip this question',
    back: '← Back',
    saves: 'Your answers save as you go. You can stop and come back with the same link.',
    yes: 'Yes',
    no: 'No',
    enterNumber: 'Enter a number',
    next: 'Continue',
  },
  done: {
    h1: (formName: string) => `Thank you. Your ${formName} is complete.`,
    intro: 'Here is what your plan can help with, based on your answers. We also texted you a link to this page.',
    none: 'Your answers did not show any needs right now. Keep up your regular checkups.',
  },
  carePlan: {
    falls: { title: 'Lower your risk of falling', detail: 'A free home safety check and balance program are covered by your plan.', action: 'Request a call about this' },
    food: { title: 'Help with food', detail: 'You may qualify for healthy meal delivery and local food programs.', action: 'Call me about it' },
    housing: { title: 'Help with housing', detail: 'A care coordinator can connect you with housing support near you.', action: 'Call me about it' },
    rides: { title: 'Free rides to appointments', detail: 'Your plan covers rides to medical visits.', action: 'Call me about rides' },
    mood: { title: 'Talk with a care manager', detail: 'Your answers suggest a call with someone could help.', action: 'Request a call' },
    pcp: { title: 'Choose a regular doctor', detail: 'Having one doctor who knows you makes care easier. We can help you pick one.', action: 'Help me choose' },
    prenatal: { title: 'Care for you and your baby', detail: 'Our maternity team will reach out about prenatal visits and extra benefits.', action: '' },
    tobacco: { title: 'Free help to quit tobacco', detail: 'Coaching and medicines to quit are covered by your plan.', action: 'Call me about it' },
    daily_help: { title: 'Help at home', detail: 'You may qualify for in-home help with daily tasks.', action: 'Call me about it' },
  } as Record<string, { title: string; detail: string; action: string }>,
  expired: {
    sentH1: 'New link sent',
    sentBody: 'We texted a new link to the phone number we have on file. Please open it to continue.',
    h1: 'This link has expired',
    body: 'For your privacy, check-in links only work for a limited time. We can text a new one to the phone number we have on file.',
    limit: 'We have already sent several new links today. Please try again tomorrow.',
    button: 'Text me a new link',
  },
  crisis: {
    h1: "You don't have to go through this alone",
    body: 'If you are thinking about hurting yourself, please reach out now. Help is free and available 24 hours a day.',
    call988: 'Call or text 988',
    lifeline: '988 Suicide & Crisis Lifeline',
    nurse: (phone: string) => `Call our nurse line: ${phone}`,
    danger: 'If you are in danger right now, call 911. A care manager from your plan will also reach out to you.',
    continue: 'Continue my check-in',
  },
  decline: {
    h1: 'No problem',
    body: "We won't text you about this check-in again. If you like, tell us why. This is optional.",
    reasonLabel: 'Reason (optional)',
    reasons: {
      '': 'Prefer not to say',
      not_interested: 'Not interested',
      no_time: 'No time right now',
      privacy: 'Privacy concerns',
      prefer_phone: "I'd rather talk to someone",
      other: 'Something else',
    } as Record<string, string>,
    button: 'Stop my check-in',
    back: 'Go back',
  },
  alreadyDone: {
    h1: 'Already did your check-in?',
    body: "Thanks for letting us know. We'll check our records and pause these texts while we do.",
    button: 'Yes, I already did it',
  },
  goodbye: {
    declined: "You're all set. We won't text you about this check-in again.",
    reported: "Thanks. We'll check our records. You don't need to do anything else.",
    no_form: "This check-in can't be completed online yet. A member of our team will reach out.",
    callback: 'Thanks. Someone from your plan will call you soon.',
    default: 'Thank you.',
    close: 'You can close this page.',
  } as Record<string, string>,
  callback: {
    topics: {
      falls: 'fall prevention', food: 'help with food', housing: 'help with housing', rides: 'rides to appointments',
      mood: 'talking with a care manager', pcp: 'choosing a doctor', tobacco: 'quitting tobacco', daily_help: 'help at home',
    } as Record<string, string>,
    fallback: 'your care plan',
    h1: (topic: string) => `Get a call about ${topic}`,
    body: 'Someone from your plan will call the phone number we have on file, usually within 2 business days.',
    button: 'Yes, please call me',
    back: 'Back to my plan',
  },
};

export type Strings = typeof en;

const es: Strings = {
  // Written without á, í, ó, ú: those letters switch a text to UCS-2, which fits 70 characters per SMS segment, not 160.
  sms: {
    invite: (link: string) => `${PLAN_NAME}: tiene un breve chequeo de salud pendiente. Toma unos 10 minutos. ${link} Responda STOP para cancelar los mensajes.`,
    reminder: (link: string) => `${PLAN_NAME}: le recordamos que su chequeo de salud sigue pendiente. ${link} Responda STOP para cancelar los mensajes.`,
    resume: (link: string) => `${PLAN_NAME}: siga con su chequeo de salud. Sus respuestas se guardaron. ${link} Responda STOP para cancelar los mensajes.`,
    relink: (link: string) => `${PLAN_NAME}: este es su nuevo enlace para el chequeo. ${link}`,
    confirm: (_formName: string, link: string) => `${PLAN_NAME}: gracias por completar su chequeo de salud. Vea su plan: ${link}`,
  },
  title: `Chequeo de ${PLAN_NAME}`,
  home: { h1: 'Chequeo de salud', body: 'Abra el enlace del mensaje de texto que le enviamos para empezar su chequeo.' },
  notFound: { h1: 'No encontramos ese enlace', body: 'Revise que haya abierto el enlace completo de su mensaje de texto.' },
  memberServices: (phone: string) => `¿Necesita ayuda? Llame a servicios para miembros al ${phone}.`,
  questionsMemberServices: (phone: string) => `¿Preguntas? Llame a servicios para miembros al ${phone}.`,
  questionsNurse: (phone: string) => `¿Preguntas? Llame a nuestra línea de enfermería, disponible las 24 horas, al ${phone}.`,
  start: {
    h1: 'Su chequeo de salud',
    intro: 'Algunas preguntas sobre su salud y su vida diaria, para que su plan le pueda ofrecer la ayuda adecuada. Toma unos 10 minutos y se guarda mientras avanza.',
    confirm: 'Primero, confirme que es usted.',
    submit: 'Empezar mi chequeo',
    checking: 'Verificando…',
    alreadyDone: 'Ya hice este chequeo',
    noThanks: 'No, gracias, no quiero hacerlo',
  },
  fields: {
    dob: { label: 'Fecha de nacimiento', hint: '' },
    zip: { label: 'Código postal', hint: '5 dígitos' },
    medicaid_id: { label: 'Número de Medicaid', hint: 'Está en su tarjeta de miembro' },
  },
  verify: {
    tooFast: 'Demasiados intentos. Espere un minuto e intente de nuevo.',
    locked: (min: number) => `Demasiados intentos. Espere ${min} minutos e intente de nuevo.`,
    noMatch: 'Los datos no coinciden con nuestros registros. Revíselos e intente de nuevo.',
  },
  q: {
    part: (n: number, of: number, section: string) => `Parte ${n} de ${of}: ${section}`,
    progress: 'Progreso',
    chooseAnswer: 'Elija una respuesta.',
    skip: 'Saltar esta pregunta',
    back: '← Atrás',
    saves: 'Sus respuestas se guardan mientras avanza. Puede parar y volver con el mismo enlace.',
    yes: 'Sí',
    no: 'No',
    enterNumber: 'Escriba un número',
    next: 'Continuar',
  },
  done: {
    h1: (formName: string) => `Gracias. Completó su ${formName}.`,
    intro: 'Según sus respuestas, esto es lo que su plan puede hacer por usted. También le enviamos por texto un enlace a esta página.',
    none: 'Sus respuestas no muestran ninguna necesidad por ahora. Siga con sus chequeos regulares.',
  },
  carePlan: {
    falls: { title: 'Reduzca su riesgo de caídas', detail: 'Su plan cubre una revisión gratuita de seguridad en el hogar y un programa de equilibrio.', action: 'Pedir una llamada sobre esto' },
    food: { title: 'Ayuda con alimentos', detail: 'Puede calificar para entrega de comidas saludables y programas de alimentos locales.', action: 'Llámenme sobre esto' },
    housing: { title: 'Ayuda con vivienda', detail: 'Un coordinador de cuidado puede conectarle con apoyo de vivienda cerca de usted.', action: 'Llámenme sobre esto' },
    rides: { title: 'Transporte gratis a sus citas', detail: 'Su plan cubre el transporte a sus citas médicas.', action: 'Llámenme sobre el transporte' },
    mood: { title: 'Hable con un administrador de cuidado', detail: 'Sus respuestas indican que hablar con alguien podría ayudarle.', action: 'Pedir una llamada' },
    pcp: { title: 'Elija un médico regular', detail: 'Tener un médico que le conozca facilita su cuidado. Le podemos ayudar a elegir uno.', action: 'Ayúdenme a elegir' },
    prenatal: { title: 'Cuidado para usted y su bebé', detail: 'Nuestro equipo de maternidad se comunicará con usted sobre las citas prenatales y beneficios adicionales.', action: '' },
    tobacco: { title: 'Ayuda gratis para dejar el tabaco', detail: 'Su plan cubre asesoría y medicamentos para dejar de fumar.', action: 'Llámenme sobre esto' },
    daily_help: { title: 'Ayuda en casa', detail: 'Puede calificar para recibir ayuda en casa con las tareas diarias.', action: 'Llámenme sobre esto' },
  },
  expired: {
    sentH1: 'Le enviamos un nuevo enlace',
    sentBody: 'Enviamos un nuevo enlace por texto al número de teléfono que tenemos registrado. Ábralo para continuar.',
    h1: 'Este enlace ya venció',
    body: 'Para proteger su privacidad, los enlaces del chequeo solo funcionan por un tiempo limitado. Podemos enviar uno nuevo por texto al número que tenemos registrado.',
    limit: 'Ya le enviamos varios enlaces nuevos hoy. Intente de nuevo mañana.',
    button: 'Envíenme un nuevo enlace',
  },
  crisis: {
    h1: 'No tiene que pasar por esto solo(a)',
    body: 'Si está pensando en hacerse daño, busque ayuda ahora. La ayuda es gratuita y está disponible las 24 horas.',
    call988: 'Llame o envíe un texto al 988',
    lifeline: '988 Línea de Prevención del Suicidio y Crisis (oprima 2 para español)',
    nurse: (phone: string) => `Llame a nuestra línea de enfermería: ${phone}`,
    danger: 'Si está en peligro ahora mismo, llame al 911. Un administrador de cuidado de su plan también se comunicará con usted.',
    continue: 'Continuar mi chequeo',
  },
  decline: {
    h1: 'No hay problema',
    body: 'No le enviaremos más textos sobre este chequeo. Si quiere, díganos por qué. Es opcional.',
    reasonLabel: 'Motivo (opcional)',
    reasons: {
      '': 'Prefiero no decirlo',
      not_interested: 'No me interesa',
      no_time: 'No tengo tiempo ahora',
      privacy: 'Me preocupa mi privacidad',
      prefer_phone: 'Prefiero hablar con alguien',
      other: 'Otro motivo',
    },
    button: 'Detener mi chequeo',
    back: 'Regresar',
  },
  alreadyDone: {
    h1: '¿Ya hizo su chequeo?',
    body: 'Gracias por avisarnos. Revisaremos nuestros registros y pausaremos estos textos mientras tanto.',
    button: 'Sí, ya lo hice',
  },
  goodbye: {
    declined: 'Listo. No le enviaremos más textos sobre este chequeo.',
    reported: 'Gracias. Revisaremos nuestros registros. No necesita hacer nada más.',
    no_form: 'Este chequeo todavía no se puede completar en línea. Alguien de nuestro equipo se comunicará con usted.',
    callback: 'Gracias. Alguien de su plan le llamará pronto.',
    default: 'Gracias.',
    close: 'Puede cerrar esta página.',
  },
  callback: {
    topics: {
      falls: 'prevención de caídas', food: 'ayuda con alimentos', housing: 'ayuda con vivienda', rides: 'transporte a sus citas',
      mood: 'hablar con un administrador de cuidado', pcp: 'elegir un médico', tobacco: 'dejar el tabaco', daily_help: 'ayuda en casa',
    },
    fallback: 'su plan de cuidado',
    h1: (topic: string) => `Reciba una llamada sobre ${topic}`,
    body: 'Alguien de su plan llamará al número de teléfono que tenemos registrado, normalmente en un plazo de 2 días hábiles.',
    button: 'Sí, llámenme',
    back: 'Regresar a mi plan',
  },
};

export const STRINGS: Record<Lang, Strings> = { en, es };
export const strings = (lang: Lang) => STRINGS[lang];

const FORM_TEXT: Record<Lang, Record<string, string>> = { en: {}, es: formsEs as Record<string, string> };

/** The form with its text in the member's language. Logic (linkIds, values, conditions) is untouched. */
export function localizeForm(def: FormDefinition, lang: Lang): FormDefinition {
  const t = FORM_TEXT[lang];
  if (lang === 'en') return def;
  const tr = (s: string) => t[s] ?? s;
  return {
    ...def,
    displayName: tr(def.displayName),
    items: def.items.map(i => ({
      ...i,
      text: tr(i.text),
      section: tr(i.section),
      help: i.help && tr(i.help),
      options: i.options?.map(o => ({ ...o, label: tr(o.label) })),
    })),
  };
}

/** English form strings with no translation in a language. Used by tests. */
export const missingFormText = (def: FormDefinition, lang: Lang) => {
  const t = FORM_TEXT[lang];
  const all = [def.displayName, ...def.items.flatMap(i => [i.text, i.section, ...(i.help ? [i.help] : []), ...(i.options ?? []).map(o => o.label)])];
  return [...new Set(all)].filter(s => !(s in t));
};
