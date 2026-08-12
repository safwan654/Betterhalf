"use client";

import { useState } from "react";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { Flame, CheckCircle2, History, Share2, Clock, AlertCircle, X, RotateCcw } from "lucide-react";
import { useGlobal, PrayerStatus, initialPrayers } from "@/context/GlobalContext";
import { format, isSameDay, parseISO } from "date-fns";

export default function SpiritualTracker() {
  const { activeUser, prayersByDate, setPrayersByDate, globalSelectedDate } = useGlobal();

  const currentPrayers = prayersByDate[globalSelectedDate] || initialPrayers;

  // State for Prayer Selection Modal
  const [loggingPrayer, setLoggingPrayer] = useState<{ id: string, person: "husband" | "wife", name: string } | null>(null);

  const handleLogClick = (id: string, name: string, person: "husband" | "wife", currentStatus: PrayerStatus) => {
    setLoggingPrayer({ id, name, person });
  };

  const submitLog = (status: PrayerStatus) => {
    if (!loggingPrayer) return;
    const updatedPrayers = currentPrayers.map(p => {
      if (p.id === loggingPrayer.id) {
        return { ...p, [loggingPrayer.person]: status };
      }
      return p;
    });
    
    setPrayersByDate({
      ...prayersByDate,
      [globalSelectedDate]: updatedPrayers
    });
    setLoggingPrayer(null);
  };

  const resetDay = () => {
    if (confirm("Are you sure you want to reset all prayer logs for this date?")) {
      setPrayersByDate({
        ...prayersByDate,
        [globalSelectedDate]: initialPrayers
      });
    }
  };

  const handleWhatsAppShare = () => {
    const message = `Alhamdulillah, I just updated my prayer log! 🕌✨\n\nLog yours here: https://betterhalf.vercel.app/spiritual?log=true`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const husbandCompleted = currentPrayers.filter(p => p.husband).length;
  const wifeCompleted = currentPrayers.filter(p => p.wife).length;
  
  const isStreakActive = husbandCompleted >= 3 && wifeCompleted >= 3;
  const currentStreak = isStreakActive ? 6 : 5; 

  const renderStatusIcon = (status: PrayerStatus) => {
    if (status === "ON_TIME") return <CheckCircle2 className="h-4 w-4" />;
    if (status === "LATE") return <Clock className="h-4 w-4" />;
    if (status === "QADA") return <AlertCircle className="h-4 w-4" />;
    return null;
  };

  const getStatusColorClass = (status: PrayerStatus, isWife: boolean) => {
    if (!status) return "border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900";
    if (status === "ON_TIME") return isWife ? "bg-rose-500 border-rose-500 text-white shadow-sm shadow-rose-500/20" : "bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-500/20";
    if (status === "LATE") return "bg-orange-400 border-orange-400 text-white shadow-sm shadow-orange-400/20";
    if (status === "QADA") return "bg-slate-700 border-slate-700 text-white shadow-sm shadow-slate-700/20";
    return "";
  };

  return (
    <div className="min-h-screen bg-background pb-24 text-slate-800 dark:text-zinc-100 transition-colors duration-300">
      <Header />
      
      <main className="mx-auto max-w-md px-4 pt-6 flex flex-col gap-6 relative">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-xl font-black tracking-tight">Spiritual Log</h2>
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
              {isSameDay(parseISO(globalSelectedDate), new Date()) ? "Today" : format(parseISO(globalSelectedDate), "MMM d, yyyy")}
            </span>
          </div>
        </div>

        {/* Motivational Summary Card */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 to-amber-500 p-5 shadow-lg shadow-rose-500/20 text-white flex flex-col gap-4">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-black/10 blur-xl" />
          
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-black tracking-tight drop-shadow-sm">Spiritual Journey</h2>
              <p className="text-xs font-medium text-white/80 drop-shadow-sm max-w-[80%]">
                "Verily, in the remembrance of Allah do hearts find rest."
              </p>
            </div>
            <div className="flex flex-col items-center justify-center bg-white/20 backdrop-blur-md rounded-xl px-3 py-2 border border-white/20">
              <Flame className="h-5 w-5 text-amber-200 mb-0.5" />
              <span className="text-sm font-black">{currentStreak}</span>
              <span className="text-[8px] font-bold uppercase tracking-wider text-white/80">Day Streak</span>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-3 mt-2">
            <div className="flex flex-col gap-1.5 bg-black/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="uppercase tracking-wider">His Progress</span>
                <span>{husbandCompleted} / 5</span>
              </div>
              <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-300 h-full rounded-full transition-all duration-500" style={{ width: `${(husbandCompleted / 5) * 100}%` }} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 bg-black/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="uppercase tracking-wider">Her Progress</span>
                <span>{wifeCompleted} / 5</span>
              </div>
              <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-300 h-full rounded-full transition-all duration-500" style={{ width: `${(wifeCompleted / 5) * 100}%` }} />
              </div>
            </div>
          </div>
          
          {isStreakActive && (
            <div className="relative z-10 mt-1 flex items-center gap-1.5 text-[9px] font-bold text-amber-100 bg-black/10 self-start px-2 py-1 rounded-full border border-white/10">
              <CheckCircle2 className="h-3 w-3" /> Streak Secured!
            </div>
          )}
        </section>

        {/* WhatsApp Deep Link Share */}
        <button 
          onClick={handleWhatsAppShare}
          className="w-full flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-bold py-3.5 rounded-2xl border border-[#25D366]/30 transition-all active:scale-95 text-sm"
        >
          <Share2 className="h-4 w-4" /> Share Update via WhatsApp
        </button>

        {/* Daily Checklist Table */}
        <section className="glass-panel rounded-3xl p-4 shadow-sm border border-slate-100/50 dark:border-zinc-850 flex flex-col">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-zinc-100">Daily Checklist</h3>
            <button 
              onClick={resetDay}
              className="text-[10px] font-bold text-slate-400 hover:text-rose-500 dark:text-zinc-500 dark:hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="h-3 w-3" /> Reset Day
            </button>
          </div>

          <div className="flex flex-col gap-0">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-2">
              <div className="col-span-4">Prayer</div>
              <div className="col-span-2 text-center">Him</div>
              <div className="col-span-2 text-center">Her</div>
              <div className="col-span-4 text-right">Status</div>
            </div>

            {/* Table Rows */}
            {currentPrayers.map((prayer) => {
              const bothLogged = prayer.husband && prayer.wife;
              const partComplete = prayer.husband || prayer.wife;

              return (
                <div key={prayer.id} className="grid grid-cols-12 gap-2 items-center py-3 border-b border-slate-50 dark:border-zinc-800/50 last:border-0 px-2 hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors rounded-xl">
                  {/* Prayer Name & Time */}
                  <div className="col-span-4 flex flex-col">
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">{prayer.name}</span>
                    <span className="text-[9px] font-semibold text-slate-400 dark:text-zinc-500">{prayer.time}</span>
                  </div>

                  {/* Husband Checkbox */}
                  <div className="col-span-2 flex justify-center relative">
                    <button 
                      onClick={() => handleLogClick(prayer.id, prayer.name, "husband", prayer.husband)}
                      className={`h-7 w-7 rounded-[8px] flex items-center justify-center transition-all active:scale-90 border-2 ${getStatusColorClass(prayer.husband, false)}`}
                    >
                      {renderStatusIcon(prayer.husband)}
                    </button>
                  </div>

                  {/* Wife Checkbox */}
                  <div className="col-span-2 flex justify-center relative">
                    <button 
                      onClick={() => handleLogClick(prayer.id, prayer.name, "wife", prayer.wife)}
                      className={`h-7 w-7 rounded-[8px] flex items-center justify-center transition-all active:scale-90 border-2 ${getStatusColorClass(prayer.wife, true)}`}
                    >
                      {renderStatusIcon(prayer.wife)}
                    </button>
                  </div>

                  {/* Status Tag */}
                  <div className="col-span-4 flex justify-end">
                    {bothLogged ? (
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full whitespace-nowrap">
                        Both Logged
                      </span>
                    ) : partComplete ? (
                      <span className="text-[9px] font-bold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-full whitespace-nowrap">
                        Part Complete
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2 py-1 rounded-full whitespace-nowrap">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        
        {/* Logging Modal */}
        {loggingPrayer && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-widest">
                    Log {loggingPrayer.person}'s Prayer
                  </span>
                  <h3 className="text-xl font-black text-slate-800 dark:text-zinc-100">{loggingPrayer.name}</h3>
                </div>
                <button onClick={() => setLoggingPrayer(null)} className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-full text-slate-500">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <button 
                  onClick={() => submitLog("ON_TIME")}
                  className="flex items-center gap-3 p-4 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-500 rounded-2xl font-bold border border-emerald-100 dark:border-emerald-500/20 transition-all active:scale-95"
                >
                  <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-sm"><CheckCircle2 className="h-5 w-5" /></div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm">On Time</span>
                    <span className="text-[10px] font-semibold opacity-70">Prayed at the proper time</span>
                  </div>
                </button>

                <button 
                  onClick={() => submitLog("LATE")}
                  className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 text-orange-600 dark:text-orange-500 rounded-2xl font-bold border border-orange-100 dark:border-orange-500/20 transition-all active:scale-95"
                >
                  <div className="p-2 bg-orange-500 text-white rounded-xl shadow-sm"><Clock className="h-5 w-5" /></div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm">Late</span>
                    <span className="text-[10px] font-semibold opacity-70">Prayed, but delayed</span>
                  </div>
                </button>

                <button 
                  onClick={() => submitLog("QADA")}
                  className="flex items-center gap-3 p-4 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 rounded-2xl font-bold border border-slate-200 dark:border-zinc-700 transition-all active:scale-95"
                >
                  <div className="p-2 bg-slate-600 dark:bg-slate-500 text-white rounded-xl shadow-sm"><AlertCircle className="h-5 w-5" /></div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm">Missed (Qada)</span>
                    <span className="text-[10px] font-semibold opacity-70">Made up after time passed</span>
                  </div>
                </button>

                <button 
                  onClick={() => submitLog(null)}
                  className="mt-2 text-[11px] font-bold text-rose-500 hover:text-rose-600 text-center py-2"
                >
                  Clear Status / Mark Unprayed
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
      <BottomNavigation />
    </div>
  );
}
