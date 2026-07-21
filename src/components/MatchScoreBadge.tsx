export default function MatchScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 75
      ? "bg-accent/15 text-accent"
      : score >= 50
      ? "bg-amber-100 text-amber-700"
      : "bg-black/5 text-muted";

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${tone}`}>
      {score}% match
    </span>
  );
}
