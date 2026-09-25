"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { PhoneCall, Calendar, Plus, Trash2, ArrowLeft, Heart, Sparkles, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobal } from "@/context/GlobalContext";
import { format, parseISO, isSameDay } from "date-fns";

export default function NetworkPage() {
  const { callsByDate, setCallsByDate, globalSelectedDate, sendInteraction } = useGlobal();

  const outreaches = callsByDate[globalSelectedDate] || [];

  const [newName, setNewName] = useState("");
  const [newRelation, setNewRelation] = useState("Husband Parents");
  const [newFreq, setNewFreq] = useState("7");

  const handleAddOutreach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newLog = {
      id: Date.now(),
      name: newName.trim(),
      relation: newRelation,
      lastContacted: "Never",
      frequency: parseInt(newFreq),
      due: "Today",
      status: "Due"
    };

    setCallsByDate({
      ...callsByDate,
      [globalSelectedDate]: [...outreaches, newLog]
    });
    
    sendInteraction("TASK_ALERT", `Scheduled family call: ${newName.trim()} (${newRelation}) 📞`);
    setNewName("");
  };

  const deleteOutreach = (id: number) => {
    setCallsByDate({
      ...callsByDate,
      [globalSelectedDate]: outreaches.filter(o => o.id !== id)
    });
  };

  const markContacted = (id: number) => {
    const target = outreaches.find(o => o.id === id);
    setCallsByDate({
      ...callsByDate,
      [globalSelectedDate]: outreaches.map(o => 
        o.id === id ? { ...o, lastContacted: "Just now", due: "Next week", status: "Active" } : o
      )
    });
    if (target) {
      sendInteraction("TASK_ALERT", `Completed family call with ${target.name} (${target.relation}) 📞✨`);
    }
  };

  return (
    <div className="min-h-screen pb-36 text-[#44342B] dark:text-zinc-100 transition-colors duration-300">
      <Header />
      
      <main className="mx-auto max-w-md px-4 pt-4 flex flex-col gap-5">
        
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/more" className="p-1.5 hover:bg-rose-50 rounded-xl text-[#826F66] transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="text-sm font-black text-[#44342B] dark:text-zinc-100">
              <span className="highlight-blue font-black">Family &amp; Network</span> Log
            </span>
          </div>
          <span className="text-[10px] font-extrabold text-[#826F66]">
            {isSameDay(parseISO(globalSelectedDate), new Date()) ? "Today" : format(parseISO(globalSelectedDate), "MMM d, yyyy")}
          </span>
        </div>

        {/* Motivation outreach call */}
        <section className="bg-gradient-to-br from-rose-500 to-amber-500 text-white rounded-[28px] p-5 shadow-lg shadow-rose-500/10 flex flex-col gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-rose-100 flex items-center gap-1.5">
            <Heart className="h-4 w-4 text-white fill-white" /> Family outreach Sync
          </span>
          <p className="text-xs font-medium leading-relaxed mt-1">
            &ldquo;Family is not an important thing. It&apos;s everything.&rdquo; BetterHalf reminds you to stay in close contact with your parents, siblings, and loved ones.
          </p>
        </section>

        {/* Log Outreach Form */}
        <section className="glass-panel rounded-[28px] p-5 border border-[#FFE2D1] shadow-sm flex flex-col gap-3.5">
          <h3 className="text-[10px] font-black uppercase tracking-wider text-[#826F66]">
            Add Family Reminder
          </h3>
          <form onSubmit={handleAddOutreach} className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Name (e.g. Grandma, Uncle Dave)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-[2] text-xs font-medium px-3 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <select
                value={newFreq}
                onChange={(e) => setNewFreq(e.target.value)}
                className="flex-1 text-[10px] font-bold px-2 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg focus:outline-none"
              >
                <option value="7">Every 7d</option>
                <option value="14">Every 14d</option>
                <option value="30">Every 30d</option>
              </select>
            </div>
            <div className="flex justify-between items-center gap-3">
              <select
                value={newRelation}
                onChange={(e) => setNewRelation(e.target.value)}
                className="text-[10px] font-bold px-2 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg focus:outline-none"
              >
                <option value="Husband Parents">Husband Parents</option>
                <option value="Wife Parents">Wife Parents</option>
                <option value="Extended Family">Extended Family</option>
              </select>
              <button
                type="submit"
                className="py-2.5 px-5 bg-gradient-to-tr from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-rose-500/10"
              >
                <Plus className="h-4 w-4" /> Add Reminder
              </button>
            </div>
          </form>
        </section>

        {/* Outreaches Status List */}
        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Outreach Calendar
          </h3>

          <div className="flex flex-col gap-2.5">
            {outreaches.map((outreach) => (
              <div key={outreach.id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900/80 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm">
                <div className="flex flex-col gap-1 max-w-[70%]">
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">{outreach.name}</span>
                  <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-extrabold uppercase">{outreach.relation} • every {outreach.frequency} days</span>
                  <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-medium">Last contacted: <span className="font-bold">{outreach.lastContacted}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={cn(
                      "text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider",
                      outreach.status === "Due" 
                        ? "bg-rose-500/10 text-rose-500 animate-pulse" 
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400"
                    )}>
                      {outreach.status === "Due" ? "Call Due" : "Active"}
                    </span>
                    <button
                      onClick={() => markContacted(outreach.id)}
                      className="text-[9px] font-extrabold border border-slate-200 hover:bg-slate-50 dark:border-zinc-800 px-2 py-1 rounded-lg flex items-center gap-1 transition-all"
                    >
                      <CheckCircle className="h-3 w-3 text-emerald-500" /> Log Call
                    </button>
                  </div>
                  <button 
                    onClick={() => deleteOutreach(outreach.id)}
                    className="p-1 hover:bg-slate-50 dark:hover:bg-zinc-850 rounded-lg text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <BottomNavigation />
    </div>
  );
}
