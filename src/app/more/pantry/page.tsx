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
    <div className="min-h-screen pb-36 text-[#44342B] dark:text-zinc-100 transition-colors duration-300">
      <Header />
      
      <main className="mx-auto max-w-md px-4 pt-4 flex flex-col gap-5">
        
        {/* Back Link */}
        <div className="flex items-center gap-2">
          <Link href="/more" className="p-1.5 hover:bg-rose-50 rounded-xl text-[#826F66] transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="text-sm font-black text-[#44342B] dark:text-zinc-100">
            <span className="highlight-yellow font-black">Pantry &amp; Grocery</span> Sync
          </span>
        </div>

        {/* Quick Add Form */}
        <section className="glass-panel rounded-[28px] p-5 border border-[#FFE2D1] shadow-sm flex flex-col gap-3.5">
          <h3 className="text-[10px] font-black uppercase tracking-wider text-[#826F66]">
            Quick Add Grocery
          </h3>
          <form onSubmit={handleAddItem} className="flex gap-2">
            <input
              type="text"
              placeholder="Apples, Milk, Bread..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-[2] text-xs font-bold px-3.5 py-2.5 bg-[#FFF9F4] dark:bg-zinc-900 border border-[#FFE2D1] dark:border-zinc-800 rounded-2xl focus:outline-none focus:border-rose-400 text-[#44342B]"
            />
            <input
              type="text"
              placeholder="Qty (e.g. 5x)"
              value={newItemQty}
              onChange={(e) => setNewItemQty(e.target.value)}
              className="flex-1 text-xs font-bold px-3.5 py-2.5 bg-[#FFF9F4] dark:bg-zinc-900 border border-[#FFE2D1] dark:border-zinc-800 rounded-2xl focus:outline-none focus:border-rose-400 text-[#44342B]"
            />
            <button
              type="submit"
              className="p-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-sm flex items-center justify-center active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" />
            </button>
          </form>
          <div className="flex gap-2">
            {["Produce", "Dairy", "Pantry", "Household"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setNewItemCat(cat)}
                className={cn(
                  "px-3 py-1.5 text-[9px] font-black rounded-xl uppercase tracking-wider border transition-all shadow-2xs active:scale-95",
                  newItemCat === cat 
                    ? "bg-rose-500 text-white border-rose-500" 
                    : "bg-[#FFF9F4] dark:bg-zinc-900 border-[#FFE2D1] text-[#826F66]"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Unchecked List */}
        <section className="flex flex-col gap-3">
          <h3 className="text-[10px] font-black uppercase tracking-wider text-[#826F66]">
            Needed Items ({uncheckedItems.length})
          </h3>
          <div className="flex flex-col gap-2">
            {uncheckedItems.length === 0 ? (
              <p className="text-xs font-bold text-center text-[#826F66] py-6 glass-panel rounded-[26px] border border-[#FFE2D1]">No items needed. Pantry is fully stocked! ✨</p>
            ) : (
              uncheckedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3.5 bg-white/95 dark:bg-zinc-900/80 rounded-[22px] border border-[#FFE2D1] shadow-2xs">
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
