"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Heart, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobal } from "@/context/GlobalContext";
import Link from "next/link";

export default function Header() {
  const { 
    relationshipMode, setRelationshipMode, 
    activeUser, setActiveUser,
    husbandTimezone, wifeTimezone,
    husbandName, wifeName,
    husbandPhoto, wifePhoto
  } = useGlobal();
  
  const [isDark, setIsDark] = useState(false);
  const [timeNY, setTimeNY] = useState("");
  const [timeDubai, setTimeDubai] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDarkClass = document.documentElement.classList.contains("dark");
    setIsDark(isDarkClass);

    // Set up dual clocks for LDR mode based on global settings
    const updateClocks = () => {
      try {
        const ny = new Date().toLocaleTimeString("en-US", { timeZone: husbandTimezone, hour: "2-digit", minute: "2-digit" });
        const dubai = new Date().toLocaleTimeString("en-US", { timeZone: wifeTimezone, hour: "2-digit", minute: "2-digit" });
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

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  if (!mounted) return null;

  const currentPhoto = activeUser === "HUSBAND" ? husbandPhoto : wifePhoto;
  const currentInitial = activeUser === "HUSBAND" ? husbandName.charAt(0) : wifeName.charAt(0);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-950/70">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-sm shadow-rose-500/20">
            <Heart className="h-4.5 w-4.5 fill-current" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-800 dark:text-zinc-100">BetterHalf</h1>
            {relationshipMode === "TOGETHER" ? (
              <p className="text-[9px] font-medium text-slate-400 dark:text-zinc-500">{today}</p>
            ) : (
              <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-450 dark:text-zinc-400">
                <span className="text-amber-500">{husbandName.charAt(0)}: {timeNY}</span>
                <span>•</span>
                <span className="text-rose-500">{wifeName.charAt(0)}: {timeDubai}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Relationship Mode Toggle */}
          <button
            onClick={() => setRelationshipMode(relationshipMode === "TOGETHER" ? "DISTANCE" : "TOGETHER")}
            className="flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-slate-50/80 px-2.5 py-1 text-[10px] font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <span>{relationshipMode === "TOGETHER" ? "🏠 Together" : "✈️ LDR"}</span>
          </button>

          {/* Active User Switcher */}
          <button
            onClick={() => setActiveUser(activeUser === "HUSBAND" ? "WIFE" : "HUSBAND")}
            className="flex items-center gap-1 rounded-full border border-slate-200/70 bg-slate-50/80 p-0.5 pr-2 text-[10px] font-semibold text-slate-750 shadow-sm transition-all hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850"
          >
            <div className={cn(
              "h-4.5 w-4.5 rounded-full flex items-center justify-center text-[9px] text-white font-bold transition-all-custom overflow-hidden",
              activeUser === "HUSBAND" 
                ? "bg-amber-500 shadow-sm shadow-amber-500/30" 
                : "bg-rose-500 shadow-sm shadow-rose-500/30"
            )}>
              {currentPhoto ? (
                <img src={currentPhoto} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                currentInitial.toUpperCase()
              )}
            </div>
          </button>

          {/* Settings Link */}
          <Link
            href="/settings"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200/70 text-slate-500 transition-all hover:bg-slate-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            <SettingsIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
