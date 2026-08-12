"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { ArrowLeft, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobal } from "@/context/GlobalContext";

export default function PantryPage() {
  const { pantryItems, setPantryItems } = useGlobal();

  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("");
  const [newItemCat, setNewItemCat] = useState("Produce");

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem = {
      id: Date.now(),
      name: newItemName,
      quantity: newItemQty.trim() ? newItemQty.trim() : "1x",
      category: newItemCat,
      checked: false
    };

    setPantryItems([newItem, ...pantryItems]);
    setNewItemName("");
    setNewItemQty("");
  };

  const toggleItemChecked = (id: number) => {
    setPantryItems(pantryItems.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const deleteItem = (id: number) => {
    setPantryItems(pantryItems.filter(item => item.id !== id));
  };

  const uncheckedItems = pantryItems.filter(item => !item.checked);
  const checkedItems = pantryItems.filter(item => item.checked);

  return (
    <div className="min-h-screen bg-background pb-24 text-slate-800 dark:text-zinc-100 transition-colors duration-300">
      <Header />
      
      <main className="mx-auto max-w-md px-4 pt-4 flex flex-col gap-6">
        
        {/* Back Link */}
        <div className="flex items-center gap-2">
          <Link href="/more" className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="text-sm font-black text-slate-700 dark:text-zinc-200">Pantry & Grocery Sync</span>
        </div>

        {/* Quick Add Form */}
        <section className="glass-panel rounded-2xl p-4 border border-slate-100/50 shadow-sm flex flex-col gap-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Quick Add Grocery
          </h3>
          <form onSubmit={handleAddItem} className="flex gap-2">
            <input
              type="text"
              placeholder="Apples..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-[2] text-xs font-medium px-3 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <input
              type="text"
              placeholder="Qty (e.g. 5x)"
              value={newItemQty}
              onChange={(e) => setNewItemQty(e.target.value)}
              className="flex-1 text-xs font-medium px-3 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <button
              type="submit"
              className="p-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-sm flex items-center justify-center"
            >
              <Plus className="h-4 w-4" />
            </button>
          </form>
          <div className="flex gap-2.5">
            {["Produce", "Dairy", "Pantry", "Household"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setNewItemCat(cat)}
                className={cn(
                  "px-3 py-1.5 text-[9px] font-extrabold rounded-lg uppercase tracking-wider border transition-all-custom",
                  newItemCat === cat 
                    ? "bg-rose-500/10 border-rose-500 text-rose-500 dark:bg-rose-500/20" 
                    : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-450 dark:text-zinc-400"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Unchecked List */}
        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Needed Items ({uncheckedItems.length})
          </h3>
          <div className="flex flex-col gap-2">
            {uncheckedItems.length === 0 ? (
              <p className="text-xs text-center text-slate-450 dark:text-zinc-500 py-6">No items needed. Pantry is fully stocked!</p>
            ) : (
              uncheckedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3.5 bg-white dark:bg-zinc-900/80 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleItemChecked(item.id)}
                      className="h-5.5 w-5.5 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-center hover:border-slate-350"
                    >
                      <span className="text-[10px] text-rose-500 opacity-0 hover:opacity-100">✓</span>
                    </button>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">{item.name}</span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold">({item.quantity})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <button 
                      onClick={() => deleteItem(item.id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Checked List */}
        {checkedItems.length > 0 && (
          <section className="flex flex-col gap-3 opacity-60">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Already in Cart
            </h3>
            <div className="flex flex-col gap-2">
              {checkedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-zinc-950/40 rounded-2xl border border-slate-100/50 dark:border-zinc-900 shadow-none">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleItemChecked(item.id)}
                      className="h-5.5 w-5.5 rounded-lg bg-rose-500/15 border-transparent flex items-center justify-center text-rose-500"
                    >
                      <span className="text-[10px] font-black">✓</span>
                    </button>
                    <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 line-through">
                      {item.quantity} {item.name}
                    </span>
                  </div>
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      <BottomNavigation />
    </div>
  );
}
