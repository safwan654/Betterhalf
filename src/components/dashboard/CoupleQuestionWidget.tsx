"use client";

import { useState } from "react";
import { useGlobal } from "@/context/GlobalContext";
import { getTodayCoupleQuestion } from "@/lib/couple-questions";
import { 
  Sparkles, 
  Heart, 
  MessageCircle, 
  CheckCircle2, 
  Lock, 
  HelpCircle,
  Flame,
  Award
} from "lucide-react";

export default function CoupleQuestionWidget() {
  const { 
    activeUser, 
    husbandName, 
    wifeName, 
    coupleDailyAnswers, 
    submitCoupleDailyAnswer,
    sendInteraction 
  } = useGlobal();

  const todayQuestion = getTodayCoupleQuestion();
  const currentEntry = coupleDailyAnswers[todayQuestion.id] || {};
  
  const isHusband = activeUser === "HUSBAND";
  const myAnswer = isHusband ? currentEntry.husbandAnswer : currentEntry.wifeAnswer;
  const partnerAnswer = isHusband ? currentEntry.wifeAnswer : currentEntry.husbandAnswer;
  const partnerName = isHusband ? wifeName : husbandName;

  const [selectedOption, setSelectedOption] = useState<string>("");
  const [customText, setCustomText] = useState<string>("");
  const [justAnswered, setJustAnswered] = useState(false);

  const bothAnswered = !!(currentEntry.husbandAnswer && currentEntry.wifeAnswer);
  const isSameAnswer = bothAnswered && (currentEntry.husbandAnswer?.toLowerCase().trim() === currentEntry.wifeAnswer?.toLowerCase().trim());

  const handleAnswer = (ans: string) => {
    if (!ans) return;
    submitCoupleDailyAnswer(todayQuestion.id, ans);
    setJustAnswered(true);
    sendInteraction("CARE_NOTE", `Answered today's couple question: "${ans}" ✨`, "PARTNER");
    setTimeout(() => setJustAnswered(false), 3000);
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

        {/* Both Answered State (Similarity Gauge & Revealed Answers) */}
        {bothAnswered ? (
          <div className="flex flex-col gap-2.5 animate-in fade-in">
            {/* Similarity Badge */}
            <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-rose-500/10 to-amber-500/10 p-3 border border-rose-200/60">
              <span className="text-xs font-black text-[#44342B] flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-rose-500 fill-rose-500 animate-pulse" />
                {isSameAnswer ? "100% Match! Perfect harmony ✨" : "Both Answered! Compare answers 💬"}
              </span>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shadow-2xs ${
                isSameAnswer ? "bg-rose-500 text-white" : "bg-purple-500 text-white"
              }`}>
                {isSameAnswer ? "100% Match" : "Synced"}
              </span>
            </div>

            {/* Answer Comparison Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white border border-amber-200/70 shadow-2xs">
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider">{husbandName}&apos;s Answer</span>
                <span className="font-extrabold text-[#44342B] leading-snug">{currentEntry.husbandAnswer}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white border border-rose-200/70 shadow-2xs">
                <span className="text-[10px] font-black text-rose-700 uppercase tracking-wider">{wifeName}&apos;s Answer</span>
                <span className="font-extrabold text-[#44342B] leading-snug">{currentEntry.wifeAnswer}</span>
              </div>
            </div>
          </div>
        ) : myAnswer ? (
          /* I have answered, waiting for partner */
          <div className="flex flex-col gap-2 p-3 rounded-2xl bg-purple-50/80 border border-purple-200/70 shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="text-xs font-bold text-slate-800">
                You answered: <strong className="text-purple-900 font-black">&ldquo;{myAnswer}&rdquo;</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-700">
              <Lock className="h-3.5 w-3.5" />
              <span>Waiting for {partnerName} to answer to reveal match!</span>
            </div>
          </div>
        ) : (
          /* Not answered yet: Option Choices */
          <div className="flex flex-col gap-2">
            {todayQuestion.options?.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                className="w-full text-left p-3 rounded-2xl border border-[#FFE2D1] bg-white hover:border-rose-400 hover:bg-rose-50/60 text-xs font-bold text-[#44342B] transition-all active:scale-[0.99] shadow-2xs"
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
