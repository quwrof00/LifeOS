import { NextRequest, NextResponse } from 'next/server';
import { Category } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  // 1. Auth check
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse & validate ?type=
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  if (!type || !Object.values(Category).includes(type.toUpperCase() as Category)) {
    return NextResponse.json(
      { success: false, error: 'Invalid or missing category type' },
      { status: 400 },
    );
  }

  try {
    if (type.toUpperCase() === 'MEDIA') {
      const mediaRows = await prisma.media.findMany({
        where: {
          Message: {
            userId: session.user.id,
          }
        },
        include: {
          Message: true
        }
      })
      console.log(mediaRows);

      const messages = mediaRows?.map((m) => ({
        ...m.Message,                     // id, content, createdAt, etc.
        boldness: m.boldness,
        boldnessExplanation: m.boldnessExplanation,
        boldnessConfidence: m.boldnessConfidence,
      }));

      return NextResponse.json({ success: true, messages });
    }
    const messages = await prisma.message.findMany({
      where: {
        type: type.toUpperCase() as Category,
        userId: session.user.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, messages });
  } catch (err) {
    console.error('[GET_MESSAGES_ERROR]', err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
