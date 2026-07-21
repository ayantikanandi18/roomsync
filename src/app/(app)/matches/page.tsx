import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MatchesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const matches = await prisma.match.findMany({
    where: { OR: [{ userAId: user.id }, { userBId: user.id }] },
    include: {
      userA: true,
      userB: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Matches</h1>

      {matches.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl py-16 text-center">
          <p className="font-medium mb-1">No matches yet</p>
          <p className="text-sm text-muted mb-4">Keep swiping on Discover to find your roommate.</p>
          <Link href="/discover" className="text-primary text-sm font-medium">
            Go to Discover →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map((match) => {
            const other = match.userAId === user.id ? match.userB : match.userA;
            const lastMessage = match.messages[0];
            const initials = other.name
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <Link
                key={match.id}
                href={`/matches/${match.id}`}
                className="flex items-center gap-4 bg-card border border-border rounded-xl px-4 py-3 hover:border-primary/40 transition-colors"
              >
                <div className="h-11 w-11 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="font-medium">{other.name}</div>
                  <div className="text-sm text-muted truncate">
                    {lastMessage ? lastMessage.body : "Say hi 👋"}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
