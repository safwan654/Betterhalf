"use client";

import { useState } from "react";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, X, Clock, PenLine, Landmark, CreditCard, Users, User, ArrowRight } from "lucide-react";
import { useGlobal, FinanceTransaction } from "@/context/GlobalContext";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export default function Finance() {
  const { financeTransactions, setFinanceTransactions, liquidBalances, setLiquidBalances, currency } = useGlobal();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  
  // Transaction Form State
  const [newTxName, setNewTxName] = useState("");
  const [newTxAmount, setNewTxAmount] = useState("");
  const [newTxDate, setNewTxDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [newTxType, setNewTxType] = useState<"PENDING" | "SPENT">("PENDING");
  const [newTxAllocation, setNewTxAllocation] = useState<"HUSBAND" | "WIFE" | "SHARED">("SHARED");

  // Balance Form State
  const [editHusbandBalance, setEditHusbandBalance] = useState(liquidBalances.husband.toString());
  const [editWifeBalance, setEditWifeBalance] = useState(liquidBalances.wife.toString());

  const pendingBills = financeTransactions.filter(t => t.type === "PENDING");
  const spentTransactions = financeTransactions.filter(t => t.type === "SPENT");

  const totalPending = pendingBills.reduce((acc, t) => acc + t.amount, 0);
  const totalSpent = spentTransactions.reduce((acc, t) => acc + t.amount, 0);
  const totalLiquid = liquidBalances.husband + liquidBalances.wife;

  const deductBalance = (amount: number, allocation: "HUSBAND" | "WIFE" | "SHARED") => {
    if (allocation === "HUSBAND") {
      setLiquidBalances({ ...liquidBalances, husband: liquidBalances.husband - amount });
    } else if (allocation === "WIFE") {
      setLiquidBalances({ ...liquidBalances, wife: liquidBalances.wife - amount });
    } else {
      setLiquidBalances({ husband: liquidBalances.husband - (amount / 2), wife: liquidBalances.wife - (amount / 2) });
    }
  };

  const addBalance = (amount: number, allocation: "HUSBAND" | "WIFE" | "SHARED") => {
    if (allocation === "HUSBAND") {
      setLiquidBalances({ ...liquidBalances, husband: liquidBalances.husband + amount });
    } else if (allocation === "WIFE") {
      setLiquidBalances({ ...liquidBalances, wife: liquidBalances.wife + amount });
    } else {
      setLiquidBalances({ husband: liquidBalances.husband + (amount / 2), wife: liquidBalances.wife + (amount / 2) });
    }
  };

  const handleAddTransaction = () => {
    if (!newTxName || !newTxAmount) return;
    const amount = Number(newTxAmount);
    
    let husbandChange = 0;
    let wifeChange = 0;

    if (editingTxId) {
      const oldTx = financeTransactions.find(t => t.id === editingTxId);
      if (oldTx && oldTx.type === "SPENT") {
        if (oldTx.allocation === "HUSBAND") husbandChange += oldTx.amount;
        else if (oldTx.allocation === "WIFE") wifeChange += oldTx.amount;
        else { husbandChange += oldTx.amount / 2; wifeChange += oldTx.amount / 2; }
      }
    }

    if (newTxType === "SPENT") {
      if (newTxAllocation === "HUSBAND") husbandChange -= amount;
      else if (newTxAllocation === "WIFE") wifeChange -= amount;
      else { husbandChange -= amount / 2; wifeChange -= amount / 2; }
    }

    if (husbandChange !== 0 || wifeChange !== 0) {
      setLiquidBalances({
        husband: liquidBalances.husband + husbandChange,
        wife: liquidBalances.wife + wifeChange
      });
    }

    const tx: FinanceTransaction = {
      id: editingTxId || Date.now().toString(),
      name: newTxName,
      amount: amount,
      date: editingTxId && newTxType === "SPENT" ? financeTransactions.find(t => t.id === editingTxId)?.date || format(new Date(), "yyyy-MM-dd") : (newTxType === "PENDING" ? newTxDate : format(new Date(), "yyyy-MM-dd")),
      type: newTxType,
      allocation: newTxAllocation
    };
    
    if (editingTxId) {
      setFinanceTransactions(financeTransactions.map(t => t.id === editingTxId ? tx : t).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } else {
      setFinanceTransactions([...financeTransactions, tx].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }

    setNewTxName("");
    setNewTxAmount("");
    setEditingTxId(null);
    setShowAddModal(false);
  };

  const openEditModal = (tx: FinanceTransaction) => {
    setEditingTxId(tx.id);
    setNewTxName(tx.name);
    setNewTxAmount(tx.amount.toString());
    setNewTxDate(tx.date);
    setNewTxType(tx.type);
    setNewTxAllocation(tx.allocation);
    setShowAddModal(true);
  };

  const markAsPaid = (id: string) => {
    const tx = financeTransactions.find(t => t.id === id);
    if (!tx) return;
    
    deductBalance(tx.amount, tx.allocation);
    
    setFinanceTransactions(financeTransactions.map(t => 
      t.id === id ? { ...t, type: "SPENT", date: format(new Date(), "yyyy-MM-dd") } : t
    ));
  };

  const deleteTransaction = (id: string) => {
    const tx = financeTransactions.find(t => t.id === id);
    if (tx && tx.type === "SPENT") {
      addBalance(tx.amount, tx.allocation);
    }
    setFinanceTransactions(financeTransactions.filter(t => t.id !== id));
  };

  const handleSaveBalances = () => {
    setLiquidBalances({
      husband: Number(editHusbandBalance) || 0,
      wife: Number(editWifeBalance) || 0
    });
    setShowBalanceModal(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24 text-slate-800 dark:text-zinc-100 transition-colors duration-300">
      <Header />
      
      <main className="mx-auto max-w-md px-4 pt-6 flex flex-col gap-6 relative">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-xl font-black tracking-tight">Finance & Ledger</h2>
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Household Wealth</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowBalanceModal(true)}
              className="h-10 w-10 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 rounded-full flex items-center justify-center transition-all active:scale-95"
            >
              <PenLine className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="h-10 w-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Liquid Balances Card */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 p-5 shadow-lg shadow-emerald-500/20 text-white flex flex-col gap-5">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-black/10 blur-xl" />
          
          <div className="relative z-10 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-100 flex items-center gap-1.5"><Landmark className="h-3 w-3" /> Total Liquid Balance</span>
            </div>
            <h3 className="text-3xl font-black tracking-tight">{currency}{totalLiquid.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 bg-black/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="p-2 bg-white/20 rounded-lg"><User className="h-4 w-4" /></div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-emerald-100 uppercase tracking-wider">His Acc</span>
                <span className="text-xs font-black">{currency}{liquidBalances.husband.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-black/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="p-2 bg-white/20 rounded-lg"><User className="h-4 w-4" /></div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-emerald-100 uppercase tracking-wider">Her Acc</span>
                <span className="text-xs font-black">{currency}{liquidBalances.wife.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Ledger Summaries */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-panel p-3 rounded-2xl border border-slate-100/50 shadow-sm flex flex-col gap-1">
             <span className="text-[10px] font-bold uppercase text-slate-400">Total Spent</span>
             <span className="text-lg font-black text-rose-500">{currency}{totalSpent.toLocaleString()}</span>
          </div>
          <div className="glass-panel p-3 rounded-2xl border border-slate-100/50 shadow-sm flex flex-col gap-1">
             <span className="text-[10px] font-bold uppercase text-slate-400">Pending Bills</span>
             <span className="text-lg font-black text-amber-500">{currency}{totalPending.toLocaleString()}</span>
          </div>
        </div>

        {/* Pending Bills */}
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-zinc-100 flex items-center gap-1.5"><Clock className="h-4 w-4 text-amber-500" /> Pending Bills</h3>
          
          {pendingBills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-slate-400 dark:text-zinc-500 glass-panel rounded-3xl border border-slate-100/50 shadow-sm">
              <span className="text-xs font-semibold">No pending bills!</span>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-3 shadow-sm border border-slate-100/50 dark:border-zinc-850 flex flex-col gap-1">
              {pendingBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-2 border-b border-slate-50 dark:border-zinc-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 rounded-xl transition-colors">
                  <div className="flex flex-col flex-1 cursor-pointer" onClick={() => openEditModal(bill)}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-700 dark:text-zinc-200">{bill.name}</span>
                      <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider", bill.allocation === "SHARED" ? "bg-purple-100 text-purple-600 dark:bg-purple-500/20" : bill.allocation === "HUSBAND" ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20" : "bg-rose-100 text-rose-600 dark:bg-rose-500/20")}>
                        {bill.allocation}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 mt-0.5">Due: {bill.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-800 dark:text-zinc-100">{currency}{bill.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    <button 
                      onClick={() => markAsPaid(bill.id)}
                      className="text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                    >
                      Mark Paid
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Transactions (Spent) */}
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-zinc-100 flex items-center gap-1.5"><CreditCard className="h-4 w-4 text-emerald-500" /> Recent Expenses</h3>
          
          {spentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-slate-400 dark:text-zinc-500 glass-panel rounded-3xl border border-slate-100/50 shadow-sm">
              <span className="text-xs font-semibold">No expenses logged yet.</span>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-3 shadow-sm border border-slate-100/50 dark:border-zinc-850 flex flex-col gap-1">
              {spentTransactions.slice(0, 10).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-2 border-b border-slate-50 dark:border-zinc-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 rounded-xl transition-colors">
                  <div className="flex flex-col flex-1 cursor-pointer" onClick={() => openEditModal(tx)}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-700 dark:text-zinc-200">{tx.name}</span>
                      <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider", tx.allocation === "SHARED" ? "bg-purple-100 text-purple-600 dark:bg-purple-500/20" : tx.allocation === "HUSBAND" ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20" : "bg-rose-100 text-rose-600 dark:bg-rose-500/20")}>
                        {tx.allocation}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 mt-0.5">{tx.date === format(new Date(), "yyyy-MM-dd") ? "Today" : tx.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-rose-500">-{currency}{tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    <button onClick={() => deleteTransaction(tx.id)} className="text-slate-300 hover:text-rose-500 p-1">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>


        {/* Add Transaction Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800 dark:text-zinc-100">{editingTxId ? "Edit Entry" : "Add Entry"}</h3>
                <button onClick={() => { setShowAddModal(false); setEditingTxId(null); setNewTxName(""); setNewTxAmount(""); }} className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-full text-slate-500 hover:bg-slate-200"><X className="h-4 w-4" /></button>
              </div>

              <div className="flex flex-col gap-4">
                {/* Type Selector */}
                <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
                  <button 
                    onClick={() => setNewTxType("PENDING")}
                    className={cn("flex-1 text-xs font-bold py-2 rounded-lg transition-all", newTxType === "PENDING" ? "bg-white dark:bg-zinc-700 shadow-sm text-slate-800 dark:text-zinc-100" : "text-slate-500")}
                  >
                    Pending Bill
                  </button>
                  <button 
                    onClick={() => setNewTxType("SPENT")}
                    className={cn("flex-1 text-xs font-bold py-2 rounded-lg transition-all", newTxType === "SPENT" ? "bg-white dark:bg-zinc-700 shadow-sm text-slate-800 dark:text-zinc-100" : "text-slate-500")}
                  >
                    Paid Expense
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{newTxType === "PENDING" ? "Bill Name" : "Expense Name"}</span>
                  <input 
                    type="text" 
                    placeholder={newTxType === "PENDING" ? "e.g. Electricity Bill" : "e.g. Groceries"}
                    value={newTxName}
                    onChange={(e) => setNewTxName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border-2 border-slate-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-base font-bold focus:outline-none focus:border-emerald-500/50"
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
                        value={newTxAmount}
                        onChange={(e) => setNewTxAmount(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-950 border-2 border-slate-100 dark:border-zinc-800 rounded-xl pl-7 pr-3 py-3 text-base font-bold focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>
                  
                  {newTxType === "PENDING" && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Date</span>
                      <input 
                        type="date"
                        value={newTxDate}
                        onChange={(e) => setNewTxDate(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-950 border-2 border-slate-100 dark:border-zinc-800 rounded-xl px-3 py-3 text-base font-bold focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Allocation (Who Paid / Owes)</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setNewTxAllocation("HUSBAND")} className={cn("py-2 rounded-xl text-xs font-bold border-2 transition-all", newTxAllocation === "HUSBAND" ? "bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-500/10" : "border-slate-100 dark:border-zinc-800 text-slate-500")}>Husband</button>
                    <button onClick={() => setNewTxAllocation("WIFE")} className={cn("py-2 rounded-xl text-xs font-bold border-2 transition-all", newTxAllocation === "WIFE" ? "bg-rose-50 border-rose-500 text-rose-600 dark:bg-rose-500/10" : "border-slate-100 dark:border-zinc-800 text-slate-500")}>Wife</button>
                    <button onClick={() => setNewTxAllocation("SHARED")} className={cn("py-2 rounded-xl text-xs font-bold border-2 transition-all", newTxAllocation === "SHARED" ? "bg-purple-50 border-purple-500 text-purple-600 dark:bg-purple-500/10" : "border-slate-100 dark:border-zinc-800 text-slate-500")}>Shared</button>
                  </div>
                </div>

                <button 
                  onClick={handleAddTransaction}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 mt-2"
                >
                  {editingTxId ? "Save Changes" : (newTxType === "PENDING" ? "Add to Pending Bills" : "Log Expense")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Balances Modal */}
        {showBalanceModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800 dark:text-zinc-100">Update Balances</h3>
                <button onClick={() => setShowBalanceModal(false)} className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-full text-slate-500 hover:bg-slate-200"><X className="h-4 w-4" /></button>
              </div>
              <p className="text-xs text-slate-500">Update your current liquid account balances manually here. We will auto-deduct logged expenses from these totals.</p>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">His Account Balance</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-slate-400">{currency}</span>
                    <input 
                      type="number" 
                      value={editHusbandBalance}
                      onChange={(e) => setEditHusbandBalance(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border-2 border-slate-100 dark:border-zinc-800 rounded-xl pl-7 pr-3 py-3 text-base font-bold focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Her Account Balance</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-slate-400">{currency}</span>
                    <input 
                      type="number" 
                      value={editWifeBalance}
                      onChange={(e) => setEditWifeBalance(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border-2 border-slate-100 dark:border-zinc-800 rounded-xl pl-7 pr-3 py-3 text-base font-bold focus:outline-none focus:border-rose-500/50"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSaveBalances}
                  className="w-full bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 mt-2"
                >
                  Save Balances
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
