"use client";

import { useState } from "react";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, Target, X, Clock } from "lucide-react";
import { useGlobal, Bill } from "@/context/GlobalContext";

export default function Finance() {
  const { bills, setBills, currency } = useGlobal();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBill, setNewBill] = useState<Partial<Bill>>({});

  const addBill = () => {
    if (!newBill.name || !newBill.amount) return;
    const bill: Bill = {
      id: Date.now().toString(),
      name: newBill.name,
      amount: Number(newBill.amount),
      due: newBill.due || "TBD"
    };
    setBills([...bills, bill]);
    setNewBill({});
    setShowAddModal(false);
  };

  const payBill = (id: string) => {
    // Just remove it to simulate payment for now
    setBills(bills.filter(b => b.id !== id));
  };

  const totalBillsAmount = bills.reduce((acc, b) => acc + b.amount, 0);

  return (
    <div className="min-h-screen bg-background pb-24 text-slate-800 dark:text-zinc-100 transition-colors duration-300">
      <Header />
      
      <main className="mx-auto max-w-md px-4 pt-6 flex flex-col gap-6 relative">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-xl font-black tracking-tight">Finance & Bills</h2>
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Shared Household Ledger</span>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="h-10 w-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Balance Card */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 p-5 shadow-lg shadow-emerald-500/20 text-white flex flex-col gap-5">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-black/10 blur-xl" />
          
          <div className="relative z-10 flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-100">Pending Bills Total</span>
            <h3 className="text-3xl font-black tracking-tight">{currency}{totalBillsAmount.toFixed(2)}</h3>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 bg-black/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
              <div className="p-1.5 bg-white/20 rounded-md"><ArrowDownRight className="h-3 w-3" /></div>
              <div className="flex flex-col">
                <span className="text-[9px] font-semibold text-emerald-100 uppercase">Limit</span>
                <span className="text-xs font-bold">{currency}2,500</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-black/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
              <div className="p-1.5 bg-white/20 rounded-md"><ArrowUpRight className="h-3 w-3" /></div>
              <div className="flex flex-col">
                <span className="text-[9px] font-semibold text-emerald-100 uppercase">Spent</span>
                <span className="text-xs font-bold">{currency}1,420</span>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-zinc-100">Pending Bills</h3>
          
          {bills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 dark:text-zinc-500 glass-panel rounded-3xl border border-slate-100/50 shadow-sm">
              <Wallet className="h-10 w-10 mb-3 opacity-20" />
              <span className="text-sm font-semibold">No pending bills</span>
              <span className="text-[10px] text-center mt-1">Tap the plus button to add a bill.</span>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-4 shadow-sm border border-slate-100/50 dark:border-zinc-850 flex flex-col gap-1">
              {bills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-zinc-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 px-2 rounded-xl transition-colors">
                  <div className="flex flex-col flex-1">
                    <span className="text-sm font-bold text-slate-700 dark:text-zinc-200">{bill.name}</span>
                    <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" /> Due: {bill.due}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-black text-slate-800 dark:text-zinc-100">{currency}{bill.amount.toFixed(2)}</span>
                    <button 
                      onClick={() => payBill(bill.id)}
                      className="text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Pay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-800 dark:text-zinc-100">Add Shared Bill</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-full text-slate-500"><X className="h-4 w-4" /></button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bill Name</span>
                  <input 
                    type="text" 
                    placeholder="e.g. Electricity"
                    value={newBill.name || ""}
                    onChange={(e) => setNewBill({...newBill, name: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border-2 border-slate-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-slate-400">{currency}</span>
                      <input 
                        type="number" 
                        placeholder="0.00"
                        value={newBill.amount || ""}
                        onChange={(e) => setNewBill({...newBill, amount: parseFloat(e.target.value)})}
                        className="w-full bg-slate-50 dark:bg-zinc-950 border-2 border-slate-100 dark:border-zinc-800 rounded-xl pl-7 pr-3 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Date</span>
                    <input 
                      type="text" 
                      placeholder="e.g. In 3 days"
                      value={newBill.due || ""}
                      onChange={(e) => setNewBill({...newBill, due: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border-2 border-slate-100 dark:border-zinc-800 rounded-xl px-3 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                <button 
                  onClick={addBill}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 mt-2"
                >
                  Add to Household Ledger
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
