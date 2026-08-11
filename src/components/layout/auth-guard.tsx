"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useGlobal } from "@/context/GlobalContext";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useGlobal();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Basic protection logic
    if (!isAuthenticated && pathname !== "/login") {
      router.replace("/login");
    } else {
      setIsReady(true);
    }
  }, [isAuthenticated, pathname, router]);

  if (!isReady || (!isAuthenticated && pathname !== "/login")) {
    // Show a loading splash screen or nothing while verifying
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-rose-500 animate-spin" />
        <span className="text-xs font-bold text-slate-400 mt-4 animate-pulse">Syncing Household...</span>
      </div>
    );
  }

  return <>{children}</>;
}
