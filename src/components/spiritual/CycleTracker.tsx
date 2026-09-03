"use client";

import { useState } from "react";
import { useGlobal } from "@/context/GlobalContext";
import { Moon, Shield, Sparkles, Calendar, Clock, X, Check, History } from "lucide-react";
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
  
  // Start/End Modal or Drawer state
  const [modalMode, setModalMode] = useState<"START" | "END" | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedTime, setSelectedTime] = useState("");
  const [useCurrentTime, setUseCurrentTime] = useState(false);

  const cycleDay = periodStartDate 
    ? Math.max(1, differenceInDays(new Date(), parseISO(periodStartDate)) + 1)
    : 1;

  // Average duration
  const completedCycles = periodCycles.filter(c => c.durationDays);
  const avgDuration = completedCycles.length > 0
    ? Math.round(completedCycles.reduce((acc, c) => acc + (c.durationDays || 5), 0) / completedCycles.length)
    : 5;

  const openStartModal = () => {
    setSelectedDate(format(new Date(), "yyyy-MM-dd"));
    setSelectedTime(format(new Date(), "HH:mm"));
    setUseCurrentTime(true);
    setModalMode("START");
  };

  const openEndModal = () => {
    setSelectedDate(format(new Date(), "yyyy-MM-dd"));
    setSelectedTime(format(new Date(), "HH:mm"));
    setUseCurrentTime(true);
    setModalMode("END");
  };

  const handleConfirmAction = () => {
    const timeToPass = selectedTime.trim() ? selectedTime.trim() : undefined;

    if (modalMode === "START") {
      markPeriodStart(selectedDate, timeToPass);
      setConfirmToast("Cycle marked active. Prayer exemption (رخصة) applied! 🌸");
    } else if (modalMode === "END") {
      markPeriodEnd(selectedDate, timeToPass);
      setConfirmToast("Cycle ended. Normal prayer tracking resumed! 🤍");
    }

    setModalMode(null);
    setTimeout(() => setConfirmToast(null), 3500);
  };

  return (
    <div className="glass-panel p-5 rounded-3xl border border-rose-200/60 dark:border-rose-900/40 bg-gradient-to-br from-rose-50/50 via-white to-purple-50/40 dark:from-rose-950/20 dark:via-zinc-900 dark:to-zinc-900 flex flex-col gap-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 shadow-sm">
            <Moon className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-500">
              Women's Health & Prayer Exemption (رخصة)
            </span>
            <h4 className="text-sm font-extrabold text-slate-800 dark:text-zinc-100">
              {periodActive ? `Cycle Active · Day ${cycleDay}` : "Menstrual Cycle Tracker"}
            </h4>
          </div>
        </div>

        {periodActive ? (
          <button
            onClick={openEndModal}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 transition-all shadow-sm active:scale-95"
          >
            Mark Cycle End
          </button>
        ) : (
          <button
            onClick={openStartModal}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20 shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" /> Mark Period Start
          </button>
        )}
      </div>

      {periodActive ? (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-200/50 dark:border-rose-900/40 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Prayer Exemption Active
            </span>
            {periodStartDate && (
              <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                Started: {format(parseISO(periodStartDate), "MMM d, h:mm a")}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
            Your prayers during this window are automatically marked as <strong>Exempt (رخصة)</strong>. Streaks will not break, and missed prayers during this period do not need to be made up.
          </p>
        </div>
      ) : (
        <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
          Log when your cycle begins with date & optional time. Prayers after start time automatically become exempt and Husband Care Mode is activated.
        </p>
      )}

      {/* Cycle Stats */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-zinc-800 text-[11px]">
        <div className="flex flex-col p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-850/60 border border-slate-100 dark:border-zinc-800">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Avg Duration</span>
          <span className="font-extrabold text-slate-700 dark:text-zinc-200">{avgDuration} days</span>
        </div>
        <div className="flex flex-col p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-850/60 border border-slate-100 dark:border-zinc-800">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Logged Cycles</span>
          <span className="font-extrabold text-slate-700 dark:text-zinc-200">{periodCycles.length} recorded</span>
        </div>
      </div>

      {/* Privacy Setting */}
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
        <span className="text-[10px] font-bold text-center text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl animate-in fade-in">
          {confirmToast}
        </span>
      )}

      {/* Date & Time Picker Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-white/20 dark:border-zinc-800 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                  {modalMode === "START" ? "Start Cycle" : "End Cycle"}
                </span>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100">
                  {modalMode === "START" ? "Mark Period Start" : "Mark Period End"}
                </h3>
              </div>
              <button 
                onClick={() => setModalMode(null)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {/* Date Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-amber-500" /> Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-rose-400"
                />
              </div>

              {/* Time Input (Optional) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-rose-500" /> Start/End Time <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
                  </label>
                  {selectedTime && (
                    <button
                      type="button"
                      onClick={() => setSelectedTime("")}
                      className="text-[10px] text-slate-400 hover:text-rose-500"
                    >
                      Clear time
                    </button>
                  )}
                </div>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-rose-400"
                />
                <p className="text-[10px] text-slate-400 leading-tight">
                  {modalMode === "START" 
                    ? "If time is set, prayers before this time remain required; prayers after become exempt."
                    : "If time is set, prayers after this time resume normal tracking."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="h-4 w-4" /> Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
