"use client";

import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { ShoppingCart, Dumbbell, ShieldAlert, PhoneCall, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useGlobal } from "@/context/GlobalContext";

export default function MoreIndex() {
  const { pantryItems, workoutsByDate, nutritionByDate, callsByDate, vaultRecords, globalSelectedDate } = useGlobal();

  const currentWorkouts = workoutsByDate[globalSelectedDate] || [];
  const currentNutrition = nutritionByDate[globalSelectedDate] || { husband: { protein: 0, proteinGoal: 150 }, wife: { protein: 0, proteinGoal: 100 } };
  
  const hPercent = (currentNutrition.husband.protein / currentNutrition.husband.proteinGoal) * 100;
  const wPercent = (currentNutrition.wife.protein / currentNutrition.wife.proteinGoal) * 100;
  const avgFitness = Math.round((hPercent + wPercent) / 2) || 0;
  
  const currentCalls = callsByDate[globalSelectedDate] || [];
  const dueCalls = currentCalls.filter(c => c.status === "Due").length;
  const activeCalls = currentCalls.length;
  
  const uncheckedPantry = pantryItems.filter(i => !i.checked).length;

  const modules = [
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
      desc: "Track shared/individual workouts, protein targets.",
      status: `${currentWorkouts.length} workouts, ${avgFitness}% protein`,
      icon: Dumbbell,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      tagColor: "text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20",
      href: "/more/fitness"
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
    <div className="min-h-screen bg-background pb-24 text-slate-800 dark:text-zinc-100 transition-colors duration-300">
      <Header />
      
      <main className="mx-auto max-w-md px-4 pt-6 flex flex-col gap-6">
        
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-zinc-100">Household Modules</h2>
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Access secondary sub-systems and indices.</p>
        </div>

        <section className="flex flex-col gap-3">
          {modules.map(mod => (
            <Link key={mod.id} href={mod.href} className="group relative glass-panel rounded-2xl p-4 shadow-sm border border-slate-100/50 dark:border-zinc-850 flex items-center justify-between overflow-hidden transition-all hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-md active:scale-95">
              
              <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-slate-50 dark:bg-zinc-900/50 group-hover:scale-150 transition-all duration-500 -z-10" />

              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl ${mod.bg} ${mod.color}`}>
                  <mod.icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-200 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">{mod.title}</h3>
                  <p className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 line-clamp-1">{mod.desc}</p>
                  
                  <span className={`self-start mt-0.5 text-[9px] font-bold px-2 py-0.5 rounded-md border ${mod.tagColor}`}>
                    {mod.status}
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0 text-slate-300 group-hover:text-amber-500 transition-colors">
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
