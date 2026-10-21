import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { prisma } from './db';
import { linkBase } from './config';
import { log } from './log';

let sns: SNSClient | null = null;

/**
 * Tells the care team that a member answered a self-harm question positively. The alert goes by email
 * (an SNS topic the care team subscribes to), so it carries no member details: only a pointer to the
 * admin page, where the member is listed under "Crisis flags".
 */
export async function sendCrisisAlert(assessmentId: string) {
  const a = await prisma.assessment.findUnique({ where: { id: assessmentId }, select: { crisisFlaggedAt: true } });
  const at = (a?.crisisFlaggedAt ?? new Date()).toISOString();
  const subject = 'HRA crisis flag: call the member now';
  const body = [
    `A member answered a self-harm question positively at ${at}.`,
    'Follow your crisis protocol and call them now.',
    `Member details: ${linkBase()}/admin#crisis (reference ${assessmentId}).`,
  ].join('\n');

  const topic = process.env.CRISIS_ALERT_TOPIC_ARN;
  if (!topic) {
    log.error({ assessmentId }, 'CRISIS ALERT (no CRISIS_ALERT_TOPIC_ARN set, so only logged): care manager follow-up required');
    return 'logged';
  }
  await (sns ??= new SNSClient({})).send(new PublishCommand({ TopicArn: topic, Subject: subject, Message: body }));
  log.warn({ assessmentId }, 'crisis alert sent');
  return 'sent';
}
