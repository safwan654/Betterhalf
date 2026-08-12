"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { Dumbbell, Plus, Trash2, ArrowLeft, Award, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobal } from "@/context/GlobalContext";
import { format, parseISO, isSameDay } from "date-fns";

export default function FitnessPage() {
  const { workoutsByDate, setWorkoutsByDate, nutritionByDate, setNutritionByDate, globalSelectedDate } = useGlobal();

  const workouts = workoutsByDate[globalSelectedDate] || [];
  const nutrition = nutritionByDate[globalSelectedDate] || {
    husband: { protein: 0, proteinGoal: 150 },
    wife: { protein: 0, proteinGoal: 100 }
  };

  const [newActivity, setNewActivity] = useState("Gym");
  const [newDuration, setNewDuration] = useState("");
  const [newSpender, setNewSpender] = useState("Husband");
  const [newNotes, setNewNotes] = useState("");

  const [proteinInput, setProteinInput] = useState("");
  const [proteinSpender, setProteinSpender] = useState("Husband");

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
    
    setNewActivity("");
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

  const husbandPercent = (nutrition.husband.protein / nutrition.husband.proteinGoal) * 100;
  const wifePercent = (nutrition.wife.protein / nutrition.wife.proteinGoal) * 100;

  return (
    <div className="min-h-screen bg-background pb-24 text-slate-800 dark:text-zinc-100 transition-colors duration-300">
      <Header />
      
      <main className="mx-auto max-w-md px-4 pt-4 flex flex-col gap-6">
        
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/more" className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-500 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="text-sm font-black text-slate-700 dark:text-zinc-200">Fitness & Health Hub</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
            {isSameDay(parseISO(globalSelectedDate), new Date()) ? "Today" : format(parseISO(globalSelectedDate), "MMM d, yyyy")}
          </span>
        </div>

        {/* Nutrition Target Progress */}
        <section className="glass-panel rounded-2xl p-4 border border-slate-100/50 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Daily Protein Targets
            </h3>
            <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Award className="h-3 w-3" /> Shared Nutrition
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {/* Husband Progress */}
            <div className="flex flex-col gap-1.5 bg-slate-50/80 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-100/30">
              <div className="flex justify-between text-[10px] font-extrabold text-slate-600 dark:text-zinc-300 uppercase tracking-wide">
                <span>Husband Protein</span>
                <span>{nutrition.husband.protein}g / {nutrition.husband.proteinGoal}g</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, husbandPercent)}%` }} />
              </div>
              <span className="text-[8px] text-right font-black text-slate-400 dark:text-zinc-500 uppercase">{husbandPercent.toFixed(0)}% Completed</span>
            </div>

            {/* Wife Progress */}
            <div className="flex flex-col gap-1.5 bg-slate-50/80 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-100/30">
              <div className="flex justify-between text-[10px] font-extrabold text-slate-600 dark:text-zinc-300 uppercase tracking-wide">
                <span>Wife Protein</span>
                <span>{nutrition.wife.protein}g / {nutrition.wife.proteinGoal}g</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, wifePercent)}%` }} />
              </div>
              <span className="text-[8px] text-right font-black text-slate-400 dark:text-zinc-500 uppercase">{wifePercent.toFixed(0)}% Completed</span>
            </div>
          </div>

          {/* Quick Add Nutrition Form */}
          <form onSubmit={handleAddProtein} className="flex gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <input
              type="number"
              placeholder="Add protein (g)..."
              value={proteinInput}
              onChange={(e) => setProteinInput(e.target.value)}
              className="flex-[2] text-xs font-semibold px-3 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <select
              value={proteinSpender}
              onChange={(e) => setProteinSpender(e.target.value)}
              className="flex-1 text-[10px] font-bold px-2 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg focus:outline-none"
            >
              <option value="Husband">Husband</option>
              <option value="Wife">Wife</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
            >
              Add
            </button>
          </form>
        </section>

        {/* Log Workout Form */}
        <section className="glass-panel rounded-2xl p-4 border border-slate-100/50 shadow-sm flex flex-col gap-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Log Daily Workout
          </h3>
          <form onSubmit={handleAddWorkout} className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Gym, Cardio, Planks, Yoga..."
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
                className="flex-[2] text-xs font-medium px-3 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <input
                type="number"
                placeholder="Min"
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                className="flex-1 text-xs font-medium px-3 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
            <textarea
              placeholder="Workout notes..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="text-xs font-medium px-3.5 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none h-12"
            />
            <div className="flex justify-between gap-3 items-center">
              <select
                value={newSpender}
                onChange={(e) => setNewSpender(e.target.value)}
                className="text-[10px] font-bold px-2 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg focus:outline-none"
              >
                <option value="Husband">Husband</option>
                <option value="Wife">Wife</option>
              </select>
              <button
                type="submit"
                className="py-2 px-5 bg-gradient-to-tr from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-rose-500/10"
              >
                <Plus className="h-4 w-4" /> Log Workout
              </button>
            </div>
          </form>
        </section>

        {/* Workouts History */}
        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Workout History
          </h3>

          <div className="flex flex-col gap-2">
            {workouts.map((workout) => (
              <div key={workout.id} className="flex flex-col gap-1.5 p-3.5 bg-white dark:bg-zinc-900/80 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">{workout.activity}</span>
                    <span className="text-[9px] font-bold text-rose-500 dark:text-rose-450 bg-rose-500/5 px-2 py-0.5 rounded-full">{workout.duration} min</span>
                  </div>
                  <button 
                    onClick={() => deleteWorkout(workout.id)}
                    className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-extrabold uppercase text-slate-450 dark:text-zinc-500 tracking-wide">{workout.spender} Logged</span>
                  {workout.notes && <p className="text-[10px] text-slate-500 dark:text-zinc-400 italic">"{workout.notes}"</p>}
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <BottomNavigation />
    </div>
  );
}
