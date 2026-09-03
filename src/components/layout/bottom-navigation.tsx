"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Activity, Wallet, Grip } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Finance", href: "/finance", icon: Wallet },
    { label: "Spiritual", href: "/spiritual", icon: Sparkles },
    { label: "Health", href: "/health", icon: Activity },
    { label: "More", href: "/more", icon: Grip },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/60 bg-white/90 backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-950/90 pt-1.5 pb-[max(env(safe-area-inset-bottom,18px),18px)] shadow-[0_-4px_25px_rgba(0,0,0,0.04)]">
      <div className="mx-auto flex max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-0.5 text-[11px] font-bold transition-all active:scale-95",
                isActive
                  ? "text-rose-500 dark:text-rose-400 font-extrabold"
                  : "text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              )}
            >
              <div className={cn(
                "rounded-2xl px-3 py-1 transition-all duration-200",
                isActive ? "bg-rose-500/10 dark:bg-rose-400/15 scale-105" : ""
              )}>
                <Icon className={cn("h-5 w-5 transition-transform", isActive ? "stroke-[2.5]" : "stroke-[1.75]")} />
              </div>
              <span className="leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}