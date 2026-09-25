"use client";

import { useState, useEffect } from "react";
import { useGlobal } from "@/context/GlobalContext";
import { differenceInDays, parseISO, format, addDays } from "date-fns";
import { 
  Heart, 
  Sparkles, 
  Send, 
  Camera, 
  MapPin, 
  Clock, 
  BatteryCharging, 
  CalendarHeart,
  Smile,
  Flame,
  MessageCircleHeart
} from "lucide-react";
import { CITY_PRESETS } from "@/lib/prayer-times";

export default function CoupleLoveHero() {
  const {
    relationshipMode,
    activeUser,
    husbandName,
    wifeName,
    husbandPhoto,
    wifePhoto,
    husbandLocation,
    wifeLocation,
    husbandTimezone,
    wifeTimezone,
    relationshipStartDate,
    sendInteraction
  } = useGlobal();

  const [timeH, setTimeH] = useState("");
  const [timeW, setTimeW] = useState("");
  const [hugSent, setHugSent] = useState(false);
  const [kissSent, setKissSent] = useState(false);
  const [noteSent, setNoteSent] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    const updateTime = () => {
      try {
        const h = new Date().toLocaleTimeString("en-US", { timeZone: husbandTimezone || "Asia/Dubai", hour: "2-digit", minute: "2-digit" });
        const w = new Date().toLocaleTimeString("en-US", { timeZone: wifeTimezone || "Asia/Kolkata", hour: "2-digit", minute: "2-digit" });
        setTimeH(h);
        setTimeW(w);
      } catch (e) {
        // Fallback
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [husbandTimezone, wifeTimezone]);

  // Calculate Days Together
  const startDate = relationshipStartDate ? parseISO(relationshipStartDate) : new Date(2024, 0, 1);
  const daysTogether = Math.max(1, differenceInDays(new Date(), startDate));

  // Next Milestone (e.g. 100, 365, 500, 600, 1000 days)
  const milestones = [100, 200, 365, 500, 600, 730, 1000, 1500, 2000];
  const nextMilestone = milestones.find(m => m > daysTogether) || (Math.floor(daysTogether / 500) + 1) * 500;
  const daysToNextMilestone = nextMilestone - daysTogether;

  // Approximate LDR distance calculation (Dubai to Mumbai ~ 1,930 km; or calculated)
  const distanceKm = relationshipMode === "DISTANCE" ? "1,930 km" : "0 km";

  const handleSendHug = () => {
    setHugSent(true);
    sendInteraction("HUG");
    setTimeout(() => setHugSent(false), 2500);
  };

  const handleSendKiss = () => {
    setKissSent(true);
    sendInteraction("KISS");
    setTimeout(() => setKissSent(false), 2500);
  };

  const handleSendNote = () => {
    if (!noteText.trim()) return;
    sendInteraction("CARE_NOTE", noteText.trim(), "PARTNER");
    setNoteText("");
    setShowNoteModal(false);
    setNoteSent(true);
    setTimeout(() => setNoteSent(false), 3000);
  };

  const partnerName = activeUser === "HUSBAND" ? wifeName : husbandName;

  return (
    <div className="relative overflow-hidden rounded-[32px] border-2 border-[#FFE2D1] bg-gradient-to-b from-[#FFF5EC] via-[#FFF9F4] to-[#FFF0E8] p-5 shadow-lg shadow-rose-500/5 transition-all">
      
      {/* Soft Background Cloud Glows */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-rose-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-amber-200/40 blur-3xl" />

      {/* 1. Top Milestone & Days Together Pill */}
      <div className="relative z-10 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-full border border-rose-200/80 bg-white/90 px-3.5 py-1 shadow-xs">
          <CalendarHeart className="h-3.5 w-3.5 text-rose-500 fill-rose-100" />
          <span className="text-xs font-black text-[#44342B]">
            <span className="text-rose-500 font-extrabold">{daysTogether}</span> Days Together 💕
          </span>
        </div>

        <span className="rounded-full border border-amber-200/70 bg-amber-50/80 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
          Next: {nextMilestone}d in {daysToNextMilestone}d
        </span>
      </div>

      {/* 2. Main Heartbeat Distance & Avatar Connection Map */}
      <div className="relative z-10 flex items-center justify-between px-1">
        
        {/* Husband Avatar Column */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="relative group cursor-pointer">
            <div className="h-16 w-16 rounded-[24px] overflow-hidden bg-gradient-to-tr from-amber-400 via-orange-400 to-amber-500 p-0.5 shadow-md shadow-amber-500/20 transition-transform active:scale-95 border-2 border-white">
              <div className="h-full w-full rounded-[22px] overflow-hidden bg-amber-100 flex items-center justify-center font-black text-xl text-amber-800">
                {husbandPhoto ? (
                  <img src={husbandPhoto} alt={husbandName} className="h-full w-full object-cover" />
                ) : (
                  (husbandName || "H").charAt(0).toUpperCase()
                )}
              </div>
            </div>
            {activeUser === "HUSBAND" && (
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] text-white font-black ring-2 ring-white">
                ✓
              </span>
            )}
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs font-black text-[#44342B]">{husbandName}</span>
            <span className="text-[10px] font-bold text-slate-400">{timeH || "10:24 AM"}</span>
          </div>
        </div>

        {/* Center Heartbeat Wavy Connector Line & Heart */}
        <div className="relative flex flex-1 flex-col items-center justify-center px-2">
          {/* Top Distance Tag */}
          <div className="mb-1 flex items-center gap-1 rounded-full border border-rose-100 bg-white/90 px-2 py-0.5 text-[9px] font-black text-[#44342B] shadow-2xs">
            <MapPin className="h-2.5 w-2.5 text-rose-500" />
            <span>{relationshipMode === "DISTANCE" ? distanceKm : "Together 🤍"}</span>
          </div>

          {/* Wavy SVG Heartbeat Line */}
          <div className="relative w-full flex items-center justify-center h-8">
            <svg className="w-full h-8 overflow-visible" viewBox="0 0 160 30" fill="none">
              <path
                d="M 0 15 Q 20 15 35 15 L 45 5 L 55 25 L 65 5 L 75 22 L 85 15 L 160 15"
                stroke="#FF8FA3"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="heartbeat-pulse"
              />
            </svg>

            {/* Beating Heart in the middle */}
            <button
              onClick={handleSendKiss}
              title="Tap to blow a kiss!"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30 transition-all hover:scale-110 active:scale-90"
            >
              <Heart className="h-4 w-4 fill-white animate-pulse" />
            </button>
          </div>

          <span className="mt-1 text-[8px] font-extrabold uppercase tracking-widest text-rose-400">
            {kissSent ? "Kiss Sent! 💋" : hugSent ? "Hug Sent! 🫂" : "Tap for Love"}
          </span>
        </div>

        {/* Wife Avatar Column */}
        <div className="flex flex-col items-center gap-1.5 text-right">
          <div className="relative group cursor-pointer">
            <div className="h-16 w-16 rounded-[24px] overflow-hidden bg-gradient-to-tr from-rose-400 via-pink-400 to-rose-500 p-0.5 shadow-md shadow-rose-500/20 transition-transform active:scale-95 border-2 border-white">
              <div className="h-full w-full rounded-[22px] overflow-hidden bg-rose-100 flex items-center justify-center font-black text-xl text-rose-800">
                {wifePhoto ? (
                  <img src={wifePhoto} alt={wifeName} className="h-full w-full object-cover" />
                ) : (
                  (wifeName || "W").charAt(0).toUpperCase()
                )}
              </div>
            </div>
            {activeUser === "WIFE" && (
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] text-white font-black ring-2 ring-white">
                ✓
              </span>
            )}
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs font-black text-[#44342B]">{wifeName}</span>
            <span className="text-[10px] font-bold text-slate-400">{timeW || "11:54 AM"}</span>
          </div>
        </div>

      </div>

      {/* 3. Quick Romantic Action Chips */}
      <div className="relative z-10 mt-4 grid grid-cols-4 gap-2 pt-3 border-t border-rose-200/50">
        <button
          onClick={handleSendKiss}
          className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-rose-200/70 bg-white/90 p-2 text-center transition-all hover:bg-rose-50/80 active:scale-95 shadow-xs"
        >
          <span className="text-base">💋</span>
          <span className="text-[10px] font-black text-rose-600">Blow Kiss</span>
        </button>

        <button
          onClick={handleSendHug}
          className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-amber-200/70 bg-white/90 p-2 text-center transition-all hover:bg-amber-50/80 active:scale-95 shadow-xs"
        >
          <span className="text-base">🫂</span>
          <span className="text-[10px] font-black text-amber-700">Virtual Hug</span>
        </button>

        <button
          onClick={() => setShowNoteModal(true)}
          className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-purple-200/70 bg-white/90 p-2 text-center transition-all hover:bg-purple-50/80 active:scale-95 shadow-xs"
        >
          <span className="text-base">💌</span>
          <span className="text-[10px] font-black text-purple-700">Love Note</span>
        </button>

        <button
          onClick={handleSendKiss}
          className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-blue-200/70 bg-white/90 p-2 text-center transition-all hover:bg-blue-50/80 active:scale-95 shadow-xs"
        >
          <span className="text-base">📸</span>
          <span className="text-[10px] font-black text-blue-700">Pic Drop</span>
        </button>
      </div>

      {/* Love Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-[28px] border border-rose-200 bg-white p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-black text-[#44342B] flex items-center gap-1.5">
                💌 Send a Sweet Love Note to {partnerName}
              </span>
              <button onClick={() => setShowNoteModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write a sweet message, compliment, or romantic thought..."
              className="w-full h-24 rounded-2xl border border-rose-200/80 bg-[#FFF9F3] p-3 text-xs font-medium text-[#44342B] focus:outline-none focus:border-rose-400 resize-none"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNoteModal(false)}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSendNote}
                disabled={!noteText.trim()}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white shadow-md shadow-rose-500/20"
              >
                Send 💌
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
