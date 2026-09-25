"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useGlobal, PeriodCycle, OvulationLog, CycleSettings } from "@/context/GlobalContext";
import { calculateCyclePhases, CyclePhaseInfo } from "@/lib/cycle-calculator";
import { 
  format, 
  parseISO, 
  differenceInDays, 
  addDays, 
  startOfDay, 
  isBefore, 
  isAfter, 
  isSameDay 
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
  Flower2 as Flower2Icon,
  Send as SendIcon,
  Smile as SmileIcon,
  Flame as FlameIcon,
  Baby as BabyIcon,
  Thermometer as ThermometerIcon,
  Activity as ActivityIcon,
  Info as InfoIcon,
  SlidersHorizontal as SlidersIcon,
  Sun as SunIcon,
  Zap as ZapIcon
} from "lucide-react";

export default function CycleTracker() {
  const { 
    activeUser,
    wifeName,
    husbandName,
    periodActive, 
    periodStartDate, 
    periodEndDate, 
    periodCycles, 
    cycleSettings,
    setCycleSettings,
    ovulationLogs,
    logDailyFertility,
    deleteDailyFertility,
    markPeriodStart, 
    markPeriodEnd, 
    updatePeriodCycle,
    deletePeriodCycle,
    addPastPeriodCycle,
    sharePeriodStatus, 
    setSharePeriodStatus,
    sendCareNote,
    globalSelectedDate
  } = useGlobal();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [confirmToast, setConfirmToast] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showHusbandCareSheet, setShowHusbandCareSheet] = useState(false);
  const [customCareText, setCustomCareText] = useState("");
  
  // Modals state (Wife)
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

  // Cycle & Ovulation Settings Modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempCycleLength, setTempCycleLength] = useState(cycleSettings?.cycleLength || 28);
  const [tempPeriodDuration, setTempPeriodDuration] = useState(cycleSettings?.periodDuration || 5);
  const [tempLutealLength, setTempLutealLength] = useState(cycleSettings?.lutealLength || 14);

  // Daily Fertility & Ovulation Symptom Log Modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [logModalDate, setLogModalDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [tempLhTest, setTempLhTest] = useState<"NOT_TESTED" | "LOW" | "HIGH" | "PEAK">("NOT_TESTED");
  const [tempCervicalMucus, setTempCervicalMucus] = useState<"DRY" | "STICKY" | "CREAMY" | "WATERY" | "EGG_WHITE">("DRY");
  const [tempBbt, setTempBbt] = useState("");
  const [tempSymptoms, setTempSymptoms] = useState<string[]>([]);
  const [tempIntimacy, setTempIntimacy] = useState(false);
  const [tempNotes, setTempNotes] = useState("");

  // Selected Day in Interactive Cycle Map
  const [selectedMapDay, setSelectedMapDay] = useState<number | null>(null);

  // Calculate historical average duration if available
  const completedCycles = periodCycles.filter(c => c.durationDays);
  const avgHistoricalDuration = completedCycles.length > 0
    ? Math.round(completedCycles.reduce((acc, c) => acc + (c.durationDays || 5), 0) / completedCycles.length)
    : (cycleSettings?.periodDuration || 5);

  const hasLoggedCycles = periodCycles.length > 0;
  const latestCycle = periodCycles[0];
  const activeOrLatestStart = periodStartDate || latestCycle?.startDate;

  // Calculate full cycle phase and ovulation info
  const cycleInfo: CyclePhaseInfo | null = calculateCyclePhases({
    startDateStr: activeOrLatestStart,
    periodActive,
    cycleLength: cycleSettings?.cycleLength || 28,
    periodDuration: cycleSettings?.periodDuration || avgHistoricalDuration || 5,
    lutealLength: cycleSettings?.lutealLength || 14,
    currentDate: new Date()
  });

  // Cycle Day & Stats
  const currentCycleDay = cycleInfo?.cycleDay || 1;
  const totalDays = cycleSettings?.cycleLength || 28;

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

  // Handle Cycle Settings Save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setCycleSettings({
      cycleLength: Number(tempCycleLength),
      periodDuration: Number(tempPeriodDuration),
      lutealLength: Number(tempLutealLength)
    });
    setShowSettingsModal(false);
    setConfirmToast("Cycle settings saved! ⚙️");
    setTimeout(() => setConfirmToast(null), 3000);
  };

  // Handle Daily Fertility Log Modal Open
  const openDailyLogModal = (dateStr: string = format(new Date(), "yyyy-MM-dd")) => {
    setLogModalDate(dateStr);
    const existing = ovulationLogs[dateStr] || {};
    setTempLhTest(existing.lhTest || "NOT_TESTED");
    setTempCervicalMucus(existing.cervicalMucus || "DRY");
    setTempBbt(existing.bbt || "");
    setTempSymptoms(existing.symptoms || []);
    setTempIntimacy(!!existing.intimacy);
    setTempNotes(existing.notes || "");
    setShowLogModal(true);
  };

  const handleSaveDailyLog = (e: React.FormEvent) => {
    e.preventDefault();
    logDailyFertility(logModalDate, {
      date: logModalDate,
      lhTest: tempLhTest,
      cervicalMucus: tempCervicalMucus,
      bbt: tempBbt || undefined,
      symptoms: tempSymptoms,
      intimacy: tempIntimacy,
      notes: tempNotes || undefined
    });
    setShowLogModal(false);
    setConfirmToast("Daily fertility symptoms logged! 🌸");
    setTimeout(() => setConfirmToast(null), 3000);
  };

  const toggleSymptom = (sym: string) => {
    if (tempSymptoms.includes(sym)) {
      setTempSymptoms(tempSymptoms.filter(s => s !== sym));
    } else {
      setTempSymptoms([...tempSymptoms, sym]);
    }
  };

  const handleDispatchCareNote = (text: string) => {
    sendCareNote(text);
    setShowHusbandCareSheet(false);
    setCustomCareText("");
    setConfirmToast(`Care note sent to ${wifeName}! 🤍`);
    setTimeout(() => setConfirmToast(null), 3500);
  };

  const SYMPTOM_OPTIONS = [
    "Mild Cramping",
    "Tender Breasts",
    "High Energy",
    "Libido Spike",
    "Bloating",
    "Headache",
    "Mood Shift",
    "Acne / Skin Glow",
    "Fatigue",
    "Nausea"
  ];

  // ==========================================
  // 1. HUSBAND VIEW (Scoped Insights, Ovulation Awareness & Care)
  // ==========================================
  if (activeUser === "HUSBAND") {
    if (!sharePeriodStatus) {
      return null;
    }

    const isFertileNow = cycleInfo?.phase === "FERTILE_WINDOW" || cycleInfo?.phase === "OVULATION_DAY";

    return (
      <div className={`glass-panel p-5 rounded-3xl transition-all duration-300 flex flex-col gap-3.5 shadow-sm ${
        periodActive 
          ? "border border-rose-300 dark:border-rose-900/60 bg-gradient-to-br from-rose-50 via-pink-50/50 to-white dark:from-rose-950/30 dark:via-zinc-900 dark:to-zinc-900 shadow-md shadow-rose-500/5"
          : isFertileNow
          ? "border border-purple-300 dark:border-purple-900/60 bg-gradient-to-br from-purple-50 via-pink-50/30 to-white dark:from-purple-950/30 dark:via-zinc-900 dark:to-zinc-900 shadow-md shadow-purple-500/5"
          : "border border-slate-200/60 dark:border-zinc-800 bg-gradient-to-br from-slate-50/50 via-white to-purple-50/20 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900"
      }`}>
        
        {/* Header with Clear Current State Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-2xl shadow-sm ${
              periodActive 
                ? "bg-rose-500 text-white shadow-rose-500/20" 
                : isFertileNow
                ? "bg-purple-600 text-white shadow-purple-500/20"
                : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
            }`}>
              {periodActive ? (
                <Flower2Icon className="h-5 w-5" />
              ) : isFertileNow ? (
                <SparklesIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </div>
            <div className="flex flex-col">
              <span className={`text-[10px] font-black uppercase tracking-wider ${
                periodActive 
                  ? "text-rose-500" 
                  : isFertileNow 
                  ? "text-purple-600 dark:text-purple-400" 
                  : "text-slate-500 dark:text-zinc-400"
              }`}>
                {wifeName}&apos;s Cycle &amp; Fertility
              </span>
              <h4 className="text-sm font-black text-slate-800 dark:text-zinc-100">
                {periodActive 
                  ? `🌸 Period Active · Day ${currentCycleDay}` 
                  : cycleInfo 
                  ? `${cycleInfo.phaseTitle} · Day ${currentCycleDay}` 
                  : `${wifeName}&apos;s Cycle Preview`}
              </h4>
            </div>
          </div>

          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
            periodActive 
              ? "text-rose-600 bg-rose-500/10 border border-rose-200 dark:border-rose-900/40" 
              : isFertileNow
              ? "text-purple-700 bg-purple-500/10 border border-purple-200 dark:border-purple-900/40 font-black"
              : "text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800"
          }`}>
            {periodActive 
              ? "Resting (Exempt)" 
              : cycleInfo 
              ? cycleInfo.fertilityBadge 
              : (hasLoggedCycles ? "Tracking" : "Awaiting data")}
          </span>
        </div>

        {/* Dynamic Contextual Guidance for Husband */}
        <div className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800 flex flex-col gap-1 text-xs">
          <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed font-medium">
            {cycleInfo?.husbandAdvice || "Keeping her supported, healthy & loved throughout her cycle ✨"}
          </p>
          
          {/* Quick Upcoming Forecast for Husband */}
          {cycleInfo && !periodActive && (
            <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-500 dark:text-zinc-400 border-t border-slate-100/60 dark:border-zinc-800/60">
              <span>🌟 Next Ovulation: <strong>{cycleInfo.daysUntilOvulation > 0 ? `In ~${cycleInfo.daysUntilOvulation} days (${format(cycleInfo.ovulationDate, "MMM d")})` : "Today"}</strong></span>
              <span>•</span>
              <span>🌸 Next Period: <strong>{cycleInfo.daysUntilNextPeriod > 0 ? `In ~${cycleInfo.daysUntilNextPeriod} days` : "Due soon"}</strong></span>
            </div>
          )}
        </div>

        {/* Care Action Header & Multi-Option Trigger */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-zinc-800">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
            <HeartIcon className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> Send attentiveness &amp; care
          </span>
          <button
            onClick={() => setShowHusbandCareSheet(true)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all active:scale-95 flex items-center gap-1.5 ${
              periodActive 
                ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20" 
                : "bg-purple-600 hover:bg-purple-700 shadow-purple-500/20"
            }`}
          >
            <SparklesIcon className="h-3.5 w-3.5" /> Send Care Note
          </button>
        </div>

        {confirmToast && (
          <span className="text-[10px] font-bold text-center text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded-xl animate-in fade-in">
            {confirmToast}
          </span>
        )}

        {/* Husband Multi-Option Care Modal */}
        {mounted && showHusbandCareSheet && createPortal(
          <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 w-full max-w-sm max-h-[85vh] overflow-y-auto my-auto rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-zinc-800 flex flex-col gap-3.5 animate-in fade-in zoom-in-95 duration-200">
              <div className="sticky -top-5 bg-white dark:bg-zinc-900 pt-1 pb-2.5 z-10 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 -mx-1 px-1">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Love &amp; Care</span>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100">
                    Send Care Note to {wifeName}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowHusbandCareSheet(false)}
                  className="p-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Preset Quick Notes */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleDispatchCareNote("Hope you're resting comfortably my love 🤍 Let me know if you need anything!")}
                  className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100/80 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/40 text-left transition-all active:scale-98 flex items-center gap-2.5"
                >
                  <span className="text-lg">💌</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-rose-900 dark:text-rose-200">Send Love Note</span>
                    <span className="text-[10px] text-rose-600 dark:text-rose-400">&ldquo;Hope you&apos;re resting comfortably my love 🤍&rdquo;</span>
                  </div>
                </button>

                <button
                  onClick={() => handleDispatchCareNote("Thinking of you! Drink some warm tea and take it easy today ✨")}
                  className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100/80 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-900/40 text-left transition-all active:scale-98 flex items-center gap-2.5"
                >
                  <span className="text-lg">🍵</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200">Warm Tea &amp; Rest Check-in</span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400">&ldquo;Drink some warm tea and take it easy ✨&rdquo;</span>
                  </div>
                </button>

                <button
                  onClick={() => handleDispatchCareNote("Would you like me to order you some comfort food or your favorite treats? 🍓🍫")}
                  className="p-3 rounded-2xl bg-purple-50 hover:bg-purple-100/80 dark:bg-purple-950/30 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-900/40 text-left transition-all active:scale-98 flex items-center gap-2.5"
                >
                  <span className="text-lg">🍫</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-purple-900 dark:text-purple-200">Offer Comfort Food / Treats</span>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400">&ldquo;Would you like me to order your favorite treats? 🍓&rdquo;</span>
                  </div>
                </button>

                <button
                  onClick={() => handleDispatchCareNote("Stay healthy, hydrated & rest well my love 💧🤍 Thinking of you!")}
                  className="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100/80 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-900/40 text-left transition-all active:scale-98 flex items-center gap-2.5"
                >
                  <span className="text-lg">💧</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-200">Stay Hydrated Reminder</span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400">&ldquo;Stay healthy, hydrated &amp; rest well 💧🤍&rdquo;</span>
                  </div>
                </button>
              </div>

              {/* Custom Note Input */}
              <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-100 dark:border-zinc-800">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Or write a custom message</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customCareText}
                    onChange={(e) => setCustomCareText(e.target.value)}
                    placeholder="e.g. Taking care of dinner tonight 🤍"
                    className="flex-1 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                  />
                  <button
                    disabled={!customCareText.trim()}
                    onClick={() => handleDispatchCareNote(customCareText.trim())}
                    className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-bold text-xs transition-all active:scale-95"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  // ==========================================
  // 2. WIFE VIEW (Full Ovulation & Period Engine)
  // ==========================================
  const currentLoggedFertility = ovulationLogs[globalSelectedDate] || ovulationLogs[format(new Date(), "yyyy-MM-dd")];

  return (
    <div className={`glass-panel p-5 rounded-3xl transition-all duration-300 flex flex-col gap-4 shadow-sm ${
      periodActive 
        ? "border border-rose-300 dark:border-rose-800/60 bg-gradient-to-br from-rose-50/90 via-pink-50/40 to-white dark:from-rose-950/30 dark:via-zinc-900 dark:to-zinc-900 ring-1 ring-rose-400/20 shadow-md shadow-rose-500/5"
        : cycleInfo?.phase === "FERTILE_WINDOW" || cycleInfo?.phase === "OVULATION_DAY"
        ? "border border-purple-300 dark:border-purple-800/60 bg-gradient-to-br from-purple-50/90 via-pink-50/30 to-white dark:from-purple-950/30 dark:via-zinc-900 dark:to-zinc-900 shadow-md shadow-purple-500/5"
        : "border border-slate-200/80 dark:border-zinc-800 bg-gradient-to-br from-slate-50/70 via-white to-purple-50/30 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900"
    }`}>
      
      {/* 1. Header with Live Phase Title & Quick Primary Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-2.5 rounded-2xl shadow-sm transition-all ${
            periodActive 
              ? "bg-rose-500 text-white shadow-rose-500/30 animate-pulse" 
              : cycleInfo?.phase === "OVULATION_DAY"
              ? "bg-amber-500 text-white shadow-amber-500/30 animate-bounce"
              : cycleInfo?.phase === "FERTILE_WINDOW"
              ? "bg-purple-600 text-white shadow-purple-500/30"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          }`}>
            {periodActive ? (
              <Flower2Icon className="h-5 w-5" />
            ) : cycleInfo?.phase === "OVULATION_DAY" ? (
              <FlameIcon className="h-5 w-5" />
            ) : cycleInfo?.phase === "FERTILE_WINDOW" ? (
              <SparklesIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </div>
          
          <div className="flex flex-col">
            <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
              periodActive 
                ? "text-rose-600 dark:text-rose-400" 
                : cycleInfo?.phase === "FERTILE_WINDOW" || cycleInfo?.phase === "OVULATION_DAY"
                ? "text-purple-600 dark:text-purple-400"
                : "text-emerald-600 dark:text-emerald-400"
            }`}>
              {periodActive ? "Menstrual Cycle Active" : "🌿 Taharah (Clean) Window"}
            </span>
            <h4 className="text-sm font-black text-slate-800 dark:text-zinc-100 flex items-center gap-1.5">
              {periodActive 
                ? `🌸 Period Active · Day ${currentCycleDay}` 
                : cycleInfo 
                ? `${cycleInfo.phaseTitle}` 
                : "Cycle & Ovulation Tracker"}
            </h4>
          </div>
        </div>

        {/* Primary Action Button (Start / End Period or Cycle Settings) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowSettingsModal(true)}
            title="Cycle Length & Ovulation Settings"
            className="p-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-100 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 transition-all active:scale-95 shadow-xs"
          >
            <SlidersIcon className="h-3.5 w-3.5" />
          </button>

          {periodActive ? (
            <button
              onClick={openEndModal}
              className="px-3 py-2 rounded-xl text-xs font-extrabold bg-slate-900 hover:bg-black text-white dark:bg-zinc-100 dark:text-zinc-900 transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2Icon className="h-3.5 w-3.5 text-emerald-400" /> End Period
            </button>
          ) : (
            <button
              onClick={openStartModal}
              className="px-3.5 py-2 rounded-xl text-xs font-black bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/25 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <SparklesIcon className="h-3.5 w-3.5 fill-white/30" /> Mark Period Start
            </button>
          )}
        </div>
      </div>

      {/* 2. Islamic Prayer Exemption Banner (During Period) OR Ovulation Forecast Cards (Outside Period) */}
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
                    Edit
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
        /* Ovulation & Fertility Forecast Cards */
        <div className="grid grid-cols-2 gap-2.5">
          {/* Ovulation Forecast Card */}
          <div className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-850/80 border border-purple-100 dark:border-purple-900/30 flex flex-col gap-1 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <FlameIcon className="h-3 w-3" /> Ovulation Forecast
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300">
                {cycleInfo ? cycleInfo.fertilityBadge : "—"}
              </span>
            </div>
            <span className="text-xs font-extrabold text-slate-800 dark:text-zinc-100">
              {cycleInfo ? format(cycleInfo.ovulationDate, "MMMM d, yyyy") : "Add cycle data"}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">
              {cycleInfo 
                ? cycleInfo.daysUntilOvulation > 0 
                  ? `Estimated in ~${cycleInfo.daysUntilOvulation} days` 
                  : cycleInfo.daysUntilOvulation === 0 
                  ? "🌟 Peak Ovulation Today!" 
                  : `Passed ${Math.abs(cycleInfo.daysUntilOvulation)} days ago`
                : "Needs 1 period start date"}
            </span>
          </div>

          {/* Fertile Window Card */}
          <div className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-850/80 border border-slate-100 dark:border-zinc-800 flex flex-col gap-1 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <BabyIcon className="h-3 w-3 text-rose-400" /> Fertile Window
              </span>
              <span className="text-[9px] font-bold text-slate-500 dark:text-zinc-400">
                6-Day Window
              </span>
            </div>
            <span className="text-xs font-extrabold text-slate-800 dark:text-zinc-100">
              {cycleInfo ? cycleInfo.fertileWindowStr : "—"}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">
              {cycleInfo ? `Next Period: ~${format(cycleInfo.nextPeriodDate, "MMM d")}` : "Set in preferences"}
            </span>
          </div>
        </div>
      )}

      {/* 3. Interactive Visual 28-Day Cycle & Ovulation Map */}
      <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-slate-50/90 dark:bg-zinc-850/60 border border-slate-100 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1">
              <ActivityIcon className="h-3.5 w-3.5 text-amber-500" />
              Cycle Map (Day {currentCycleDay} of {totalDays})
            </span>
          </div>

          {/* Legend indicator */}
          <div className="flex items-center gap-2 text-[9px] font-bold">
            <span className="flex items-center gap-1 text-rose-500">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Period
            </span>
            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" /> Fertile
            </span>
            <span className="flex items-center gap-1 text-amber-500">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Peak
            </span>
          </div>
        </div>

        {/* 28-Day Visual Progression Bar & Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1.5 pt-1 scrollbar-hide">
          {Array.from({ length: totalDays }).map((_, idx) => {
            const dayNum = idx + 1;
            const isPeriodDay = dayNum <= (cycleSettings?.periodDuration || avgHistoricalDuration || 5);
            const ovulationOffset = Math.max(1, totalDays - (cycleSettings?.lutealLength || 14));
            const isOvulationDay = dayNum === ovulationOffset + 1;
            const isFertileDay = dayNum >= ovulationOffset - 4 && dayNum <= ovulationOffset + 1;
            const isCurrentDay = dayNum === currentCycleDay;
            const isSelected = selectedMapDay === dayNum;

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => setSelectedMapDay(isSelected ? null : dayNum)}
                className={`flex flex-col items-center justify-center min-w-[28px] h-10 rounded-xl transition-all relative ${
                  isCurrentDay 
                    ? "ring-2 ring-amber-500 ring-offset-1 scale-105 z-10 font-black shadow-sm" 
                    : ""
                } ${
                  isPeriodDay 
                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-900/50" 
                    : isOvulationDay
                    ? "bg-amber-500 text-white font-black shadow-xs"
                    : isFertileDay 
                    ? "bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800/40" 
                    : "bg-white dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-100 dark:border-zinc-700/60"
                }`}
                title={`Day ${dayNum}: ${isPeriodDay ? "Period" : isOvulationDay ? "Ovulation Peak" : isFertileDay ? "Fertile Window" : "Luteal / Follicular"}`}
              >
                <span className="text-[10px] font-bold leading-none">{dayNum}</span>
                {isOvulationDay && <span className="text-[8px] leading-none">🌟</span>}
                {isPeriodDay && !isOvulationDay && <span className="text-[8px] leading-none">🌸</span>}
                {isFertileDay && !isOvulationDay && <span className="text-[8px] leading-none">✨</span>}
                
                {isCurrentDay && (
                  <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-amber-500 animate-ping" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Day Info Popup */}
        {selectedMapDay && (
          <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 dark:text-zinc-100">
                Cycle Day {selectedMapDay} Analysis
              </span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                {selectedMapDay <= (cycleSettings?.periodDuration || 5) 
                  ? "🌸 Menstrual Phase · Exemption Active" 
                  : selectedMapDay === (totalDays - (cycleSettings?.lutealLength || 14) + 1)
                  ? "🌟 Peak Ovulation Day · Highest chance of conception"
                  : selectedMapDay >= (totalDays - (cycleSettings?.lutealLength || 14) - 4) && selectedMapDay <= (totalDays - (cycleSettings?.lutealLength || 14) + 1)
                  ? "✨ Fertile Window · Conception window open"
                  : selectedMapDay < (totalDays - (cycleSettings?.lutealLength || 14) - 4)
                  ? "🌿 Follicular Phase · Estrogen building"
                  : "🌙 Luteal Phase · Progesterone dominant"}
              </span>
            </div>
            <button
              onClick={() => setSelectedMapDay(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <XIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 4. Daily Ovulation & Fertility Symptom Quick Logger */}
      <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-slate-100 dark:border-zinc-800 flex flex-col gap-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ThermometerIcon className="h-4 w-4 text-purple-500" />
            <span className="text-xs font-black text-slate-800 dark:text-zinc-100">
              Daily Fertility &amp; Ovulation Log
            </span>
          </div>
          <button
            onClick={() => openDailyLogModal(globalSelectedDate || format(new Date(), "yyyy-MM-dd"))}
            className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-purple-500 hover:bg-purple-600 text-white shadow-xs active:scale-95 transition-all flex items-center gap-1"
          >
            <PlusIcon className="h-3 w-3" /> Log Today
          </button>
        </div>

        {/* Current Logged Status Display */}
        {currentLoggedFertility ? (
          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
            {currentLoggedFertility.lhTest && currentLoggedFertility.lhTest !== "NOT_TESTED" && (
              <span className={`px-2 py-0.5 rounded-md font-bold ${
                currentLoggedFertility.lhTest === "PEAK" 
                  ? "bg-rose-500 text-white" 
                  : currentLoggedFertility.lhTest === "HIGH" 
                  ? "bg-purple-500 text-white" 
                  : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300"
              }`}>
                LH Test: {currentLoggedFertility.lhTest}
              </span>
            )}

            {currentLoggedFertility.cervicalMucus && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold">
                Fluid: {currentLoggedFertility.cervicalMucus.replace("_", "-")}
              </span>
            )}

            {currentLoggedFertility.bbt && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold">
                BBT: {currentLoggedFertility.bbt}°
              </span>
            )}

            {currentLoggedFertility.symptoms && currentLoggedFertility.symptoms.length > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold">
                {currentLoggedFertility.symptoms.length} symptoms logged
              </span>
            )}

            {currentLoggedFertility.intimacy && (
              <span className="px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold flex items-center gap-1">
                <HeartIcon className="h-2.5 w-2.5 fill-pink-500" /> Intimacy
              </span>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 dark:text-zinc-500">
            No symptoms or ovulation test logged for this date. Tap &ldquo;Log Today&rdquo; to track LH surge, cervical fluid, BBT, or cramps.
          </p>
        )}
      </div>

      {/* 5. Phase-Specific Wellness Guidance (Physical, Nutrition & Spiritual) */}
      {cycleInfo && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50/50 via-slate-50/50 to-white dark:from-zinc-900 dark:to-zinc-850 border border-slate-100 dark:border-zinc-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <SunIcon className="h-3.5 w-3.5" /> Phase Guidance &amp; Nutrition
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              {cycleInfo.phaseSubtitle}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 flex flex-col gap-0.5">
              <span className="font-extrabold text-slate-700 dark:text-zinc-200">⚡ Physical</span>
              <p className="text-slate-500 dark:text-zinc-400 leading-tight line-clamp-3">{cycleInfo.tips.physical}</p>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 flex flex-col gap-0.5">
              <span className="font-extrabold text-slate-700 dark:text-zinc-200">🥗 Nutrition</span>
              <p className="text-slate-500 dark:text-zinc-400 leading-tight line-clamp-3">{cycleInfo.tips.nutrition}</p>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 flex flex-col gap-0.5">
              <span className="font-extrabold text-slate-700 dark:text-zinc-200">🤲 Spiritual</span>
              <p className="text-slate-500 dark:text-zinc-400 leading-tight line-clamp-3">{cycleInfo.tips.spiritual}</p>
            </div>
          </div>
        </div>
      )}

      {/* 6. Privacy & Sync Toggle */}
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

      {/* 7. Cycle History Dropdown & Add Past Period Backfill */}
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
                No past cycles recorded. Tap &ldquo;Add Past Period&rdquo; to backfill historical dates.
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
      {mounted && startEndModal && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 w-full max-w-sm max-h-[85vh] overflow-y-auto my-auto rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-zinc-800 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky -top-5 bg-white dark:bg-zinc-900 pt-1 pb-3 z-10 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 -mx-1 px-1">
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
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-rose-400"
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
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-rose-400"
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
        </div>,
        document.body
      )}

      {/* ========================================================= */}
      {/* 2. EDIT CYCLE MODAL */}
      {/* ========================================================= */}
      {mounted && editingCycle && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 w-full max-w-sm max-h-[85vh] overflow-y-auto my-auto rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-zinc-800 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky -top-5 bg-white dark:bg-zinc-900 pt-1 pb-3 z-10 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 -mx-1 px-1">
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
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Period Start Date &amp; Time</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    required
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none"
                  />
                  <input
                    type="time"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    placeholder="Optional time"
                    className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Period End Date &amp; Time <span className="text-[10px] font-normal text-slate-400">(Leave empty if active)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none"
                  />
                  <input
                    type="time"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    placeholder="Optional time"
                    className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none"
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
        </div>,
        document.body
      )}

      {/* ========================================================= */}
      {/* 3. ADD PAST PERIOD MODAL */}
      {/* ========================================================= */}
      {mounted && showAddPastModal && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 w-full max-w-sm max-h-[85vh] overflow-y-auto my-auto rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-zinc-800 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky -top-5 bg-white dark:bg-zinc-900 pt-1 pb-3 z-10 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 -mx-1 px-1">
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
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Period Start Date &amp; Time</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    required
                    value={pastStartDate}
                    onChange={(e) => setPastStartDate(e.target.value)}
                    className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none"
                  />
                  <input
                    type="time"
                    value={pastStartTime}
                    onChange={(e) => setPastStartTime(e.target.value)}
                    placeholder="Optional time"
                    className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Period End Date &amp; Time</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    required
                    value={pastEndDate}
                    onChange={(e) => setPastEndDate(e.target.value)}
                    className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none"
                  />
                  <input
                    type="time"
                    value={pastEndTime}
                    onChange={(e) => setPastEndTime(e.target.value)}
                    placeholder="Optional time"
                    className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none"
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
                  <CheckIcon className="h-4 w-4" /> Save Record
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================= */}
      {/* 4. CYCLE & OVULATION SETTINGS MODAL */}
      {/* ========================================================= */}
      {mounted && showSettingsModal && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 w-full max-w-sm max-h-[85vh] overflow-y-auto my-auto rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-zinc-800 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky -top-5 bg-white dark:bg-zinc-900 pt-1 pb-3 z-10 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 -mx-1 px-1">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Settings</span>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100 flex items-center gap-1.5">
                  <SlidersIcon className="h-4 w-4 text-purple-500" /> Cycle &amp; Ovulation Preferences
                </h3>
              </div>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Average Cycle Length</label>
                  <span className="text-xs font-black text-purple-600 dark:text-purple-400">{tempCycleLength} days</span>
                </div>
                <input
                  type="range"
                  min="21"
                  max="40"
                  value={tempCycleLength}
                  onChange={(e) => setTempCycleLength(parseInt(e.target.value))}
                  className="w-full accent-purple-600 h-2 bg-slate-100 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Typical range: 24 to 35 days (default: 28 days)</span>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Average Period Duration</label>
                  <span className="text-xs font-black text-rose-500">{tempPeriodDuration} days</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={tempPeriodDuration}
                  onChange={(e) => setTempPeriodDuration(parseInt(e.target.value))}
                  className="w-full accent-rose-500 h-2 bg-slate-100 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Typical duration: 4 to 7 days (default: 5 days)</span>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Luteal Phase Length</label>
                  <span className="text-xs font-black text-amber-500">{tempLutealLength} days</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="16"
                  value={tempLutealLength}
                  onChange={(e) => setTempLutealLength(parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-2 bg-slate-100 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Time from ovulation to period (standard: 14 days)</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckIcon className="h-4 w-4" /> Save Preferences
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================= */}
      {/* 5. DAILY FERTILITY & OVULATION SYMPTOMS LOG MODAL */}
      {/* ========================================================= */}
      {mounted && showLogModal && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 w-full max-w-sm max-h-[88vh] overflow-y-auto my-auto rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-zinc-800 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky -top-5 bg-white dark:bg-zinc-900 pt-1 pb-3 z-10 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 -mx-1 px-1">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Daily Health Check-in</span>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100 flex items-center gap-1.5">
                  <ThermometerIcon className="h-4 w-4 text-purple-500" /> Log Fertility &amp; Symptoms
                </h3>
              </div>
              <button 
                onClick={() => setShowLogModal(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDailyLog} className="flex flex-col gap-3.5">
              
              {/* Log Date */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Log Date</label>
                <input
                  type="date"
                  value={logModalDate}
                  onChange={(e) => setLogModalDate(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              {/* LH Ovulation Test Strip (OPK) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                  <ZapIcon className="h-3.5 w-3.5 text-amber-500" /> Ovulation LH Test Strip
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { key: "NOT_TESTED", label: "None" },
                    { key: "LOW", label: "Low ⚪" },
                    { key: "HIGH", label: "High 🟢" },
                    { key: "PEAK", label: "Peak 🟣" }
                  ].map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setTempLhTest(opt.key as any)}
                      className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${
                        tempLhTest === opt.key 
                          ? "bg-purple-600 text-white border-purple-600 shadow-xs scale-102" 
                          : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cervical Fluid / Mucus */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                  <DropletsIcon className="h-3.5 w-3.5 text-blue-500" /> Cervical Fluid (Fertility Sign)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { key: "DRY", label: "Dry / None" },
                    { key: "STICKY", label: "Sticky" },
                    { key: "CREAMY", label: "Creamy" },
                    { key: "WATERY", label: "Watery ✨" },
                    { key: "EGG_WHITE", label: "Egg-White 🌟 (Peak)" }
                  ].map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setTempCervicalMucus(opt.key as any)}
                      className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all ${
                        tempCervicalMucus === opt.key 
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs" 
                          : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* BBT & Intimacy */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                    <ThermometerIcon className="h-3 w-3 text-amber-500" /> BBT Temp (°C/°F)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 36.6"
                    value={tempBbt}
                    onChange={(e) => setTempBbt(e.target.value)}
                    className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <button
                    type="button"
                    onClick={() => setTempIntimacy(!tempIntimacy)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                      tempIntimacy 
                        ? "bg-pink-500 text-white border-pink-500 shadow-xs" 
                        : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400"
                    }`}
                  >
                    <HeartIcon className={`h-3.5 w-3.5 ${tempIntimacy ? "fill-white" : ""}`} /> Intimacy
                  </button>
                </div>
              </div>

              {/* Symptoms Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Symptoms &amp; Body Sensations</label>
                <div className="flex flex-wrap gap-1.5">
                  {SYMPTOM_OPTIONS.map(sym => {
                    const isSelected = tempSymptoms.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => toggleSymptom(sym)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all ${
                          isSelected 
                            ? "bg-rose-500 text-white border-rose-500 shadow-xs" 
                            : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400"
                        }`}
                      >
                        {sym}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Private Notes */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Daily Notes</label>
                <input
                  type="text"
                  placeholder="e.g. High energy, drank raspberry leaf tea..."
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckIcon className="h-4 w-4" /> Save Log
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
