import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MessageThread from "./MessageThread";

export default async function MatchThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const match = await prisma.match.findUnique({
    where: { id },
    include: { userA: true, userB: true },
  });

  if (!match || (match.userAId !== user.id && match.userBId !== user.id)) {
    notFound();
  }

  const other = match.userAId === user.id ? match.userB : match.userA;

  const initialMessages = await prisma.message.findMany({
    where: { matchId: match.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="max-w-lg mx-auto">
      <Link href="/matches" className="text-sm text-muted hover:text-foreground">
        ← Back to matches
      </Link>
      <h1 className="text-2xl font-semibold mt-2 mb-6">{other.name}</h1>
      <MessageThread
        matchId={match.id}
        currentUserId={user.id}
        initialMessages={initialMessages.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          body: m.body,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
