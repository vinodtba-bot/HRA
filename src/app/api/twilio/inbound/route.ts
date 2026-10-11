import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validTwilioSignature } from '@/lib/sms';
import { linkBase } from '@/lib/config';
import { audit } from '@/lib/audit';
import { setDisposition } from '@/lib/outreach';

// The Messaging Service's Advanced Opt-Out replies to STOP/HELP/START itself. This endpoint only records
// opt-outs (and opt-ins) so no job ever texts that number again.
const STOP = new Set(['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT', 'REVOKE', 'OPTOUT']);
const START = new Set(['START', 'UNSTOP', 'YES']);

const twiml = () => new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', { headers: { 'Content-Type': 'text/xml' } });

export async function POST(req: NextRequest) {
  const params = Object.fromEntries(new URLSearchParams(await req.text()));
  if (!validTwilioSignature(req.headers.get('x-twilio-signature'), `${linkBase()}/api/twilio/inbound`, params))
    return new NextResponse('forbidden', { status: 403 });

  const from = params.From;
  const word = (params.OptOutType ?? params.Body ?? '').trim().toUpperCase();
  if (!from) return twiml();

  if (STOP.has(word)) {
    const members = await prisma.member.findMany({ where: { phoneE164: from, optedOutAt: null }, include: { invitations: true } });
    for (const m of members) {
      await prisma.member.update({ where: { id: m.id }, data: { optedOutAt: new Date() } });
      for (const inv of m.invitations) {
        await setDisposition(inv.id, 'opted_out');
        await audit('opted_out', inv.id, { actor: 'twilio' });
      }
    }
  } else if (START.has(word)) {
    await prisma.member.updateMany({ where: { phoneE164: from }, data: { optedOutAt: null } });
  }
  return twiml();
}
