"use client";

import { useState, useEffect } from "react";
import { useGlobal } from "@/context/GlobalContext";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import WeeklyTimeline from "@/components/dashboard/weekly-timeline";
import QuickActions from "@/components/dashboard/quick-actions";
import EntryAnimation from "@/components/animations/EntryAnimation";
import { 
  Heart, Sparkles, CheckSquare, Wallet, Dumbbell, 
  ShoppingCart, PhoneCall, ShieldAlert, Utensils, Flame,
  Clock, HeartHandshake, CalendarClock, Check, Inbox, Gamepad2
} from "lucide-react";
import Link from "next/link";
import { initialPrayers } from "@/context/GlobalContext";
import CareCard from "@/components/spiritual/CareCard";

export default function Dashboard() {
  const { 
    relationshipMode, activeUser, husbandName, wifeName,
    husbandPhoto, wifePhoto, husbandLocation, wifeLocation, husbandTimezone, wifeTimezone,
    prayersByDate, tasks, financeTransactions, liquidBalances, currency, sendInteraction, globalSelectedDate,
    periodActive, sharePeriodStatus
  } = useGlobal();
  
  const [hugsCount, setHugsCount] = useState(0);
  const [kissesCount, setKissesCount] = useState(0);

  const [hugSentLocal, setHugSentLocal] = useState(false);
  const [kissSentLocal, setKissSentLocal] = useState(false);

  const currentTasks = tasks.filter(t => t.due === globalSelectedDate);
  const currentPrayers = prayersByDate[globalSelectedDate] || initialPrayers;

  const handleSendHug = () => {
    setHugsCount(hugsCount + 1);
    setHugSentLocal(true);
    sendInteraction("HUG");
    setTimeout(() => setHugSentLocal(false), 2000);
  };

  const handleSendKiss = () => {
    setKissesCount(kissesCount + 1);
    setKissSentLocal(true);
    sendInteraction("KISS");
    setTimeout(() => setKissSentLocal(false), 2000);
  };

  const partnerName = activeUser === "HUSBAND" ? wifeName : husbandName;

  // Since we don't have meals, fitness, groceries global state fully built yet, 
  // we will just show empty arrays for them to fulfill the "clean slate" requirement.
  const groceries: any[] = [];
  const familyOutreach: any[] = [];
  const vaultIndex: any[] = [];

  const pendingBills = financeTransactions.filter(t => t.type === "PENDING");
  const totalLiquid = liquidBalances.husband + liquidBalances.wife;

  return (
    <div className="min-h-screen bg-background pb-32 text-slate-800 dark:text-zinc-100 transition-colors duration-300">
      <Header />
      
      <main className="mx-auto max-w-md px-4 pt-4 flex flex-col gap-5">
        
        {/* Couple Presence & DP Avatar Hero Card */}
        <section className="glass-panel rounded-3xl p-4.5 border border-slate-100/60 dark:border-zinc-850 shadow-sm bg-gradient-to-br from-rose-50/40 via-white to-amber-50/30 dark:from-rose-950/15 dark:via-zinc-900 dark:to-amber-950/15 flex items-center justify-between">
          {/* Husband Avatar & Name */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-lg font-black text-white shadow-md shadow-amber-500/20 border-2 border-white dark:border-zinc-800">
                {husbandPhoto ? (
                  <img src={husbandPhoto} alt={husbandName} className="h-full w-full object-cover" />
                ) : (
                  (husbandName || "H").charAt(0).toUpperCase()
                )}
              </div>
              {activeUser === "HUSBAND" && (
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900" title="Active" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-800 dark:text-zinc-100 leading-tight">{husbandName}</span>
              <span className="text-[10px] font-semibold text-slate-400">{husbandLocation?.city || "Dubai"}</span>
            </div>
          </div>

          {/* Center Connection Icon / Tap for Love */}
          <div className="flex flex-col items-center gap-1 px-2">
            <button
              onClick={handleSendKiss}
              title="Tap to blow a kiss!"
              className="p-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-all active:scale-90"
            >
              <Heart className="h-4 w-4 fill-rose-500 animate-pulse" />
            </button>
            <span className="text-[8px] font-black uppercase tracking-wider text-rose-400">Together</span>
          </div>

          {/* Wife Avatar & Name */}
          <div className="flex items-center gap-3 text-right">
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-800 dark:text-zinc-100 leading-tight">{wifeName}</span>
              <span className="text-[10px] font-semibold text-slate-400">{wifeLocation?.city || "Mumbai"}</span>
            </div>
            <div className="relative">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-lg font-black text-white shadow-md shadow-rose-500/20 border-2 border-white dark:border-zinc-800">
                {wifePhoto ? (
                  <img src={wifePhoto} alt={wifeName} className="h-full w-full object-cover" />
                ) : (
                  (wifeName || "W").charAt(0).toUpperCase()
                )}
              </div>
              {activeUser === "WIFE" && (
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900" title="Active" />
              )}
            </div>
          </div>
        </section>

        {/* Weekly Timeline */}
        <section className="glass-panel rounded-2xl p-4 shadow-sm">
          <WeeklyTimeline />
        </section>

        {/* Husband Care Mode (Appears on Husband's Dashboard when Wife's Period is active) */}
        {activeUser === "HUSBAND" && periodActive && sharePeriodStatus && (
          <CareCard />
        )}

        {/* LDR Mode Connection Corner */}
        {relationshipMode === "DISTANCE" && (
          <section className="glass-panel rounded-2xl p-4 border border-rose-100/50 dark:border-rose-900/20 shadow-sm flex flex-col gap-3.5 bg-gradient-to-r from-rose-500/5 to-amber-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                  <HeartHandshake className="h-4 w-4 fill-rose-500/20" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">LDR Connection Corner</span>
              </div>
              <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Virtual Hugs
              </span>
            </div>

            {/* Micro Interaction Hug/Kiss Counters */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSendHug}
                disabled={hugSentLocal}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all shadow-sm ${
                  hugSentLocal 
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" 
                    : "bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-850 active:scale-95"
                }`}
              >
                {hugSentLocal ? (
                  <>
                    <Check className="h-6 w-6 text-emerald-500 mb-1" />
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Sent to {partnerName}!</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl">🤗</span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 mt-1">Send a Virtual Hug</span>
                    <span className="text-xs font-black text-rose-500 dark:text-rose-455 mt-0.5">{hugsCount} Sent</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleSendKiss}
                disabled={kissSentLocal}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all shadow-sm ${
                  kissSentLocal 
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" 
                    : "bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-850 active:scale-95"
                }`}
              >
                {kissSentLocal ? (
                  <>
                    <Check className="h-6 w-6 text-emerald-500 mb-1" />
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Sent to {partnerName}!</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl">😘</span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 mt-1">Blow a Kiss</span>
                    <span className="text-xs font-black text-rose-500 dark:text-rose-455 mt-0.5">{kissesCount} Sent</span>
                  </>
                )}
              </button>
            </div>
          </section>
        )}

        {/* 1. Daily Snapshot (Command Center) */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Today's Overview
            </h2>
            <div className="glass-panel p-3 rounded-xl border border-slate-100/50 flex flex-col items-center justify-center gap-1 shadow-sm">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Liquid Wealth</span>
              <span className="text-xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">{currency}{totalLiquid.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
            </div>
            <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Household Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* LDR Games & Dates Widget */}
            <div className="col-span-2 glass-panel rounded-2xl p-4 border border-slate-100/50 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                    <Gamepad2 className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    LDR Virtual Dates
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-1">
                <a href="https://skribbl.io" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all active:scale-95 group">
                  <div className="text-xl mb-1 group-hover:scale-110 transition-transform">🎨</div>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 group-hover:text-indigo-500">Skribbl.io</span>
                </a>
                
                <a href="https://www.chess.com/play/online/friends" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all active:scale-95 group">
                  <div className="text-xl mb-1 group-hover:scale-110 transition-transform">♟️</div>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 group-hover:text-indigo-500">Chess.com</span>
                </a>

                <a href="https://playingcards.io/" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all active:scale-95 group">
                  <div className="text-xl mb-1 group-hover:scale-110 transition-transform">🃏</div>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 group-hover:text-indigo-500">Card Games</span>
                </a>

                <a href="https://codenames.game/" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all active:scale-95 group">
                  <div className="text-xl mb-1 group-hover:scale-110 transition-transform">🕵️</div>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 group-hover:text-indigo-500">Codenames</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Spiritual Tracker */}
        <section className="glass-panel rounded-2xl p-4 border border-slate-100/50 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                <Heart className="h-4 w-4 fill-rose-500/20" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Spiritual Tracker</span>
            </div>
            <Link href="/spiritual" className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full hover:bg-amber-500/20 transition-colors">
              Open Tracker
            </Link>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[9px] text-slate-400 dark:text-zinc-500 uppercase border-b border-slate-100 dark:border-zinc-800 pb-1.5">
              <div className="col-span-3 text-left">Prayer</div>
              <div>Him</div>
              <div>Her</div>
              <div className="col-span-2 text-right">Status</div>
            </div>
            {currentPrayers.map((prayer) => (
              <div key={prayer.name} className="grid grid-cols-7 gap-1 items-center py-0.5 text-xs">
                <span className="col-span-3 font-semibold text-slate-600 dark:text-zinc-400">{prayer.name}</span>
                <div className="flex justify-center">
                  <div className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center transition-all ${
                    prayer.husband 
                      ? "bg-amber-500/10 border-amber-500 text-amber-500" 
                      : "border-slate-200 dark:border-zinc-800"
                  }`}>
                    {prayer.husband && <span className="text-[10px] font-black">✓</span>}
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center transition-all ${
                    prayer.wife 
                      ? "bg-rose-500/10 border-rose-500 text-rose-500" 
                      : "border-slate-200 dark:border-zinc-800"
                  }`}>
                    {prayer.wife && <span className="text-[10px] font-black">✓</span>}
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  {prayer.husband && prayer.wife ? (
                    <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">Joint Complete</span>
                  ) : prayer.husband || prayer.wife ? (
                    <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full">1/2 Complete</span>
                  ) : (
                    <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 dark:bg-zinc-850 px-1.5 py-0.5 rounded-full">Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Task & Reminder Engine */}
        <section className="glass-panel rounded-2xl p-4 border border-slate-100/50 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                <CheckSquare className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Shared To-Dos</span>
            </div>
            <Link href="/tasks" className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full hover:bg-slate-200 transition-colors">
              Manage Tasks
            </Link>
          </div>

          {currentTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-4 text-slate-400 dark:text-zinc-500">
              <CheckSquare className="h-6 w-6 mb-2 opacity-30" />
              <span className="text-xs font-medium">0 Tasks</span>
              <Link href="/tasks" className="mt-2 text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors">
                + Add a Task
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {currentTasks.map((task) => (
                <div key={task.title} className="flex items-start justify-between p-2 rounded-xl bg-slate-50/80 dark:bg-zinc-900/50 border border-slate-100/10">
                  <div className="flex flex-col gap-0.5 max-w-[70%]">
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-200 line-clamp-1">{task.title}</span>
                    <span className="text-[9px] text-slate-400 dark:text-zinc-500">{task.category}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      task.urgency === "HIGH" 
                        ? "bg-rose-500/10 text-rose-500" 
                        : task.urgency === "MEDIUM" 
                        ? "bg-amber-500/10 text-amber-500" 
                        : "bg-slate-350/20 text-slate-600 dark:text-zinc-400"
                    }`}>
                      {task.urgency}
                    </span>
                    <span className="text-[9px] font-medium text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" /> {task.due}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. Finance & Bills Manager */}
        <section className="glass-panel rounded-2xl p-4 border border-slate-100/50 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Wallet className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Finance & Bills</span>
            </div>
            <Link href="/finance" className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full hover:bg-emerald-500/20">
              Go to Finance
            </Link>
          </div>

          {pendingBills.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-4 text-slate-400 dark:text-zinc-500">
               <Wallet className="h-6 w-6 mb-2 opacity-30" />
               <span className="text-xs font-medium">No pending bills</span>
               <Link href="/finance" className="mt-2 text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1.5 rounded-full transition-colors">
                 + Add Bill
               </Link>
             </div>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mt-1">Pending Bills</span>
              {pendingBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between py-1 text-xs border-b border-slate-50 dark:border-zinc-800 last:border-0">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300">{bill.name}</span>
                    <span className="text-[9px] text-slate-400 dark:text-zinc-500 mt-0.5">{bill.date}</span>
                  </div>
                  <span className="font-black text-slate-800 dark:text-zinc-100">{currency}{bill.amount}</span>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      <QuickActions />
      <BottomNavigation />
      <EntryAnimation />
    </div>
  );
}
