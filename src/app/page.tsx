"use client";

import { useState, useEffect } from "react";
import { useGlobal } from "@/context/GlobalContext";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import WeeklyTimeline from "@/components/dashboard/weekly-timeline";
import QuickActions from "@/components/dashboard/quick-actions";
import { 
  Heart, Sparkles, CheckSquare, Wallet, Dumbbell, 
  ShoppingCart, PhoneCall, ShieldAlert, Utensils, Flame,
  Clock, HeartHandshake, CalendarClock, Check, Inbox
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { 
    relationshipMode, activeUser, husbandName, wifeName,
    prayers, tasks, bills
  } = useGlobal();
  
  const [hugsCount, setHugsCount] = useState(0);
  const [kissesCount, setKissesCount] = useState(0);

  const [hugSentLocal, setHugSentLocal] = useState(false);
  const [kissSentLocal, setKissSentLocal] = useState(false);

  const handleSendHug = () => {
    setHugsCount(hugsCount + 1);
    setHugSentLocal(true);
    setTimeout(() => setHugSentLocal(false), 2000);
  };

  const handleSendKiss = () => {
    setKissesCount(kissesCount + 1);
    setKissSentLocal(true);
    setTimeout(() => setKissSentLocal(false), 2000);
  };

  const partnerName = activeUser === "HUSBAND" ? wifeName : husbandName;

  // Since we don't have meals, fitness, groceries global state fully built yet, 
  // we will just show empty arrays for them to fulfill the "clean slate" requirement.
  const groceries: any[] = [];
  const familyOutreach: any[] = [];
  const vaultIndex: any[] = [];

  const totalSaved = (bills || []).reduce((acc, curr) => acc + curr.amount, 0); // mockup metric

  return (
    <div className="min-h-screen bg-background pb-24 text-slate-800 dark:text-zinc-100 transition-colors duration-300">
      <Header />
      
      <main className="mx-auto max-w-md px-4 pt-4 flex flex-col gap-6">
        
        {/* Weekly Timeline */}
        <section className="glass-panel rounded-2xl p-4 shadow-sm">
          <WeeklyTimeline />
        </section>

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
            <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Household Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Meal Widget - Empty State */}
            <div className="col-span-2 glass-panel rounded-2xl p-4 border border-slate-100/50 shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500">
                    <Utensils className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Today's Meals
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center py-4 text-slate-400 dark:text-zinc-500">
                <Inbox className="h-6 w-6 mb-2 opacity-50" />
                <span className="text-xs font-medium">No meals planned for today</span>
                <button className="mt-2 text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
                  Plan a Meal
                </button>
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
            {prayers.map((prayer) => (
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

          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-4 text-slate-400 dark:text-zinc-500">
              <CheckSquare className="h-6 w-6 mb-2 opacity-30" />
              <span className="text-xs font-medium">0 Active Tasks</span>
              <Link href="/tasks" className="mt-2 text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors">
                + Add a Task
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {tasks.map((task) => (
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

          {bills.length === 0 ? (
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
              {bills.map((bill) => (
                <div key={bill.name} className="flex items-center justify-between py-1 text-xs border-b border-slate-50 dark:border-zinc-800 last:border-0">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300">{bill.name}</span>
                    <span className="text-[9px] text-slate-400 dark:text-zinc-500">{bill.due}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-slate-800 dark:text-zinc-100">${bill.amount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      <QuickActions />
      <BottomNavigation />
    </div>
  );
}
