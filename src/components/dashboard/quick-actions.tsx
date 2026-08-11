"use client";

import { useState } from "react";
import { Plus, CheckSquare, DollarSign, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { label: "Add Task", icon: CheckSquare, color: "bg-amber-500 hover:bg-amber-600" },
    { label: "Log Expense", icon: DollarSign, color: "bg-emerald-500 hover:bg-emerald-600" },
    { label: "Mark Prayer", icon: Sparkles, color: "bg-rose-500 hover:bg-rose-600" }
  ];

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2.5">
      {isOpen && (
        <div className="flex flex-col items-end gap-2.5 mb-1.5 animate-in fade-in slide-in-from-bottom-5 duration-200">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-lg border border-slate-100 hover:bg-slate-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <span>{action.label}</span>
                <div className={cn("flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm", action.color)}>
                  <Icon className="h-4 w-4" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/30 transition-transform active:scale-95"
        aria-label="Quick actions"
      >
        <Plus className={cn("h-6 w-6 transition-transform duration-300", isOpen && "rotate-45")} />
      </button>
    </div>
  );
}