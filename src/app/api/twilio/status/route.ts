import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validTwilioSignature } from '@/lib/sms';
import { linkBase } from '@/lib/config';
import { audit } from '@/lib/audit';

// Twilio error codes that mean the number cannot receive texts: unreachable, unknown, landline.
const BAD_NUMBER = new Set([30003, 30005, 30006]);

export async function POST(req: NextRequest) {
  const params = Object.fromEntries(new URLSearchParams(await req.text()));
  if (!validTwilioSignature(req.headers.get('x-twilio-signature'), `${linkBase()}/api/twilio/status`, params))
    return new NextResponse('forbidden', { status: 403 });

  const sid = params.MessageSid;
  const status = params.MessageStatus;
  const errorCode = params.ErrorCode ? Number(params.ErrorCode) : null;
  const msg = sid ? await prisma.message.findUnique({ where: { twilioSid: sid }, include: { invitation: true } }) : null;
  if (!msg) return new NextResponse(null, { status: 204 });

  const bad = errorCode !== null && BAD_NUMBER.has(errorCode);
  await prisma.message.update({
    where: { id: msg.id },
    data: { status, errorCode, ...(bad ? { disposition: 'bad_number', dispositionReason: `twilio ${errorCode}` } : {}) },
  });
  if (bad) {
    await prisma.member.update({ where: { id: msg.invitation.memberId }, data: { badNumberAt: new Date() } });
    await audit('bad_number', msg.invitationId, { actor: 'twilio', detail: { errorCode } });
  }
  return new NextResponse(null, { status: 204 });
}
