"use client";

import { useState } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import Link from "next/link";
import SwipeCard from "@/components/SwipeCard";
import type { CompatibilityBreakdown } from "@/lib/matching";

export interface Candidate {
  id: string;
  name: string;
  location: string;
  budgetMin: number;
  budgetMax: number;
  moveInDate: string;
  cleanliness: number;
  schedule: string;
  petsOk: boolean;
  smokingOk: boolean;
  socialLevel: number;
  bio: string;
  compatibility: CompatibilityBreakdown;
}

const SWIPE_THRESHOLD = 120;

export default function SwipeStack({ candidates }: { candidates: Candidate[] }) {
  const [stack, setStack] = useState(candidates);
  const [matchedName, setMatchedName] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSwipe(direction: "like" | "pass") {
    if (pending || stack.length === 0) return;
    const [current, ...rest] = stack;
    setPending(true);
    setStack(rest);

    try {
      const res = await fetch("/api/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: current.id, direction }),
      });
      const data = await res.json();
      if (data.matched) setMatchedName(current.name);
    } finally {
      setPending(false);
    }
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) handleSwipe("like");
    else if (info.offset.x < -SWIPE_THRESHOLD) handleSwipe("pass");
  }

  if (stack.length === 0) {
    return (
      <div className="h-[520px] flex flex-col items-center justify-center text-center border border-dashed border-border rounded-3xl">
        <p className="text-lg font-medium mb-1">You&apos;re all caught up</p>
        <p className="text-sm text-muted">No more profiles to show right now — check back later.</p>
      </div>
    );
  }

  return (
    <div className="relative h-[520px] max-w-md mx-auto">
      <AnimatePresence>
        {stack
          .slice(0, 2)
          .reverse()
          .map((candidate, i) => {
            const isTop = i === stack.slice(0, 2).length - 1;
            return (
              <motion.div
                key={candidate.id}
                className="absolute inset-0"
                style={{ zIndex: isTop ? 10 : 5 }}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: isTop ? 1 : 0.96, opacity: 1, y: isTop ? 0 : 10 }}
                exit={{
                  x: 0,
                  opacity: 0,
                  transition: { duration: 0.2 },
                }}
                drag={isTop ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={isTop ? onDragEnd : undefined}
                whileDrag={{ rotate: 8 }}
              >
                <SwipeCard candidate={candidate} />
              </motion.div>
            );
          })}
      </AnimatePresence>

      <div className="absolute -bottom-16 left-0 right-0 flex justify-center gap-4">
        <button
          onClick={() => handleSwipe("pass")}
          disabled={pending}
          className="h-14 w-14 rounded-full border border-border bg-card shadow-sm flex items-center justify-center text-2xl hover:scale-105 transition-transform disabled:opacity-50"
          aria-label="Pass"
        >
          ✕
        </button>
        <button
          onClick={() => handleSwipe("like")}
          disabled={pending}
          className="h-14 w-14 rounded-full bg-primary text-white shadow-sm flex items-center justify-center text-2xl hover:scale-105 transition-transform disabled:opacity-50"
          aria-label="Like"
        >
          ♥
        </button>
      </div>

      <AnimatePresence>
        {matchedName && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-card rounded-2xl p-8 text-center max-w-sm w-full"
            >
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-xl font-semibold mb-1">It&apos;s a match!</h2>
              <p className="text-sm text-muted mb-6">You and {matchedName} liked each other.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setMatchedName(null)}
                  className="flex-1 border border-border rounded-lg py-2 text-sm font-medium"
                >
                  Keep swiping
                </button>
                <Link
                  href="/matches"
                  className="flex-1 bg-primary text-white rounded-lg py-2 text-sm font-medium text-center"
                >
                  Send a message
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
