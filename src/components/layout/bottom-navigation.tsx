"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Activity, BookHeart, Grip } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Journal", href: "/journal", icon: BookHeart },
    { label: "Spiritual", href: "/spiritual", icon: Sparkles },
    { label: "Health", href: "/health", icon: Activity },
    { label: "More", href: "/more", icon: Grip },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#FFE2D1]/80 bg-[#FFF8F3]/90 backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-950/90 pt-2 pb-[max(env(safe-area-inset-bottom,18px),18px)] shadow-[0_-4px_25px_rgba(255,140,140,0.06)]">
      <div className="mx-auto flex max-w-md items-center justify-around px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-0.5 text-[10px] font-extrabold transition-all active:scale-90",
                isActive
                  ? "text-rose-500 font-black"
                  : "text-[#826F66] hover:text-[#44342B] dark:text-zinc-500 dark:hover:text-zinc-300"
              )}
            >
              <div className={cn(
                "rounded-2xl px-3.5 py-1 transition-all duration-200",
                isActive ? "bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 scale-105 shadow-2xs" : ""
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