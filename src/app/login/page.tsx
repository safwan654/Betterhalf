"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobal } from "@/context/GlobalContext";
import { Heart, Lock } from "lucide-react";

export default function Login() {
  const [pin, setPin] = useState("");
  const [selectedUser, setSelectedUser] = useState<"HUSBAND" | "WIFE" | null>(null);
  const [error, setError] = useState(false);
  const { login } = useGlobal();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setError(true);
      return;
    }
    
    const success = login(pin, selectedUser);
    if (success) {
      router.replace("/");
    } else {
      setError(true);
      setPin("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col gap-8 bg-white dark:bg-zinc-900 p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-zinc-800">
        
        <div className="flex flex-col items-center text-center gap-3">
          <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20 mb-2">
            <Heart className="h-8 w-8 text-white fill-current" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-zinc-100">BetterHalf OS</h1>
          <p className="text-xs font-semibold text-slate-400 dark:text-zinc-500 max-w-[80%]">
            Enter your household PIN to sync your shared life.
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500 text-center">Who is logging in?</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setSelectedUser("HUSBAND"); setError(false); }}
                className={`py-3 rounded-2xl border-2 font-bold text-sm transition-all active:scale-95 ${
                  selectedUser === "HUSBAND" 
                    ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-500" 
                    : "border-slate-100 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:border-slate-200 dark:hover:border-zinc-700"
                }`}
              >
                Husband
              </button>
              <button
                type="button"
                onClick={() => { setSelectedUser("WIFE"); setError(false); }}
                className={`py-3 rounded-2xl border-2 font-bold text-sm transition-all active:scale-95 ${
                  selectedUser === "WIFE" 
                    ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-500" 
                    : "border-slate-100 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:border-slate-200 dark:hover:border-zinc-700"
                }`}
              >
                Wife
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 relative mt-2">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="password"
                placeholder="Household PIN"
                value={pin}
                onChange={(e) => { setPin(e.target.value); setError(false); }}
                maxLength={4}
                className="w-full bg-slate-50 dark:bg-zinc-950 border-2 border-slate-100 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-center text-lg font-black tracking-[0.5em] focus:outline-none focus:border-rose-500/50 transition-colors"
              />
            </div>
            {error && <span className="text-[10px] font-bold text-rose-500 text-center animate-pulse">Invalid credentials or user not selected.</span>}
          </div>

          <button
            type="submit"
            className="w-full bg-slate-800 hover:bg-slate-700 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95 mt-2"
          >
            Access Household
          </button>
          
          <div className="text-center text-[10px] font-medium text-slate-400 dark:text-zinc-500">
            Enter ANY 4-digit PIN to Create or Join a Household
          </div>
        </form>

      </div>
    </div>
  );
}
