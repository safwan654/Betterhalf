"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { 
  CheckSquare, Plus, Clock, X, Tag, Trash2, Edit3, 
  Check, Calendar as CalendarIcon, User, Sparkles, CheckCircle2, RotateCcw 
} from "lucide-react";
import { useGlobal, Task } from "@/context/GlobalContext";
import { format, parseISO, isSameDay, isPast, isToday, addDays, startOfDay } from "date-fns";

export default function TasksEngine() {
  const { tasks, setTasks, sendInteraction, activeUser, husbandName, wifeName, globalSelectedDate } = useGlobal();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL_ACTIVE" | "TODAY" | "COMPLETED">("ALL_ACTIVE");
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({ 
    urgency: "MEDIUM", 
    category: "Home", 
    assignedTo: "SHARED" 
  });
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [alertPartner, setAlertPartner] = useState(false);
  const [customCategory, setCustomCategory] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const partnerName = activeUser === "HUSBAND" ? wifeName : husbandName;
  const currentUserName = activeUser === "HUSBAND" ? husbandName : wifeName;

  // Task filtering
  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  // Selected date or today's tasks
  const selectedDateTasks = activeTasks.filter(t => {
    if (!t.due) return false;
    if (t.due === globalSelectedDate) return true;
    if (t.due === "Today" && isSameDay(parseISO(globalSelectedDate), new Date())) return true;
    return false;
  });

  const displayedTasks = 
    activeTab === "ALL_ACTIVE" 
      ? activeTasks 
      : activeTab === "TODAY" 
      ? selectedDateTasks 
      : completedTasks;

  const openAddModal = () => {
    setEditingTaskId(null);
    setNewTask({ 
      urgency: "MEDIUM", 
      category: "Home", 
      due: globalSelectedDate || format(new Date(), "yyyy-MM-dd"),
      assignedTo: "SHARED"
    });
    setAlertPartner(false);
    setCustomCategory(false);
    setShowAddModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTaskId(task.id);
    setNewTask({ ...task });
    setAlertPartner(false);
    setCustomCategory(false);
    setShowAddModal(true);
  };

  const setQuickDate = (daysToAdd: number) => {
    const targetDate = addDays(new Date(), daysToAdd);
    setNewTask(prev => ({ ...prev, due: format(targetDate, "yyyy-MM-dd") }));
  };

  const saveTask = () => {
    if (!newTask.title || !newTask.title.trim()) return;
    
    if (editingTaskId) {
      setTasks(tasks.map(t => t.id === editingTaskId ? { 
        ...t, 
        title: newTask.title!.trim(),
        urgency: newTask.urgency || "MEDIUM",
        category: newTask.category || "General",
        due: newTask.due || format(new Date(), "yyyy-MM-dd"),
        assignedTo: newTask.assignedTo || "SHARED"
      } : t));
    } else {
      const task: Task = {
        id: "task_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
        title: newTask.title.trim(),
        urgency: newTask.urgency || "MEDIUM",
        category: newTask.category || "Home",
        due: newTask.due || format(new Date(), "yyyy-MM-dd"),
        completed: false,
        createdAt: Date.now(),
        assignedTo: newTask.assignedTo || "SHARED"
      };
      setTasks([task, ...tasks]);
    }

    if (alertPartner) {
      sendInteraction("TASK_ALERT", newTask.title.trim());
    }

    setNewTask({ urgency: "MEDIUM", category: "Home", assignedTo: "SHARED" });
    setEditingTaskId(null);
    setShowAddModal(false);
  };

  const toggleTaskCompletion = (id: string) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? Date.now() : undefined
        };
      }
      return t;
    });
    setTasks(updated);
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const clearAllCompleted = () => {
    if (window.confirm("Are you sure you want to clear all completed tasks?")) {
      setTasks(tasks.filter(t => !t.completed));
    }
  };

  const formatDueDate = (dueStr: string) => {
    if (!dueStr) return "No date";
    if (dueStr === "Today") return "Today";
    try {
      const parsed = parseISO(dueStr);
      if (isToday(parsed)) return "Today";
      const tomorrow = addDays(new Date(), 1);
      if (isSameDay(parsed, tomorrow)) return "Tomorrow";
      return format(parsed, "MMM d");
    } catch (e) {
      return dueStr;
    }
  };

  const isTaskOverdue = (task: Task) => {
    if (task.completed || !task.due || task.due === "Today") return false;
    try {
      const parsed = parseISO(task.due);
      const todayStart = startOfDay(new Date());
      return parsed < todayStart;
    } catch {
      return false;
    }
  };

  const CATEGORY_PRESETS = ["Home", "Groceries", "Bills", "Health", "Errands", "Family", "Spiritual"];

  return (
    <div className="min-h-screen pb-36 text-[#44342B] dark:text-zinc-100 transition-colors duration-300">
      <Header />
      
      <main className="mx-auto max-w-md px-4 pt-4 flex flex-col gap-5 relative">
        
        {/* Top Header & New Task Trigger */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
              Household Chores
            </span>
            <h2 className="text-lg font-black text-[#44342B] dark:text-zinc-100 flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-amber-500" />
              <span className="highlight-yellow font-black">Shared To-Dos</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 font-extrabold border border-amber-200">
                {activeTasks.length} active
              </span>
            </h2>
          </div>
          <button 
            onClick={openAddModal}
            className="h-10 w-10 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-2xl flex items-center justify-center shadow-md shadow-amber-500/25 transition-all"
            aria-label="Add new task"
          >
            <Plus className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-white/95 dark:bg-zinc-900 rounded-[22px] border border-[#FFE2D1] shadow-2xs">
          <button
            onClick={() => setActiveTab("ALL_ACTIVE")}
            className={`py-2 px-1 text-xs font-black rounded-2xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "ALL_ACTIVE"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-500/20"
                : "text-[#826F66] hover:text-[#44342B] dark:text-zinc-400"
            }`}
          >
            <span>All Active</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "ALL_ACTIVE" ? "bg-white/20 text-white" : "bg-amber-50 text-amber-700"}`}>
              {activeTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("TODAY")}
            className={`py-2 px-1 text-xs font-black rounded-2xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "TODAY"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-500/20"
                : "text-[#826F66] hover:text-[#44342B] dark:text-zinc-400"
            }`}
          >
            <span>Date View</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "TODAY" ? "bg-white/20 text-white" : "bg-amber-50 text-amber-700"}`}>
              {selectedDateTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("COMPLETED")}
            className={`py-2 px-1 text-xs font-black rounded-2xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "COMPLETED"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-500/20"
                : "text-[#826F66] hover:text-[#44342B] dark:text-zinc-400"
            }`}
          >
            <span>Done</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "COMPLETED" ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700"}`}>
              {completedTasks.length}
            </span>
          </button>
        </div>

        {/* Active Tab Subtitle Info */}
        {activeTab === "TODAY" && (
          <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-zinc-400 font-semibold">
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-3.5 w-3.5 text-amber-500" />
              Showing tasks for {isSameDay(parseISO(globalSelectedDate), new Date()) ? "Today" : format(parseISO(globalSelectedDate), "EEEE, MMM d")}
            </span>
            {selectedDateTasks.length === 0 && activeTasks.length > 0 && (
              <button 
                onClick={() => setActiveTab("ALL_ACTIVE")}
                className="text-amber-600 dark:text-amber-400 hover:underline text-[11px]"
              >
                Show all {activeTasks.length}
              </button>
            )}
          </div>
        )}

        {/* Tasks List Content */}
        {displayedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30">
            {activeTab === "COMPLETED" ? (
              <>
                <CheckCircle2 className="h-12 w-12 mb-3 text-emerald-500/40 stroke-[1.5]" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-200">No completed tasks yet</h3>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-[240px]">
                  When you or your partner finish tasks, they will appear here with completion history.
                </p>
              </>
            ) : activeTab === "TODAY" ? (
              <>
                <CalendarIcon className="h-12 w-12 mb-3 text-amber-500/40 stroke-[1.5]" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-200">No tasks for this day</h3>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-[240px]">
                  {activeTasks.length > 0 
                    ? `You have ${activeTasks.length} active tasks scheduled on other days.`
                    : "Your schedule is clear! Tap below to add a new task."}
                </p>
                <div className="flex items-center gap-2 mt-4">
                  {activeTasks.length > 0 && (
                    <button 
                      onClick={() => setActiveTab("ALL_ACTIVE")}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                    >
                      View All Active
                    </button>
                  )}
                  <button 
                    onClick={openAddModal}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20"
                  >
                    + Add Task
                  </button>
                </div>
              </>
            ) : (
              <>
                <Sparkles className="h-12 w-12 mb-3 text-amber-500/40 stroke-[1.5]" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-200">All caught up!</h3>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-[240px]">
                  No active tasks in your household list. Tap the button below to add your first chore or reminder.
                </p>
                <button 
                  onClick={openAddModal}
                  className="mt-4 text-xs font-bold px-4 py-2 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                >
                  + Add New Task
                </button>
              </>
            )}
          </div>
        ) : (
          <section className="flex flex-col gap-3">
            {displayedTasks.map((task) => {
              const overdue = isTaskOverdue(task);
              const formattedDue = formatDueDate(task.due);

              return (
                <div 
                  key={task.id} 
                  className={`glass-panel rounded-2xl p-4 shadow-sm border transition-all flex items-start gap-3.5 ${
                    task.completed 
                      ? "opacity-60 bg-slate-50/40 dark:bg-zinc-900/30 border-slate-100 dark:border-zinc-850" 
                      : overdue 
                      ? "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50" 
                      : "border-slate-100/60 dark:border-zinc-850 hover:border-slate-300 dark:hover:border-zinc-700"
                  }`}
                >
                  {/* Interactive Checkbox Button */}
                  <button 
                    onClick={() => toggleTaskCompletion(task.id)}
                    className={`h-6 w-6 mt-0.5 rounded-lg border-2 transition-all flex items-center justify-center flex-shrink-0 active:scale-90 ${
                      task.completed 
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20" 
                        : "border-slate-300 dark:border-zinc-700 hover:border-amber-500 bg-white dark:bg-zinc-800"
                    }`}
                    aria-label={task.completed ? "Mark as uncompleted" : "Mark as completed"}
                  >
                    {task.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </button>

                  {/* Task Content */}
                  <div className="flex flex-col flex-1 gap-1.5 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-sm font-bold leading-tight break-words transition-all ${
                        task.completed 
                          ? "line-through text-slate-400 dark:text-zinc-500" 
                          : "text-slate-800 dark:text-zinc-100"
                      }`}>
                        {task.title}
                      </span>
                      
                      {/* Action Menu / Buttons */}
                      <div className="flex items-center gap-1 flex-shrink-0 -mr-1">
                        <button 
                          onClick={() => openEditModal(task)} 
                          className="text-slate-400 hover:text-amber-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Edit task"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => deleteTask(task.id)} 
                          className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {/* Urgency Pill */}
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md ${
                        task.urgency === "HIGH" 
                          ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" 
                          : task.urgency === "MEDIUM" 
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                          : "bg-slate-200/50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700"
                      }`}>
                        {task.urgency}
                      </span>

                      {/* Category Pill */}
                      <span className="text-[9px] font-bold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md flex items-center gap-1 border border-slate-200/40 dark:border-zinc-700/50">
                        <Tag className="h-2.5 w-2.5" /> {task.category}
                      </span>

                      {/* Due Date Pill */}
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border ${
                        overdue 
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-extrabold"
                          : formattedDue === "Today"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-extrabold"
                          : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-200/40 dark:border-zinc-700/50"
                      }`}>
                        <Clock className="h-2.5 w-2.5" /> {overdue ? `Overdue (${formattedDue})` : formattedDue}
                      </span>

                      {/* Assignee Pill */}
                      {task.assignedTo && task.assignedTo !== "SHARED" && (
                        <span className="text-[9px] font-bold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md flex items-center gap-1 border border-slate-200/40 dark:border-zinc-700/50">
                          <User className="h-2.5 w-2.5" /> {task.assignedTo === "HUSBAND" ? husbandName : wifeName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Clear All Completed Footer */}
            {activeTab === "COMPLETED" && completedTasks.length > 0 && (
              <button 
                onClick={clearAllCompleted}
                className="mt-4 text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear All Completed ({completedTasks.length})
              </button>
            )}
          </section>
        )}

      </main>

      {/* Task Creation & Editing Modal (Rendered in Body Portal to guarantee zero viewport clipping) */}
      {mounted && showAddModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 flex flex-col gap-4 max-h-[88dvh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <CheckSquare className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-zinc-100">
                  {editingTaskId ? "Edit Task" : "New Shared Task"}
                </h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 bg-slate-100 dark:bg-zinc-800 p-2 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="flex flex-col gap-4">
              
              {/* Task Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Task Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Pick up groceries, fix kitchen sink..."
                  value={newTask.title || ""}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border-2 border-slate-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-base font-bold text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-amber-500/50"
                  autoFocus
                />
              </div>

              {/* Urgency Level */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority Level</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "HIGH", label: "🔥 High", color: "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400" },
                    { key: "MEDIUM", label: "⚡ Medium", color: "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400" },
                    { key: "LOW", label: "🌱 Low", color: "border-slate-400 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300" },
                  ].map((level) => (
                    <button 
                      key={level.key}
                      type="button"
                      onClick={() => setNewTask({...newTask, urgency: level.key as any})}
                      className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                        newTask.urgency === level.key 
                          ? `${level.color} shadow-sm scale-[1.02]` 
                          : "border-slate-100 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:border-slate-200"
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Selection */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</span>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORY_PRESETS.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setNewTask({ ...newTask, category: cat });
                        setCustomCategory(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        newTask.category === cat && !customCategory
                          ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                          : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCustomCategory(true)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      customCategory
                        ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                        : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400"
                    }`}
                  >
                    + Custom
                  </button>
                </div>
                {customCategory && (
                  <input 
                    type="text" 
                    placeholder="Enter custom category name..."
                    value={newTask.category || ""}
                    onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                    className="w-full mt-1 bg-slate-50 dark:bg-zinc-950 border-2 border-slate-100 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-amber-500/50"
                  />
                )}
              </div>

              {/* Due Date & Quick Presets */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Date</span>
                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                  <button 
                    type="button" 
                    onClick={() => setQuickDate(0)} 
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-slate-700 dark:text-zinc-300"
                  >
                    Today
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setQuickDate(1)} 
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-slate-700 dark:text-zinc-300"
                  >
                    Tomorrow
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setQuickDate(3)} 
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-slate-700 dark:text-zinc-300"
                  >
                    In 3 Days
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setQuickDate(7)} 
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-slate-700 dark:text-zinc-300"
                  >
                    Next Week
                  </button>
                </div>
                <input 
                  type="date" 
                  value={newTask.due || ""}
                  onChange={(e) => setNewTask({...newTask, due: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border-2 border-slate-100 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-amber-500/50 appearance-none text-slate-800 dark:text-zinc-100"
                />
              </div>

              {/* Assignee Selection */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned To</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "SHARED", label: "🤝 Shared" },
                    { key: "HUSBAND", label: husbandName },
                    { key: "WIFE", label: wifeName },
                  ].map((assignee) => (
                    <button 
                      key={assignee.key}
                      type="button"
                      onClick={() => setNewTask({...newTask, assignedTo: assignee.key as any})}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all truncate ${
                        newTask.assignedTo === assignee.key 
                          ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold" 
                          : "border-slate-100 dark:border-zinc-800 text-slate-500 dark:text-zinc-400"
                      }`}
                    >
                      {assignee.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alert Partner Option */}
              <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl mt-1">
                <input 
                  type="checkbox" 
                  id="alertPartner"
                  checked={alertPartner}
                  onChange={(e) => setAlertPartner(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 accent-amber-500"
                />
                <label htmlFor="alertPartner" className="text-xs font-bold text-slate-700 dark:text-zinc-300 cursor-pointer">
                  Send notification alert to {partnerName}
                </label>
              </div>

              {/* Submit Button */}
              <button 
                onClick={saveTask}
                disabled={!newTask.title || !newTask.title.trim()}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 mt-2"
              >
                {editingTaskId ? "Save Changes" : "Add to Shared List"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <BottomNavigation />
    </div>
  );
}
