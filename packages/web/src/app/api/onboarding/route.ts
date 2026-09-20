import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { businessName, ownerName, knowledge } = body;

    const business = await prisma.business.create({
      data: {
        name: businessName,
        ownerName: ownerName,
        industry: 'Retail',
        knowledge: {
          create: knowledge
        }
      }
    });

    return NextResponse.json({ success: true, businessId: business.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create business knowledge base' }, { status: 500 });
  }
}
