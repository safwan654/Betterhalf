"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { ShieldAlert, Plus, Trash2, ArrowLeft, Search, Eye, Key } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VaultPage() {
  const [documents, setDocuments] = useState([
    { id: 1, name: "Marriage Certificate", location: "Safe Box 1 (Master Bedroom)", reference: "MC-2022-9012", notes: "Original physical copy" },
    { id: 2, name: "Apartment Title Deed", location: "Blue Binder, Shelf 3", reference: "TD-APT-104B", notes: "Under Husband name" },
    { id: 3, name: "Car Warranty Book", location: "Glove Compartment", reference: "WARR-CAR-2024", notes: "Expires in 2029" },
    { id: 4, name: "Health Insurance Policies", location: "Green cabinet drawer 2", reference: "INS-MED-88123", notes: "Both profiles registered" }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [newName, setNewName] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newRef, setNewRef] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newLocation.trim()) return;

    const newDoc = {
      id: Date.now(),
      name: newName,
      location: newLocation,
      reference: newRef ? newRef : "N/A",
      notes: newNotes
    };

    setDocuments([newDoc, ...documents]);
    setNewName("");
    setNewLocation("");
    setNewRef("");
    setNewNotes("");
  };

  const deleteDocument = (id: number) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-24 text-slate-800 dark:text-zinc-100 transition-colors duration-300">
      <Header />
      
      <main className="mx-auto max-w-md px-4 pt-4 flex flex-col gap-6">
        
        {/* Back Link */}
        <div className="flex items-center gap-2">
          <Link href="/more" className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="text-sm font-black text-slate-700 dark:text-zinc-200">Secure Vault Index</span>
        </div>

        {/* Info Box */}
        <section className="bg-slate-50/80 dark:bg-zinc-900/60 p-4 rounded-2xl border border-slate-150/10 flex gap-3">
          <Key className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-wide">Security Notice</span>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">
              This index references physical locations of key papers inside the house. No scanned document files are stored in the cloud for privacy and maximum security.
            </p>
          </div>
        </section>

        {/* Add Record Form */}
        <section className="glass-panel rounded-2xl p-4 border border-slate-100/50 shadow-sm flex flex-col gap-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Index New Document
          </h3>
          <form onSubmit={handleAddDocument} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Document Name (e.g. Passport copy)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="text-xs font-medium px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Physical Location"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="flex-[2] text-xs font-medium px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <input
                type="text"
                placeholder="Ref No."
                value={newRef}
                onChange={(e) => setNewRef(e.target.value)}
                className="flex-1 text-xs font-medium px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
            <input
              type="text"
              placeholder="Additional notes..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="text-xs font-medium px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-tr from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-rose-500/10"
            >
              <Plus className="h-4 w-4" /> Index Document
            </button>
          </form>
        </section>

        {/* Index Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 dark:text-zinc-550" />
          <input
            type="text"
            placeholder="Search index..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs font-medium pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 shadow-sm"
          />
        </div>

        {/* Documents List */}
        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Vault Index Listings ({filteredDocuments.length})
          </h3>

          <div className="flex flex-col gap-2.5">
            {filteredDocuments.length === 0 ? (
              <p className="text-xs text-center text-slate-450 dark:text-zinc-550 py-6">No matching records found.</p>
            ) : (
              filteredDocuments.map((doc) => (
                <div key={doc.id} className="flex flex-col gap-2 p-4 bg-white dark:bg-zinc-900/80 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">{doc.name}</span>
                    </div>
                    <button 
                      onClick={() => deleteDocument(doc.id)}
                      className="p-1 hover:bg-slate-50 dark:hover:bg-zinc-850 rounded-lg text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1 border-t border-slate-50 dark:border-zinc-850 pt-2 text-[10px] font-semibold text-slate-500 dark:text-zinc-400">
                    <div>Location: <span className="font-extrabold text-slate-800 dark:text-zinc-250 italic">{doc.location}</span></div>
                    <div>Ref No: <span className="font-extrabold text-slate-700 dark:text-zinc-300">{doc.reference}</span></div>
                    {doc.notes && <div>Notes: <span className="font-medium text-slate-400 dark:text-zinc-500">{doc.notes}</span></div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </main>

      <BottomNavigation />
    </div>
  );
}
