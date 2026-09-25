"use client";

import { useState } from "react";
import { format, addDays, startOfWeek, isSameDay, parseISO } from "date-fns";
import { useGlobal } from "@/context/GlobalContext";
import { Calendar, Sparkles } from "lucide-react";

export default function WeeklyTimeline() {
  const { globalSelectedDate, setGlobalSelectedDate, tasks } = useGlobal();
  const [currentDate] = useState(new Date());
  
  const parsedSelectedDate = parseISO(globalSelectedDate);
  
  // Generate 7 days starting from Monday of the current week
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const dayDate = addDays(startDate, i);
    const dayDateString = format(dayDate, "yyyy-MM-dd");
    return {
      date: dayDate,
      dateString: dayDateString,
      isToday: isSameDay(dayDate, currentDate),
      hasPendingItems: tasks.some(t => !t.completed && (t.due === dayDateString || (t.due === "Today" && isSameDay(dayDate, currentDate))))
    };
  });

  return (
    <div className="flex flex-col gap-2.5 w-full overflow-hidden">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-rose-500" />
          <h2 className="text-xs font-black text-[#44342B] dark:text-zinc-200">
            <span className="highlight-yellow font-black">
              {isSameDay(parsedSelectedDate, currentDate) ? "This Week" : format(parsedSelectedDate, "EEEE, MMM d")}
            </span>
          </h2>
        </div>
        <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
          {format(currentDate, "MMMM yyyy")}
        </span>
      </div>
      
      <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {weekDays.map((day, idx) => {
          const isSelected = day.dateString === globalSelectedDate;
          return (
            <button 
              key={idx}
              onClick={() => setGlobalSelectedDate(day.dateString)}
              className={`flex flex-col items-center justify-center min-w-[3.1rem] h-[4.5rem] rounded-[20px] transition-all relative active:scale-95 ${
                isSelected 
                  ? "bg-gradient-to-b from-rose-500 via-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/25 scale-105 font-black border-2 border-white" 
                  : day.isToday 
                    ? "bg-[#FFF0E5] border-2 border-rose-300 text-[#44342B] dark:bg-zinc-850 dark:text-zinc-200"
                    : "bg-white/90 dark:bg-zinc-900 border border-[#FFE2D1] text-[#826F66] dark:text-zinc-400 hover:bg-rose-50/50"
              }`}
            >
              <span className={`text-[10px] font-bold mb-0.5 ${isSelected ? "text-white/90" : day.isToday ? "text-rose-500 font-extrabold" : "text-[#826F66] dark:text-zinc-400"}`}>
                {format(day.date, "E")}
              </span>
              <span className={`text-base font-black leading-none ${isSelected ? "text-white" : day.isToday ? "text-[#44342B] dark:text-zinc-100 font-black" : "text-[#554339] dark:text-zinc-300"}`}>
                {format(day.date, "d")}
              </span>
              
              {/* Dot Indicator for pending tasks / items */}
              {day.hasPendingItems && !isSelected && (
                <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              )}
              {day.hasPendingItems && isSelected && (
                <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
