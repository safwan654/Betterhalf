"use client";

import React from "react";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import JournalCalendar from "@/components/journal/JournalCalendar";

export default function JournalPage() {
  return (
    <div className="min-h-screen pb-36 text-[#44342B] dark:text-zinc-100 transition-colors duration-300">
      <Header />
      
      <main className="mx-auto max-w-md px-4 pt-4 flex flex-col gap-5">
        <JournalCalendar />
      </main>

      <BottomNavigation />
    </div>
  );
}
