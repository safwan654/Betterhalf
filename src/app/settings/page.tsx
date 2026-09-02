"use client";

import { useGlobal } from "@/context/GlobalContext";
import { useRouter } from "next/navigation";
import { LogOut, Globe, HeartHandshake, Camera, Save, Check, Bell, Clock } from "lucide-react";
import { useMemo, useEffect, useState, useRef } from "react";
import { subscribeUserToPush } from "@/lib/push";
import { CITY_PRESETS, UserLocation } from "@/lib/prayer-times";

export default function Settings() {
  const globalContext = useGlobal();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state for the form
  const [localHusbandName, setLocalHusbandName] = useState("");
  const [localWifeName, setLocalWifeName] = useState("");
  const [localHusbandPhoto, setLocalHusbandPhoto] = useState<string | null>(null);
  const [localWifePhoto, setLocalWifePhoto] = useState<string | null>(null);
  const [localRelationshipMode, setLocalRelationshipMode] = useState<"TOGETHER" | "DISTANCE">("TOGETHER");
  const [localHusbandTimezone, setLocalHusbandTimezone] = useState("");
  const [localWifeTimezone, setLocalWifeTimezone] = useState("");
  const [localHusbandLocation, setLocalHusbandLocation] = useState<UserLocation>(CITY_PRESETS["Dubai, UAE"]);
  const [localWifeLocation, setLocalWifeLocation] = useState<UserLocation>(CITY_PRESETS["Mumbai, India"]);
  const [localCurrency, setLocalCurrency] = useState("$");
  const [localReminderTone, setLocalReminderTone] = useState<"GENTLE" | "DIRECT" | "PLAYFUL">("GENTLE");
  const [localMadhhab, setLocalMadhhab] = useState<"STANDARD" | "HANAFI">("STANDARD");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [pushStatus, setPushStatus] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleEnablePush = async () => {
    setIsSubscribing(true);
    setPushStatus(null);
    const res = await subscribeUserToPush(globalContext.activeUser, globalContext.householdPin || "");
    setIsSubscribing(false);
    if (res.success) {
      setPushStatus("SUCCESS: Push notifications enabled on this device! Tap 'Send Test Notification' below to verify.");
    } else {
      setPushStatus(`ERROR: ${res.reason}`);
    }
  };

  const handleTestPush = async () => {
    setPushStatus("Sending test push notification...");
    try {
      const res = await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          householdPin: globalContext.householdPin,
          targetUser: globalContext.activeUser,
          title: "Test Notification 🔔",
          body: "If you see this, push notifications are working on your phone!"
        })
      });
      const data = await res.json();
      if (data.success) {
        setPushStatus("SUCCESS: Test notification sent! Lock your phone or check your notification bar.");
      } else {
        setPushStatus(`ERROR: ${data.message || data.error || "No subscription found. Please tap 'Enable Push Notifications' first."}`);
      }
    } catch (err: any) {
      setPushStatus(`ERROR: ${err.message}`);
    }
  };

  useEffect(() => {
    // Initialize local state from global context once mounted
    setLocalHusbandName(globalContext.husbandName);
    setLocalWifeName(globalContext.wifeName);
    setLocalHusbandPhoto(globalContext.husbandPhoto);
    setLocalWifePhoto(globalContext.wifePhoto);
    setLocalRelationshipMode(globalContext.relationshipMode);
    setLocalHusbandTimezone(globalContext.husbandTimezone);
    setLocalWifeTimezone(globalContext.wifeTimezone);
    setLocalCurrency(globalContext.currency || "$");
    setLocalReminderTone(globalContext.reminderTone || "GENTLE");
    setLocalMadhhab(globalContext.madhhab || "STANDARD");
    if (globalContext.husbandLocation) setLocalHusbandLocation(globalContext.husbandLocation);
    if (globalContext.wifeLocation) setLocalWifeLocation(globalContext.wifeLocation);
    setMounted(true);
  }, [
    globalContext.husbandName, globalContext.wifeName, globalContext.husbandPhoto, 
    globalContext.wifePhoto, globalContext.relationshipMode, globalContext.husbandTimezone, 
    globalContext.wifeTimezone, globalContext.currency, globalContext.reminderTone, globalContext.madhhab,
    globalContext.husbandLocation, globalContext.wifeLocation
  ]);

  const handleLogout = () => {
    globalContext.logout();
    router.replace("/login");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (globalContext.activeUser === "HUSBAND") {
        setLocalHusbandPhoto(base64String);
      } else {
        setLocalWifePhoto(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setIsSaving(true);
    // Push local state to global context (which saves to Firebase/LocalStorage)
    globalContext.setHusbandName(localHusbandName);
    globalContext.setWifeName(localWifeName);
    globalContext.setHusbandPhoto(localHusbandPhoto);
    globalContext.setWifePhoto(localWifePhoto);
    globalContext.setRelationshipMode(localRelationshipMode);
    globalContext.setHusbandTimezone(localHusbandTimezone);
    globalContext.setWifeTimezone(localWifeTimezone);
    globalContext.setHusbandLocation(localHusbandLocation);
    globalContext.setWifeLocation(localWifeLocation);
    globalContext.setCurrency(localCurrency);
    globalContext.setReminderTone(localReminderTone);
    globalContext.setMadhhab(localMadhhab);
    
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }, 600); // Tiny visual delay for UX
  };

  const timezones = useMemo(() => {
    try {
      if (typeof Intl !== 'undefined' && Intl.supportedValuesOf) {
        const list = Intl.supportedValuesOf('timeZone').map(tz => {
          const date = new Date();
          const formatter = new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'shortOffset' });
          const parts = formatter.formatToParts(date);
          let offsetStr = parts.find(p => p.type === 'timeZoneName')?.value || 'GMT';
          
          if (offsetStr === 'GMT') offsetStr = 'GMT+0';
          
          let offsetVal = 0;
          if (offsetStr !== 'GMT') {
            const sign = offsetStr.includes('-') ? -1 : 1;
            const nums = offsetStr.replace('GMT', '').replace('+', '').replace('-', '').split(':');
            const hours = parseInt(nums[0] || '0', 10);
            const mins = parseInt(nums[1] || '0', 10);
            offsetVal = sign * (hours * 60 + mins);
          }
          
          const timeFormatter = new Intl.DateTimeFormat('en', { timeZone: tz, hour: 'numeric', minute: '2-digit' });
          const time = timeFormatter.format(date);
          
          const simpleName = tz.split('/').pop()?.replace(/_/g, ' ') || tz;
          
          return { 
            id: tz, 
            label: `(${offsetStr}) ${simpleName}`, 
            offsetVal 
          };
        });

        // Remove duplicates with same label (e.g. America/New_York and America/Detroit often have same offset, but names are different. So keep all, just sort)
        list.sort((a, b) => a.offsetVal - b.offsetVal || a.label.localeCompare(b.label));
        return list;
      }
    } catch (e) {
      console.error(e);
    }
    return [
      { id: "America/New_York", label: "America/New_York" },
      { id: "Asia/Dubai", label: "Asia/Dubai" }
    ];
  }, []);

  if (!mounted) return null;

  const currentName = globalContext.activeUser === "HUSBAND" ? localHusbandName : localWifeName;
  const currentPhoto = globalContext.activeUser === "HUSBAND" ? localHusbandPhoto : localWifePhoto;
  
  const handleNameChange = (val: string) => {
    if (globalContext.activeUser === "HUSBAND") setLocalHusbandName(val);
    else setLocalWifeName(val);
  };

  return (
    <div className="min-h-screen bg-background pb-24 text-slate-800 dark:text-zinc-100 transition-colors duration-300">
      
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-950/70">
        <div className="mx-auto flex h-14 max-w-md items-center px-4 gap-3">
          <button onClick={() => router.back()} className="text-sm font-bold text-slate-400 hover:text-slate-700 dark:hover:text-zinc-300">
            ← Back
          </button>
          <h1 className="text-sm font-bold tracking-tight text-slate-800 dark:text-zinc-100">Profile & Settings</h1>
        </div>
      </header>
      
      <main className="mx-auto max-w-md px-4 pt-6 flex flex-col gap-6">
        
        {/* Profile Card / Editor */}
        <section className="glass-panel rounded-3xl p-5 shadow-sm border border-slate-100/50 dark:border-zinc-850 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="h-16 w-16 rounded-full overflow-hidden bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20 text-2xl font-black text-white relative">
                {currentPhoto ? (
                  <img src={currentPhoto} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  currentName.charAt(0).toUpperCase()
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 h-6 w-6 bg-slate-800 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-zinc-900 transition-transform active:scale-95"
              >
                <Camera className="h-3 w-3" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            
            <div className="flex flex-col flex-1 gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Editing {globalContext.activeUser}</span>
              <input 
                type="text" 
                value={currentName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Your Name"
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Global Settings */}
        <section className="flex flex-col gap-3">
          <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-1">Household Preferences</h3>
          
          <div className="glass-panel rounded-3xl p-5 shadow-sm border border-slate-100/50 dark:border-zinc-850 flex flex-col gap-5">
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
                <HeartHandshake className="h-4 w-4 text-rose-500" /> Relationship Mode
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-zinc-900 p-1 rounded-xl border border-slate-100 dark:border-zinc-800">
                <button
                  onClick={() => setLocalRelationshipMode("TOGETHER")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    localRelationshipMode === "TOGETHER" 
                      ? "bg-white dark:bg-zinc-800 shadow-sm text-slate-800 dark:text-zinc-100" 
                      : "text-slate-400 dark:text-zinc-500 hover:text-slate-600"
                  }`}
                >
                  🏠 Together
                </button>
                <button
                  onClick={() => setLocalRelationshipMode("DISTANCE")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    localRelationshipMode === "DISTANCE" 
                      ? "bg-white dark:bg-zinc-800 shadow-sm text-slate-800 dark:text-zinc-100" 
                      : "text-slate-400 dark:text-zinc-500 hover:text-slate-600"
                  }`}
                >
                  ✈️ LDR
                </button>
              </div>
            </div>

            {/* Timezone Setup - ONLY SHOW IF LDR */}
            {localRelationshipMode === "DISTANCE" && (
              <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-amber-500" /> Timezone Setup
                </label>
                <p className="text-[9px] text-slate-400 dark:text-zinc-500 mb-1">
                  Select your respective global timezones. When LDR mode is active, the dashboard clocks will sync to these locations automatically.
                </p>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{localHusbandName || "Husband"}'s Location</span>
                    <select 
                      value={localHusbandTimezone}
                      onChange={(e) => setLocalHusbandTimezone(e.target.value)}
                      className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs rounded-xl px-2.5 py-2 font-medium focus:outline-none focus:border-amber-500/50"
                    >
                      {timezones.map(tz => <option key={tz.id} value={tz.id}>{tz.label}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{localWifeName || "Wife"}'s Location</span>
                    <select 
                      value={localWifeTimezone}
                      onChange={(e) => setLocalWifeTimezone(e.target.value)}
                      className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs rounded-xl px-2.5 py-2 font-medium focus:outline-none focus:border-rose-500/50"
                    >
                      {timezones.map(tz => <option key={tz.id} value={tz.id}>{tz.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-slate-100 dark:border-zinc-800">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
                Household Currency
              </label>
              <p className="text-[9px] text-slate-400 dark:text-zinc-500 mb-1">
                Select the primary currency for your shared finance tracker.
              </p>
              <select 
                value={localCurrency}
                onChange={(e) => setLocalCurrency(e.target.value)}
                className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs rounded-xl px-2.5 py-2 font-medium focus:outline-none focus:border-emerald-500/50"
              >
                <option value="$">$ (USD / AUD / CAD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
                <option value="AED">AED (UAE Dirham)</option>
                <option value="SAR">SAR (Saudi Riyal)</option>
                <option value="INR">₹ (INR)</option>
                <option value="EGP">EGP (Egyptian Pound)</option>
                <option value="PKR">PKR (Pakistani Rupee)</option>
                <option value="BDT">BDT (Bangladeshi Taka)</option>
              </select>
            </div>

            {/* Phone Push Notifications */}
            <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 dark:border-zinc-800">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-amber-500" /> Phone Push Notifications
              </label>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                Receive system notifications on your phone's lock screen when your partner sends a hug, kiss, prayer update, or task assignment.
              </p>

              {/* Household Device Status Box */}
              <div className="grid grid-cols-2 gap-2 my-1 p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${globalContext.hasHusbandPush ? "bg-emerald-500 animate-pulse" : "bg-slate-300 dark:bg-zinc-700"}`} />
                  <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 truncate">
                    {globalContext.husbandName}: {globalContext.hasHusbandPush ? "Active ✅" : "Disabled ❌"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${globalContext.hasWifePush ? "bg-emerald-500 animate-pulse" : "bg-slate-300 dark:bg-zinc-700"}`} />
                  <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 truncate">
                    {globalContext.wifeName}: {globalContext.hasWifePush ? "Active ✅" : "Disabled ❌"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-1">
                <button
                  type="button"
                  onClick={handleEnablePush}
                  disabled={isSubscribing}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 active:scale-95 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all disabled:opacity-50"
                >
                  <Bell className="h-4 w-4" />
                  {isSubscribing ? "Subscribing Phone..." : "1. Enable Push Notifications on this Phone"}
                </button>
                <button
                  type="button"
                  onClick={handleTestPush}
                  className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 active:scale-95 text-slate-700 dark:text-zinc-300 font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-200 dark:border-zinc-700 transition-all"
                >
                  <Bell className="h-4 w-4 text-amber-500" />
                  2. Send Test Notification to This Phone
                </button>
              </div>
              {pushStatus && (
                <span className={`text-[10px] font-bold mt-1.5 p-2.5 rounded-xl block ${pushStatus.startsWith("SUCCESS") ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : pushStatus.startsWith("ERROR") ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"}`}>
                  {pushStatus}
                </span>
              )}
            </div>
            
          </div>
        </section>

        {/* Spiritual & Prayer Preferences */}
        <section className="flex flex-col gap-3">
          <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-1">
            Spiritual & Prayer Settings
          </h3>
          <div className="glass-panel rounded-3xl p-5 shadow-sm border border-slate-100/50 dark:border-zinc-850 flex flex-col gap-5">
            {/* Reminder Tone */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-amber-500" /> Prayer Reminder Tone
              </label>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                Choose the wording style for prayer reminders sent to your partner.
              </p>
              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-zinc-900 p-1 rounded-xl border border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setLocalReminderTone("GENTLE")}
                  className={`py-2 px-1 text-[11px] font-bold rounded-lg transition-all ${
                    localReminderTone === "GENTLE" 
                      ? "bg-white dark:bg-zinc-800 shadow-sm text-slate-800 dark:text-zinc-100" 
                      : "text-slate-400 dark:text-zinc-500 hover:text-slate-600"
                  }`}
                >
                  🌿 Gentle
                </button>
                <button
                  type="button"
                  onClick={() => setLocalReminderTone("DIRECT")}
                  className={`py-2 px-1 text-[11px] font-bold rounded-lg transition-all ${
                    localReminderTone === "DIRECT" 
                      ? "bg-white dark:bg-zinc-800 shadow-sm text-slate-800 dark:text-zinc-100" 
                      : "text-slate-400 dark:text-zinc-500 hover:text-slate-600"
                  }`}
                >
                  🕌 Direct
                </button>
                <button
                  type="button"
                  onClick={() => setLocalReminderTone("PLAYFUL")}
                  className={`py-2 px-1 text-[11px] font-bold rounded-lg transition-all ${
                    localReminderTone === "PLAYFUL" 
                      ? "bg-white dark:bg-zinc-800 shadow-sm text-slate-800 dark:text-zinc-100" 
                      : "text-slate-400 dark:text-zinc-500 hover:text-slate-600"
                  }`}
                >
                  ✨🤍 Playful
                </button>
              </div>
              <span className="text-[9px] text-slate-400 italic">
                {localReminderTone === "GENTLE" && 'Preview: "Warm reminder from [Name]: Time for prayer 🌿"'}
                {localReminderTone === "DIRECT" && 'Preview: "[Name]: Time for prayer 🕌"'}
                {localReminderTone === "PLAYFUL" && 'Preview: "Hey love! [Name] is checking in: don\'t forget prayer! ✨🤍"'}
              </span>
            </div>

            {/* Asr Madhhab Calculation */}
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-emerald-500" /> Asr Calculation (Madhhab)
              </label>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                Determines how Asr prayer start time is calculated for your household.
              </p>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-zinc-900 p-1 rounded-xl border border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setLocalMadhhab("STANDARD")}
                  className={`py-2 text-[11px] font-bold rounded-lg transition-all ${
                    localMadhhab === "STANDARD" 
                      ? "bg-white dark:bg-zinc-800 shadow-sm text-slate-800 dark:text-zinc-100" 
                      : "text-slate-400 dark:text-zinc-500 hover:text-slate-600"
                  }`}
                >
                  Standard (Shafi'i/Hanbali/Maliki)
                </button>
                <button
                  type="button"
                  onClick={() => setLocalMadhhab("HANAFI")}
                  className={`py-2 text-[11px] font-bold rounded-lg transition-all ${
                    localMadhhab === "HANAFI" 
                      ? "bg-white dark:bg-zinc-800 shadow-sm text-slate-800 dark:text-zinc-100" 
                      : "text-slate-400 dark:text-zinc-500 hover:text-slate-600"
                  }`}
                >
                  Hanafi (Later Asr)
                </button>
              </div>
            </div>

            {/* Independent Prayer Locations */}
            <div className="flex flex-col gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-blue-500" /> Independent Prayer Locations
              </label>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                Prayer times & reminders are calculated independently for each partner using their local city coordinates and calculation method.
              </p>

              {/* Husband Location Selector */}
              <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  {localHusbandName || "Husband"}'s City
                </span>
                <select
                  value={`${localHusbandLocation.city}, ${localHusbandLocation.country}`}
                  onChange={(e) => {
                    const preset = CITY_PRESETS[e.target.value];
                    if (preset) {
                      setLocalHusbandLocation(preset);
                      setLocalHusbandTimezone(preset.timezone);
                    }
                  }}
                  className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs rounded-xl px-2.5 py-2 font-bold focus:outline-none focus:border-amber-500/50"
                >
                  {Object.keys(CITY_PRESETS).map(cityName => (
                    <option key={cityName} value={cityName}>{cityName}</option>
                  ))}
                </select>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>TZ: {localHusbandLocation.timezone}</span>
                  <span>Method: {localHusbandLocation.method}</span>
                </div>
              </div>

              {/* Wife Location Selector */}
              <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  {localWifeName || "Wife"}'s City
                </span>
                <select
                  value={`${localWifeLocation.city}, ${localWifeLocation.country}`}
                  onChange={(e) => {
                    const preset = CITY_PRESETS[e.target.value];
                    if (preset) {
                      setLocalWifeLocation(preset);
                      setLocalWifeTimezone(preset.timezone);
                    }
                  }}
                  className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs rounded-xl px-2.5 py-2 font-bold focus:outline-none focus:border-rose-500/50"
                >
                  {Object.keys(CITY_PRESETS).map(cityName => (
                    <option key={cityName} value={cityName}>{cityName}</option>
                  ))}
                </select>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>TZ: {localWifeLocation.timezone}</span>
                  <span>Method: {localWifeLocation.method}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <button 
          onClick={handleSave}
          disabled={isSaving || isSaved}
          className={`w-full mt-2 flex items-center justify-center gap-2 font-bold text-sm py-4 rounded-2xl transition-all shadow-lg active:scale-95 ${
            isSaved 
              ? "bg-emerald-500 text-white shadow-emerald-500/20" 
              : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-zinc-900 shadow-slate-900/20"
          }`}
        >
          {isSaving ? (
            <span className="animate-pulse">Saving Changes...</span>
          ) : isSaved ? (
            <>
              <Check className="h-4 w-4" /> Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save Preferences
            </>
          )}
        </button>

        {/* Danger Zone */}
        <section className="flex flex-col gap-3 mt-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-500 font-bold text-sm py-4 rounded-2xl transition-all border border-rose-200 dark:border-rose-500/20"
          >
            <LogOut className="h-4 w-4" /> Logout of Household
          </button>
        </section>

      </main>
    </div>
  );
}
