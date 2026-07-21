"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
}

const POLL_INTERVAL_MS = 4000;

export default function MessageThread({
  matchId,
  currentUserId,
  initialMessages,
}: {
  matchId: string;
  currentUserId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/messages?matchId=${matchId}`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);
    const body = draft.trim();
    setDraft("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, body }),
      });
      const data = await res.json();
      if (res.ok) setMessages((prev) => [...prev, data.message]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl flex flex-col h-[520px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <p className="text-sm text-muted text-center mt-8">No messages yet — say hi 👋</p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  mine ? "bg-primary text-white" : "bg-black/[0.04] text-foreground"
                }`}
              >
                {m.body}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="border-t border-border p-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="bg-primary hover:bg-primary-dark text-white text-sm font-medium px-4 rounded-lg disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
