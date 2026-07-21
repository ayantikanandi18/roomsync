import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeCompatibility } from "@/lib/matching";
import SwipeStack, { type Candidate } from "./SwipeStack";

export default async function DiscoverPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.profile) redirect("/profile");

  const alreadySwiped = await prisma.swipe.findMany({
    where: { swiperId: user.id },
    select: { targetId: true },
  });
  const excludeIds = new Set([user.id, ...alreadySwiped.map((s) => s.targetId)]);

  const others = await prisma.user.findMany({
    where: {
      id: { notIn: Array.from(excludeIds) },
      profile: { isNot: null },
    },
    include: { profile: true },
  });

  const candidates: Candidate[] = others
    .filter((o) => o.profile)
    .map((o) => {
      const breakdown = computeCompatibility(user.profile!, o.profile!);
      return {
        id: o.id,
        name: o.name,
        location: o.profile!.location,
        budgetMin: o.profile!.budgetMin,
        budgetMax: o.profile!.budgetMax,
        moveInDate: o.profile!.moveInDate.toISOString(),
        cleanliness: o.profile!.cleanliness,
        schedule: o.profile!.schedule,
        petsOk: o.profile!.petsOk,
        smokingOk: o.profile!.smokingOk,
        socialLevel: o.profile!.socialLevel,
        bio: o.profile!.bio,
        compatibility: breakdown,
      };
    })
    .sort((a, b) => b.compatibility.score - a.compatibility.score);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Discover</h1>
      <p className="text-sm text-muted mb-6">Swipe right to like, left to pass. Ranked by compatibility.</p>
      <SwipeStack candidates={candidates} />
    </div>
  );
}
