"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { 
  Dumbbell, 
  Plus, 
  Trash2, 
  Award, 
  Sparkles, 
  Activity, 
  Stethoscope, 
  HeartPulse, 
  X, 
  Heart, 
  Moon, 
  Flame, 
  Calendar 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobal } from "@/context/GlobalContext";
import { format, parseISO, isSameDay } from "date-fns";
import CycleTracker from "@/components/spiritual/CycleTracker";

export default function HealthPage() {
  const { 
    activeUser,
    husbandName,
    wifeName,
    husbandPhoto,
    wifePhoto,
    workoutsByDate, 
    setWorkoutsByDate, 
    nutritionByDate, 
    setNutritionByDate, 
    healthProfiles, 
    setHealthProfiles, 
    doctorVisits, 
    setDoctorVisits, 
    globalSelectedDate 
  } = useGlobal();

  const workouts = workoutsByDate[globalSelectedDate] || [];
  const nutrition = nutritionByDate[globalSelectedDate] || {
    husband: { protein: 0, proteinGoal: 150 },
    wife: { protein: 0, proteinGoal: 100 }
  };

  const [newActivity, setNewActivity] = useState("Gym");
  const [newDuration, setNewDuration] = useState("");
  const [newSpender, setNewSpender] = useState<"Husband" | "Wife">(activeUser === "HUSBAND" ? "Husband" : "Wife");
  const [newNotes, setNewNotes] = useState("");

  const [proteinInput, setProteinInput] = useState("");
  const [proteinSpender, setProteinSpender] = useState<"Husband" | "Wife">(activeUser === "HUSBAND" ? "Husband" : "Wife");

  // Health Profile Edit Modal State
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [healthEditPerson, setHealthEditPerson] = useState<"husband" | "wife">("husband");
  const [healthEditForm, setHealthEditForm] = useState({ height: "", weight: "", bloodType: "", allergies: "", notes: "" });

  // Doctor Visit Form State
  const [newDocDate, setNewDocDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [newDocName, setNewDocName] = useState("");
  const [newDocPatient, setNewDocPatient] = useState("Husband");
  const [newDocReason, setNewDocReason] = useState("");
  const [newDocNotes, setNewDocNotes] = useState("");

  const handleAddWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.trim() || !newDuration) return;

    const newWorkout = {
      id: Date.now(),
      activity: newActivity,
      duration: parseInt(newDuration),
      spender: newSpender,
      notes: newNotes
    };

    setWorkoutsByDate({
      ...workoutsByDate,
      [globalSelectedDate]: [...workouts, newWorkout]
    });
    
    setNewActivity("Gym");
    setNewDuration("");
    setNewNotes("");
  };

  const handleAddProtein = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proteinInput) return;

    const amount = parseInt(proteinInput);
    const isHusband = proteinSpender === "Husband";

    setNutritionByDate({
      ...nutritionByDate,
      [globalSelectedDate]: {
        ...nutrition,
        [isHusband ? "husband" : "wife"]: {
          ...nutrition[isHusband ? "husband" : "wife"],
          protein: nutrition[isHusband ? "husband" : "wife"].protein + amount
        }
      }
    });

    setProteinInput("");
  };

  const deleteWorkout = (id: number) => {
    setWorkoutsByDate({
      ...workoutsByDate,
      [globalSelectedDate]: workouts.filter(w => w.id !== id)
    });
  };

  const openHealthModal = (person: "husband" | "wife") => {
    setHealthEditPerson(person);
    setHealthEditForm(healthProfiles[person] || { height: "", weight: "", bloodType: "", allergies: "", notes: "" });
    setShowHealthModal(true);
  };

  const saveHealthProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setHealthProfiles({
      ...healthProfiles,
      [healthEditPerson]: healthEditForm
    });
    setShowHealthModal(false);
  };

  const handleAddDoctorVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim() || !newDocReason.trim()) return;

    const newVisit = {
      id: Date.now(),
      date: newDocDate,
      doctorName: newDocName,
      patient: newDocPatient,
      reason: newDocReason,
      notes: newDocNotes
    };

    setDoctorVisits([newVisit, ...doctorVisits]);
    setNewDocName("");
    setNewDocReason("");
    setNewDocNotes("");
  };

  const deleteDoctorVisit = (id: number) => {
    setDoctorVisits(doctorVisits.filter(v => v.id !== id));
  };

  const husbandProteinPercent = Math.min(100, Math.round((nutrition.husband.protein / nutrition.husband.proteinGoal) * 100));
  const wifeProteinPercent = Math.min(100, Math.round((nutrition.wife.protein / nutrition.wife.proteinGoal) * 100));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-28 text-slate-900 dark:text-zinc-100 transition-colors duration-300">
      <Header />
      
      <main className="mx-auto max-w-md px-4 pt-4 flex flex-col gap-5">
        
        {/* Title Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-500">
              Wellness & Vitality
            </span>
            <h2 className="text-lg font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Activity className="h-5 w-5 text-rose-500" /> Health & Fitness Hub
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {format(parseISO(globalSelectedDate), "MMM d, yyyy")}
          </span>
        </div>

        {/* 1. Women's Health & Cycle Exemption Card */}
        <CycleTracker />

        {/* 2. Daily Protein & Nutrition Targets */}
        <section className="glass-panel p-5 rounded-3xl border border-slate-100/60 dark:border-zinc-850 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold flex items-center gap-2 text-slate-800 dark:text-zinc-100">
              <Sparkles className="h-4 w-4 text-amber-500" /> Daily Protein Targets
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Goal Tracking</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Husband Protein */}
            <div className="flex flex-col p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 gap-2.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <div className="h-5 w-5 rounded-full overflow-hidden bg-amber-500 text-white flex items-center justify-center text-[9px] font-black shrink-0">
                    {husbandPhoto ? (
                      <img src={husbandPhoto} alt={husbandName} className="h-full w-full object-cover" />
                    ) : (
                      (husbandName || "H").charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-slate-700 dark:text-zinc-200">{husbandName}</span>
                </div>
                <span className="text-amber-600 dark:text-amber-400 font-extrabold">{nutrition.husband.protein}g / {nutrition.husband.proteinGoal}g</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${husbandProteinPercent}%` }}
                />
              </div>
            </div>

            {/* Wife Protein */}
            <div className="flex flex-col p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 gap-2.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <div className="h-5 w-5 rounded-full overflow-hidden bg-rose-500 text-white flex items-center justify-center text-[9px] font-black shrink-0">
                    {wifePhoto ? (
                      <img src={wifePhoto} alt={wifeName} className="h-full w-full object-cover" />
                    ) : (
                      (wifeName || "W").charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-slate-700 dark:text-zinc-200">{wifeName}</span>
                </div>
                <span className="text-rose-500 dark:text-rose-400 font-extrabold">{nutrition.wife.protein}g / {nutrition.wife.proteinGoal}g</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${wifeProteinPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Add Protein Form */}
          <form onSubmit={handleAddProtein} className="flex items-center gap-2 pt-1">
            <select
              value={proteinSpender}
              onChange={(e) => setProteinSpender(e.target.value as "Husband" | "Wife")}
              className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs rounded-xl px-2.5 py-2 font-bold focus:outline-none"
            >
              <option value="Husband">{husbandName}</option>
              <option value="Wife">{wifeName}</option>
            </select>
            <input
              type="number"
              value={proteinInput}
              onChange={(e) => setProteinInput(e.target.value)}
              placeholder="Add protein (g)"
              className="flex-1 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
            />
            <button
              type="submit"
              disabled={!proteinInput}
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-bold transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
            </button>
          </form>
        </section>

        {/* 3. Daily Workouts Log */}
        <section className="glass-panel p-5 rounded-3xl border border-slate-100/60 dark:border-zinc-850 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold flex items-center gap-2 text-slate-800 dark:text-zinc-100">
              <Dumbbell className="h-4 w-4 text-emerald-500" /> Workouts & Activity
            </h3>
            <span className="text-[10px] font-bold text-slate-400">{workouts.length} logged today</span>
          </div>

          {/* Add Workout Form */}
          <form onSubmit={handleAddWorkout} className="flex flex-col gap-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
            <div className="grid grid-cols-3 gap-2">
              <select
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
                className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs rounded-xl px-2.5 py-2 font-bold focus:outline-none"
              >
                <option value="Gym">Gym 🏋️</option>
                <option value="Running">Running 🏃</option>
                <option value="Walking">Walking 🚶</option>
                <option value="Yoga">Yoga 🧘</option>
                <option value="Cycling">Cycling 🚴</option>
                <option value="Swimming">Swimming 🏊</option>
              </select>

              <input
                type="number"
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                placeholder="Mins (e.g. 45)"
                className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
              />

              <select
                value={newSpender}
                onChange={(e) => setNewSpender(e.target.value as "Husband" | "Wife")}
                className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs rounded-xl px-2.5 py-2 font-bold focus:outline-none"
              >
                <option value="Husband">{husbandName}</option>
                <option value="Wife">{wifeName}</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Optional workout notes (e.g. Legs + Core)"
                className="flex-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newDuration}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Log
              </button>
            </div>
          </form>

          {/* Workouts List */}
          <div className="flex flex-col gap-2">
            {workouts.length === 0 ? (
              <span className="text-xs text-slate-400 text-center py-3 italic">No workouts logged for this date yet.</span>
            ) : (
              workouts.map((w) => (
                <div key={w.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                      <Flame className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-100">{w.activity}</span>
                        <span className="text-[10px] font-semibold text-slate-400">· {w.duration} mins</span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                        {w.spender === "Husband" ? husbandName : wifeName} {w.notes && `(${w.notes})`}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteWorkout(w.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 4. Health Profiles (Height, Weight, Blood Type) */}
        <section className="glass-panel p-5 rounded-3xl border border-slate-100/60 dark:border-zinc-850 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold flex items-center gap-2 text-slate-800 dark:text-zinc-100">
              <HeartPulse className="h-4 w-4 text-rose-500" /> Medical & Health Profiles
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Vitals</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Husband Profile Card */}
            <div 
              onClick={() => openHealthModal("husband")}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 flex flex-col gap-2 cursor-pointer hover:border-amber-400 transition-all active:scale-98"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full overflow-hidden bg-amber-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                    {husbandPhoto ? (
                      <img src={husbandPhoto} alt={husbandName} className="h-full w-full object-cover" />
                    ) : (
                      (husbandName || "H").charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-black text-slate-800 dark:text-zinc-200">{husbandName}</span>
                </div>
                <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">Edit</span>
              </div>
              <div className="flex flex-col text-[11px] text-slate-500 dark:text-zinc-400 gap-0.5 pt-1">
                <span>Height: <strong className="text-slate-700 dark:text-zinc-200">{healthProfiles.husband?.height || "—"}</strong></span>
                <span>Weight: <strong className="text-slate-700 dark:text-zinc-200">{healthProfiles.husband?.weight || "—"}</strong></span>
                <span>Blood: <strong className="text-slate-700 dark:text-zinc-200">{healthProfiles.husband?.bloodType || "—"}</strong></span>
                {healthProfiles.husband?.allergies && (
                  <span className="text-rose-500 text-[10px] truncate">Allergy: {healthProfiles.husband.allergies}</span>
                )}
              </div>
            </div>

            {/* Wife Profile Card */}
            <div 
              onClick={() => openHealthModal("wife")}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 flex flex-col gap-2 cursor-pointer hover:border-rose-400 transition-all active:scale-98"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full overflow-hidden bg-rose-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                    {wifePhoto ? (
                      <img src={wifePhoto} alt={wifeName} className="h-full w-full object-cover" />
                    ) : (
                      (wifeName || "W").charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-black text-slate-800 dark:text-zinc-200">{wifeName}</span>
                </div>
                <span className="text-[9px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">Edit</span>
              </div>
              <div className="flex flex-col text-[11px] text-slate-500 dark:text-zinc-400 gap-0.5 pt-1">
                <span>Height: <strong className="text-slate-700 dark:text-zinc-200">{healthProfiles.wife?.height || "—"}</strong></span>
                <span>Weight: <strong className="text-slate-700 dark:text-zinc-200">{healthProfiles.wife?.weight || "—"}</strong></span>
                <span>Blood: <strong className="text-slate-700 dark:text-zinc-200">{healthProfiles.wife?.bloodType || "—"}</strong></span>
                {healthProfiles.wife?.allergies && (
                  <span className="text-rose-500 text-[10px] truncate">Allergy: {healthProfiles.wife.allergies}</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 5. Doctor Visits & Medical Appointments */}
        <section className="glass-panel p-5 rounded-3xl border border-slate-100/60 dark:border-zinc-850 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold flex items-center gap-2 text-slate-800 dark:text-zinc-100">
              <Stethoscope className="h-4 w-4 text-blue-500" /> Doctor Visits & Appointments
            </h3>
            <span className="text-[10px] font-bold text-slate-400">{doctorVisits.length} recorded</span>
          </div>

          {/* Add Visit Form */}
          <form onSubmit={handleAddDoctorVisit} className="flex flex-col gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
            <div className="grid grid-cols-3 gap-2">
              <input
                type="date"
                value={newDocDate}
                onChange={(e) => setNewDocDate(e.target.value)}
                className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none"
              />
              <input
                type="text"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                placeholder="Doctor Name"
                className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none"
              />
              <select
                value={newDocPatient}
                onChange={(e) => setNewDocPatient(e.target.value)}
                className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs rounded-xl px-2.5 py-1.5 font-bold focus:outline-none"
              >
                <option value="Husband">{husbandName}</option>
                <option value="Wife">{wifeName}</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newDocReason}
                onChange={(e) => setNewDocReason(e.target.value)}
                placeholder="Reason / Prescription / Next appointment"
                className="flex-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newDocName || !newDocReason}
                className="px-4 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
          </form>

          {/* Visits List */}
          <div className="flex flex-col gap-2">
            {doctorVisits.length === 0 ? (
              <span className="text-xs text-slate-400 text-center py-2 italic">No doctor visits recorded yet.</span>
            ) : (
              doctorVisits.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-100">{v.doctorName}</span>
                      <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                        {v.patient === "Husband" ? husbandName : wifeName}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-600 dark:text-zinc-300 mt-0.5">{v.reason}</span>
                    <span className="text-[9px] text-slate-400">{v.date} {v.notes && `· ${v.notes}`}</span>
                  </div>
                  <button
                    onClick={() => deleteDoctorVisit(v.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

      </main>

      {/* Edit Health Profile Modal */}
      {showHealthModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-white/20 dark:border-zinc-800 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Edit Vitals</span>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100">
                  {healthEditPerson === "husband" ? husbandName : wifeName}'s Profile
                </h3>
              </div>
              <button
                onClick={() => setShowHealthModal(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={saveHealthProfile} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Height</label>
                  <input
                    type="text"
                    value={healthEditForm.height}
                    onChange={(e) => setHealthEditForm({ ...healthEditForm, height: e.target.value })}
                    placeholder="e.g. 5'10 / 178cm"
                    className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Weight</label>
                  <input
                    type="text"
                    value={healthEditForm.weight}
                    onChange={(e) => setHealthEditForm({ ...healthEditForm, weight: e.target.value })}
                    placeholder="e.g. 75 kg"
                    className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Blood Type</label>
                  <input
                    type="text"
                    value={healthEditForm.bloodType}
                    onChange={(e) => setHealthEditForm({ ...healthEditForm, bloodType: e.target.value })}
                    placeholder="e.g. O+ / A+"
                    className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Allergies</label>
                  <input
                    type="text"
                    value={healthEditForm.allergies}
                    onChange={(e) => setHealthEditForm({ ...healthEditForm, allergies: e.target.value })}
                    placeholder="e.g. Peanuts, Penicillin"
                    className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Medical Notes</label>
                <textarea
                  value={healthEditForm.notes}
                  onChange={(e) => setHealthEditForm({ ...healthEditForm, notes: e.target.value })}
                  placeholder="e.g. Regular multivitamins, asthma inhaler as needed"
                  rows={2}
                  className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHealthModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-slate-900 text-white dark:bg-white dark:text-zinc-900 shadow-md transition-all active:scale-95"
                >
                  Save Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}
