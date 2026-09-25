"use client";

import { useState, useEffect } from "react";
import { Heart, Settings as SettingsIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobal } from "@/context/GlobalContext";
import Link from "next/link";

export default function Header() {
  const { 
    relationshipMode, setRelationshipMode, 
    activeUser,
    husbandTimezone, wifeTimezone,
    husbandName, wifeName,
    husbandPhoto, wifePhoto
  } = useGlobal();
  
  const [timeNY, setTimeNY] = useState("");
  const [timeDubai, setTimeDubai] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const updateClocks = () => {
      try {
        const ny = new Date().toLocaleTimeString("en-US", { timeZone: husbandTimezone || "Asia/Dubai", hour: "2-digit", minute: "2-digit" });
        const dubai = new Date().toLocaleTimeString("en-US", { timeZone: wifeTimezone || "Asia/Kolkata", hour: "2-digit", minute: "2-digit" });
        setTimeNY(ny);
        setTimeDubai(dubai);
      } catch (e) {
        console.error("Invalid timezone");
      }
    };

    updateClocks();
    const interval = setInterval(updateClocks, 60000);
    return () => clearInterval(interval);
  }, [husbandTimezone, wifeTimezone]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  if (!mounted) return null;

  const currentPhoto = activeUser === "HUSBAND" ? husbandPhoto : wifePhoto;
  const currentInitial = activeUser === "HUSBAND" ? husbandName.charAt(0) : wifeName.charAt(0);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#FFE2D1]/80 bg-[#FFF8F3]/85 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        
        {/* Brand Logo & Cute Heart Icon */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-400 to-amber-400 text-white shadow-sm shadow-rose-500/25 transition-transform group-hover:scale-105 active:scale-95">
            <Heart className="h-4.5 w-4.5 fill-current animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-tight text-[#44342B] dark:text-zinc-100 flex items-center gap-1">
              BetterHalf <span className="text-[10px] text-rose-500 font-extrabold">²</span>
            </h1>
            {relationshipMode === "TOGETHER" ? (
              <p className="text-[9px] font-bold text-[#826F66] dark:text-zinc-400">{today}</p>
            ) : (
              <div className="flex items-center gap-1.5 text-[8px] font-bold text-[#826F66] dark:text-zinc-400">
                <span className="text-amber-600">{husbandName.charAt(0)}: {timeNY}</span>
                <span>•</span>
                <span className="text-rose-500">{wifeName.charAt(0)}: {timeDubai}</span>
              </div>
            )}
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Relationship Mode Pill */}
          <button
            onClick={() => setRelationshipMode(relationshipMode === "TOGETHER" ? "DISTANCE" : "TOGETHER")}
            className="flex items-center gap-1 rounded-full border border-[#FFE2D1] bg-white/90 px-2.5 py-1 text-[10px] font-extrabold text-[#44342B] shadow-2xs transition-all hover:bg-rose-50/60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 active:scale-95"
          >
            <span>{relationshipMode === "TOGETHER" ? "🏠 Together" : "✈️ LDR"}</span>
          </button>

          {/* Active User Avatar Pill */}
          <Link
            href="/settings"
            title={`Logged in as ${activeUser === "HUSBAND" ? husbandName : wifeName}`}
            className="flex items-center gap-1.5 rounded-full border border-[#FFE2D1] bg-white/90 p-0.5 pr-2.5 text-[10px] font-extrabold text-[#44342B] shadow-2xs transition-all hover:bg-rose-50/60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 active:scale-95"
          >
            <div className={cn(
              "h-6 w-6 rounded-full flex items-center justify-center text-[10px] text-white font-black transition-all overflow-hidden shrink-0 border border-white dark:border-zinc-700 shadow-xs",
              activeUser === "HUSBAND" 
                ? "bg-amber-500" 
                : "bg-rose-500"
            )}>
              {currentPhoto ? (
                <img src={currentPhoto} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                currentInitial.toUpperCase()
              )}
            </div>
            <span className="truncate max-w-[70px]">{activeUser === "HUSBAND" ? husbandName : wifeName}</span>
          </Link>

          {/* Settings Icon */}
          <Link
            href="/settings"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#FFE2D1] bg-white/80 text-[#826F66] transition-all hover:bg-rose-50/70 hover:text-rose-500 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            <SettingsIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
