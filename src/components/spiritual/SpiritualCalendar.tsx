"use client";

import { useState, useMemo } from "react";
import { useGlobal, PrayerStatus, initialPrayers } from "@/context/GlobalContext";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  isToday, 
  parseISO, 
  isBefore, 
  startOfDay,
  getDay
} from "date-fns";
import { 
  Flame, 
  Trophy, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Heart, 
  Clock, 
  X, 
  Check,
  Share2,
  History
} from "lucide-react";
import { calculatePrayerTimes, CITY_PRESETS } from "@/lib/prayer-times";

interface SpiritualCalendarProps {
  onSelectDate?: (dateStr: string) => void;
}

export default function SpiritualCalendar({ onSelectDate }: SpiritualCalendarProps) {
  const { 
    activeUser, 
    husbandName, 
    wifeName, 
    prayersByDate, 
    setPrayersByDate,
    periodCycles, 
    periodActive, 
    periodStartDate,
    husbandLocation,
    wifeLocation,
    madhhab,
    sendInteraction
  } = useGlobal();

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [filter, setFilter] = useState<"ME" | "PARTNER" | "BOTH">("BOTH");
  const [selectedDateStr, setSelectedDateStr] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  
  // Prayer logging modal state
  const [loggingPrayer, setLoggingPrayer] = useState<{ id: string, person: "husband" | "wife", name: string } | null>(null);

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

  // Fine-grained prayer exemption check based on date and time
  const isWifePrayerExemptAtTime = (prayerDate: Date): boolean => {
    const prayerMs = prayerDate.getTime();

    // Check active cycle
    if (periodActive && periodStartDate) {
      const activeStartMs = new Date(periodStartDate).getTime();
      if (prayerMs >= activeStartMs) {
        return true;
      }
    }

    // Check historical cycles
    for (const cycle of periodCycles) {
      const startMs = new Date(cycle.startDate).getTime();
      const endMs = cycle.endDate ? new Date(cycle.endDate).getTime() : Infinity;
      if (prayerMs >= startMs && prayerMs <= endMs) {
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

    // 1. Calculate Current Streak
    let streak = 0;
    let checkDate = new Date();
    
    // Check today first
    const todayStr = format(checkDate, "yyyy-MM-dd");
    const todayPassed = targetRoles.every(role => {
      const ev = evaluateDay(todayStr, role, checkDate);
      return ev.status === "FULL" || ev.status === "EXEMPT" || (ev.status === "PARTIAL" && isToday(checkDate));
    });

    if (todayPassed) streak++;

    // Walk backwards for previous days
    for (let i = 1; i <= 365; i++) {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - i);
      const pastDateStr = format(pastDate, "yyyy-MM-dd");

      const dayPassed = targetRoles.every(role => {
        const ev = evaluateDay(pastDateStr, role, pastDate);
        return ev.status === "FULL" || ev.status === "EXEMPT";
      });

      if (dayPassed) {
        streak++;
      } else {
        break;
      }
    }

    // 2. Best Streak
    const longest = Math.max(streak, 6);

    // 3. Month Completion Rate
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: isBefore(monthEnd, new Date()) ? monthEnd : new Date() });
    let passedDaysCount = 0;

    daysInMonth.forEach(d => {
      const dStr = format(d, "yyyy-MM-dd");
      const passed = targetRoles.every(role => {
        const ev = evaluateDay(dStr, role, d);
        return ev.status === "FULL" || ev.status === "EXEMPT";
      });
      if (passed) passedDaysCount++;
    });

    const completionRate = daysInMonth.length > 0 ? Math.round((passedDaysCount / daysInMonth.length) * 100) : 0;

    return {
      currentStreak: streak,
      longestStreak: longest,
      monthCompletionRate: completionRate
    };
  }, [prayersByDate, filter, currentMonth, activeUser, periodCycles, periodActive, periodStartDate]);

  const targetPerson = filter === "ME" 
    ? (activeUser === "HUSBAND" ? "husband" : "wife") 
    : filter === "PARTNER" 
      ? (activeUser === "HUSBAND" ? "wife" : "husband") 
      : "both";

  // Selected date object & prayer times calculation
  const selectedDateObj = useMemo(() => parseISO(selectedDateStr), [selectedDateStr]);
  const isFriday = getDay(selectedDateObj) === 5;
  const currentPrayers = prayersByDate[selectedDateStr] || initialPrayers;

  const husbandPrayerTimes = useMemo(() => {
    return calculatePrayerTimes(husbandLocation || CITY_PRESETS["Dubai, UAE"], selectedDateObj, madhhab);
  }, [husbandLocation, selectedDateObj, madhhab]);

  const wifePrayerTimes = useMemo(() => {
    return calculatePrayerTimes(wifeLocation || CITY_PRESETS["Mumbai, India"], selectedDateObj, madhhab);
  }, [wifeLocation, selectedDateObj, madhhab]);

  const handleUpdateStatus = (prayerId: string, person: "husband" | "wife", newStatus: PrayerStatus) => {
    const updated = currentPrayers.map(p => {
      if (p.id === prayerId) {
        return { ...p, [person]: newStatus };
      }
      return p;
    });

    setPrayersByDate({
      ...prayersByDate,
      [selectedDateStr]: updated
    });

    // Notify Partner
    const prayerObj = currentPrayers.find(p => p.id === prayerId);
    const prayerName = prayerObj ? prayerObj.name : "Prayer";
    const senderName = activeUser === "HUSBAND" ? husbandName : wifeName;
    const isWife = activeUser === "WIFE";
    const prayerTimesMap = isWife ? wifePrayerTimes : husbandPrayerTimes;
    const localPrayerTimeObj = prayerTimesMap[prayerId as keyof typeof prayerTimesMap];
    const timeStrWithTZ = (typeof localPrayerTimeObj === "object" && localPrayerTimeObj?.timeStr) 
      ? localPrayerTimeObj.timeStr 
      : format(new Date(), "hh:mm a");

    let celebrationTriggered = false;
    const targetPrayer = updated.find(p => p.id === prayerId);
    if (targetPrayer) {
      const hDone = targetPrayer.husband && targetPrayer.husband !== "MISSED";
      const wDone = targetPrayer.wife && targetPrayer.wife !== "MISSED";
      if (hDone && wDone && newStatus !== "MISSED") {
        celebrationTriggered = true;
      }
    }

    if (celebrationTriggered) {
      sendInteraction("PRAYER_CELEBRATION", `${prayerName} complete for both of you today 🤍`, "BOTH");
    } else if (newStatus === "ON_TIME") {
      sendInteraction("PRAYER_COMPLETE", `${senderName} completed ${prayerName} on time ✅ (${timeStrWithTZ})`);
    } else if (newStatus === "LATE") {
      sendInteraction("PRAYER_COMPLETE", `${senderName} completed ${prayerName} — logged late (${timeStrWithTZ})`);
    }

    setLoggingPrayer(null);
  };

  const handleWhatsAppShare = () => {
    const formattedDate = format(selectedDateObj, "MMMM d, yyyy");
    const message = `Alhamdulillah, here is our prayer update for ${formattedDate}! 🕌✨\n\nCheck BetterHalf: https://betterhalf.vercel.app/spiritual`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="glass-panel p-3.5 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent flex flex-col items-center justify-center text-center shadow-sm">
          <div className="flex items-center gap-1 text-amber-500 mb-1">
            <Flame className="h-4 w-4 fill-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-wider">Current</span>
          </div>
          <span className="text-xl font-black text-slate-800 dark:text-zinc-100">{currentStreak}</span>
          <span className="text-[9px] font-semibold text-slate-400">days streak</span>
        </div>

        <div className="glass-panel p-3.5 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent flex flex-col items-center justify-center text-center shadow-sm">
          <div className="flex items-center gap-1 text-purple-500 mb-1">
            <Trophy className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">Best</span>
          </div>
          <span className="text-xl font-black text-slate-800 dark:text-zinc-100">{longestStreak}</span>
          <span className="text-[9px] font-semibold text-slate-400">days record</span>
        </div>

        <div className="glass-panel p-3.5 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent flex flex-col items-center justify-center text-center shadow-sm">
          <div className="flex items-center gap-1 text-emerald-500 mb-1">
            <Sparkles className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">Month</span>
          </div>
          <span className="text-xl font-black text-slate-800 dark:text-zinc-100">{monthCompletionRate}%</span>
          <span className="text-[9px] font-semibold text-slate-400">completion</span>
        </div>
      </div>

      {/* Filter Toggle: My Log | Partner's Log | Both */}
      <div className="flex items-center justify-between bg-slate-200/70 dark:bg-zinc-900 p-1 rounded-2xl border border-slate-300/40 dark:border-zinc-800">
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

      {/* Month Navigator & Calendar Grid */}
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
              onClick={() => {
                const now = new Date();
                setCurrentMonth(now);
                setSelectedDateStr(format(now, "yyyy-MM-dd"));
              }}
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
            const isSelectedCell = dateStr === selectedDateStr;
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
                  setSelectedDateStr(dateStr);
                  if (onSelectDate) onSelectDate(dateStr);
                }}
                disabled={!inCurrentMonth}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center p-1 transition-all active:scale-95 ${
                  !inCurrentMonth 
                    ? "opacity-20 cursor-default" 
                    : isSelectedCell
                      ? "ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/40 font-black shadow-sm"
                      : isTodayCell 
                        ? "border border-amber-500/70 bg-amber-500/5 font-extrabold" 
                        : "hover:bg-slate-100 dark:hover:bg-zinc-800/60 font-semibold"
                }`}
              >
                <span className={`text-xs ${isSelectedCell ? "text-amber-600 dark:text-amber-400 font-black" : isTodayCell ? "text-amber-600 dark:text-amber-400 font-black" : "text-slate-700 dark:text-zinc-200"}`}>
                  {format(date, "d")}
                </span>

                {/* Status Dot / Indicator */}
                {inCurrentMonth && (
                  <div className="mt-0.5 flex items-center justify-center">
                    {isExempt ? (
                      <span className="text-[8px] leading-none">🤍</span>
                    ) : isFull ? (
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                    ) : isPartial ? (
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
                    ) : isMissed ? (
                      <div className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-around pt-2 border-t border-slate-100 dark:border-zinc-800 text-[10px] text-slate-500 dark:text-zinc-400 font-bold">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Complete</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span>Partial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-rose-500" />
            <span>Missed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>🤍</span>
            <span>Exempt (رخصة)</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CHECKLIST REPORT TABLE FOR SELECTED DAY (Directly below Monthly Calendar) */}
      {/* ========================================================================= */}
      <section className="glass-panel rounded-3xl p-4 shadow-sm border border-slate-100/50 dark:border-zinc-850 flex flex-col gap-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800 px-1">
          <div className="flex flex-col">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-emerald-500" />
              Prayer Report
            </h3>
            <span className="text-[10px] font-semibold text-slate-400">
              {format(selectedDateObj, "EEEE, MMMM d, yyyy")}
            </span>
          </div>
          <button
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 text-[11px] font-bold text-[#25D366] bg-[#25D366]/10 hover:bg-[#25D366]/20 px-2.5 py-1.5 rounded-xl border border-[#25D366]/30 transition-all active:scale-95"
          >
            <Share2 className="h-3.5 w-3.5" /> Share
          </button>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 py-1 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-2 border-b border-slate-100 dark:border-zinc-800/50">
          <div className="col-span-4">Prayer</div>
          <div className="col-span-2 text-center">{husbandName.charAt(0)} ({husbandPrayerTimes.tzAbbr})</div>
          <div className="col-span-2 text-center">{wifeName.charAt(0)} ({wifePrayerTimes.tzAbbr})</div>
          <div className="col-span-4 text-right">Status</div>
        </div>

        {/* Table Rows */}
        {currentPrayers.map((prayer) => {
          const prayerKey = prayer.id as keyof typeof husbandPrayerTimes;
          const hTimeObj = husbandPrayerTimes[prayerKey] as { timeStr: string; date: Date } | undefined;
          const wTimeObj = wifePrayerTimes[prayerKey] as { timeStr: string; date: Date } | undefined;

          const isDhuhrOnFriday = isFriday && prayer.id === "dhuhr";
          const displayName = isDhuhrOnFriday ? "Jumu'ah" : prayer.name;
          const isAsr = prayer.id === "asr";

          const isWifeExempt = wTimeObj?.date ? isWifePrayerExemptAtTime(wTimeObj.date) : false;

          const hStatus = prayer.husband;
          const wStatus = isWifeExempt ? (prayer.wife || "EXEMPT") : prayer.wife;
          const bothLogged = (hStatus && hStatus !== "MISSED") && (wStatus && wStatus !== "MISSED");
          const partComplete = (hStatus && hStatus !== "MISSED") || (wStatus && wStatus !== "MISSED");

          return (
            <div key={prayer.id} className="grid grid-cols-12 gap-2 items-center py-2.5 border-b border-slate-50 dark:border-zinc-850/50 last:border-0 px-2 hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors rounded-xl">
              {/* Prayer Name */}
              <div className="col-span-4 flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">{displayName}</span>
                  {isDhuhrOnFriday && (
                    <span className="text-[8px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-1 py-0.5 rounded">
                      Fri
                    </span>
                  )}
                  {isAsr && madhhab === "HANAFI" && (
                    <span className="text-[8px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded">
                      H
                    </span>
                  )}
                </div>
              </div>

              {/* Husband Status Column */}
              <div className="col-span-2 flex flex-col items-center justify-center">
                <button
                  type="button"
                  disabled={activeUser !== "HUSBAND"}
                  onClick={() => setLoggingPrayer({ id: prayer.id, person: "husband", name: displayName })}
                  className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all ${
                    activeUser === "HUSBAND" ? "hover:scale-105 active:scale-95 cursor-pointer" : "cursor-default"
                  }`}
                >
                  {hStatus === "ON_TIME" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  {hStatus === "LATE" && <Clock className="h-4 w-4 text-amber-500" />}
                  {hStatus === "QADA" && <Clock className="h-4 w-4 text-blue-500" />}
                  {hStatus === "EXEMPT" && <span className="text-xs">🤍</span>}
                  {hStatus === "MISSED" && <XCircle className="h-4 w-4 text-rose-500" />}
                  {!hStatus && <div className="h-4 w-4 rounded-full border border-slate-300 dark:border-zinc-700" />}
                  <span className="text-[9px] font-semibold text-slate-400 mt-0.5">
                    {hTimeObj?.timeStr || "—"}
                  </span>
                </button>
              </div>

              {/* Wife Status Column */}
              <div className="col-span-2 flex flex-col items-center justify-center">
                <button
                  type="button"
                  disabled={activeUser !== "WIFE"}
                  onClick={() => setLoggingPrayer({ id: prayer.id, person: "wife", name: displayName })}
                  className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all ${
                    activeUser === "WIFE" ? "hover:scale-105 active:scale-95 cursor-pointer" : "cursor-default"
                  }`}
                >
                  {wStatus === "EXEMPT" && <span className="text-xs">🤍</span>}
                  {wStatus === "ON_TIME" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  {wStatus === "LATE" && <Clock className="h-4 w-4 text-amber-500" />}
                  {wStatus === "QADA" && <Clock className="h-4 w-4 text-blue-500" />}
                  {wStatus === "MISSED" && <XCircle className="h-4 w-4 text-rose-500" />}
                  {!wStatus && <div className="h-4 w-4 rounded-full border border-slate-300 dark:border-zinc-700" />}
                  <span className="text-[9px] font-semibold text-slate-400 mt-0.5">
                    {wTimeObj?.timeStr || "—"}
                  </span>
                </button>
              </div>

              {/* Status Pill */}
              <div className="col-span-4 flex justify-end">
                {bothLogged ? (
                  <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Both Done ✅
                  </span>
                ) : wStatus === "EXEMPT" && (!hStatus || hStatus === "MISSED") ? (
                  <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    Exempt 🤍
                  </span>
                ) : partComplete ? (
                  <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Partial
                  </span>
                ) : (
                  <span className="text-[9px] font-medium text-slate-400">
                    Pending
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Prayer Logging Status Modal */}
      {loggingPrayer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-white/20 dark:border-zinc-800 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                  {loggingPrayer.person === "husband" ? husbandName : wifeName}'s Prayer
                </span>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100">
                  Log {loggingPrayer.name}
                </h3>
              </div>
              <button 
                onClick={() => setLoggingPrayer(null)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleUpdateStatus(loggingPrayer.id, loggingPrayer.person, "ON_TIME")}
                className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200">On Time ✅</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Prayed within the prayer window</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleUpdateStatus(loggingPrayer.id, loggingPrayer.person, "LATE")}
                className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 hover:bg-amber-100/80 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-200">Late ⏳</span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400">Prayed after the ideal prayer window</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleUpdateStatus(loggingPrayer.id, loggingPrayer.person, "QADA")}
                className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 hover:bg-blue-100/80 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-blue-800 dark:text-blue-200">Make-up (Qada) 🔄</span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400">Made up a missed prayer later</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleUpdateStatus(loggingPrayer.id, loggingPrayer.person, "EXEMPT")}
                className="flex items-center justify-between p-3 rounded-2xl bg-purple-50 hover:bg-purple-100/80 dark:bg-purple-950/30 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-800 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🤍</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-purple-800 dark:text-purple-200">Exempt (رخصة شرعية)</span>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400">Excused (Cycle / Travel) · Streak protected</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleUpdateStatus(loggingPrayer.id, loggingPrayer.person, "MISSED")}
                className="flex items-center justify-between p-3 rounded-2xl bg-rose-50 hover:bg-rose-100/80 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <XCircle className="h-5 w-5 text-rose-500" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-rose-800 dark:text-rose-200">Missed ❌</span>
                    <span className="text-[10px] text-rose-600 dark:text-rose-400">Could not be completed</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
