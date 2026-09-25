"use client";

import { useState } from "react";
import { useGlobal, initialPrayers, Task } from "@/context/GlobalContext";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import WeeklyTimeline from "@/components/dashboard/weekly-timeline";
import EntryAnimation from "@/components/animations/EntryAnimation";
import CoupleLoveHero from "@/components/dashboard/CoupleLoveHero";
import CoupleQuestionWidget from "@/components/dashboard/CoupleQuestionWidget";
import CareCard from "@/components/spiritual/CareCard";
import { MOOD_CONFIGS } from "@/lib/journal";
import { 
  Heart, 
  Sparkles, 
  CheckSquare, 
  Wallet, 
  Clock, 
  Check, 
  Flame, 
  Gamepad2, 
  CalendarClock,
  BookHeart,
  Lock,
  Pencil,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { 
    relationshipMode, 
    activeUser, 
    husbandName, 
    wifeName,
    prayersByDate, 
    tasks, 
    setTasks, 
    financeTransactions, 
    liquidBalances, 
    currency, 
    globalSelectedDate,
    periodActive, 
    sharePeriodStatus,
    journalEntries
  } = useGlobal();

  const todayStr = new Date().toISOString().split("T")[0];
  const isSelectedToday = globalSelectedDate === todayStr;

  const activeTasks = tasks.filter(t => !t.completed);
  const currentTasks = tasks.filter(t => {
    if (t.due === globalSelectedDate) return true;
    if (isSelectedToday && (t.due === "Today" || !t.due)) return true;
    return false;
  });

  const toggleTaskComplete = (id: string) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        const isComp = !t.completed;
        return { ...t, completed: isComp, completedAt: isComp ? Date.now() : undefined };
      }
      return t;
    });
    setTasks(updated);
  };

  const currentPrayers = prayersByDate[globalSelectedDate] || initialPrayers;
  const pendingBills = financeTransactions.filter(t => t.type === "PENDING");
  const totalLiquid = liquidBalances.husband + liquidBalances.wife;

  return (
    <div className="min-h-screen pb-36 text-[#44342B] dark:text-zinc-100 transition-colors duration-300">
      <Header />
      
      <main className="mx-auto max-w-md px-4 pt-4 pb-12 flex flex-col gap-5">
        
        {/* 1. Signature Couple² Love, Days Together & Heartbeat Hero */}
        <CoupleLoveHero />

        {/* 2. "Discover More About Each Other" Daily Couple Question */}
        <CoupleQuestionWidget />

        {/* 2b. Shared Journal for Two (Today's Moods & Lock-Reveal Diary) */}
        {(() => {
          const todayEntry = journalEntries[todayStr];
          const hasWife = !!todayEntry?.wife;
          const hasHusband = !!todayEntry?.husband;
          const bothWrote = hasWife && hasHusband;
          const wifeMood = todayEntry?.wife?.mood ? MOOD_CONFIGS[todayEntry.wife.mood] : null;
          const husbandMood = todayEntry?.husband?.mood ? MOOD_CONFIGS[todayEntry.husband.mood] : null;
          const isSpicy = todayEntry?.wife?.mood === "SPICY" || todayEntry?.husband?.mood === "SPICY";

          return (
            <section className="glass-panel rounded-[28px] p-5 border border-[#FFE2D1] shadow-sm flex flex-col gap-3.5 transition-all hover:border-rose-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-rose-500/10 text-rose-500">
                    <BookHeart className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-[#44342B]">
                      <span className="highlight-pink font-black">Shared Journal</span> Just for Two
                    </h3>
                    <p className="text-[10px] font-bold text-[#826F66]">Today&apos;s Moods &amp; Private Diary 🍒</p>
                  </div>
                </div>

                <Link
                  href="/journal"
                  className="text-[10px] font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1 rounded-full border border-rose-200/60 transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <span>Calendar</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Mood Avatars & Status Banner */}
              <div className="flex items-center justify-between rounded-2xl bg-[#FFF9F4] p-3.5 border border-[#FFE2D1]">
                <div className="flex items-center gap-3">
                  {/* Wife Avatar Pill */}
                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-rose-100 shadow-2xs">
                    <span className="text-base">{wifeMood?.emoji || "👧"}</span>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-rose-700">{wifeName}</span>
                      <span className="text-[8px] font-bold text-[#826F66]">{wifeMood ? wifeMood.label.split(" ")[0] : "Thinking..."}</span>
                    </div>
                  </div>

                  {/* Heart / Flame Connection */}
                  <span className="text-xs">{isSpicy ? "🔥" : "🤍"}</span>

                  {/* Husband Avatar Pill */}
                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-amber-100 shadow-2xs">
                    <span className="text-base">{husbandMood?.emoji || "👦"}</span>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-amber-700">{husbandName}</span>
                      <span className="text-[8px] font-bold text-[#826F66]">{husbandMood ? husbandMood.label.split(" ")[0] : "Thinking..."}</span>
                    </div>
                  </div>
                </div>

                {/* Status Pill */}
                <div className="flex flex-col items-end">
                  <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border shadow-2xs ${
                    bothWrote
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : (hasWife || hasHusband)
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-rose-50 text-rose-600 border-rose-200"
                  }`}>
                    {bothWrote ? "Unlocked ✨" : (hasWife || hasHusband) ? "1 Waiting 🔒" : "Write Today ✍️"}
                  </span>
                </div>
              </div>
            </section>
          );
        })()}

        {/* 3. Weekly Timeline */}
        <section className="glass-panel rounded-[28px] p-5 shadow-sm border border-[#FFE2D1]">
          <WeeklyTimeline />
        </section>

        {/* 4. Husband Care Mode (Appears on Husband's Dashboard when Wife's Period is active) */}
        {activeUser === "HUSBAND" && periodActive && sharePeriodStatus && (
          <CareCard />
        )}

        {/* 5. Spiritual & Prayer Rhythm Card */}
        <section className="glass-panel rounded-[28px] p-5 border border-[#FFE2D1] shadow-sm flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-rose-500/10 text-rose-500">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-black text-[#44342B] dark:text-zinc-200">
                <span className="highlight-pink font-black">Daily Prayers</span> &amp; Spiritual Sync
              </h3>
            </div>
            <Link 
              href="/spiritual" 
              className="text-[10px] font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 px-2.5 py-1 rounded-full border border-rose-200/60 transition-colors"
            >
              Open Tracker →
            </Link>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[9px] text-[#826F66] dark:text-zinc-400 uppercase border-b border-rose-100/60 dark:border-zinc-800 pb-1.5">
              <div className="col-span-3 text-left">Prayer</div>
              <div>Him</div>
              <div>Her</div>
              <div className="col-span-2 text-right">Status</div>
            </div>

            {currentPrayers.map((prayer) => (
              <div key={prayer.name} className="grid grid-cols-7 gap-1 items-center py-1 text-xs">
                <span className="col-span-3 font-extrabold text-[#44342B] dark:text-zinc-300">{prayer.name}</span>
                
                <div className="flex justify-center">
                  <div className={`h-5 w-5 rounded-lg border flex items-center justify-center transition-all ${
                    prayer.husband 
                      ? "bg-amber-500 border-amber-500 text-white shadow-2xs" 
                      : "border-slate-200 dark:border-zinc-800 bg-white"
                  }`}>
                    {prayer.husband && <span className="text-[10px] font-black">✓</span>}
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className={`h-5 w-5 rounded-lg border flex items-center justify-center transition-all ${
                    prayer.wife 
                      ? "bg-rose-500 border-rose-500 text-white shadow-2xs" 
                      : "border-slate-200 dark:border-zinc-800 bg-white"
                  }`}>
                    {prayer.wife && <span className="text-[10px] font-black">✓</span>}
                  </div>
                </div>

                <div className="col-span-2 text-right">
                  {prayer.husband && prayer.wife ? (
                    <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Joint Complete
                    </span>
                  ) : prayer.husband || prayer.wife ? (
                    <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      1/2 Done
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-50 dark:bg-zinc-850 px-2 py-0.5 rounded-full">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Shared Tasks & Chores Widget */}
        <section className="glass-panel rounded-[28px] p-5 border border-[#FFE2D1] shadow-sm flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600">
                <CheckSquare className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-black text-[#44342B] dark:text-zinc-200">
                <span className="highlight-yellow font-black">Shared To-Dos</span> &amp; Chores
              </h3>
            </div>
            <Link 
              href="/tasks" 
              className="text-[10px] font-extrabold text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 px-2.5 py-1 rounded-full border border-amber-200/60 transition-colors"
            >
              Manage Tasks →
            </Link>
          </div>

          {currentTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-4 text-slate-400 dark:text-zinc-500">
              <CheckSquare className="h-6 w-6 mb-2 opacity-30 text-amber-500" />
              <span className="text-xs font-bold text-[#826F66]">
                {activeTasks.length > 0 ? `${activeTasks.length} active tasks scheduled` : "All caught up! 0 active tasks"}
              </span>
              <Link 
                href="/tasks" 
                className="mt-2 text-[10px] font-black bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-1.5 rounded-full shadow-sm shadow-amber-500/20 transition-all active:scale-95"
              >
                {activeTasks.length > 0 ? "View All Tasks" : "+ Add a Task"}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {currentTasks.map((task) => (
                <div key={task.id || task.title} className="flex items-start justify-between p-3 rounded-2xl bg-white/95 dark:bg-zinc-900/60 border border-[#FFE2D1]/80 hover:border-amber-300 transition-colors shadow-2xs">
                  <div className="flex items-start gap-2.5 max-w-[70%]">
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`h-5 w-5 mt-0.5 rounded-lg border flex items-center justify-center flex-shrink-0 transition-all active:scale-90 ${
                        task.completed 
                          ? "bg-amber-500 border-amber-500 text-white" 
                          : "border-slate-300 dark:border-zinc-700 hover:border-amber-500 bg-white"
                      }`}
                      aria-label="Toggle task completion"
                    >
                      {task.completed && <Check className="h-3 w-3 stroke-[3]" />}
                    </button>
                    <div className="flex flex-col gap-0.5">
                      <span className={`text-xs font-bold line-clamp-1 transition-all ${task.completed ? "line-through text-slate-400" : "text-[#44342B] dark:text-zinc-200"}`}>
                        {task.title}
                      </span>
                      <span className="text-[9px] font-bold text-[#826F66]">{task.category}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${
                      task.urgency === "HIGH" 
                        ? "bg-rose-500/10 text-rose-500" 
                        : task.urgency === "MEDIUM" 
                        ? "bg-amber-500/10 text-amber-600" 
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {task.urgency}
                    </span>
                    <span className="text-[9px] font-bold text-[#826F66] flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" /> {task.due}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 7. Finance & Liquid Wealth Card */}
        <section className="glass-panel rounded-[28px] p-5 border border-[#FFE2D1] shadow-sm flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                <Wallet className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-black text-[#44342B] dark:text-zinc-200">
                <span className="highlight-mint font-black">Shared Finances</span> &amp; Bills
              </h3>
            </div>
            <Link 
              href="/finance" 
              className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-200/60 transition-colors"
            >
              Go to Finance →
            </Link>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50/50 border border-emerald-100">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">Combined Liquid Balance</span>
              <span className="text-lg font-black text-emerald-900">{currency}{totalLiquid.toLocaleString()}</span>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white text-emerald-700 shadow-2xs border border-emerald-100">
              {pendingBills.length} Bills Pending
            </span>
          </div>
        </section>

        {/* 8. Virtual Dates & Activities Widget (when in LDR or relaxing) */}
        <section className="glass-panel rounded-[28px] p-5 border border-[#FFE2D1] shadow-sm flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-600">
                <Gamepad2 className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-black text-[#44342B] dark:text-zinc-200">
                <span className="highlight-blue font-black">Cozy Couple</span> Activities &amp; Games
              </h3>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            <a href="https://skribbl.io" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/95 border border-[#FFE2D1] hover:border-purple-300 transition-all active:scale-95 group shadow-2xs">
              <span className="text-xl mb-0.5 group-hover:scale-110 transition-transform">🎨</span>
              <span className="text-[9px] font-black text-[#44342B]">Draw</span>
            </a>
            
            <a href="https://www.chess.com/play/online/friends" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/95 border border-[#FFE2D1] hover:border-purple-300 transition-all active:scale-95 group shadow-2xs">
              <span className="text-xl mb-0.5 group-hover:scale-110 transition-transform">♟️</span>
              <span className="text-[9px] font-black text-[#44342B]">Chess</span>
            </a>

            <a href="https://playingcards.io/" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/95 border border-[#FFE2D1] hover:border-purple-300 transition-all active:scale-95 group shadow-2xs">
              <span className="text-xl mb-0.5 group-hover:scale-110 transition-transform">🃏</span>
              <span className="text-[9px] font-black text-[#44342B]">Cards</span>
            </a>

            <a href="https://codenames.game/" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/95 border border-[#FFE2D1] hover:border-purple-300 transition-all active:scale-95 group shadow-2xs">
              <span className="text-xl mb-0.5 group-hover:scale-110 transition-transform">🕵️</span>
              <span className="text-[9px] font-black text-[#44342B]">Words</span>
            </a>
          </div>
        </section>

      </main>

      <BottomNavigation />
      <EntryAnimation />
    </div>
  );
}
