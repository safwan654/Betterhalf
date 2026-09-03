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
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-slate-200/50 bg-white/80 backdrop-blur-lg dark:border-zinc-800/50 dark:bg-zinc-900/80">
      <div className="mx-auto flex h-full max-w-md items-center justify-around px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-1 text-xs font-medium transition-all-custom",
                isActive
                  ? "text-rose-500 dark:text-rose-400"
                  : "text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              )}
            >
              <div className={cn(
                "rounded-full px-3 py-1 transition-all-custom",
                isActive ? "bg-rose-500/10 dark:bg-rose-400/10" : ""
              )}>
                <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}