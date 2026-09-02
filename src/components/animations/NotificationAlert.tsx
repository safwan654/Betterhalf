"use client";

import { useEffect, useState } from "react";
import { useGlobal } from "@/context/GlobalContext";
import { CheckSquare, Heart, Sparkles, Bell } from "lucide-react";

export default function NotificationAlert() {
  const { pendingAnimation, interactionPayload, activeUser, husbandName, wifeName, clearPendingAnimation } = useGlobal();
  const [show, setShow] = useState(false);
  const [alertContent, setAlertContent] = useState({ title: "", subtitle: "", type: "", icon: <Sparkles className="h-6 w-6" /> });

  useEffect(() => {
    if (pendingAnimation) {
      const partnerName = activeUser === "HUSBAND" ? wifeName : husbandName;
      
      let title = "";
      let subtitle = "";
      let icon = <Sparkles className="h-6 w-6 text-white" />;
      
      if (pendingAnimation === "TASK_ALERT") {
        title = `${partnerName} Assigned a Task`;
        subtitle = interactionPayload || "a new task";
        icon = <CheckSquare className="h-6 w-6 text-white" />;
      } else if (pendingAnimation === "PRAYER_ALERT") {
        title = "Prayer Reminder 🕌";
        subtitle = interactionPayload || `${partnerName} sent a prayer reminder`;
        icon = <Bell className="h-6 w-6 text-white" />;
      } else if (pendingAnimation === "PRAYER_COMPLETE") {
        title = "Prayer Completed ✅";
        subtitle = interactionPayload || `${partnerName} completed prayer`;
        icon = <Sparkles className="h-6 w-6 text-white" />;
      } else if (pendingAnimation === "PRAYER_CELEBRATION") {
        title = "Prayer Complete Together 🤍";
        subtitle = interactionPayload || "Alhamdulillah! Both of you prayed today!";
        icon = <Heart className="h-6 w-6 text-white" fill="white" />;
      } else if (pendingAnimation === "HUG") {
        title = "Virtual Hug!";
        subtitle = `${partnerName} sent you a hug 🫂`;
        icon = <Heart className="h-6 w-6 text-white" fill="white" />;
      } else if (pendingAnimation === "KISS") {
        title = "Virtual Kiss!";
        subtitle = `${partnerName} sent you a kiss 😘`;
        icon = <Heart className="h-6 w-6 text-white" fill="white" />;
      }

      setAlertContent({ title, subtitle, type: pendingAnimation, icon });
      setShow(true);
      
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(clearPendingAnimation, 500); // clear after animation finishes
      }, 4500);
      
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [pendingAnimation, interactionPayload]);

  if (!pendingAnimation && !show) return null;

  return (
    <div 
      onClick={() => {
        setShow(false);
        setTimeout(clearPendingAnimation, 500);
      }}
      className={`fixed top-4 left-4 right-4 z-[100] flex justify-center cursor-pointer transition-all duration-500 transform ${
        show ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
      }`}
    >
      <div className={`text-white rounded-2xl p-4 shadow-xl flex items-center gap-4 max-w-sm w-full border ${
        alertContent.type === "TASK_ALERT" ? "bg-amber-500 shadow-amber-500/20 border-amber-400" :
        alertContent.type === "PRAYER_ALERT" ? "bg-amber-500 shadow-amber-500/20 border-amber-400" :
        alertContent.type === "PRAYER_COMPLETE" ? "bg-emerald-600 shadow-emerald-600/20 border-emerald-500" :
        alertContent.type === "PRAYER_CELEBRATION" ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/30 border-emerald-400" :
        "bg-rose-500 shadow-rose-500/20 border-rose-400"
      }`}>
        <div className="bg-white/20 p-2 rounded-full">
          {alertContent.icon}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider font-extrabold opacity-90">
            {alertContent.title}
          </span>
          <span className="font-bold text-sm line-clamp-1">{alertContent.subtitle}</span>
        </div>
      </div>
    </div>
  );
}
