"use client";

import { useGlobal } from "@/context/GlobalContext";
import { useRouter } from "next/navigation";
import { LogOut, Globe, HeartHandshake, Camera, Upload } from "lucide-react";
import { useMemo, useEffect, useState, useRef } from "react";

export default function Settings() {
  const { 
    logout, activeUser, 
    husbandTimezone, setHusbandTimezone, 
    wifeTimezone, setWifeTimezone,
    relationshipMode, setRelationshipMode,
    husbandName, setHusbandName,
    wifeName, setWifeName,
    husbandPhoto, setHusbandPhoto,
    wifePhoto, setWifePhoto
  } = useGlobal();
  
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (activeUser === "HUSBAND") {
        setHusbandPhoto(base64String);
      } else {
        setWifePhoto(base64String);
      }
    };
    // Resize image slightly conceptually, but for now just read as data URL
    // since localStorage handles up to 5MB easily for small profile avatars
    reader.readAsDataURL(file);
  };

  const timezones = useMemo(() => {
    try {
      if (typeof Intl !== 'undefined' && Intl.supportedValuesOf) {
        return Intl.supportedValuesOf('timeZone').map(tz => {
          const date = new Date();
          const formatter = new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'shortOffset' });
          const parts = formatter.formatToParts(date);
          const offset = parts.find(p => p.type === 'timeZoneName')?.value || 'GMT';
          
          const timeFormatter = new Intl.DateTimeFormat('en', { timeZone: tz, hour: 'numeric', minute: '2-digit' });
          const time = timeFormatter.format(date);
          
          return { id: tz, label: `(${offset}) ${time} - ${tz.replace(/_/g, ' ')}` };
        });
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

  const currentName = activeUser === "HUSBAND" ? husbandName : wifeName;
  const currentPhoto = activeUser === "HUSBAND" ? husbandPhoto : wifePhoto;
  
  const handleNameChange = (val: string) => {
    if (activeUser === "HUSBAND") setHusbandName(val);
    else setWifeName(val);
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
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Editing {activeUser}</span>
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
                  onClick={() => setRelationshipMode("TOGETHER")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    relationshipMode === "TOGETHER" 
                      ? "bg-white dark:bg-zinc-800 shadow-sm text-slate-800 dark:text-zinc-100" 
                      : "text-slate-400 dark:text-zinc-500"
                  }`}
                >
                  🏠 Together
                </button>
                <button
                  onClick={() => setRelationshipMode("DISTANCE")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    relationshipMode === "DISTANCE" 
                      ? "bg-white dark:bg-zinc-800 shadow-sm text-slate-800 dark:text-zinc-100" 
                      : "text-slate-400 dark:text-zinc-500"
                  }`}
                >
                  ✈️ LDR
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-amber-500" /> Timezone Setup
              </label>
              <p className="text-[9px] text-slate-400 dark:text-zinc-500 mb-1">
                Select your respective global timezones. When LDR mode is active, the dashboard clocks will sync to these locations automatically.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{husbandName}'s Location</span>
                  <select 
                    value={husbandTimezone}
                    onChange={(e) => setHusbandTimezone(e.target.value)}
                    className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs rounded-xl px-2.5 py-2 font-medium focus:outline-none focus:border-amber-500/50"
                  >
                    {timezones.map(tz => <option key={tz.id} value={tz.id}>{tz.label}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 mt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{wifeName}'s Location</span>
                  <select 
                    value={wifeTimezone}
                    onChange={(e) => setWifeTimezone(e.target.value)}
                    className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs rounded-xl px-2.5 py-2 font-medium focus:outline-none focus:border-rose-500/50"
                  >
                    {timezones.map(tz => <option key={tz.id} value={tz.id}>{tz.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
            
          </div>
        </section>

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
