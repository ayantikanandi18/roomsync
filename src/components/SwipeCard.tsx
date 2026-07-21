import MatchScoreBadge from "./MatchScoreBadge";
import type { Candidate } from "@/app/(app)/discover/SwipeStack";

const scheduleLabel: Record<string, string> = {
  early_bird: "Early bird",
  night_owl: "Night owl",
  flexible: "Flexible schedule",
};

export default function SwipeCard({ candidate }: { candidate: Candidate }) {
  const initials = candidate.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="h-full w-full bg-card border border-border rounded-3xl shadow-lg p-6 flex flex-col select-none">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-primary/15 text-primary flex items-center justify-center text-lg font-bold">
            {initials}
          </div>
          <div>
            <div className="font-semibold text-lg">{candidate.name}</div>
            <div className="text-sm text-muted">{candidate.location}</div>
          </div>
        </div>
        <MatchScoreBadge score={candidate.compatibility.score} />
      </div>

      {candidate.bio && <p className="text-sm text-foreground/80 mb-4">{candidate.bio}</p>}

      <div className="grid grid-cols-2 gap-2 text-xs mt-auto">
        <div className="bg-black/[0.03] rounded-lg px-3 py-2">
          <div className="text-muted">Budget</div>
          <div className="font-medium">
            ${candidate.budgetMin}–${candidate.budgetMax}/mo
          </div>
        </div>
        <div className="bg-black/[0.03] rounded-lg px-3 py-2">
          <div className="text-muted">Move-in</div>
          <div className="font-medium">
            {new Date(candidate.moveInDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </div>
        </div>
        <div className="bg-black/[0.03] rounded-lg px-3 py-2">
          <div className="text-muted">Schedule</div>
          <div className="font-medium">{scheduleLabel[candidate.schedule]}</div>
        </div>
        <div className="bg-black/[0.03] rounded-lg px-3 py-2">
          <div className="text-muted">Cleanliness</div>
          <div className="font-medium">{candidate.cleanliness}/5</div>
        </div>
        <div className="bg-black/[0.03] rounded-lg px-3 py-2">
          <div className="text-muted">Pets</div>
          <div className="font-medium">{candidate.petsOk ? "OK" : "Not OK"}</div>
        </div>
        <div className="bg-black/[0.03] rounded-lg px-3 py-2">
          <div className="text-muted">Smoking</div>
          <div className="font-medium">{candidate.smokingOk ? "OK" : "Not OK"}</div>
        </div>
      </div>
    </div>
  );
}
