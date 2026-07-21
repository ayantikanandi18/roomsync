import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json();
  const { targetId, direction } = body as { targetId?: string; direction?: "like" | "pass" };

  if (!targetId || (direction !== "like" && direction !== "pass")) {
    return NextResponse.json({ error: "targetId and a valid direction are required." }, { status: 400 });
  }
  if (targetId === userId) {
    return NextResponse.json({ error: "Cannot swipe on yourself." }, { status: 400 });
  }

  await prisma.swipe.upsert({
    where: { swiperId_targetId: { swiperId: userId, targetId } },
    update: { direction },
    create: { swiperId: userId, targetId, direction },
  });

  if (direction !== "like") {
    return NextResponse.json({ matched: false });
  }

  const reciprocal = await prisma.swipe.findUnique({
    where: { swiperId_targetId: { swiperId: targetId, targetId: userId } },
  });

  if (!reciprocal || reciprocal.direction !== "like") {
    return NextResponse.json({ matched: false });
  }

  const [userAId, userBId] = [userId, targetId].sort();

  const match = await prisma.match.upsert({
    where: { userAId_userBId: { userAId, userBId } },
    update: {},
    create: { userAId, userBId },
  });

  return NextResponse.json({ matched: true, matchId: match.id });
}
