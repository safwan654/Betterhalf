"use client";

import { useState } from "react";
import { format, addDays, startOfWeek, isSameDay, parseISO } from "date-fns";
import { useGlobal } from "@/context/GlobalContext";

export default function WeeklyTimeline() {
  const { globalSelectedDate, setGlobalSelectedDate, tasks } = useGlobal();
  const [currentDate] = useState(new Date());
  
  const parsedSelectedDate = parseISO(globalSelectedDate);
  
  // Generate 7 days starting from Monday of the current week (or just 7 days from -2 days to +4 days)
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const dayDate = addDays(startDate, i);
    const dayDateString = format(dayDate, "yyyy-MM-dd");
    return {
      date: dayDate,
      dateString: dayDateString,
      isToday: isSameDay(dayDate, currentDate),
      hasPendingItems: tasks.some(t => t.due === dayDateString) // Basic indicator based on tasks
    };
  });

  return (
    <div className="flex flex-col gap-2 w-full overflow-hidden">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
          {isSameDay(parsedSelectedDate, currentDate) ? "This Week" : format(parsedSelectedDate, "EEEE, MMM d")}
        </h2>
        <span className="text-[10px] font-bold text-amber-500">{format(currentDate, "MMMM yyyy")}</span>
      </div>
      
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {weekDays.map((day, idx) => {
          const isSelected = day.dateString === globalSelectedDate;
          return (
          <button 
            key={idx}
            onClick={() => setGlobalSelectedDate(day.dateString)}
            className={`flex flex-col items-center justify-center min-w-[3rem] h-[4.5rem] rounded-[18px] transition-all relative ${
              isSelected 
                ? "bg-gradient-to-b from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/20 scale-105" 
                : day.isToday 
                  ? "bg-slate-100 dark:bg-zinc-800 border-2 border-rose-500/50 text-slate-800 dark:text-zinc-200"
                  : "bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800"
            }`}
          >
            <span className={`text-[10px] font-bold mb-1 ${isSelected ? "text-white/90" : day.isToday ? "text-rose-500" : "text-slate-400 dark:text-zinc-500"}`}>
              {format(day.date, "E")}
            </span>
            <span className={`text-lg font-black leading-none ${isSelected ? "text-white" : day.isToday ? "text-slate-800 dark:text-zinc-100" : "text-slate-700 dark:text-zinc-200"}`}>
              {format(day.date, "d")}
            </span>
            
            {/* Dot Indicator for pending items */}
            {day.hasPendingItems && !isSelected && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
            )}
            {day.hasPendingItems && isSelected && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white animate-pulse" />
            )}
          </button>
        )})}
      </div>
    </div>
  );
}
