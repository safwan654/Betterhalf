"use client";

import { useState, useMemo } from "react";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { 
  Flame, 
  CheckCircle2, 
  History, 
  Share2, 
  Clock, 
  AlertCircle, 
  X, 
  Bell, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  Sparkles, 
  Heart, 
  Globe, 
  ShieldAlert, 
  Moon 
} from "lucide-react";
import { useGlobal, PrayerStatus, initialPrayers } from "@/context/GlobalContext";
import { format, isSameDay, parseISO, getDay } from "date-fns";
import { 
  calculatePrayerTimes, 
  checkMakruhWindow, 
  CITY_PRESETS, 
  formatTimeWithTZ, 
  getTimezoneAbbr 
} from "@/lib/prayer-times";
import SpiritualCalendar from "@/components/spiritual/SpiritualCalendar";

export default function SpiritualTracker() {
  const { 
    activeUser, 
    husbandName, 
    wifeName, 
    husbandPhoto,
    wifePhoto,
    prayersByDate, 
    setPrayersByDate, 
    globalSelectedDate, 
    setGlobalSelectedDate, 
    sendInteraction, 
    madhhab, 
    husbandLocation, 
    wifeLocation, 
    periodActive, 
    periodStartDate, 
    periodCycles, 
    sharePeriodStatus 
  } = useGlobal();

  const [activeTab, setActiveTab] = useState<"CHECKLIST" | "CALENDAR">("CHECKLIST");
  const [loggingPrayer, setLoggingPrayer] = useState<{ id: string, person: "husband" | "wife", name: string } | null>(null);
  const [reminderToast, setReminderToast] = useState<string | null>(null);
  const [reminderCooldowns, setReminderCooldowns] = useState<Record<string, number>>({});

  const todayDateObj = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => format(todayDateObj, "yyyy-MM-dd"), [todayDateObj]);
  const isFriday = getDay(todayDateObj) === 5;
  const currentPrayers = prayersByDate[todayStr] || initialPrayers;

  // Calculate local prayer times for husband & wife for today
  const husbandPrayerTimes = useMemo(() => {
    return calculatePrayerTimes(husbandLocation || CITY_PRESETS["Dubai, UAE"], todayDateObj, madhhab);
  }, [husbandLocation, todayDateObj, madhhab]);

  const wifePrayerTimes = useMemo(() => {
    return calculatePrayerTimes(wifeLocation || CITY_PRESETS["Mumbai, India"], todayDateObj, madhhab);
  }, [wifeLocation, todayDateObj, madhhab]);

  // Fine-grained prayer exemption check based on date and time
  const isWifePrayerExempt = (prayerDate: Date): boolean => {
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

  // Makruh window for active user
  const activeUserPrayerTimes = activeUser === "HUSBAND" ? husbandPrayerTimes : wifePrayerTimes;
  const makruhCheck = useMemo(() => {
    return checkMakruhWindow(activeUserPrayerTimes, new Date());
  }, [activeUserPrayerTimes]);

  // Handle cross-timezone reminder
  const handleRemindPartner = (prayerId: string, prayerName: string) => {
    const isRemindingHusband = activeUser === "WIFE";
    const partnerName = isRemindingHusband ? husbandName : wifeName;
    const targetPrayerTimes = isRemindingHusband ? husbandPrayerTimes : wifePrayerTimes;
    const targetLocation = isRemindingHusband ? husbandLocation : wifeLocation;

    const now = Date.now();
    if (reminderCooldowns[prayerId] && now < reminderCooldowns[prayerId]) {
      const remainingMins = Math.ceil((reminderCooldowns[prayerId] - now) / 60000);
      setReminderToast(`Cooldown active: Please wait ${remainingMins}m before reminding again ⏳`);
      setTimeout(() => setReminderToast(null), 3000);
      return;
    }

    // Target prayer info in recipient's local timezone
    const prayerKey = prayerId as keyof typeof targetPrayerTimes;
    const targetPrayerObj = targetPrayerTimes[prayerKey] as { timeStr: string; date: Date } | undefined;
    const targetTimeStr = targetPrayerObj?.timeStr || "soon";
    const targetTzAbbr = targetPrayerTimes.tzAbbr || "";

    const isDhuhrOnFriday = isFriday && prayerId === "dhuhr";
    const displayName = isDhuhrOnFriday ? (isRemindingHusband ? "Jumu'ah" : "Dhuhr") : prayerName;

    // Calculate diff relative to recipient's prayer time
    let diffMins = 0;
    if (targetPrayerObj?.date) {
      diffMins = Math.round((targetPrayerObj.date.getTime() - now) / 60000);
    }

    let reminderText = "";
    if (diffMins > 0) {
      reminderText = `${displayName} is in ${diffMins}m (${targetTimeStr} ${targetTzAbbr})`;
    } else {
      const agoMins = Math.abs(diffMins);
      if (agoMins > 210) {
        reminderText = `${displayName} time was ${targetTimeStr} ${targetTzAbbr} — check if ${partnerName} prayed 🕌`;
      } else {
        reminderText = `${displayName} started ${agoMins}m ago (${targetTimeStr} ${targetTzAbbr})`;
      }
    }

    sendInteraction("PRAYER_ALERT", reminderText, "PARTNER");

    setReminderCooldowns(prev => ({
      ...prev,
      [prayerId]: now + 15 * 60 * 1000
    }));

    setReminderToast(`Reminder for ${displayName} (${targetTimeStr} ${targetTzAbbr}) sent to ${partnerName}! 🔔`);
    setTimeout(() => setReminderToast(null), 3500);
  };

  const handleLogClick = (id: string, name: string, person: "husband" | "wife", currentStatus: PrayerStatus) => {
    if (person.toUpperCase() !== activeUser) {
      alert(`You can only log prayers for yourself! You are currently logged in as ${activeUser === "HUSBAND" ? husbandName : wifeName}.`);
      return;
    }
    setLoggingPrayer({ id, name, person });
  };

  const submitLog = (status: PrayerStatus) => {
    if (!loggingPrayer) return;

    const targetPrayer = currentPrayers.find(p => p.id === loggingPrayer.id);
    const partnerPerson = loggingPrayer.person === "husband" ? "wife" : "husband";
    const senderName = activeUser === "HUSBAND" ? husbandName : wifeName;
    const partnerName = activeUser === "HUSBAND" ? wifeName : husbandName;
    const isDhuhrOnFriday = isFriday && loggingPrayer.id === "dhuhr";
    const prayerDisplayName = isDhuhrOnFriday ? (loggingPrayer.person === "husband" ? "Jumu'ah" : "Dhuhr") : loggingPrayer.name;

    const userLoc = activeUser === "HUSBAND" ? husbandLocation : wifeLocation;
    const nowTimeFormatted = formatTimeWithTZ(new Date(), userLoc?.timezone || "UTC", true);

    if (targetPrayer && status && status !== null) {
      const partnerAlreadyCompleted = !!targetPrayer[partnerPerson] && targetPrayer[partnerPerson] !== "MISSED";

      if (partnerAlreadyCompleted) {
        sendInteraction(
          "PRAYER_CELEBRATION",
          `Alhamdulillah! ${prayerDisplayName} complete for both of you today 🤍`,
          "BOTH"
        );
        setReminderToast(`${prayerDisplayName} complete for both of you today! 🤍`);
      } else {
        let completionMsg = `Prayer Completed ✅ - ${senderName} just prayed ${prayerDisplayName} (${nowTimeFormatted})`;
        if (status === "LATE") {
          completionMsg = `${senderName} completed ${prayerDisplayName} — logged late (${nowTimeFormatted})`;
        } else if (status === "QADA") {
          completionMsg = `${senderName} made up ${prayerDisplayName} (Qada) 🤲 (${nowTimeFormatted})`;
        } else if (status === "EXEMPT") {
          completionMsg = `${senderName} marked ${prayerDisplayName} as Exempt (رخصة) 🤍`;
        }

        if (status !== "MISSED") {
          sendInteraction("PRAYER_COMPLETE", completionMsg, "PARTNER");
        }
        setReminderToast(`${prayerDisplayName} marked ${status.toLowerCase()} ✅ ${partnerName} notified`);
      }
      setTimeout(() => setReminderToast(null), 4000);
    }

    const updatedPrayers = currentPrayers.map(p => {
      if (p.id === loggingPrayer.id) {
        return { ...p, [loggingPrayer.person]: status };
      }
      return p;
    });

    setPrayersByDate({
      ...prayersByDate,
      [todayStr]: updatedPrayers
    });
    setLoggingPrayer(null);
  };

  const handleWhatsAppShare = () => {
    const message = `Alhamdulillah, I just updated my prayer log for today! 🕌✨\n\nCheck BetterHalf: https://betterhalf.vercel.app/spiritual`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const husbandCompleted = currentPrayers.filter(p => p.husband && p.husband !== "MISSED").length;
  const wifeCompleted = currentPrayers.filter(p => (p.wife && p.wife !== "MISSED") || isWifePrayerExempt(todayDateObj)).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-28 text-slate-900 dark:text-zinc-100 transition-colors">
      <Header />

      <main className="mx-auto max-w-md px-4 pt-4 flex flex-col gap-4">
        
        {/* View Switcher: Checklist vs Calendar */}
        <div className="flex items-center justify-between bg-slate-200/70 dark:bg-zinc-900 p-1 rounded-2xl border border-slate-300/40 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab("CHECKLIST")}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "CHECKLIST"
                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-700"
            }`}
          >
            <CheckSquare className="h-4 w-4 text-emerald-500" /> Daily Checklist
          </button>
          <button
            onClick={() => setActiveTab("CALENDAR")}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "CALENDAR"
                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-700"
            }`}
          >
            <CalendarIcon className="h-4 w-4 text-amber-500" /> Monthly Calendar
          </button>
        </div>

        {/* Makruh Window Alert Banner */}
        {makruhCheck.isMakruh && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-amber-700 dark:text-amber-400 animate-in fade-in">
            <ShieldAlert className="h-5 w-5 shrink-0 text-amber-500" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-wider">Makruh Window Active</span>
              <span className="text-xs font-semibold">{makruhCheck.reason}</span>
            </div>
          </div>
        )}

        {/* Render Tab Content */}
        {activeTab === "CALENDAR" ? (
          <SpiritualCalendar />
        ) : (
          <>
            {/* Timezone Locations & Isha Midnight Summary */}
            <div className="glass-panel p-3.5 rounded-3xl border border-slate-100/60 dark:border-zinc-850 flex items-center justify-between text-[11px] shadow-sm">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Him ({husbandLocation?.city || "Dubai"})</span>
                <span className="font-bold text-slate-700 dark:text-zinc-200">{husbandPrayerTimes.tzAbbr} · {husbandLocation?.timezone}</span>
              </div>
              <div className="h-6 w-[1px] bg-slate-200 dark:bg-zinc-800" />
              <div className="flex flex-col text-right">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Her ({wifeLocation?.city || "Mumbai"})</span>
                <span className="font-bold text-slate-700 dark:text-zinc-200">{wifePrayerTimes.tzAbbr} · {wifeLocation?.timezone}</span>
              </div>
            </div>

            {/* WhatsApp Share Button */}
            <button
              onClick={handleWhatsAppShare}
              className="w-full flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-bold py-3.5 rounded-2xl border border-[#25D366]/30 transition-all active:scale-95 text-sm"
            >
              <Share2 className="h-4 w-4" /> Share Update via WhatsApp
            </button>

            {/* Daily Checklist Table */}
            <section className="glass-panel rounded-3xl p-4 shadow-sm border border-slate-100/50 dark:border-zinc-850 flex flex-col gap-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800 px-1">
                <div className="flex flex-col">
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-zinc-100">Daily Checklist</h3>
                  <span className="text-[10px] text-slate-400">Today · {format(todayDateObj, "EEEE, MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2">
                  {madhhab === "HANAFI" && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      Hanafi Asr
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                    <History className="h-3 w-3" /> Auto-resets
                  </span>
                </div>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 py-2 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-2 border-b border-slate-100 dark:border-zinc-800/50 items-center">
                <div className="col-span-4">Prayer</div>
                <div className="col-span-2 flex items-center justify-center gap-1">
                  <div className="h-4 w-4 rounded-full overflow-hidden bg-amber-500 text-white flex items-center justify-center text-[8px] font-black shrink-0">
                    {husbandPhoto ? (
                      <img src={husbandPhoto} alt={husbandName} className="h-full w-full object-cover" />
                    ) : (
                      (husbandName || "H").charAt(0).toUpperCase()
                    )}
                  </div>
                  <span>{husbandPrayerTimes.tzAbbr}</span>
                </div>
                <div className="col-span-2 flex items-center justify-center gap-1">
                  <div className="h-4 w-4 rounded-full overflow-hidden bg-rose-500 text-white flex items-center justify-center text-[8px] font-black shrink-0">
                    {wifePhoto ? (
                      <img src={wifePhoto} alt={wifeName} className="h-full w-full object-cover" />
                    ) : (
                      (wifeName || "W").charAt(0).toUpperCase()
                    )}
                  </div>
                  <span>{wifePrayerTimes.tzAbbr}</span>
                </div>
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

                const isWifeExempt = wTimeObj?.date ? isWifePrayerExempt(wTimeObj.date) : false;
                const cooldownActive = !!(reminderCooldowns[prayer.id] && Date.now() < reminderCooldowns[prayer.id]);
                const cooldownRemainingMins = cooldownActive ? Math.ceil((reminderCooldowns[prayer.id] - Date.now()) / 60000) : 0;

                const hStatus = prayer.husband;
                const wStatus = isWifeExempt ? (prayer.wife || "EXEMPT") : prayer.wife;
                const bothLogged = (hStatus && hStatus !== "MISSED") && (wStatus && wStatus !== "MISSED");
                const partComplete = (hStatus && hStatus !== "MISSED") || (wStatus && wStatus !== "MISSED");

                return (
                  <div key={prayer.id} className="grid grid-cols-12 gap-2 items-center py-2.5 border-b border-slate-50 dark:border-zinc-850/50 last:border-0 px-2 hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors rounded-xl">
                    {/* Prayer Name & Bell */}
                    <div className="col-span-4 flex items-center justify-between pr-1">
                      <div className="flex flex-col">
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
                      <button 
                        type="button"
                        onClick={() => handleRemindPartner(prayer.id, prayer.name)}
                        title={cooldownActive ? `Cooldown active (${cooldownRemainingMins}m remaining)` : `Send reminder to partner`}
                        className={`p-1.5 rounded-lg transition-all active:scale-90 ${
                          cooldownActive
                            ? "bg-slate-100 dark:bg-zinc-800 text-slate-400 opacity-60 cursor-not-allowed"
                            : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        <Bell className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Husband Checkbox Column */}
                    <div className="col-span-2 flex flex-col items-center justify-center">
                      <button 
                        onClick={() => handleLogClick(prayer.id, prayer.name, "husband", prayer.husband)}
                        className={`h-7 w-7 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                          hStatus === "ON_TIME" ? "bg-emerald-500 text-white shadow-emerald-500/20 shadow-sm" :
                          hStatus === "LATE" ? "bg-amber-500 text-white shadow-amber-500/20 shadow-sm" :
                          hStatus === "QADA" ? "bg-purple-500 text-white shadow-purple-500/20 shadow-sm" :
                          hStatus === "EXEMPT" ? "bg-blue-500 text-white shadow-blue-500/20 shadow-sm" :
                          hStatus === "MISSED" ? "bg-rose-500 text-white shadow-rose-500/20 shadow-sm" :
                          "bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-300 dark:text-zinc-600"
                        }`}
                      >
                        {hStatus === "ON_TIME" ? <CheckCircle2 className="h-4 w-4" /> :
                         hStatus === "LATE" ? <Clock className="h-4 w-4" /> :
                         hStatus === "QADA" ? <Sparkles className="h-4 w-4" /> :
                         hStatus === "EXEMPT" ? <Heart className="h-4 w-4" fill="white" /> :
                         hStatus === "MISSED" ? <X className="h-4 w-4" /> :
                         <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-zinc-700" />}
                      </button>
                      <span className="text-[8px] font-semibold text-slate-400 dark:text-zinc-500 mt-0.5">
                        {hTimeObj?.timeStr || prayer.time}
                      </span>
                    </div>

                    {/* Wife Checkbox Column */}
                    <div className="col-span-2 flex flex-col items-center justify-center">
                      {isWifeExempt ? (
                        <div className="flex flex-col items-center" title="Exempt (رخصة)">
                          <div className="h-7 w-7 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                            <Heart className="h-3.5 w-3.5 fill-blue-500" />
                          </div>
                          <span className="text-[8px] font-bold text-blue-500 mt-0.5">Exempt</span>
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleLogClick(prayer.id, prayer.name, "wife", prayer.wife)}
                            className={`h-7 w-7 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                              wStatus === "ON_TIME" ? "bg-emerald-500 text-white shadow-emerald-500/20 shadow-sm" :
                              wStatus === "LATE" ? "bg-amber-500 text-white shadow-amber-500/20 shadow-sm" :
                              wStatus === "QADA" ? "bg-purple-500 text-white shadow-purple-500/20 shadow-sm" :
                              wStatus === "EXEMPT" ? "bg-blue-500 text-white shadow-blue-500/20 shadow-sm" :
                              wStatus === "MISSED" ? "bg-rose-500 text-white shadow-rose-500/20 shadow-sm" :
                              "bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-300 dark:text-zinc-600"
                            }`}
                          >
                            {wStatus === "ON_TIME" ? <CheckCircle2 className="h-4 w-4" /> :
                             wStatus === "LATE" ? <Clock className="h-4 w-4" /> :
                             wStatus === "QADA" ? <Sparkles className="h-4 w-4" /> :
                             wStatus === "EXEMPT" ? <Heart className="h-4 w-4" fill="white" /> :
                             wStatus === "MISSED" ? <X className="h-4 w-4" /> :
                             <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-zinc-700" />}
                          </button>
                          <span className="text-[8px] font-semibold text-slate-400 dark:text-zinc-500 mt-0.5">
                            {wTimeObj?.timeStr || prayer.time}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Status Pill */}
                    <div className="col-span-4 flex justify-end">
                      {isWifeExempt ? (
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          Resting (Exempt) 🌸
                        </span>
                      ) : bothLogged ? (
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Both Logged 🤍
                        </span>
                      ) : partComplete ? (
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          Part Complete
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </section>
          </>
        )}

      </main>

      {/* Prayer Logging Modal */}
      {loggingPrayer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-white/20 dark:border-zinc-800 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Log Prayer</span>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100">
                  {loggingPrayer.name} for {loggingPrayer.person === "husband" ? husbandName : wifeName}
                </h3>
              </div>
              <button 
                onClick={() => setLoggingPrayer(null)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Select how you performed this prayer according to Sunni Fiqh guidelines:
            </p>

            <div className="flex flex-col gap-2">
              <button 
                onClick={() => submitLog("ON_TIME")}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-500/30 transition-all active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <div className="flex flex-col text-left">
                    <span>On Time (في وقته)</span>
                    <span className="text-[10px] font-normal opacity-80">Performed inside the standard prayer window</span>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => submitLog("LATE")}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-500/30 transition-all active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <div className="flex flex-col text-left">
                    <span>Logged Late (تأخير)</span>
                    <span className="text-[10px] font-normal opacity-80">Delayed near cutoff but before window expired</span>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => submitLog("QADA")}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-500/30 transition-all active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <div className="flex flex-col text-left">
                    <span>Make-up Prayer (قضاء)</span>
                    <span className="text-[10px] font-normal opacity-80">Prayed as make-up after the window passed</span>
                  </div>
                </div>
              </button>

              {loggingPrayer.person === "wife" && (
                <button 
                  onClick={() => submitLog("EXEMPT")}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-500/30 transition-all active:scale-98"
                >
                  <div className="flex items-center gap-2.5">
                    <Heart className="h-4 w-4 text-blue-600" />
                    <div className="flex flex-col text-left">
                      <span>Exempt (رخصة شرعية)</span>
                      <span className="text-[10px] font-normal opacity-80">Menstruation exemption (does not break streak)</span>
                    </div>
                  </div>
                </button>
              )}

              <button 
                onClick={() => submitLog("MISSED")}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-500/30 transition-all active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <X className="h-4 w-4 text-rose-600" />
                  <div className="flex flex-col text-left">
                    <span>Missed (فائتة)</span>
                    <span className="text-[10px] font-normal opacity-80">Missed without excuse</span>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => submitLog(null)}
                className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
              >
                Clear Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-app Toast */}
      {reminderToast && (
        <div className="fixed bottom-20 left-4 right-4 z-50 flex justify-center animate-in fade-in slide-in-from-bottom-5">
          <div className="bg-slate-900/90 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700/50 flex items-center gap-2 text-xs font-bold max-w-sm backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
            <span>{reminderToast}</span>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}
