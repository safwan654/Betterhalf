"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useGlobal } from "@/context/GlobalContext";
import { MOOD_CONFIGS, MoodType, SingleJournalEntry } from "@/lib/journal";
import { X, Sparkles, Heart, Flame, Send, Tag, Smile } from "lucide-react";
import { format } from "date-fns";

interface WriteJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
}

export default function WriteJournalModal({ isOpen, onClose, selectedDate }: WriteJournalModalProps) {
  const { activeUser, husbandName, wifeName, journalEntries, saveJournalEntry } = useGlobal();
  const dateStr = selectedDate || format(new Date(), "yyyy-MM-dd");

  const isHusband = activeUser === "HUSBAND";
  const myName = isHusband ? husbandName : wifeName;
  const partnerName = isHusband ? wifeName : husbandName;

  const existingDay = journalEntries[dateStr];
  const existingEntry = isHusband ? existingDay?.husband : existingDay?.wife;

  const [selectedMood, setSelectedMood] = useState<MoodType>(existingEntry?.mood || "IN_LOVE");
  const [text, setText] = useState<string>(existingEntry?.text || "");
  const [spicyScore, setSpicyScore] = useState<number>(existingEntry?.spicyScore || 3);
  const [selectedTags, setSelectedTags] = useState<string[]>(existingEntry?.tags || []);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const availableTags = ["#spicy🔥", "#datenight✨", "#cuddles🧸", "#ldr_love✈️", "#deep_talk🌙", "#grateful🤍", "#funny😂"];

  const toggleTag = (t: string) => {
    if (selectedTags.includes(t)) {
      setSelectedTags(selectedTags.filter(x => x !== t));
    } else {
      setSelectedTags([...selectedTags, t]);
    }
  };

  const handleSave = () => {
    if (!text.trim()) return;
    setIsSaving(true);
    saveJournalEntry(dateStr, {
      mood: selectedMood,
      text: text.trim(),
      tags: selectedTags,
      spicyScore: selectedMood === "SPICY" ? spicyScore : undefined,
    });
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 400);
  };

  const moodList = Object.values(MOOD_CONFIGS);

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] border-2 border-[#FFE2D1] bg-[#FFF8F3] p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto no-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#FFE2D1] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍒</span>
            <div>
              <h3 className="text-sm font-black text-[#44342B] flex items-center gap-1.5">
                <span className="highlight-pink font-black">Shared Diary</span> Note
              </h3>
              <p className="text-[10px] font-bold text-[#826F66]">
                {dateStr === format(new Date(), "yyyy-MM-dd") ? "Today's Entry" : dateStr} • Written by {myName}
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

        {/* 1. Mood Picker */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-black text-[#44342B] uppercase tracking-wider flex items-center gap-1.5">
            <Smile className="h-3.5 w-3.5 text-rose-500" />
            Pick Your Mood Avatar
          </label>
          <div className="grid grid-cols-5 gap-2">
            {moodList.map((m) => {
              const isSelected = selectedMood === m.id;
              const avatar = isHusband ? m.avatarHusbandEmoji : m.avatarWifeEmoji;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMood(m.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-2xl border transition-all text-center ${
                    isSelected
                      ? "border-rose-400 bg-white shadow-md scale-105 ring-2 ring-rose-300"
                      : "border-[#FFE2D1] bg-white/70 hover:bg-white text-[#826F66]"
                  }`}
                >
                  <span className="text-xl leading-none">{m.emoji}</span>
                  <span className="text-[9px] font-extrabold truncate w-full">{m.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Spicy Meter (if Spicy Mood Selected) */}
        {selectedMood === "SPICY" && (
          <div className="rounded-2xl border border-red-200 bg-red-50/70 p-3 flex flex-col gap-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-black text-red-700">
              <span className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
                Spicy Chemistry Level
              </span>
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                Level {spicyScore} / 5 🔥
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={spicyScore}
              onChange={(e) => setSpicyScore(Number(e.target.value))}
              className="w-full accent-red-500 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-bold text-red-600">
              <span>Flirty Wink 😉</span>
              <span>Hot Teasing 🔥</span>
              <span>Wild Reunion 💋🔥</span>
            </div>
          </div>
        )}

        {/* 3. Diary Text Area */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-black text-[#44342B] uppercase tracking-wider flex items-center justify-between">
            <span>What&apos;s on your heart today?</span>
            <span className="text-[10px] text-rose-500 font-bold lowercase">secret until both write 🔒</span>
          </label>
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Write a sweet thought, spicy confession, or daily memory for ${partnerName}...`}
            className="w-full rounded-2xl border border-[#FFE2D1] bg-white p-3.5 text-xs font-semibold text-[#44342B] placeholder:text-[#826F66]/60 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 shadow-2xs resize-none"
          />
        </div>

        {/* 4. Quick Tags */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-[#826F66] uppercase tracking-wider flex items-center gap-1">
            <Tag className="h-3 w-3" /> Quick Tags
          </label>
          <div className="flex flex-wrap gap-1.5">
            {availableTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                    active
                      ? "bg-rose-500 text-white border-rose-500 shadow-2xs"
                      : "bg-white text-[#826F66] border-[#FFE2D1] hover:border-rose-300"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Save & Notify Button */}
        <button
          onClick={handleSave}
          disabled={!text.trim() || isSaving}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-black shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <Sparkles className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4" />
              Save to Shared Journal 💌
            </>
          )}
        </button>

      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
}
