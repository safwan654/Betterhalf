"use client";

import { useState } from "react";
import { useGlobal } from "@/context/GlobalContext";
import { Heart, Moon, Shield, Info, Check, Sparkles, RefreshCw } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";

export default function CycleTracker() {
  const { 
    periodActive, 
    periodStartDate, 
    periodCycles, 
    markPeriodStart, 
    markPeriodEnd, 
    sharePeriodStatus, 
    setSharePeriodStatus 
  } = useGlobal();

  const [confirmToast, setConfirmToast] = useState<string | null>(null);

  const cycleDay = periodStartDate 
    ? Math.max(1, differenceInDays(new Date(), parseISO(periodStartDate)) + 1)
    : 1;

  // Average duration
  const completedCycles = periodCycles.filter(c => c.durationDays);
  const avgDuration = completedCycles.length > 0
    ? Math.round(completedCycles.reduce((acc, c) => acc + (c.durationDays || 5), 0) / completedCycles.length)
    : 5;

  const handleTogglePeriod = () => {
    if (periodActive) {
      markPeriodEnd();
      setConfirmToast("Cycle ended. Normal prayer tracking resumed! 🤍");
    } else {
      markPeriodStart();
      setConfirmToast("Cycle marked active. Prayer exemption (رخصة) applied! 🌸");
    }
    setTimeout(() => setConfirmToast(null), 3500);
  };

  return (
    <div className="glass-panel p-4 rounded-3xl border border-rose-200/60 dark:border-rose-900/40 bg-gradient-to-br from-rose-50/50 via-white to-purple-50/40 dark:from-rose-950/20 dark:via-zinc-900 dark:to-zinc-900 flex flex-col gap-3.5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-rose-500/10 text-rose-500">
            <Moon className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-500">
              Women's Health & Exemption (رخصة)
            </span>
            <h4 className="text-sm font-extrabold text-slate-800 dark:text-zinc-100">
              {periodActive ? `Cycle Active · Day ${cycleDay}` : "Cycle Tracking"}
            </h4>
          </div>
        </div>

        <button
          onClick={handleTogglePeriod}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5 ${
            periodActive 
              ? "bg-slate-800 hover:bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900" 
              : "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20"
          }`}
        >
          {periodActive ? "Mark Cycle End" : "Mark Period Start"}
        </button>
      </div>

      {periodActive ? (
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-200/50 dark:border-rose-900/40 flex flex-col gap-1.5">
          <span className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Prayer Exemption Active
          </span>
          <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
            Your daily prayers are automatically marked as <strong>Exempt (رخصة)</strong>. Streaks will not break, and missed prayers during this period do not need to be made up.
          </p>
        </div>
      ) : (
        <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
          Tap when your cycle begins to automatically pause prayer tracking and activate Husband Care Mode.
        </p>
      )}

      {/* Cycle Stats & Privacy */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-zinc-800 text-[11px]">
        <div className="flex flex-col p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Avg Duration</span>
          <span className="font-extrabold text-slate-700 dark:text-zinc-200">{avgDuration} days</span>
        </div>
        <div className="flex flex-col p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Logged Cycles</span>
          <span className="font-extrabold text-slate-700 dark:text-zinc-200">{periodCycles.length} recorded</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-300 flex items-center gap-1.5 cursor-pointer">
          <Shield className="h-3.5 w-3.5 text-slate-400" /> Share status with Husband for Care Mode
        </label>
        <input
          type="checkbox"
          checked={sharePeriodStatus}
          onChange={(e) => setSharePeriodStatus(e.target.checked)}
          className="rounded text-rose-500 focus:ring-rose-400 h-4 w-4"
        />
      </div>

      {confirmToast && (
        <span className="text-[10px] font-bold text-center text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded-xl animate-in fade-in">
          {confirmToast}
        </span>
      )}
    </div>
  );
}
