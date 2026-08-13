"use client";

import { useEffect, useState } from "react";
import { useGlobal } from "@/context/GlobalContext";
import { CheckSquare } from "lucide-react";

export default function TaskAlert() {
  const { pendingAnimation, interactionPayload, activeUser, husbandName, wifeName, clearPendingAnimation } = useGlobal();
  const [show, setShow] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");

  useEffect(() => {
    if (pendingAnimation === "TASK_ALERT") {
      setTaskTitle(interactionPayload || "a new task");
      setShow(true);
      const timer = setTimeout(() => setShow(false), 3500);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [pendingAnimation, interactionPayload]);

  if (pendingAnimation !== "TASK_ALERT" && !show) return null;

  const partnerName = activeUser === "HUSBAND" ? wifeName : husbandName;

  return (
    <div 
      onClick={clearPendingAnimation}
      className={`fixed top-4 left-4 right-4 z-[100] flex justify-center cursor-pointer transition-all duration-500 transform ${
        show ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
      }`}
    >
      <div className="bg-amber-500 text-white rounded-2xl p-4 shadow-xl shadow-amber-500/20 flex items-center gap-4 max-w-sm w-full border border-amber-400">
        <div className="bg-white/20 p-2 rounded-full">
          <CheckSquare className="h-6 w-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-100">
            {partnerName} Assigned a Task
          </span>
          <span className="font-bold text-sm line-clamp-1">{taskTitle}</span>
        </div>
      </div>
    </div>
  );
}
