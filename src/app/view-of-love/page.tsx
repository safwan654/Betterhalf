"use client";

import React from "react";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import ViewOfLoveComponent from "@/components/love-tests/ViewOfLoveComponent";

export default function ViewOfLovePage() {
  return (
    <div className="min-h-screen pb-36 text-[#44342B] dark:text-zinc-100 transition-colors duration-300">
      <Header />
      
      <main className="mx-auto max-w-md px-4 pt-4 flex flex-col gap-5">
        <ViewOfLoveComponent />
      </main>

      <BottomNavigation />
    </div>
  );
}
