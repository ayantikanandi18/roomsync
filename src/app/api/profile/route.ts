import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import type { Schedule } from "@prisma/client";

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const body = await request.json();
  const {
    budgetMin,
    budgetMax,
    moveInDate,
    location,
    cleanliness,
    schedule,
    petsOk,
    smokingOk,
    socialLevel,
    bio,
  } = body as {
    budgetMin: number;
    budgetMax: number;
    moveInDate: string;
    location: string;
    cleanliness: number;
    schedule: Schedule;
    petsOk: boolean;
    smokingOk: boolean;
    socialLevel: number;
    bio: string;
  };

  if (!location?.trim() || !moveInDate || budgetMin == null || budgetMax == null) {
    return NextResponse.json({ error: "Location, move-in date, and budget are required." }, { status: 400 });
  }
  if (budgetMin > budgetMax) {
    return NextResponse.json({ error: "Minimum budget can't exceed maximum budget." }, { status: 400 });
  }

  const data = {
    budgetMin: Number(budgetMin),
    budgetMax: Number(budgetMax),
    moveInDate: new Date(moveInDate),
    location: location.trim(),
    cleanliness: Number(cleanliness),
    schedule,
    petsOk: Boolean(petsOk),
    smokingOk: Boolean(smokingOk),
    socialLevel: Number(socialLevel),
    bio: bio?.trim() ?? "",
  };

  const profile = await prisma.profile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });

  return NextResponse.json({ profile });
}
