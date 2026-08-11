"use client";

import { useState } from "react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";

export default function WeeklyTimeline() {
  const [currentDate] = useState(new Date());
  
  // Generate 7 days starting from Monday of the current week (or just 7 days from -2 days to +4 days)
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(startDate, i);
    // Mocking some days having pending items for the dot indicator
    const hasPendingItems = i === 1 || i === 3 || i === 4; 
    return {
      date,
      hasPendingItems,
      isToday: isSameDay(date, currentDate)
    };
  });

  return (
    <div className="flex flex-col gap-2 w-full overflow-hidden">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
          This Week
        </h2>
        <span className="text-[10px] font-bold text-amber-500">{format(currentDate, "MMMM yyyy")}</span>
      </div>
      
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {weekDays.map((day, idx) => (
          <button 
            key={idx}
            className={`flex flex-col items-center justify-center min-w-[3rem] h-[4.5rem] rounded-[18px] transition-all relative ${
              day.isToday 
                ? "bg-gradient-to-b from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/20 scale-105" 
                : "bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800"
            }`}
          >
            <span className={`text-[10px] font-bold mb-1 ${day.isToday ? "text-white/90" : "text-slate-400 dark:text-zinc-500"}`}>
              {format(day.date, "E")}
            </span>
            <span className={`text-lg font-black leading-none ${day.isToday ? "text-white" : "text-slate-700 dark:text-zinc-200"}`}>
              {format(day.date, "d")}
            </span>
            
            {/* Dot Indicator for pending items */}
            {day.hasPendingItems && !day.isToday && (
              <span className="absolute bottom-2 h-1 w-1 rounded-full bg-rose-500" />
            )}
            {day.hasPendingItems && day.isToday && (
              <span className="absolute bottom-2 h-1 w-1 rounded-full bg-white" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
