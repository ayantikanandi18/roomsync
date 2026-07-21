import type { Profile, Schedule } from "@prisma/client";

/**
 * Compatibility score (0-100) between two roommate profiles.
 *
 * Soft factors (budget/location/cleanliness/schedule/social/move-in timing)
 * sum to a 0-100 base score. Pets/smoking are treated as hard filters: a
 * mismatch there doesn't just subtract a few points, it multiplies the whole
 * score down, because "I have a cat, you're allergic" matters more than a
 * $50 budget gap.
 */

const WEIGHTS = {
  budget: 28,
  location: 17,
  cleanliness: 17,
  schedule: 17,
  social: 11,
  moveIn: 10,
};

function budgetOverlapScore(a: Profile, b: Profile): number {
  const overlapStart = Math.max(a.budgetMin, b.budgetMin);
  const overlapEnd = Math.min(a.budgetMax, b.budgetMax);
  const overlap = Math.max(0, overlapEnd - overlapStart);

  const widestRange = Math.max(a.budgetMax - a.budgetMin, b.budgetMax - b.budgetMin, 1);
  const ratio = Math.min(1, overlap / widestRange);
  return WEIGHTS.budget * ratio;
}

function locationScore(a: Profile, b: Profile): number {
  const normalize = (s: string) => s.trim().toLowerCase();
  return normalize(a.location) === normalize(b.location) ? WEIGHTS.location : 0;
}

function closenessScore(diff: number, maxDiff: number, weight: number): number {
  const ratio = 1 - Math.min(diff, maxDiff) / maxDiff;
  return weight * ratio;
}

function scheduleScore(a: Schedule, b: Schedule): number {
  if (a === b) return WEIGHTS.schedule;
  if (a === "flexible" || b === "flexible") return WEIGHTS.schedule * 0.65;
  return 0; // early_bird vs night_owl
}

function moveInScore(a: Profile, b: Profile): number {
  const diffDays = Math.abs(a.moveInDate.getTime() - b.moveInDate.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays <= 14) return WEIGHTS.moveIn;
  if (diffDays <= 30) return WEIGHTS.moveIn * 0.6;
  if (diffDays <= 60) return WEIGHTS.moveIn * 0.3;
  return 0;
}

function hardFilterMultiplier(a: Profile, b: Profile): number {
  const petsConflict = a.petsOk !== b.petsOk;
  const smokingConflict = a.smokingOk !== b.smokingOk;

  if (petsConflict && smokingConflict) return 0.35;
  if (smokingConflict) return 0.5; // smoking tends to be the harder dealbreaker
  if (petsConflict) return 0.65;
  return 1;
}

export interface CompatibilityBreakdown {
  score: number;
  budget: number;
  location: number;
  cleanliness: number;
  schedule: number;
  social: number;
  moveIn: number;
  hardFilterMultiplier: number;
}

export function computeCompatibility(a: Profile, b: Profile): CompatibilityBreakdown {
  const budget = budgetOverlapScore(a, b);
  const location = locationScore(a, b);
  const cleanliness = closenessScore(Math.abs(a.cleanliness - b.cleanliness), 4, WEIGHTS.cleanliness);
  const schedule = scheduleScore(a.schedule, b.schedule);
  const social = closenessScore(Math.abs(a.socialLevel - b.socialLevel), 4, WEIGHTS.social);
  const moveIn = moveInScore(a, b);

  const multiplier = hardFilterMultiplier(a, b);
  const rawTotal = budget + location + cleanliness + schedule + social + moveIn;
  const score = Math.round(Math.min(100, Math.max(0, rawTotal * multiplier)));

  return { score, budget, location, cleanliness, schedule, social, moveIn, hardFilterMultiplier: multiplier };
}
