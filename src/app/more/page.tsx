"use client";

import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { ShoppingCart, Dumbbell, ShieldAlert, PhoneCall, ChevronRight, CheckSquare, Activity, BookHeart, Flame, Sparkles, Heart } from "lucide-react";
import Link from "next/link";
import { useGlobal } from "@/context/GlobalContext";

export default function MoreIndex() {
  const { pantryItems, workoutsByDate, nutritionByDate, callsByDate, vaultRecords, tasks, globalSelectedDate, journalEntries } = useGlobal();

  const currentWorkouts = workoutsByDate[globalSelectedDate] || [];
  const currentNutrition = nutritionByDate[globalSelectedDate] || { husband: { protein: 0, proteinGoal: 150 }, wife: { protein: 0, proteinGoal: 100 } };
  
  const hPercent = (currentNutrition.husband.protein / currentNutrition.husband.proteinGoal) * 100;
  const wPercent = (currentNutrition.wife.protein / currentNutrition.wife.proteinGoal) * 100;
  const avgFitness = Math.round((hPercent + wPercent) / 2) || 0;
  
  const currentCalls = callsByDate[globalSelectedDate] || [];
  const dueCalls = currentCalls.filter(c => c.status === "Due").length;
  const activeCalls = currentCalls.length;
  
  const uncheckedPantry = pantryItems.filter(i => !i.checked).length;
  const activeTasks = tasks.filter(t => !t.completed);
  const highPriorityActive = activeTasks.filter(t => t.urgency === "HIGH").length;
  const taskStatus = 
    activeTasks.length === 0 
      ? (tasks.length > 0 ? "All completed ✅" : "0 active tasks")
      : highPriorityActive > 0 
        ? `${highPriorityActive} high priority` 
        : `${activeTasks.length} active ${activeTasks.length === 1 ? "task" : "tasks"}`;

  const totalDiaries = Object.keys(journalEntries || {}).length;

  const modules = [
    {
      id: "journal",
      title: "Shared Journal for Two 🍒",
      desc: "Daily mood avatars, private diary notes & lock-reveal entries.",
      status: `${totalDiaries} memories logged`,
      icon: BookHeart,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      tagColor: "text-rose-600 bg-rose-50 border-rose-200",
      href: "/journal"
    },
    {
      id: "view_of_love",
      title: "View of Love & Spicy Chemistry 🔥",
      desc: "Compatibility gauges, flirty tests & couple discussion threads.",
      status: "4 tests active • 100% Match",
      icon: Flame,
      color: "text-red-500",
      bg: "bg-red-500/10",
      tagColor: "text-red-600 bg-red-50 border-red-200",
      href: "/view-of-love"
    },
    {
      id: "tasks",
      title: "Shared Tasks & Chores",
      desc: "Track daily tasks, priorities and home chores.",
      status: taskStatus,
      icon: CheckSquare,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      tagColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
      href: "/tasks"
    },
    {
      id: "pantry",
      title: "Pantry & Grocery Sync",
      desc: "Syncs a shared shopping list.",
      status: `${uncheckedPantry} items left`,
      icon: ShoppingCart,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      tagColor: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
      href: "/more/pantry"
    },
    {
      id: "fitness",
      title: "Fitness & Health Hub",
      desc: "Track workouts, protein targets, and cycle care.",
      status: `${currentWorkouts.length} workouts, ${avgFitness}% protein`,
      icon: Activity,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      tagColor: "text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20",
      href: "/health"
    },
    {
      id: "network",
      title: "Family & Network Log",
      desc: "Reminder calendar for important parent outreach.",
      status: dueCalls > 0 ? `${dueCalls} calls due` : `${activeCalls} scheduled`,
      icon: PhoneCall,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      tagColor: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
      href: "/more/network"
    },
    {
      id: "vault",
      title: "Secure Vault Index",
      desc: "Lookup cabinet locations for physical contracts/IDs.",
      status: `${vaultRecords.length} records indexed`,
      icon: ShieldAlert,
      color: "text-slate-700 dark:text-slate-300",
      bg: "bg-slate-800/10 dark:bg-slate-700/20",
      tagColor: "text-slate-600 bg-slate-100 dark:bg-zinc-800 dark:text-zinc-300 border-slate-200 dark:border-zinc-700",
      href: "/more/vault"
    },
  ];

  return (
    <div className="min-h-screen pb-36 text-[#44342B] dark:text-zinc-100 transition-colors duration-300">
      <Header />
      
      <main className="mx-auto max-w-md px-4 pt-4 flex flex-col gap-5">
        
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-wider text-rose-500">
            Subsystems &amp; Indices
          </span>
          <h2 className="text-lg font-black text-[#44342B] dark:text-zinc-100">
            <span className="highlight-pink font-black">Household Modules</span>
          </h2>
        </div>

        <section className="flex flex-col gap-3">
          {modules.map(mod => (
            <Link key={mod.id} href={mod.href} className="group relative glass-panel rounded-[26px] p-4.5 shadow-sm border border-[#FFE2D1] dark:border-zinc-850 flex items-center justify-between overflow-hidden transition-all hover:border-rose-300 dark:hover:border-zinc-700 hover:shadow-md active:scale-98">
              
              <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-rose-50/50 dark:bg-zinc-900/50 group-hover:scale-150 transition-all duration-500 -z-10" />

              <div className="flex items-start gap-3.5">
                <div className={`p-3 rounded-2xl ${mod.bg} ${mod.color} shrink-0`}>
                  <mod.icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-xs font-black text-[#44342B] dark:text-zinc-200 group-hover:text-rose-600 transition-colors">{mod.title}</h3>
                  <p className="text-[10px] font-semibold text-[#826F66] dark:text-zinc-500 line-clamp-1">{mod.desc}</p>
                  
                  <span className={`self-start mt-1 text-[9px] font-black px-2.5 py-0.5 rounded-full border ${mod.tagColor}`}>
                    {mod.status}
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0 text-slate-300 group-hover:text-rose-500 transition-colors">
                <ChevronRight className="h-5 w-5" />
              </div>
            </Link>
          ))}
        </section>

      </main>
      <BottomNavigation />
    </div>
  );
}
