"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
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
    <div className="min-h-screen pb-36 text-[#44342B] dark:text-zinc-100 transition-colors duration-300">
      <Header />
      
      <main className="mx-auto max-w-md px-4 pt-4 flex flex-col gap-5 relative">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
              Household Wealth
            </span>
            <h2 className="text-lg font-black text-[#44342B] dark:text-zinc-100 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-600" />
              <span className="highlight-mint font-black">Finance &amp; Shared Wealth</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowBalanceModal(true)}
              className="h-9 w-9 bg-white/95 dark:bg-zinc-800 hover:bg-rose-50 border border-[#FFE2D1] text-[#826F66] dark:text-zinc-300 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-2xs"
              title="Edit Account Balances"
            >
              <PenLine className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="h-9 w-9 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-md shadow-emerald-500/20 transition-all active:scale-95"
              title="Add Transaction"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Liquid Balances Card */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-emerald-500 to-teal-500 p-5 shadow-lg shadow-emerald-500/20 text-white flex flex-col gap-5">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-black/10 blur-xl" />
          
          <div className="relative z-10 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-100 flex items-center gap-1.5"><Landmark className="h-3 w-3" /> Total Liquid Balance</span>
            </div>
            <h3 className="text-3xl font-black tracking-tight">{currency}{totalLiquid.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 bg-black/10 backdrop-blur-sm rounded-2xl p-3 border border-white/15">
              <div className="p-2 bg-white/20 rounded-xl"><User className="h-4 w-4" /></div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-emerald-100 uppercase tracking-wider">His Acc</span>
                <span className="text-xs font-black">{currency}{liquidBalances.husband.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-black/10 backdrop-blur-sm rounded-2xl p-3 border border-white/15">
              <div className="p-2 bg-white/20 rounded-xl"><User className="h-4 w-4" /></div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-emerald-100 uppercase tracking-wider">Her Acc</span>
                <span className="text-xs font-black">{currency}{liquidBalances.wife.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Ledger Summaries */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-panel p-4 rounded-[22px] border border-[#FFE2D1] shadow-sm flex flex-col gap-1">
             <span className="text-[10px] font-bold uppercase text-[#826F66]">Total Spent</span>
             <span className="text-lg font-black text-rose-500">{currency}{totalSpent.toLocaleString()}</span>
          </div>
          <div className="glass-panel p-4 rounded-[22px] border border-[#FFE2D1] shadow-sm flex flex-col gap-1">
             <span className="text-[10px] font-bold uppercase text-[#826F66]">Pending Bills</span>
             <span className="text-lg font-black text-amber-500">{currency}{totalPending.toLocaleString()}</span>
          </div>
        </div>

        {/* Pending Bills */}
        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-black text-[#44342B] dark:text-zinc-100 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="highlight-yellow font-black">Pending Bills</span>
          </h3>
          
          {pendingBills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-[#826F66] glass-panel rounded-[28px] border border-[#FFE2D1] shadow-sm">
              <span className="text-xs font-bold">No pending bills! ✨</span>
            </div>
          ) : (
            <div className="glass-panel rounded-[28px] p-3 shadow-sm border border-[#FFE2D1] dark:border-zinc-850 flex flex-col gap-1.5">
              {pendingBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-2.5 border-b border-[#FFE2D1]/60 dark:border-zinc-800/50 last:border-0 hover:bg-rose-50/40 dark:hover:bg-zinc-900/30 rounded-2xl transition-colors">
                  <div className="flex flex-col flex-1 cursor-pointer" onClick={() => openEditModal(bill)}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#44342B] dark:text-zinc-200">{bill.name}</span>
                      <span className={cn("text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider", bill.allocation === "SHARED" ? "bg-purple-100 text-purple-700" : bill.allocation === "HUSBAND" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700")}>
                        {bill.allocation}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#826F66] mt-0.5">Due: {bill.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-xs text-[#44342B] dark:text-zinc-100">{currency}{bill.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    <button 
                      onClick={() => markAsPaid(bill.id)}
                      className="text-[10px] font-black bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-xl transition-all shadow-xs active:scale-95"
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
          <h3 className="text-xs font-black text-[#44342B] dark:text-zinc-100 flex items-center gap-1.5">
            <ArrowDownRight className="h-4 w-4 text-rose-500" />
            <span className="highlight-pink font-black">Recent Outflow</span>
          </h3>
          
          {spentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-[#826F66] glass-panel rounded-[28px] border border-[#FFE2D1] shadow-sm">
              <span className="text-xs font-bold">No expenses logged yet!</span>
            </div>
          ) : (
            <div className="glass-panel rounded-[28px] p-3 shadow-sm border border-[#FFE2D1] flex flex-col gap-1.5">
              {spentTransactions.slice(0, 10).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-2.5 border-b border-[#FFE2D1]/60 last:border-0 hover:bg-rose-50/40 rounded-2xl transition-colors">
                  <div className="flex flex-col flex-1 cursor-pointer" onClick={() => openEditModal(tx)}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#44342B]">{tx.name}</span>
                      <span className={cn("text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider", tx.allocation === "SHARED" ? "bg-purple-100 text-purple-700" : tx.allocation === "HUSBAND" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700")}>
                        {tx.allocation}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#826F66] mt-0.5">{tx.date === format(new Date(), "yyyy-MM-dd") ? "Today" : tx.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-xs text-rose-500">-{currency}{tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    <button onClick={() => deleteTransaction(tx.id)} className="text-slate-300 hover:text-rose-500 p-1">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Add Transaction Modal */}
      {mounted && showAddModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[28px] p-5 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col gap-4 border border-[#FFE2D1]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-sm font-black text-[#44342B] dark:text-zinc-100">{editingTxId ? "Edit Entry" : "Add Entry"}</h3>
              <button onClick={() => { setShowAddModal(false); setEditingTxId(null); setNewTxName(""); setNewTxAmount(""); }} className="p-1.5 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"><X className="h-4 w-4" /></button>
            </div>

            <div className="flex flex-col gap-3">
              {/* Type Selector */}
              <div className="flex bg-[#FFF9F4] p-1 rounded-2xl border border-[#FFE2D1]">
                <button 
                  onClick={() => setNewTxType("PENDING")}
                  className={cn("flex-1 text-xs font-bold py-2 rounded-xl transition-all", newTxType === "PENDING" ? "bg-white shadow-sm text-[#44342B] font-black" : "text-slate-400")}
                >
                  Pending Bill
                </button>
                <button 
                  onClick={() => setNewTxType("SPENT")}
                  className={cn("flex-1 text-xs font-bold py-2 rounded-xl transition-all", newTxType === "SPENT" ? "bg-white shadow-sm text-[#44342B] font-black" : "text-slate-400")}
                >
                  Paid Expense
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-[#826F66] uppercase tracking-wider">{newTxType === "PENDING" ? "Bill Name" : "Expense Name"}</span>
                <input 
                  type="text" 
                  placeholder={newTxType === "PENDING" ? "e.g. Electricity Bill" : "e.g. Groceries"}
                  value={newTxName}
                  onChange={(e) => setNewTxName(e.target.value)}
                  className="w-full bg-[#FFF9F4] border border-[#FFE2D1] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#44342B] focus:outline-none focus:border-emerald-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-[#826F66] uppercase tracking-wider">Amount</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-xs text-[#826F66]">{currency}</span>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={newTxAmount}
                      onChange={(e) => setNewTxAmount(e.target.value)}
                      className="w-full bg-[#FFF9F4] border border-[#FFE2D1] rounded-2xl pl-7 pr-3 py-2.5 text-xs font-bold text-[#44342B] focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                
                {newTxType === "PENDING" && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-[#826F66] uppercase tracking-wider">Due Date</span>
                    <input 
                      type="date" 
                      value={newTxDate}
                      onChange={(e) => setNewTxDate(e.target.value)}
                      className="w-full bg-[#FFF9F4] border border-[#FFE2D1] rounded-2xl px-3 py-2.5 text-xs font-bold text-[#44342B] focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-[#826F66] uppercase tracking-wider">Allocation</span>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => setNewTxAllocation("HUSBAND")} className={cn("py-2 rounded-xl text-xs font-bold border transition-all", newTxAllocation === "HUSBAND" ? "bg-amber-500 text-white border-amber-500 font-black shadow-xs" : "border-[#FFE2D1] bg-[#FFF9F4] text-[#826F66]")}>Husband</button>
                  <button onClick={() => setNewTxAllocation("WIFE")} className={cn("py-2 rounded-xl text-xs font-bold border transition-all", newTxAllocation === "WIFE" ? "bg-rose-500 text-white border-rose-500 font-black shadow-xs" : "border-[#FFE2D1] bg-[#FFF9F4] text-[#826F66]")}>Wife</button>
                  <button onClick={() => setNewTxAllocation("SHARED")} className={cn("py-2 rounded-xl text-xs font-bold border transition-all", newTxAllocation === "SHARED" ? "bg-purple-500 text-white border-purple-500 font-black shadow-xs" : "border-[#FFE2D1] bg-[#FFF9F4] text-[#826F66]")}>Shared</button>
                </div>
              </div>

              <button 
                onClick={handleAddTransaction}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-2xl shadow-md shadow-emerald-500/20 transition-all active:scale-95 mt-1 text-xs"
              >
                {editingTxId ? "Save Changes" : (newTxType === "PENDING" ? "Add to Pending Bills" : "Log Expense")}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Balances Modal */}
      {mounted && showBalanceModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[28px] p-5 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col gap-4 border border-[#FFE2D1]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-sm font-black text-[#44342B] dark:text-zinc-100">Update Balances</h3>
              <button onClick={() => setShowBalanceModal(false)} className="p-1.5 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"><X className="h-4 w-4" /></button>
            </div>
            <p className="text-[11px] font-medium text-[#826F66]">Update your liquid account balances. Logged expenses auto-deduct from these totals.</p>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider">His Account Balance</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-xs text-slate-400">{currency}</span>
                  <input 
                    type="number" 
                    value={editHusbandBalance}
                    onChange={(e) => setEditHusbandBalance(e.target.value)}
                    className="w-full bg-[#FFF9F4] border border-[#FFE2D1] rounded-2xl pl-7 pr-3 py-2.5 text-xs font-bold text-[#44342B] focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-rose-700 uppercase tracking-wider">Her Account Balance</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-xs text-slate-400">{currency}</span>
                  <input 
                    type="number" 
                    value={editWifeBalance}
                    onChange={(e) => setEditWifeBalance(e.target.value)}
                    className="w-full bg-[#FFF9F4] border border-[#FFE2D1] rounded-2xl pl-7 pr-3 py-2.5 text-xs font-bold text-[#44342B] focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveBalances}
                className="w-full bg-[#44342B] hover:bg-black text-white font-black py-3 rounded-2xl shadow-md transition-all active:scale-95 mt-1 text-xs"
              >
                Save Balances
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
