"use client";

import { useState } from "react";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { CheckSquare, Plus, Clock, MoreVertical, X, Calendar as CalendarIcon, Tag } from "lucide-react";
import { useGlobal, Task } from "@/context/GlobalContext";
import { format, parseISO, isSameDay } from "date-fns";

export default function TasksEngine() {
  const { tasks, setTasks, sendInteraction, activeUser, husbandName, wifeName, globalSelectedDate } = useGlobal();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({ urgency: "MEDIUM" });
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [alertPartner, setAlertPartner] = useState(false);

  const partnerName = activeUser === "HUSBAND" ? wifeName : husbandName;
  const currentTasks = tasks.filter(t => t.due === globalSelectedDate);

  const openAddModal = () => {
    setEditingTaskId(null);
    setNewTask({ urgency: "MEDIUM", category: "General", due: globalSelectedDate });
    setAlertPartner(false);
    setShowAddModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTaskId(task.id);
    setNewTask(task);
    setAlertPartner(false);
    setShowAddModal(true);
  };

  const saveTask = () => {
    if (!newTask.title) return;
    
    if (editingTaskId) {
      setTasks(tasks.map(t => t.id === editingTaskId ? { ...t, ...newTask } as Task : t));
    } else {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title,
        urgency: newTask.urgency || "MEDIUM",
        category: newTask.category || "General",
        due: newTask.due || "Today"
      };
      setTasks([...tasks, task]);
    }

    if (alertPartner) {
      sendInteraction("TASK_ALERT", newTask.title);
    }

    setNewTask({ urgency: "MEDIUM" });
    setEditingTaskId(null);
    setShowAddModal(false);
  };

  const completeTask = (id: string) => {
    // Just remove it to simulate completion for now
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-background pb-24 text-slate-800 dark:text-zinc-100 transition-colors duration-300">
      <Header />
      
      <main className="mx-auto max-w-md px-4 pt-6 flex flex-col gap-6 relative">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-xl font-black tracking-tight">Shared To-Dos</h2>
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
              {currentTasks.length} Tasks for {isSameDay(parseISO(globalSelectedDate), new Date()) ? "Today" : format(parseISO(globalSelectedDate), "MMM d")}
            </span>
          </div>
          <button 
            onClick={openAddModal}
            className="h-10 w-10 bg-amber-500 hover:bg-amber-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {currentTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-zinc-500">
            <CheckSquare className="h-12 w-12 mb-4 opacity-20" />
            <span className="text-sm font-semibold">No active tasks</span>
            <span className="text-[10px] text-center max-w-[70%] mt-1">Tap the plus button to add a new task to your shared household list.</span>
          </div>
        ) : (
          <section className="flex flex-col gap-3">
            {currentTasks.map((task) => (
              <div key={task.id} className="glass-panel rounded-2xl p-4 shadow-sm border border-slate-100/50 dark:border-zinc-850 flex items-start gap-3 transition-all hover:border-slate-300 dark:hover:border-zinc-700">
                <button 
                  onClick={() => completeTask(task.id)}
                  className="h-6 w-6 mt-0.5 rounded-md border-2 border-slate-200 dark:border-zinc-700 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors flex-shrink-0" 
                />
                <div className="flex flex-col flex-1 gap-1">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-slate-800 dark:text-zinc-100">{task.title}</span>
                      <button onClick={() => openEditModal(task)} className="text-slate-400 hover:text-amber-500 transition-colors p-1 -mr-1">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                      task.urgency === "HIGH" 
                        ? "bg-rose-500/10 text-rose-500" 
                        : task.urgency === "MEDIUM" 
                        ? "bg-amber-500/10 text-amber-500" 
                        : "bg-slate-350/20 text-slate-600 dark:text-zinc-400"
                    }`}>
                      {task.urgency}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Tag className="h-2.5 w-2.5" /> {task.category}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" /> {task.due}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 flex flex-col gap-5">
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="text-lg font-black">{editingTaskId ? "Edit Task" : "Add New Task"}</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-full"><X className="h-4 w-4" /></button>
              </div>

              <div className="flex flex-col gap-4">
                <input 
                  type="text" 
                  placeholder="Task title..."
                  value={newTask.title || ""}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border-2 border-slate-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500/50"
                  autoFocus
                />
                
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Urgency</span>
                  <div className="grid grid-cols-3 gap-2">
                    {["HIGH", "MEDIUM", "LOW"].map((level) => (
                      <button 
                        key={level}
                        onClick={() => setNewTask({...newTask, urgency: level as any})}
                        className={`py-2 rounded-lg text-[10px] font-bold border-2 transition-all ${
                          newTask.urgency === level 
                            ? "border-amber-500 bg-amber-500/10 text-amber-600" 
                            : "border-slate-100 dark:border-zinc-800 text-slate-500"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</span>
                    <input 
                      type="text" 
                      placeholder="e.g. Home"
                      value={newTask.category || ""}
                      onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border-2 border-slate-100 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due</span>
                    <input 
                      type="date" 
                      value={newTask.due || ""}
                      onChange={(e) => setNewTask({...newTask, due: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border-2 border-slate-100 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-amber-500/50 appearance-none min-h-[36px]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl mt-1">
                  <input 
                    type="checkbox" 
                    id="alertPartner"
                    checked={alertPartner}
                    onChange={(e) => setAlertPartner(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="alertPartner" className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Alert {partnerName} (Send Notification)
                  </label>
                </div>

                <button 
                  onClick={saveTask}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 mt-2"
                >
                  {editingTaskId ? "Save Changes" : "Add to Shared List"}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
      <BottomNavigation />
    </div>
  );
}
