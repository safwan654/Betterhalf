"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useGlobal } from "@/context/GlobalContext";
import { MOOD_CONFIGS, MoodType, JournalDayEntry } from "@/lib/journal";
import WriteJournalModal from "./WriteJournalModal";
import { 
  Heart, 
  Flame, 
  Lock, 
  Unlock, 
  Pencil, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Smile, 
  X,
  MessageCircle,
  Clock,
  BookOpen
} from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getDay, 
  addMonths, 
  subMonths,
  isSameDay,
  isToday
} from "date-fns";

export default function JournalCalendar() {
  const { 
    activeUser, 
    husbandName, 
    wifeName, 
    journalEntries, 
    reactToJournalEntry 
  } = useGlobal();

  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 25)); // Sep 2026
  const [viewMode, setViewMode] = useState<"CALENDAR" | "LIST">("CALENDAR");
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [selectedDayDetail, setSelectedDayDetail] = useState<JournalDayEntry | null>(null);
  const [writeForDate, setWriteForDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  const isHusband = activeUser === "HUSBAND";
  const myName = isHusband ? husbandName : wifeName;
  const partnerName = isHusband ? wifeName : husbandName;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart); // 0 = Sunday

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const openDayDetail = (dateStr: string) => {
    const entry = journalEntries[dateStr] || { date: dateStr };
    setSelectedDayDetail(entry);
  };

  const openWriteToday = (dateStr?: string) => {
    setWriteForDate(dateStr || format(new Date(), "yyyy-MM-dd"));
    setIsWriteModalOpen(true);
  };

  const allEntriesList = Object.values(journalEntries).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="relative flex flex-col gap-4">
      
      {/* 1. Cute Illustration Banner & Title */}
      <div className="relative overflow-hidden rounded-[32px] border-2 border-[#FFE2D1] bg-gradient-to-b from-[#FFF0E5] via-[#FFF8F3] to-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
              <span>🍒</span> A Shared Journal Just for Two
            </span>
            <h2 className="text-lg font-black text-[#44342B] leading-tight">
              <span className="highlight-pink font-black">Our Daily Heartbeat</span> &amp; Moods
            </h2>
            <p className="text-[11px] font-semibold text-[#826F66]">
              Express your feelings, spicy moods &amp; sweet memories together
            </p>
          </div>

          {/* Cute Cherry Badge */}
          <div className="shrink-0 flex items-center justify-center h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-200 shadow-2xs">
            <span className="text-2xl animate-bounce">🍒</span>
          </div>
        </div>

        {/* 2. Month Selector & Mode Switch */}
        <div className="mt-4 flex items-center justify-between border-t border-[#FFE2D1] pt-3.5">
          <div className="flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-2xl border border-[#FFE2D1] shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-xl text-[#826F66] hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-black text-[#44342B] min-w-[85px] text-center">
              {format(currentDate, "MM/yyyy")}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-xl text-[#826F66] hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setViewMode(viewMode === "CALENDAR" ? "LIST" : "CALENDAR")}
            className="flex items-center gap-1.5 text-xs font-black text-rose-600 bg-rose-50 hover:bg-rose-100/80 px-3.5 py-1.5 rounded-2xl border border-rose-200 transition-all shadow-2xs"
          >
            {viewMode === "CALENDAR" ? (
              <>
                <BookOpen className="h-3.5 w-3.5" />
                All Diaries &gt;
              </>
            ) : (
              <>
                <CalendarIcon className="h-3.5 w-3.5" />
                Calendar View &gt;
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Calendar Grid View */}
      {viewMode === "CALENDAR" ? (
        <div className="rounded-[32px] border-2 border-[#FFE2D1] bg-white/95 p-4 shadow-sm flex flex-col gap-3">
          
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName, idx) => (
              <span key={idx} className="text-[10px] font-black text-[#826F66] uppercase">
                {dayName}
              </span>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Blank leading slots */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[72px] rounded-2xl bg-[#FFFBF8]/50 border border-dashed border-[#FFE2D1]/40 opacity-40" />
            ))}

            {/* Month Days */}
            {daysInMonth.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const entry = journalEntries[dateStr];
              const isCurrentDay = isToday(day);
              const dayNumber = format(day, "d");

              const hasWife = !!entry?.wife;
              const hasHusband = !!entry?.husband;
              const bothWrote = hasWife && hasHusband;
              const onlyOneWrote = (hasWife && !hasHusband) || (!hasWife && hasHusband);
              const isLocked = onlyOneWrote && ((isHusband && !hasHusband) || (!isHusband && !hasWife));

              const wifeMoodConfig = entry?.wife?.mood ? MOOD_CONFIGS[entry.wife.mood] : null;
              const husbandMoodConfig = entry?.husband?.mood ? MOOD_CONFIGS[entry.husband.mood] : null;

              return (
                <button
                  key={dateStr}
                  onClick={() => openDayDetail(dateStr)}
                  className={`min-h-[76px] rounded-2xl border p-1.5 flex flex-col items-center justify-between transition-all relative group active:scale-95 ${
                    isCurrentDay
                      ? "border-rose-400 bg-rose-50/40 shadow-xs ring-2 ring-rose-200"
                      : entry
                      ? "border-[#FFE2D1] bg-[#FFF9F4] hover:bg-white hover:border-rose-300 shadow-2xs"
                      : "border-[#FFE2D1]/60 bg-white/70 hover:bg-[#FFF9F4]"
                  }`}
                >
                  {/* Day Number Pill */}
                  <div className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-all ${
                    entry
                      ? "bg-sky-100 text-sky-800 border border-sky-200"
                      : isCurrentDay
                      ? "bg-rose-500 text-white shadow-2xs"
                      : "text-[#826F66]"
                  }`}>
                    {dayNumber}
                  </div>

                  {/* Mood Avatars Display (Top: Wife, Bottom: Husband) */}
                  <div className="flex flex-col items-center gap-1 w-full my-auto">
                    {/* Top: Wife Expression */}
                    <div className="h-5 flex items-center justify-center text-sm leading-none">
                      {hasWife ? (
                        <span title={`Wife: ${wifeMoodConfig?.label}`} className="transition-transform hover:scale-125">
                          {wifeMoodConfig?.emoji || "👧"}
                        </span>
                      ) : (
                        <span className="text-[9px] text-[#826F66]/30">•</span>
                      )}
                    </div>

                    {/* Bottom: Husband Expression */}
                    <div className="h-5 flex items-center justify-center text-sm leading-none">
                      {hasHusband ? (
                        <span title={`Husband: ${husbandMoodConfig?.label}`} className="transition-transform hover:scale-125">
                          {husbandMoodConfig?.emoji || "👦"}
                        </span>
                      ) : (
                        <span className="text-[9px] text-[#826F66]/30">•</span>
                      )}
                    </div>
                  </div>

                  {/* Lock Indicator if only partner wrote */}
                  {onlyOneWrote && (
                    <div className="absolute top-1 right-1">
                      <Lock className="h-3 w-3 text-amber-500" />
                    </div>
                  )}

                  {/* Spicy indicator */}
                  {(entry?.wife?.mood === "SPICY" || entry?.husband?.mood === "SPICY") && (
                    <div className="absolute -bottom-1 -right-1">
                      <span className="text-[10px]">🔥</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* 4. List / Feed View */
        <div className="flex flex-col gap-3">
          {allEntriesList.map((entry) => {
            const hasWife = !!entry.wife;
            const hasHusband = !!entry.husband;
            return (
              <div
                key={entry.date}
                onClick={() => openDayDetail(entry.date)}
                className="cursor-pointer rounded-[26px] border border-[#FFE2D1] bg-white p-4 shadow-sm hover:border-rose-300 transition-all flex flex-col gap-3"
              >
                <div className="flex items-center justify-between border-b border-[#FFE2D1]/60 pb-2">
                  <span className="text-xs font-black text-[#44342B] flex items-center gap-1.5">
                    <CalendarIcon className="h-3.5 w-3.5 text-rose-500" />
                    {entry.date}
                  </span>
                  <div className="flex items-center gap-1">
                    {entry.wife?.mood && <span className="text-base">{MOOD_CONFIGS[entry.wife.mood]?.emoji}</span>}
                    {entry.husband?.mood && <span className="text-base">{MOOD_CONFIGS[entry.husband.mood]?.emoji}</span>}
                  </div>
                </div>

                {/* Wife Entry Snippet */}
                {hasWife && (
                  <div className="flex items-start gap-2.5 bg-rose-50/60 p-3 rounded-2xl border border-rose-100">
                    <span className="text-lg">👧</span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-black text-rose-700">{wifeName}</span>
                      <p className="text-xs font-semibold text-[#44342B] line-clamp-2">{entry.wife?.text}</p>
                    </div>
                  </div>
                )}

                {/* Husband Entry Snippet */}
                {hasHusband && (
                  <div className="flex items-start gap-2.5 bg-amber-50/60 p-3 rounded-2xl border border-amber-100">
                    <span className="text-lg">👦</span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-black text-amber-700">{husbandName}</span>
                      <p className="text-xs font-semibold text-[#44342B] line-clamp-2">{entry.husband?.text}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Floating Cherry Pencil Button (Matching Image 1) */}
      <button
        onClick={() => openWriteToday()}
        title="Write Today's Diary Entry"
        className="fixed bottom-24 right-5 z-40 h-14 w-14 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 text-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all ring-4 ring-white border-2 border-white/80 animate-in zoom-in"
      >
        <Pencil className="h-6 w-6 stroke-[2.5]" />
      </button>

      {/* 6. Write Modal */}
      <WriteJournalModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        selectedDate={writeForDate}
      />

      {/* 7. Day Detail Modal */}
      {selectedDayDetail && (
        <DayDetailModal
          entry={selectedDayDetail}
          onClose={() => setSelectedDayDetail(null)}
          onWriteClick={() => {
            const d = selectedDayDetail.date;
            setSelectedDayDetail(null);
            openWriteToday(d);
          }}
        />
      )}

    </div>
  );
}

// Day Detail Modal Component
function DayDetailModal({ 
  entry, 
  onClose, 
  onWriteClick 
}: { 
  entry: JournalDayEntry; 
  onClose: () => void; 
  onWriteClick: () => void;
}) {
  const { activeUser, husbandName, wifeName, reactToJournalEntry } = useGlobal();
  const isHusband = activeUser === "HUSBAND";
  const myName = isHusband ? husbandName : wifeName;
  const partnerName = isHusband ? wifeName : husbandName;

  const hasWife = !!entry.wife;
  const hasHusband = !!entry.husband;
  const bothWrote = hasWife && hasHusband;

  const wifeMood = entry.wife?.mood ? MOOD_CONFIGS[entry.wife.mood] : null;
  const husbandMood = entry.husband?.mood ? MOOD_CONFIGS[entry.husband.mood] : null;

  const reactions = ["❤️", "🔥", "💋", "🥺", "🥰", "✨"];

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-[32px] border-2 border-[#FFE2D1] bg-[#FFF8F3] p-5 shadow-2xl flex flex-col gap-4 max-h-[88vh] overflow-y-auto no-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#FFE2D1] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📖</span>
            <div>
              <h3 className="text-sm font-black text-[#44342B] flex items-center gap-1.5">
                <span className="highlight-pink font-black">Diary for</span> {entry.date}
              </h3>
              <p className="text-[10px] font-bold text-[#826F66]">
                {bothWrote ? "Both notes unlocked ✨" : "Private until both write"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[#826F66] hover:bg-rose-100/60 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Wife Entry Card */}
        <div className="flex flex-col gap-2 rounded-2xl border border-rose-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">👧</span>
              <span className="text-xs font-black text-rose-700">{wifeName}&apos;s Note</span>
            </div>
            {wifeMood && (
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center gap-1">
                <span>{wifeMood.emoji}</span>
                <span>{wifeMood.label}</span>
              </span>
            )}
          </div>

          {hasWife ? (
            <div className="flex flex-col gap-2 mt-1">
              <p className="text-xs font-semibold text-[#44342B] leading-relaxed">
                &ldquo;{entry.wife?.text}&rdquo;
              </p>
              {entry.wife?.tags && entry.wife.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {entry.wife.tags.map(t => (
                    <span key={t} className="text-[9px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-[11px] font-bold text-[#826F66]">
                {wifeName} has not written for this day yet.
              </p>
            </div>
          )}
        </div>

        {/* Husband Entry Card */}
        <div className="flex flex-col gap-2 rounded-2xl border border-amber-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">👦</span>
              <span className="text-xs font-black text-amber-700">{husbandName}&apos;s Note</span>
            </div>
            {husbandMood && (
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                <span>{husbandMood.emoji}</span>
                <span>{husbandMood.label}</span>
              </span>
            )}
          </div>

          {hasHusband ? (
            <div className="flex flex-col gap-2 mt-1">
              <p className="text-xs font-semibold text-[#44342B] leading-relaxed">
                &ldquo;{entry.husband?.text}&rdquo;
              </p>
              {entry.husband?.tags && entry.husband.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {entry.husband.tags.map(t => (
                    <span key={t} className="text-[9px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-[11px] font-bold text-[#826F66]">
                {husbandName} has not written for this day yet.
              </p>
            </div>
          )}
        </div>

        {/* Reaction Bar */}
        <div className="flex items-center justify-between rounded-2xl border border-[#FFE2D1] bg-white p-3 shadow-2xs">
          <span className="text-[10px] font-black text-[#826F66] uppercase">React:</span>
          <div className="flex items-center gap-1.5">
            {reactions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => reactToJournalEntry(entry.date, emoji)}
                className="text-lg p-1 hover:scale-125 active:scale-95 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Write / Edit Button */}
        <button
          onClick={onWriteClick}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-black shadow-sm hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Pencil className="h-4 w-4" />
          {((isHusband && hasHusband) || (!isHusband && hasWife)) ? "Edit My Entry ✍️" : "Write My Entry ✍️"}
        </button>

      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
}
