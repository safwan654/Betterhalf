"use client";

import { useState } from "react";
import { useGlobal } from "@/context/GlobalContext";
import { getTodayCoupleQuestion } from "@/lib/couple-questions";
import { 
  Heart, 
  CheckCircle2, 
  Lock, 
  RotateCcw,
  Pencil,
  Sparkles,
  MessageCircle
} from "lucide-react";

export default function CoupleQuestionWidget() {
  const { 
    activeUser, 
    husbandName, 
    wifeName, 
    coupleDailyAnswers, 
    submitCoupleDailyAnswer,
    undoCoupleDailyAnswer 
  } = useGlobal();

  const todayQuestion = getTodayCoupleQuestion();
  const currentEntry = coupleDailyAnswers[todayQuestion.id] || {};
  
  const isHusband = activeUser === "HUSBAND";
  const myAnswer = isHusband ? currentEntry.husbandAnswer : currentEntry.wifeAnswer;
  const partnerAnswer = isHusband ? currentEntry.wifeAnswer : currentEntry.husbandAnswer;
  const partnerName = isHusband ? wifeName : husbandName;

  const [isEditing, setIsEditing] = useState(false);

  const bothAnswered = !!(currentEntry.husbandAnswer && currentEntry.wifeAnswer);
  const isSameAnswer = bothAnswered && (currentEntry.husbandAnswer?.toLowerCase().trim() === currentEntry.wifeAnswer?.toLowerCase().trim());

  const handleAnswer = (ans: string) => {
    if (!ans) return;
    submitCoupleDailyAnswer(todayQuestion.id, ans);
    setIsEditing(false);
  };

  const handleUndo = () => {
    undoCoupleDailyAnswer(todayQuestion.id);
    setIsEditing(true);
  };

  return (
    <div className="relative overflow-hidden rounded-[28px] border-2 border-[#FFE2D1] bg-white/95 p-5 shadow-sm transition-all flex flex-col gap-3.5">
      
      {/* 1. Header with Cute Highlighter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{todayQuestion.emoji}</span>
          <span className="text-xs font-black text-[#44342B]">
            <span className="highlight-pink font-black">Daily Question</span> for Two
          </span>
        </div>

        <span className="rounded-full bg-purple-50 px-3 py-1 text-[10px] font-extrabold text-purple-700 border border-purple-200/60 shadow-2xs">
          {todayQuestion.category}
        </span>
      </div>

      {/* 2. Today's Question Card */}
      <div className="rounded-[22px] border border-[#FFE2D1] bg-[#FFF9F4] p-4 flex flex-col gap-3 shadow-2xs">
        <h4 className="text-sm font-black text-[#44342B] leading-snug">
          &ldquo;{todayQuestion.question}&rdquo;
        </h4>

        {/* Both Answered State */}
        {bothAnswered && !isEditing ? (
          <div className="flex flex-col gap-2.5 animate-in fade-in">
            {/* Match Status Banner */}
            <div className={`flex items-center justify-between rounded-2xl p-3 border ${
              isSameAnswer 
                ? "bg-gradient-to-r from-rose-500/10 to-pink-500/10 border-rose-200/80 text-rose-800" 
                : "bg-gradient-to-r from-purple-500/10 to-amber-500/10 border-purple-200/80 text-purple-900"
            }`}>
              <span className="text-xs font-black flex items-center gap-1.5">
                <Heart className={`h-4 w-4 ${isSameAnswer ? "text-rose-500 fill-rose-500 animate-pulse" : "text-purple-500 fill-purple-500"}`} />
                {isSameAnswer ? "You both answered the same! 🎉" : "Both Answered! See responses 💬"}
              </span>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shadow-2xs text-white ${
                isSameAnswer ? "bg-rose-500" : "bg-purple-500"
              }`}>
                {isSameAnswer ? "100% Match" : "Synced"}
              </span>
            </div>

            {/* Answer Comparison Cards */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Husband Box */}
              <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white border border-amber-200/70 shadow-2xs">
                <div className="flex items-center gap-1">
                  <span className="text-xs">👦</span>
                  <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider">{husbandName}</span>
                </div>
                <span className="font-extrabold text-[#44342B] leading-snug">&ldquo;{currentEntry.husbandAnswer}&rdquo;</span>
              </div>

              {/* Wife Box */}
              <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white border border-rose-200/70 shadow-2xs">
                <div className="flex items-center gap-1">
                  <span className="text-xs">👧</span>
                  <span className="text-[10px] font-black text-rose-700 uppercase tracking-wider">{wifeName}</span>
                </div>
                <span className="font-extrabold text-[#44342B] leading-snug">&ldquo;{currentEntry.wifeAnswer}&rdquo;</span>
              </div>
            </div>

            {/* Change / Undo Button */}
            <button
              onClick={handleUndo}
              className="self-end flex items-center gap-1 text-[10px] font-bold text-[#826F66] hover:text-rose-600 transition-colors pt-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Change my answer</span>
            </button>
          </div>
        ) : myAnswer && !isEditing ? (
          /* I have answered, waiting for partner */
          <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200/70 shadow-2xs animate-in fade-in">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#826F66]">You answered:</span>
                  <span className="text-xs font-black text-purple-900 leading-snug">&ldquo;{myAnswer}&rdquo;</span>
                </div>
              </div>

              <button
                onClick={handleUndo}
                className="flex items-center gap-1 text-[10px] font-extrabold text-rose-600 bg-white hover:bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200 shadow-2xs transition-all active:scale-95 shrink-0"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Undo</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-700 pt-1 border-t border-purple-200/40">
              <Lock className="h-3.5 w-3.5 shrink-0" />
              <span>Waiting for {partnerName} to answer to reveal match!</span>
            </div>
          </div>
        ) : (
          /* Not answered yet or in Editing Mode: Option Choices */
          <div className="flex flex-col gap-2">
            {todayQuestion.options?.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                className="w-full text-left p-3 rounded-2xl border border-[#FFE2D1] bg-white hover:border-rose-400 hover:bg-rose-50/60 text-xs font-bold text-[#44342B] transition-all active:scale-[0.99] shadow-2xs flex items-center justify-between"
              >
                <span>{opt}</span>
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
