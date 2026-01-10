import { format, addDays, parseISO, isValid, subDays } from 'date-fns';
import TimelineContent from '@/components/TimelineContent';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface Message {
  id: string;
  content: string;
  type: string | null;
  createdAt: string | Date;
}

async function getMessages(date: string, userId: string): Promise<Message[]> {
  try {
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59.999`);

    const messages = await prisma.message.findMany({
      where: {
        userId,
        createdAt: {
          gte: start,
          lt: end,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      type: msg.type ?? null,
      createdAt: msg.createdAt,
    }));
  } catch (err) {
    console.error('Prisma error:', err);
    return [];
  }
}

interface TimelinePageProps {
  params: Promise<{ date: string }>;   
}

export default async function TimelinePage({ params }: TimelinePageProps) {
  const { date } = await params;

  const parsedDate = (() => {
    try {
      const d = parseISO(date);
      return isValid(d) ? d : new Date();
    } catch {
      return new Date();
    }
  })();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.log("Unauthorized");
    return null;
  }

  const messages = await getMessages(date, session.user.id);

  const prevDay = subDays(parsedDate, 1);
  const nextDay = addDays(parsedDate, 1);

  return (
    <TimelineContent
      date={parsedDate}
      messages={messages}
      prevDayUrl={`/timeline/${format(prevDay, 'yyyy-MM-dd')}`}
      nextDayUrl={`/timeline/${format(nextDay, 'yyyy-MM-dd')}`}
    />
  );
}
