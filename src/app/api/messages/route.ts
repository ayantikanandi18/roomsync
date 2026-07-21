import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

async function assertParticipant(matchId: string, userId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return null;
  if (match.userAId !== userId && match.userBId !== userId) return null;
  return match;
}

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const matchId = request.nextUrl.searchParams.get("matchId");
  if (!matchId) return NextResponse.json({ error: "matchId is required." }, { status: 400 });

  const match = await assertParticipant(matchId, userId);
  if (!match) return NextResponse.json({ error: "Match not found." }, { status: 404 });

  const messages = await prisma.message.findMany({
    where: { matchId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const body = await request.json();
  const { matchId, body: text } = body as { matchId?: string; body?: string };

  if (!matchId || !text?.trim()) {
    return NextResponse.json({ error: "matchId and body are required." }, { status: 400 });
  }

  const match = await assertParticipant(matchId, userId);
  if (!match) return NextResponse.json({ error: "Match not found." }, { status: 404 });

  const message = await prisma.message.create({
    data: { matchId, senderId: userId, body: text.trim() },
  });

  return NextResponse.json({ message });
}
