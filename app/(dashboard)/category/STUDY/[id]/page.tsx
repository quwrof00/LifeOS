import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import StudyEditor from '@/components/StudyEditor';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface PageProps {
  params: Promise<{ id: string }>;   
}

export default async function StudyDetailPage({ params }: PageProps) {
  const { id } = await params; 
  const session = await getServerSession(authOptions);
  const user = session?.user || null;

  // Fetch message
  let message;
  try {
    message = await prisma.message.findUnique({
      where: { id },
    });
    if (!message) notFound();
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 relative overflow-hidden">
      <StudyEditor initialContent={message.content} messageId={id} user={user} />
    </div>
  );
}