"use client";

import { useEffect, useState } from "react";
import { useGlobal } from "@/context/GlobalContext";

export default function EntryAnimation() {
  const { pendingAnimation, clearPendingAnimation } = useGlobal();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (pendingAnimation) {
      setShow(true);
      // Wait slightly less than the 4s global context timeout to fade out
      const timer = setTimeout(() => setShow(false), 3500);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [pendingAnimation]);

  if (pendingAnimation !== "HUG" && pendingAnimation !== "KISS") return null;

  return (
    <div 
      onClick={clearPendingAnimation}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-500 cursor-pointer ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <div 
        className={`text-[8rem] transform transition-all duration-1000 ${
          show ? "scale-100 translate-y-0" : "scale-50 translate-y-12"
        } ${pendingAnimation === "HUG" ? "animate-bounce" : "animate-pulse"}`}
      >
        {pendingAnimation === "HUG" ? "🤗" : "😘"}
      </div>
      <div className={`absolute bottom-32 text-white font-black text-2xl tracking-tight transition-opacity duration-1000 ${show ? "opacity-100" : "opacity-0"}`}>
        You received a {pendingAnimation === "HUG" ? "Hug" : "Kiss"}!
      </div>
    </div>
  );
}
