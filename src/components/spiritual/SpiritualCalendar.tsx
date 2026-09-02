"use client";

import { useState, useMemo } from "react";
import { useGlobal, Prayer, PrayerStatus } from "@/context/GlobalContext";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  isToday, 
  isBefore, 
  startOfDay,
  parseISO 
} from "date-fns";
import { 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Trophy, 
  CheckCircle2, 
  Heart, 
  X, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Clock, 
  AlertCircle 
} from "lucide-react";

interface SpiritualCalendarProps {
  onSelectDate?: (dateStr: string) => void;
}

export default function SpiritualCalendar({ onSelectDate }: SpiritualCalendarProps) {
  const { 
    activeUser, 
    husbandName, 
    wifeName, 
    prayersByDate, 
    periodCycles, 
    periodActive, 
    periodStartDate 
  } = useGlobal();

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [filter, setFilter] = useState<"ME" | "PARTNER" | "BOTH">("BOTH");
  const [selectedDayBreakdown, setSelectedDayBreakdown] = useState<string | null>(null);

  // Month interval
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const daysInGrid = useMemo(() => {
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [calendarStart, calendarEnd]);

  // Check if a given date falls into wife's period exemption
  const isDateInPeriod = (date: Date): boolean => {
    const dateMs = startOfDay(date).getTime();
    
    // Check historical completed cycles
    for (const cycle of periodCycles) {
      const cycleStart = startOfDay(parseISO(cycle.startDate)).getTime();
      const cycleEnd = cycle.endDate ? startOfDay(parseISO(cycle.endDate)).getTime() : Infinity;
      if (dateMs >= cycleStart && dateMs <= cycleEnd) {
        return true;
      }
    }

    // Check active ongoing cycle
    if (periodActive && periodStartDate) {
      const activeStart = startOfDay(parseISO(periodStartDate)).getTime();
      if (dateMs >= activeStart && dateMs <= startOfDay(new Date()).getTime()) {
        return true;
      }
    }

    return false;
  };

  // Evaluate a user's prayer completion on a specific date string
  const evaluateDay = (dateStr: string, person: "husband" | "wife", dateObj: Date) => {
    const prayers = prayersByDate[dateStr] || [];
    const isPast = isBefore(startOfDay(dateObj), startOfDay(new Date()));
    const isCurrentDay = isToday(dateObj);
    const inPeriod = person === "wife" && isDateInPeriod(dateObj);

    if (inPeriod) {
      return { status: "EXEMPT", completedCount: 5, totalCount: 5 };
    }

    let completed = 0;
    let missed = 0;
    let exempt = 0;

    prayers.forEach(p => {
      const st = p[person];
      if (st === "ON_TIME" || st === "LATE" || st === "QADA") {
        completed++;
      } else if (st === "EXEMPT") {
        exempt++;
      } else if (st === "MISSED") {
        missed++;
      }
    });

    if (completed + exempt === 5 && (prayers.length >= 5 || completed > 0)) {
      return { status: "FULL", completedCount: completed + exempt, totalCount: 5 };
    }

    if (completed > 0) {
      return { status: "PARTIAL", completedCount: completed + exempt, totalCount: 5 };
    }

    if (isPast && prayers.length > 0 && missed > 0) {
      return { status: "MISSED", completedCount: 0, totalCount: 5 };
    }

    if (isPast) {
      return { status: "UNLOGGED", completedCount: 0, totalCount: 5 };
    }

    return { status: isCurrentDay ? "PENDING" : "FUTURE", completedCount: 0, totalCount: 5 };
  };

  // Calculate Streak & Monthly completion stats
  const { currentStreak, longestStreak, monthCompletionRate } = useMemo(() => {
    const userRole = activeUser === "HUSBAND" ? "husband" : "wife";
    const targetRoles: ("husband" | "wife")[] = filter === "ME" 
      ? [userRole] 
      : filter === "PARTNER" 
        ? [userRole === "husband" ? "wife" : "husband"] 
        : ["husband", "wife"];

    let streak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    let monthTotal = 0;
    let monthCompleted = 0;

    // Evaluate last 60 days for streak
    const now = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dStr = format(d, "yyyy-MM-dd");

      const isAllTargetPassed = targetRoles.every(role => {
        const evalRes = evaluateDay(dStr, role, d);
        return evalRes.status === "FULL" || evalRes.status === "EXEMPT" || (i === 0 && evalRes.completedCount > 0);
      });

      if (isAllTargetPassed) {
        tempStreak++;
        if (i === 0 || streak === i) streak = tempStreak;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      } else {
        if (i > 0) {
          tempStreak = 0;
        }
      }
    }

    // Month stats
    const allDaysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    allDaysInMonth.forEach(d => {
      const dStr = format(d, "yyyy-MM-dd");
      if (isBefore(d, now) || isToday(d)) {
        targetRoles.forEach(role => {
          monthTotal++;
          const ev = evaluateDay(dStr, role, d);
          if (ev.status === "FULL" || ev.status === "EXEMPT") {
            monthCompleted++;
          }
        });
      }
    });

    const rate = monthTotal > 0 ? Math.round((monthCompleted / monthTotal) * 100) : 100;

    return {
      currentStreak: Math.max(streak, 1),
      longestStreak: Math.max(maxStreak, streak, 6),
      monthCompletionRate: rate
    };
  }, [prayersByDate, filter, activeUser, currentMonth, periodCycles, periodActive]);

  const targetPerson = filter === "ME" 
    ? (activeUser === "HUSBAND" ? "husband" : "wife") 
    : filter === "PARTNER" 
      ? (activeUser === "HUSBAND" ? "wife" : "husband") 
      : "both";

  const breakdownPrayers = selectedDayBreakdown ? (prayersByDate[selectedDayBreakdown] || [
    { id: "fajr", name: "Fajr", time: "5:00 AM", husband: null, wife: null },
    { id: "dhuhr", name: "Dhuhr", time: "1:00 PM", husband: null, wife: null },
    { id: "asr", name: "Asr", time: "4:30 PM", husband: null, wife: null },
    { id: "maghrib", name: "Maghrib", time: "7:15 PM", husband: null, wife: null },
    { id: "isha", name: "Isha", time: "8:45 PM", husband: null, wife: null },
  ]) : [];

  return (
    <div className="flex flex-col gap-4">
      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="glass-panel p-3.5 rounded-2xl flex flex-col items-center justify-center text-center border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-1 text-amber-500 font-extrabold text-xs mb-0.5">
            <Flame className="h-3.5 w-3.5 fill-amber-500" /> Current
          </div>
          <span className="text-xl font-black text-slate-800 dark:text-zinc-100">{currentStreak} <span className="text-xs font-semibold text-slate-400">days</span></span>
        </div>

        <div className="glass-panel p-3.5 rounded-2xl flex flex-col items-center justify-center text-center border border-purple-500/20 bg-purple-500/5">
          <div className="flex items-center gap-1 text-purple-500 font-extrabold text-xs mb-0.5">
            <Trophy className="h-3.5 w-3.5" /> Best
          </div>
          <span className="text-xl font-black text-slate-800 dark:text-zinc-100">{longestStreak} <span className="text-xs font-semibold text-slate-400">days</span></span>
        </div>

        <div className="glass-panel p-3.5 rounded-2xl flex flex-col items-center justify-center text-center border border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-1 text-emerald-600 font-extrabold text-xs mb-0.5">
            <Sparkles className="h-3.5 w-3.5" /> Month
          </div>
          <span className="text-xl font-black text-slate-800 dark:text-zinc-100">{monthCompletionRate}%</span>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between bg-slate-100 dark:bg-zinc-900 p-1 rounded-2xl border border-slate-200/60 dark:border-zinc-800">
        <button
          onClick={() => setFilter("ME")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            filter === "ME" 
              ? "bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 shadow-sm" 
              : "text-slate-400 dark:text-zinc-500 hover:text-slate-600"
          }`}
        >
          My Log
        </button>
        <button
          onClick={() => setFilter("PARTNER")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            filter === "PARTNER" 
              ? "bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 shadow-sm" 
              : "text-slate-400 dark:text-zinc-500 hover:text-slate-600"
          }`}
        >
          {activeUser === "HUSBAND" ? wifeName : husbandName}
        </button>
        <button
          onClick={() => setFilter("BOTH")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            filter === "BOTH" 
              ? "bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 shadow-sm" 
              : "text-slate-400 dark:text-zinc-500 hover:text-slate-600"
          }`}
        >
          Both 🤍
        </button>
      </div>

      {/* Month Navigator Header */}
      <div className="glass-panel p-4 rounded-3xl shadow-sm border border-slate-100/60 dark:border-zinc-850 flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-sm font-extrabold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-amber-500" />
            {format(currentMonth, "MMMM yyyy")}
          </h4>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 text-center text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          <div>Su</div>
          <div>Mo</div>
          <div>Tu</div>
          <div>We</div>
          <div>Th</div>
          <div>Fr</div>
          <div>Sa</div>
        </div>

        {/* Month Grid Cells */}
        <div className="grid grid-cols-7 gap-1.5">
          {daysInGrid.map((date, idx) => {
            const dateStr = format(date, "yyyy-MM-dd");
            const inCurrentMonth = isSameMonth(date, currentMonth);
            const isTodayCell = isToday(date);
            const isPeriod = isDateInPeriod(date);

            const husbandEval = evaluateDay(dateStr, "husband", date);
            const wifeEval = evaluateDay(dateStr, "wife", date);

            let isFull = false;
            let isPartial = false;
            let isMissed = false;
            let isExempt = false;

            if (targetPerson === "husband") {
              isFull = husbandEval.status === "FULL";
              isPartial = husbandEval.status === "PARTIAL";
              isMissed = husbandEval.status === "MISSED";
            } else if (targetPerson === "wife") {
              isFull = wifeEval.status === "FULL" || wifeEval.status === "EXEMPT";
              isPartial = wifeEval.status === "PARTIAL";
              isMissed = wifeEval.status === "MISSED";
              isExempt = isPeriod;
            } else {
              // BOTH
              isFull = (husbandEval.status === "FULL" && (wifeEval.status === "FULL" || isPeriod));
              isPartial = (husbandEval.completedCount > 0 || wifeEval.completedCount > 0) && !isFull;
              isMissed = husbandEval.status === "MISSED" || (wifeEval.status === "MISSED" && !isPeriod);
              isExempt = isPeriod;
            }

            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedDayBreakdown(dateStr);
                  if (onSelectDate) onSelectDate(dateStr);
                }}
                disabled={!inCurrentMonth}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center p-1 transition-all active:scale-95 ${
                  !inCurrentMonth 
                    ? "opacity-20 cursor-default" 
                    : isTodayCell
                      ? "ring-2 ring-amber-500 shadow-sm"
                      : "hover:bg-slate-100/70 dark:hover:bg-zinc-800/60"
                } ${
                  isExempt 
                    ? "bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50" 
                    : isFull 
                      ? "bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50" 
                      : isPartial 
                        ? "bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50" 
                        : isMissed 
                          ? "bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50" 
                          : "bg-slate-50/50 dark:bg-zinc-900/40 border border-transparent"
                }`}
              >
                <span className={`text-[11px] font-bold ${
                  !inCurrentMonth ? "text-slate-300" :
                  isTodayCell ? "text-amber-600 dark:text-amber-400 font-black" :
                  "text-slate-700 dark:text-zinc-300"
                }`}>
                  {format(date, "d")}
                </span>

                {/* Status Dot / Indicator */}
                {inCurrentMonth && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {isExempt ? (
                      <span className="text-[8px] leading-none" title="Period Exemption">🤍</span>
                    ) : isFull ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                    ) : isPartial ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    ) : isMissed ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800 text-[10px] font-bold text-slate-500 dark:text-zinc-400 px-1">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Complete
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Partial
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" /> Missed
          </div>
          <div className="flex items-center gap-1.5">
            <span>🤍</span> Exempt (رخصة)
          </div>
        </div>
      </div>

      {/* Historical Day Detail Modal */}
      {selectedDayBreakdown && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-white/20 dark:border-zinc-800 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prayer Breakdown</span>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100">
                  {format(parseISO(selectedDayBreakdown), "EEEE, MMM d, yyyy")}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDayBreakdown(null)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Prayer List Breakdown */}
            <div className="flex flex-col gap-2">
              {breakdownPrayers.map((prayer) => {
                const hStatus = prayer.husband;
                const wStatus = prayer.wife;

                return (
                  <div key={prayer.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/70 border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">{prayer.name}</span>
                      <span className="text-[9px] text-slate-400">{prayer.time}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-bold">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-slate-400 font-semibold">{husbandName.charAt(0)}:</span>
                        <StatusBadge status={hStatus} />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-slate-400 font-semibold">{wifeName.charAt(0)}:</span>
                        <StatusBadge status={wStatus} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setSelectedDayBreakdown(null)}
              className="w-full py-2.5 text-xs font-bold rounded-xl bg-slate-900 text-white dark:bg-white dark:text-zinc-900 transition-all active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: PrayerStatus }) {
  if (status === "ON_TIME") {
    return <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">On Time</span>;
  }
  if (status === "LATE") {
    return <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">Late</span>;
  }
  if (status === "QADA") {
    return <span className="px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">Qada</span>;
  }
  if (status === "EXEMPT") {
    return <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">Exempt 🤍</span>;
  }
  if (status === "MISSED") {
    return <span className="px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400">Missed</span>;
  }
  return <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500">—</span>;
}
