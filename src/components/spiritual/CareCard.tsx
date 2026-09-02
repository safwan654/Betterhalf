"use client";

import { useState } from "react";
import { useGlobal } from "@/context/GlobalContext";
import { Heart, Send, Coffee, Sparkles, MessageCircleHeart } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

const CARE_TEMPLATES = [
  "Hope you're resting comfortably today my love 🤍 Let me know if you need anything!",
  "Thinking of you! Drink some warm tea and take it easy today 🍵✨",
  "Sending you a warm hug and lots of love 🫂🤍",
  "Would you like me to order you some comfort food or treats? 🍫🍓"
];

export default function CareCard() {
  const { wifeName, periodStartDate, sendCareNote } = useGlobal();
  const [customNote, setCustomNote] = useState("");
  const [sentToast, setSentToast] = useState<string | null>(null);

  const cycleDay = periodStartDate 
    ? Math.max(1, differenceInDays(new Date(), parseISO(periodStartDate)) + 1)
    : 1;

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    sendCareNote(text);
    setCustomNote("");
    setSentToast("Love note sent to your wife! 💌🤍");
    setTimeout(() => setSentToast(null), 3000);
  };

  return (
    <div className="glass-panel p-4 rounded-3xl border border-rose-200/60 dark:border-rose-900/40 bg-gradient-to-br from-rose-50/70 via-white to-amber-50/50 dark:from-rose-950/20 dark:via-zinc-900 dark:to-zinc-900 flex flex-col gap-3.5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-rose-500/10 text-rose-500">
            <Heart className="h-5 w-5 fill-rose-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-500">
              Care Mode · Day {cycleDay}
            </span>
            <h4 className="text-sm font-extrabold text-slate-800 dark:text-zinc-100">
              {wifeName} is resting (Exempt) 🌸
            </h4>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
          Cycle Active
        </span>
      </div>

      <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
        She is currently exempt from prayer. Take a moment to send her a thoughtful note or ask how she's feeling.
      </p>

      {/* Preset Quick Notes */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Quick Care Messages:
        </span>
        <div className="grid grid-cols-1 gap-1.5">
          {CARE_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(tmpl)}
              className="text-left text-xs font-semibold p-2.5 rounded-xl bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60 text-slate-700 dark:text-zinc-300 transition-all active:scale-[0.98] flex items-center justify-between group"
            >
              <span className="line-clamp-1">{tmpl}</span>
              <Send className="h-3 w-3 text-slate-400 group-hover:text-rose-500 transition-colors shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </div>

      {/* Custom Note Input */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={customNote}
          onChange={(e) => setCustomNote(e.target.value)}
          placeholder="Write your own sweet message..."
          className="flex-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-rose-400"
          onKeyDown={(e) => e.key === "Enter" && handleSend(customNote)}
        />
        <button
          onClick={() => handleSend(customNote)}
          disabled={!customNote.trim()}
          className="p-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-bold transition-all active:scale-95 shrink-0"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>

      {sentToast && (
        <span className="text-[10px] font-bold text-center text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded-xl animate-in fade-in">
          {sentToast}
        </span>
      )}
    </div>
  );
}
