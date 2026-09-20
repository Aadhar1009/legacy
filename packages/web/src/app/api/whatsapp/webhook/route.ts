import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Simplified Twilio/WhatsApp Webhook Payload parsing
    const { Body, From } = body;

    // Get the first business (since this is a single-tenant local demo setup)
    const business = await prisma.business.findFirst();
    if (!business) return NextResponse.json({ error: 'No business configured' }, { status: 400 });

    await prisma.communicationLog.create({
      data: {
        businessId: business.id,
        platform: 'WhatsApp',
        sender: From || 'Unknown',
        content: Body || 'Media Message'
      }
    });

    return NextResponse.json({ success: true, message: 'Ingested to DukaanOS Memory' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
