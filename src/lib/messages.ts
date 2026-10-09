import { PLAN_NAME } from './config';

// Every member-facing string lives here so a second language is a translation, not a rewrite.
// SMS bodies never carry the member's name or anything health related.
export const sms = {
  invite: (link: string) => `${PLAN_NAME}: you have a short health check-in waiting. It takes about 10 minutes. ${link} Reply STOP to opt out.`,
  reminder: (link: string) => `${PLAN_NAME}: a reminder that your health check-in is still waiting. ${link} Reply STOP to opt out.`,
  resume: (link: string) => `${PLAN_NAME}: pick up your check-in where you left off. ${link} Reply STOP to opt out.`,
  relink: (link: string) => `${PLAN_NAME}: here is your new check-in link. ${link}`,
  confirm: (formName: string, link: string) => `${PLAN_NAME}: thanks, your ${formName} is complete. See your plan: ${link}`,
};
