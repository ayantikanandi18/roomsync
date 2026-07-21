"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@prisma/client";

function toDateInputValue(date: Date | undefined) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export default function ProfileForm({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const [form, setForm] = useState({
    budgetMin: profile?.budgetMin ?? 800,
    budgetMax: profile?.budgetMax ?? 1500,
    moveInDate: toDateInputValue(profile?.moveInDate) || toDateInputValue(new Date()),
    location: profile?.location ?? "",
    cleanliness: profile?.cleanliness ?? 3,
    schedule: profile?.schedule ?? "flexible",
    petsOk: profile?.petsOk ?? true,
    smokingOk: profile?.smokingOk ?? false,
    socialLevel: profile?.socialLevel ?? 3,
    bio: profile?.bio ?? "",
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save profile.");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-card border border-border rounded-2xl p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Min budget ($/mo)</label>
          <input
            type="number"
            min={0}
            value={form.budgetMin}
            onChange={(e) => update("budgetMin", Number(e.target.value))}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Max budget ($/mo)</label>
          <input
            type="number"
            min={0}
            value={form.budgetMax}
            onChange={(e) => update("budgetMax", Number(e.target.value))}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Move-in date</label>
          <input
            type="date"
            required
            value={form.moveInDate}
            onChange={(e) => update("moveInDate", e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location / neighborhood</label>
          <input
            required
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="e.g. Austin, TX"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Cleanliness ({form.cleanliness}/5)
        </label>
        <input
          type="range"
          min={1}
          max={5}
          value={form.cleanliness}
          onChange={(e) => update("cleanliness", Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Social level ({form.socialLevel}/5)
        </label>
        <input
          type="range"
          min={1}
          max={5}
          value={form.socialLevel}
          onChange={(e) => update("socialLevel", Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Schedule</label>
        <select
          value={form.schedule}
          onChange={(e) => update("schedule", e.target.value as typeof form.schedule)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-card"
        >
          <option value="early_bird">Early bird</option>
          <option value="night_owl">Night owl</option>
          <option value="flexible">Flexible</option>
        </select>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.petsOk}
            onChange={(e) => update("petsOk", e.target.checked)}
            className="accent-primary"
          />
          OK with pets
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.smokingOk}
            onChange={(e) => update("smokingOk", e.target.checked)}
            className="accent-primary"
          />
          OK with smoking
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Bio</label>
        <textarea
          rows={3}
          value={form.bio}
          onChange={(e) => update("bio", e.target.value)}
          placeholder="A little about you..."
          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-primary-dark">{error}</p>}
      {saved && <p className="text-sm text-accent">Saved.</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary-dark text-white font-medium text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save preferences"}
      </button>
    </form>
  );
}
