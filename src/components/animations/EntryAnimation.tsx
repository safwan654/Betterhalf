"use client";

import { useEffect, useState } from "react";
import { useGlobal } from "@/context/GlobalContext";
import { Heart, Sparkles } from "lucide-react";

export default function EntryAnimation() {
  const { 
    pendingAnimation, 
    interactionPayload, 
    activeUser, 
    husbandName, 
    wifeName, 
    husbandPhoto, 
    wifePhoto, 
    sendInteraction, 
    clearPendingAnimation 
  } = useGlobal();
  const [show, setShow] = useState(false);

  const partnerName = activeUser === "HUSBAND" ? wifeName : husbandName;
  const partnerPhoto = activeUser === "HUSBAND" ? wifePhoto : husbandPhoto;

  useEffect(() => {
    if (pendingAnimation === "HUG" || pendingAnimation === "KISS") {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(clearPendingAnimation, 500);
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [pendingAnimation, clearPendingAnimation]);

  if (pendingAnimation !== "HUG" && pendingAnimation !== "KISS") return null;

  const isHug = pendingAnimation === "HUG";

  const handleReturnLove = (e: React.MouseEvent) => {
    e.stopPropagation();
    sendInteraction(isHug ? "KISS" : "HUG");
    setShow(false);
    setTimeout(clearPendingAnimation, 500);
  };

  return (
    <div 
      onClick={() => {
        setShow(false);
        setTimeout(clearPendingAnimation, 500);
      }}
      className={`fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md transition-all duration-500 cursor-pointer overflow-hidden ${
        show ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Floating Animated Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl animate-bounce"
            style={{
              top: `${(i * 17) % 90}%`,
              left: `${(i * 23) % 90}%`,
              animationDuration: `${2 + (i % 3)}s`,
              animationDelay: `${(i * 0.2)}s`,
              opacity: 0.6
            }}
          >
            {isHug 
              ? (i % 3 === 0 ? "💖" : i % 3 === 1 ? "🤗" : "✨") 
              : (i % 3 === 0 ? "💋" : i % 3 === 1 ? "😘" : "💖")}
          </div>
        ))}
      </div>

      {/* Main Celebration Card */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`relative z-10 glass-panel max-w-xs w-full rounded-3xl p-6 shadow-2xl border flex flex-col items-center text-center gap-4 transform transition-all duration-500 bg-white/95 dark:bg-zinc-900/95 ${
          isHug ? "border-rose-300 dark:border-rose-800/60" : "border-pink-300 dark:border-pink-800/60"
        } ${show ? "scale-100 translate-y-0" : "scale-75 translate-y-8"}`}
      >
        {/* Partner DP & Badge */}
        <div className="relative">
          <div className="h-16 w-16 rounded-full overflow-hidden border-3 border-rose-500 shadow-lg shadow-rose-500/30 flex items-center justify-center text-2xl font-black bg-rose-500 text-white">
            {partnerPhoto ? (
              <img src={partnerPhoto} alt={partnerName} className="h-full w-full object-cover" />
            ) : (
              partnerName.charAt(0).toUpperCase()
            )}
          </div>
          <span className="absolute -bottom-1 -right-1 text-2xl">
            {isHug ? "🤗" : "💋"}
          </span>
        </div>

        {/* Big Animated Central Emoji */}
        <div className="text-6xl animate-pulse -my-1">
          {isHug ? "🫂" : "😘"}
        </div>

        {/* Title & Sweet Message */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3" /> {isHug ? "Warm Hug Received" : "Sweet Kiss Received"}
          </span>
          <h3 className="text-lg font-black text-slate-800 dark:text-zinc-100">
            {isHug ? `Hug from ${partnerName}` : `Kiss from ${partnerName}`}
          </h3>
          <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mt-0.5 italic">
            "{interactionPayload || (isHug ? "Wrapping you in warmth and love from afar!" : "Mwah! Thinking of you and sending all my love!")}"
          </p>
        </div>

        {/* Return the love button */}
        <button
          onClick={handleReturnLove}
          className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-xs shadow-md shadow-rose-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <Heart className="h-3.5 w-3.5 fill-white" />
          {isHug ? "Blow a Kiss Back 😘" : "Send a Hug Back 🤗"}
        </button>
      </div>
    </div>
  );
}
