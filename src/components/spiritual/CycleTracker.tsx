"use client";

import { useState } from "react";
import { useGlobal, PeriodCycle } from "@/context/GlobalContext";
import { 
  format, 
  parseISO, 
  differenceInDays, 
  addDays, 
  startOfDay, 
  isBefore, 
  isAfter 
} from "date-fns";
import { 
  Moon as MoonIcon, 
  Shield as ShieldIcon, 
  Sparkles as SparklesIcon, 
  Calendar as CalendarIcon, 
  Clock as ClockIcon, 
  X as XIcon, 
  Check as CheckIcon, 
  Heart as HeartIcon, 
  Droplets as DropletsIcon, 
  Plus as PlusIcon, 
  Edit3 as Edit3Icon, 
  Trash2 as Trash2Icon, 
  ChevronDown as ChevronDownIcon, 
  ChevronUp as ChevronUpIcon, 
  History as HistoryIcon,
  CheckCircle2 as CheckCircle2Icon,
  CalendarPlus as CalendarPlusIcon,
  Flower2 as Flower2Icon
} from "lucide-react";

export default function CycleTracker() {
  const { 
    activeUser,
    wifeName,
    husbandName,
    periodActive, 
    periodStartDate, 
    periodCycles, 
    markPeriodStart, 
    markPeriodEnd, 
    updatePeriodCycle,
    deletePeriodCycle,
    addPastPeriodCycle,
    sharePeriodStatus, 
    setSharePeriodStatus,
    sendCareNote
  } = useGlobal();

  const [confirmToast, setConfirmToast] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  // Modals state
  const [startEndModal, setStartEndModal] = useState<"START" | "END" | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedTime, setSelectedTime] = useState("");

  // Edit cycle modal state
  const [editingCycle, setEditingCycle] = useState<PeriodCycle | null>(null);
  const [editStartDate, setEditStartDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editEndTime, setEditEndTime] = useState("");

  // Add past cycle modal state
  const [showAddPastModal, setShowAddPastModal] = useState(false);
  const [pastStartDate, setPastStartDate] = useState(format(addDays(new Date(), -30), "yyyy-MM-dd"));
  const [pastStartTime, setPastStartTime] = useState("");
  const [pastEndDate, setPastEndDate] = useState(format(addDays(new Date(), -25), "yyyy-MM-dd"));
  const [pastEndTime, setPastEndTime] = useState("");

  const cycleDay = periodStartDate 
    ? Math.max(1, differenceInDays(new Date(), parseISO(periodStartDate)) + 1)
    : 1;

  // Average duration
  const completedCycles = periodCycles.filter(c => c.durationDays);
  const avgDuration = completedCycles.length > 0
    ? Math.round(completedCycles.reduce((acc, c) => acc + (c.durationDays || 5), 0) / completedCycles.length)
    : 5;

  const hasLoggedCycles = periodCycles.length > 0;

  // Calculate estimated next period date
  const lastCycle = periodCycles[0];
  const lastStartDate = lastCycle?.startDate || periodStartDate;
  const baseDate = lastStartDate ? parseISO(lastStartDate) : new Date();
  const nextEstimatedDate = addDays(baseDate, 28);
  const daysUntilNext = differenceInDays(nextEstimatedDate, new Date());

  // Handle Start / End Cycle
  const openStartModal = () => {
    setSelectedDate(format(new Date(), "yyyy-MM-dd"));
    setSelectedTime(format(new Date(), "HH:mm"));
    setStartEndModal("START");
  };

  const openEndModal = () => {
    setSelectedDate(format(new Date(), "yyyy-MM-dd"));
    setSelectedTime(format(new Date(), "HH:mm"));
    setStartEndModal("END");
  };

  const handleConfirmStartEnd = () => {
    const timeToPass = selectedTime.trim() ? selectedTime.trim() : undefined;

    if (startEndModal === "START") {
      markPeriodStart(selectedDate, timeToPass);
      setConfirmToast("Cycle marked active. Prayer exemption (رخصة) applied! 🌸");
    } else if (startEndModal === "END") {
      markPeriodEnd(selectedDate, timeToPass);
      setConfirmToast("Cycle ended. Normal prayer tracking resumed! 🤍");
    }

    setStartEndModal(null);
    setTimeout(() => setConfirmToast(null), 3500);
  };

  // Handle Edit Cycle
  const openEditModal = (cycle: PeriodCycle) => {
    setEditingCycle(cycle);
    
    if (cycle.startDate.includes("T")) {
      const parts = cycle.startDate.split("T");
      setEditStartDate(parts[0]);
      setEditStartTime(cycle.startTime || parts[1]?.substring(0, 5) || "");
    } else {
      setEditStartDate(cycle.startDate);
      setEditStartTime(cycle.startTime || "");
    }

    if (cycle.endDate) {
      if (cycle.endDate.includes("T")) {
        const parts = cycle.endDate.split("T");
        setEditEndDate(parts[0]);
        setEditEndTime(cycle.endTime || parts[1]?.substring(0, 5) || "");
      } else {
        setEditEndDate(cycle.endDate);
        setEditEndTime(cycle.endTime || "");
      }
    } else {
      setEditEndDate("");
      setEditEndTime("");
    }
  };

  const handleSaveEditCycle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCycle || !editStartDate) return;

    const fullStart = editStartTime ? `${editStartDate}T${editStartTime}:00` : `${editStartDate}T00:00:00`;
    let fullEnd: string | undefined = undefined;
    if (editEndDate) {
      fullEnd = editEndTime ? `${editEndDate}T${editEndTime}:00` : `${editEndDate}T23:59:59`;
    }

    updatePeriodCycle(editingCycle.id, {
      startDate: fullStart,
      startTime: editStartTime || undefined,
      endDate: fullEnd,
      endTime: editEndTime || undefined
    });

    setEditingCycle(null);
    setConfirmToast("Cycle dates updated successfully! ✨");
    setTimeout(() => setConfirmToast(null), 3000);
  };

  // Handle Add Past Cycle (Historical Backfill)
  const handleSaveAddPast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastStartDate || !pastEndDate) return;

    const fullStart = pastStartTime ? `${pastStartDate}T${pastStartTime}:00` : `${pastStartDate}T00:00:00`;
    const fullEnd = pastEndTime ? `${pastEndDate}T${pastEndTime}:00` : `${pastEndDate}T23:59:59`;

    if (isBefore(parseISO(fullEnd), parseISO(fullStart))) {
      alert("End date cannot be earlier than start date.");
      return;
    }

    addPastPeriodCycle({
      startDate: fullStart,
      startTime: pastStartTime || undefined,
      endDate: fullEnd,
      endTime: pastEndTime || undefined
    });

    setShowAddPastModal(false);
    setConfirmToast("Past cycle added to history! 📚");
    setTimeout(() => setConfirmToast(null), 3000);
  };

  const handleDeleteCycle = (cycleId: string) => {
    if (confirm("Are you sure you want to delete this cycle entry?")) {
      deletePeriodCycle(cycleId);
      setConfirmToast("Cycle entry deleted.");
      setTimeout(() => setConfirmToast(null), 3000);
    }
  };

  const handleSendHydrationCare = () => {
    sendCareNote("Stay healthy, hydrated & rest well my love 💧🤍 Thinking of you!");
    setConfirmToast("Care note sent to her dashboard! 🤍");
    setTimeout(() => setConfirmToast(null), 3000);
  };

  // ==========================================
  // 1. HUSBAND VIEW
  // ==========================================
  if (activeUser === "HUSBAND") {
    if (!sharePeriodStatus) {
      return null;
    }

    // A) Husband View: Period is ACTIVE
    if (periodActive) {
      return (
        <div className="glass-panel p-5 rounded-3xl border border-rose-300 dark:border-rose-900/60 bg-gradient-to-br from-rose-50 via-pink-50/50 to-white dark:from-rose-950/30 dark:via-zinc-900 dark:to-zinc-900 flex flex-col gap-3 shadow-md shadow-rose-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-rose-500 text-white shadow-md shadow-rose-500/20">
                <Flower2Icon className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-500">
                  {wifeName}'s Cycle Status
                </span>
                <h4 className="text-sm font-black text-slate-800 dark:text-zinc-100">
                  🌸 Cycle Active · Day {cycleDay}
                </h4>
              </div>
            </div>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-500/10 border border-rose-200 dark:border-rose-900/40 px-2.5 py-1 rounded-full">
              Resting (Exempt)
            </span>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
            {wifeName} is currently on her cycle. Her daily prayers are excused (رخصة شرعية). Be extra supportive today! 🤍
          </p>

          {confirmToast && (
            <span className="text-[10px] font-bold text-center text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded-xl animate-in fade-in">
              {confirmToast}
            </span>
          )}
        </div>
      );
    }

    // B) Husband View: Period has ENDED -> Show Next Period Approximate Time
    return (
      <div className="glass-panel p-5 rounded-3xl border border-purple-200/60 dark:border-purple-900/40 bg-gradient-to-br from-purple-50/50 via-white to-slate-50 dark:from-purple-950/20 dark:via-zinc-900 dark:to-zinc-900 flex flex-col gap-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-sm">
              <MoonIcon className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Women's Health Insights
              </span>
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-zinc-100">
                {wifeName}'s Next Cycle Preview
              </h4>
            </div>
          </div>
          {hasLoggedCycles ? (
            <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full">
              {daysUntilNext > 0 ? `In ~${daysUntilNext} days` : "Approaching soon"}
            </span>
          ) : (
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
              Awaiting data
            </span>
          )}
        </div>

        {hasLoggedCycles ? (
          <div className="p-3 rounded-2xl bg-purple-500/5 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30 flex items-center justify-between text-xs">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Estimated Next Period</span>
              <span className="font-extrabold text-slate-800 dark:text-zinc-100">
                ~{format(nextEstimatedDate, "MMMM d, yyyy")}
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Avg Duration</span>
              <span className="font-extrabold text-slate-800 dark:text-zinc-100">{avgDuration} days</span>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 text-xs text-slate-500">
            Predictions will appear after {wifeName} logs her first cycle.
          </div>
        )}

        {/* Gentle Care / Hydration action for Husband */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-zinc-800">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
            <DropletsIcon className="h-3.5 w-3.5 text-blue-500" /> Remind her to stay hydrated & rested
          </span>
          <button
            onClick={handleSendHydrationCare}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-500 hover:bg-purple-600 text-white shadow-purple-500/20 shadow-sm transition-all active:scale-95 flex items-center gap-1"
          >
            <HeartIcon className="h-3.5 w-3.5 fill-white" /> Send Care
          </button>
        </div>

        {confirmToast && (
          <span className="text-[10px] font-bold text-center text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded-xl animate-in fade-in">
            {confirmToast}
          </span>
        )}
      </div>
    );
  }

  // ==========================================
  // 2. WIFE VIEW (Full Management & Tracking)
  // ==========================================
  return (
    <div className={`glass-panel p-5 rounded-3xl transition-all duration-300 flex flex-col gap-4 shadow-sm ${
      periodActive 
        ? "border border-rose-300 dark:border-rose-800/60 bg-gradient-to-br from-rose-50/90 via-pink-50/40 to-white dark:from-rose-950/30 dark:via-zinc-900 dark:to-zinc-900 ring-1 ring-rose-400/20 shadow-md shadow-rose-500/5"
        : "border border-slate-200/80 dark:border-zinc-800 bg-gradient-to-br from-slate-50/70 via-white to-purple-50/30 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900"
    }`}>
      
      {/* Header with Explicit Current State Confirmation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-2.5 rounded-2xl shadow-sm transition-all ${
            periodActive 
              ? "bg-rose-500 text-white shadow-rose-500/30 animate-pulse" 
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          }`}>
            {periodActive ? <Flower2Icon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </div>
          <div className="flex flex-col">
            <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
              periodActive ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
            }`}>
              {periodActive ? "Menstrual Cycle Active" : "🌿 Clean / Taharah Window"}
            </span>
            <h4 className="text-sm font-black text-slate-800 dark:text-zinc-100">
              {periodActive ? `🌸 Period Active · Day ${cycleDay}` : "Menstrual Cycle Tracker"}
            </h4>
          </div>
        </div>

        {/* Primary Action Button (Swaps based on active state) */}
        {periodActive ? (
          <div className="flex items-center gap-1.5">
            {periodCycles[0] && (
              <button
                onClick={() => openEditModal(periodCycles[0])}
                title="Edit Start Date/Time"
                className="p-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-100 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 transition-all active:scale-95 shadow-xs"
              >
                <Edit3Icon className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={openEndModal}
              className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-slate-900 hover:bg-black text-white dark:bg-zinc-100 dark:text-zinc-900 transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2Icon className="h-3.5 w-3.5 text-emerald-400" /> Mark Period End
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={openStartModal}
              className="px-4 py-2.5 rounded-2xl text-xs font-black bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/25 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <SparklesIcon className="h-3.5 w-3.5 fill-white/30" /> Mark Period Start
            </button>
          </div>
        )}
      </div>

      {/* State Banner */}
      {periodActive ? (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 flex flex-col gap-1.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
              <SparklesIcon className="h-3.5 w-3.5" /> Prayer Exemption Active (رخصة شرعية)
            </span>
            {periodStartDate && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                  Started: {format(parseISO(periodStartDate), "MMM d, h:mm a")}
                </span>
                {periodCycles[0] && (
                  <button
                    onClick={() => openEditModal(periodCycles[0])}
                    className="text-[10px] text-rose-700 dark:text-rose-300 underline font-bold"
                  >
                    Change date
                  </button>
                )}
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
            Your prayers during this window are automatically marked as <strong>Exempt (رخصة)</strong>. Streaks will not break, and missed prayers do not need to be made up.
          </p>
        </div>
      ) : (
        /* Not on Period: Prediction Card with Honest 0-Cycle Empty State */
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-850/50 border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {hasLoggedCycles ? "Next Estimated Period" : "Cycle Insights"}
            </span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-zinc-100">
              {hasLoggedCycles ? `~${format(nextEstimatedDate, "MMMM d, yyyy")}` : "Add your first cycle to unlock predictions"}
            </span>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
            hasLoggedCycles 
              ? "text-purple-600 dark:text-purple-400 bg-purple-500/10" 
              : "text-slate-500 bg-slate-200/60 dark:bg-zinc-800"
          }`}>
            {hasLoggedCycles ? (daysUntilNext > 0 ? `In ~${daysUntilNext} days` : "Approaching") : "Needs 1 cycle"}
          </span>
        </div>
      )}

      {/* Cycle Stats */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-zinc-800 text-[11px]">
        <div className="flex flex-col p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-850/60 border border-slate-100 dark:border-zinc-800">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Avg Duration</span>
          <span className="font-extrabold text-slate-700 dark:text-zinc-200">
            {hasLoggedCycles ? `${avgDuration} days` : "—"}
          </span>
        </div>
        <div className="flex flex-col p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-850/60 border border-slate-100 dark:border-zinc-800">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Cycle Length</span>
          <span className="font-extrabold text-slate-700 dark:text-zinc-200">
            {hasLoggedCycles ? "~28 days" : "—"}
          </span>
        </div>
        <div className="flex flex-col p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-850/60 border border-slate-100 dark:border-zinc-800">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">History</span>
          <span className="font-extrabold text-slate-700 dark:text-zinc-200">{periodCycles.length} logged</span>
        </div>
      </div>

      {/* Privacy Setting */}
      <div className="flex items-center justify-between pt-1">
        <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-300 flex items-center gap-1.5 cursor-pointer">
          <ShieldIcon className="h-3.5 w-3.5 text-slate-400" /> Share status with Husband for Care Mode
        </label>
        <input
          type="checkbox"
          checked={sharePeriodStatus}
          onChange={(e) => setSharePeriodStatus(e.target.checked)}
          className="rounded text-rose-500 focus:ring-rose-400 h-4 w-4"
        />
      </div>

      {/* Cycle History Section & Differentiated Secondary "Add Past Period" Action */}
      <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs font-extrabold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5 hover:text-rose-500 transition-colors"
          >
            <HistoryIcon className="h-3.5 w-3.5 text-slate-400" />
            Cycle History ({periodCycles.length})
            {showHistory ? <ChevronUpIcon className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDownIcon className="h-3.5 w-3.5 text-slate-400" />}
          </button>

          {/* Secondary Historical Backfill Button */}
          <button
            onClick={() => setShowAddPastModal(true)}
            className="border border-dashed border-slate-300 dark:border-zinc-700 hover:border-rose-400 bg-slate-50/70 hover:bg-rose-50/50 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-rose-600 text-[10px] font-bold px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 shadow-2xs active:scale-95"
          >
            <CalendarPlusIcon className="h-3 w-3 text-slate-400" /> Add Past Period
          </button>
        </div>

        {/* History List */}
        {showHistory && (
          <div className="flex flex-col gap-2 mt-1 animate-in fade-in">
            {periodCycles.length === 0 ? (
              <span className="text-[11px] text-slate-400 italic text-center py-2">
                No past cycles recorded. Tap "Add Past Period" to backfill historical dates.
              </span>
            ) : (
              periodCycles.map((cycle) => {
                const isCurrentActive = periodActive && !cycle.endDate;
                const startFormatted = format(parseISO(cycle.startDate), "MMM d, yyyy");
                const endFormatted = cycle.endDate ? format(parseISO(cycle.endDate), "MMM d, yyyy") : "Ongoing";

                return (
                  <div 
                    key={cycle.id}
                    className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 flex items-center justify-between shadow-xs"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                          {startFormatted} – {endFormatted}
                        </span>
                        {isCurrentActive ? (
                          <span className="text-[9px] font-extrabold text-rose-600 bg-rose-500/10 px-1.5 py-0.5 rounded">
                            Active
                          </span>
                        ) : (
                          <span className="text-[9px] font-semibold text-slate-400">
                            {cycle.durationDays || 5} days
                          </span>
                        )}
                      </div>
                      {(cycle.startTime || cycle.endTime) && (
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          {cycle.startTime && `Start: ${cycle.startTime}`} {cycle.endTime && `· End: ${cycle.endTime}`}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(cycle)}
                        title="Edit Dates"
                        className="p-1.5 text-slate-400 hover:text-amber-500 transition-colors"
                      >
                        <Edit3Icon className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCycle(cycle.id)}
                        title="Delete Cycle"
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2Icon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {confirmToast && (
        <span className="text-[10px] font-bold text-center text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl animate-in fade-in">
          {confirmToast}
        </span>
      )}

      {/* ========================================================= */}
      {/* 1. START / END CYCLE MODAL */}
      {/* ========================================================= */}
      {startEndModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-white/20 dark:border-zinc-800 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                  {startEndModal === "START" ? "Start Cycle" : "End Cycle"}
                </span>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100">
                  {startEndModal === "START" ? "Mark Period Start" : "Mark Period End"}
                </h3>
              </div>
              <button 
                onClick={() => setStartEndModal(null)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <CalendarIcon className="h-4 w-4 text-amber-500" /> Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <ClockIcon className="h-4 w-4 text-rose-500" /> Time <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
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
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStartEndModal(null)}
                className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStartEnd}
                className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <CheckIcon className="h-4 w-4" /> Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. EDIT CYCLE MODAL (Change Start/End Dates & Times) */}
      {/* ========================================================= */}
      {editingCycle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-white/20 dark:border-zinc-800 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Edit Cycle Dates</span>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100">
                  Modify Period Dates
                </h3>
              </div>
              <button 
                onClick={() => setEditingCycle(null)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCycle} className="flex flex-col gap-3">
              {/* Start Date & Time */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Period Start Date & Time</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    required
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none"
                  />
                  <input
                    type="time"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    placeholder="Optional time"
                    className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              {/* End Date & Time */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Period End Date & Time <span className="text-[10px] font-normal text-slate-400">(Leave empty if active)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none"
                  />
                  <input
                    type="time"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    placeholder="Optional time"
                    className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCycle(null)}
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckIcon className="h-4 w-4" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. ADD PAST PERIOD MODAL (Historical Backfill) */}
      {/* ========================================================= */}
      {showAddPastModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-white/20 dark:border-zinc-800 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Historical Backfill</span>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100">
                  Log Past Period
                </h3>
              </div>
              <button 
                onClick={() => setShowAddPastModal(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddPast} className="flex flex-col gap-3">
              {/* Start Date & Time */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Period Start Date & Time</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    required
                    value={pastStartDate}
                    onChange={(e) => setPastStartDate(e.target.value)}
                    className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none"
                  />
                  <input
                    type="time"
                    value={pastStartTime}
                    onChange={(e) => setPastStartTime(e.target.value)}
                    placeholder="Optional time"
                    className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              {/* End Date & Time */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Period End Date & Time</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    required
                    value={pastEndDate}
                    onChange={(e) => setPastEndDate(e.target.value)}
                    className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none"
                  />
                  <input
                    type="time"
                    value={pastEndTime}
                    onChange={(e) => setPastEndTime(e.target.value)}
                    placeholder="Optional time"
                    className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPastModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-zinc-900 shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <PlusIcon className="h-4 w-4" /> Save Past Period
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
