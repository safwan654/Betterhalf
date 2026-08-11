"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";

export type PrayerStatus = "ON_TIME" | "LATE" | "QADA" | null;
export interface Prayer { id: string; name: string; time: string; husband: PrayerStatus; wife: PrayerStatus; }
export interface Task { id: string; title: string; urgency: "HIGH"|"MEDIUM"|"LOW"; category: string; due: string; }
export interface Bill { id: string; name: string; amount: number; due: string; }

interface GlobalContextType {
  isAuthenticated: boolean;
  login: (pin: string, user: "HUSBAND" | "WIFE") => boolean;
  logout: () => void;
  activeUser: "HUSBAND" | "WIFE";
  setActiveUser: (user: "HUSBAND" | "WIFE") => void;
  
  relationshipMode: "TOGETHER" | "DISTANCE";
  setRelationshipMode: (mode: "TOGETHER" | "DISTANCE") => void;
  
  husbandTimezone: string;
  setHusbandTimezone: (tz: string) => void;
  wifeTimezone: string;
  setWifeTimezone: (tz: string) => void;
  
  husbandName: string;
  setHusbandName: (name: string) => void;
  wifeName: string;
  setWifeName: (name: string) => void;
  
  husbandPhoto: string | null;
  setHusbandPhoto: (photoBase64: string | null) => void;
  wifePhoto: string | null;
  setWifePhoto: (photoBase64: string | null) => void;

  pendingAnimation: "HUG" | "KISS" | null;
  setPendingAnimation: (anim: "HUG" | "KISS" | null) => void;
  
  householdPin: string | null;

  // App Data
  prayers: Prayer[];
  setPrayers: (prayers: Prayer[]) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  bills: Bill[];
  setBills: (bills: Bill[]) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

const initialPrayers: Prayer[] = [
  { id: "fajr", name: "Fajr", time: "5:00 AM", husband: null, wife: null },
  { id: "dhuhr", name: "Dhuhr", time: "1:00 PM", husband: null, wife: null },
  { id: "asr", name: "Asr", time: "4:30 PM", husband: null, wife: null },
  { id: "maghrib", name: "Maghrib", time: "7:15 PM", husband: null, wife: null },
  { id: "isha", name: "Isha", time: "8:45 PM", husband: null, wife: null },
];

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [householdPin, setHouseholdPin] = useState<string | null>(null);
  const [activeUser, setActiveUserState] = useState<"HUSBAND" | "WIFE">("HUSBAND");
  
  // Shared state default values
  const [relationshipMode, setRelationshipModeState] = useState<"TOGETHER" | "DISTANCE">("TOGETHER");
  const [husbandTimezone, setHusbandTimezoneState] = useState("America/New_York");
  const [wifeTimezone, setWifeTimezoneState] = useState("Asia/Dubai");
  const [husbandName, setHusbandNameState] = useState("Husband");
  const [wifeName, setWifeNameState] = useState("Wife");
  const [husbandPhoto, setHusbandPhotoState] = useState<string | null>(null);
  const [wifePhoto, setWifePhotoState] = useState<string | null>(null);
  const [pendingAnimation, setPendingAnimationState] = useState<"HUG" | "KISS" | null>(null);
  const [prayers, setPrayersState] = useState<Prayer[]>(initialPrayers);
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [bills, setBillsState] = useState<Bill[]>([]);

  // 1. Initial Load of Auth from LocalStorage
  useEffect(() => {
    setIsMounted(true);
    const auth = localStorage.getItem("bh_auth") === "true";
    const pin = localStorage.getItem("bh_household_pin");
    const user = localStorage.getItem("bh_user") as "HUSBAND" | "WIFE";

    if (auth) setIsAuthenticated(true);
    if (pin) setHouseholdPin(pin);
    if (user) setActiveUserState(user);
  }, []);

  // 2. Firebase Sync - Subscribe to Household Document
  useEffect(() => {
    if (!householdPin) return;

    const docRef = doc(db, "households", householdPin);
    
    // Subscribe to real-time changes
    const unsubscribe = onSnapshot(docRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.relationshipMode) setRelationshipModeState(data.relationshipMode);
        if (data.husbandTimezone) setHusbandTimezoneState(data.husbandTimezone);
        if (data.wifeTimezone) setWifeTimezoneState(data.wifeTimezone);
        if (data.husbandName) setHusbandNameState(data.husbandName);
        if (data.wifeName) setWifeNameState(data.wifeName);
        if (data.husbandPhoto !== undefined) setHusbandPhotoState(data.husbandPhoto);
        if (data.wifePhoto !== undefined) setWifePhotoState(data.wifePhoto);
        if (data.pendingAnimation !== undefined) setPendingAnimationState(data.pendingAnimation);
        
        if (data.prayers) setPrayersState(data.prayers);
        if (data.tasks) setTasksState(data.tasks);
        if (data.bills) setBillsState(data.bills);
      } else {
        // First time this household is created on Firebase, initialize it
        await setDoc(docRef, {
          relationshipMode: "TOGETHER",
          husbandTimezone: "America/New_York",
          wifeTimezone: "Asia/Dubai",
          husbandName: "Husband",
          wifeName: "Wife",
          husbandPhoto: null,
          wifePhoto: null,
          pendingAnimation: null,
          prayers: initialPrayers,
          tasks: [],
          bills: []
        }, { merge: true });
      }
    });

    return () => unsubscribe();
  }, [householdPin]);

  // Utility to push updates to Firebase
  const updateFirebase = async (updates: any) => {
    if (!householdPin) return;
    try {
      const docRef = doc(db, "households", householdPin);
      await setDoc(docRef, updates, { merge: true });
    } catch (e) {
      console.error("Error writing to Firebase:", e);
    }
  };

  const login = (pin: string, user: "HUSBAND" | "WIFE") => {
    if (pin.length >= 4) { 
      setIsAuthenticated(true);
      setActiveUserState(user);
      setHouseholdPin(pin);
      localStorage.setItem("bh_auth", "true");
      localStorage.setItem("bh_user", user);
      localStorage.setItem("bh_household_pin", pin);
      
      // Ensure document exists immediately
      const docRef = doc(db, "households", pin);
      getDoc(docRef).then(snap => {
        if (!snap.exists()) {
          setDoc(docRef, { prayers: initialPrayers, tasks: [], bills: [] }, { merge: true });
        }
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("bh_auth");
  };

  const setActiveUser = (user: "HUSBAND" | "WIFE") => {
    setActiveUserState(user);
    localStorage.setItem("bh_user", user);
  };

  // State setters now write to Firebase directly.
  // We optionally update local state immediately for snappy UI, but onSnapshot handles it anyway.
  
  const setRelationshipMode = (mode: "TOGETHER" | "DISTANCE") => {
    setRelationshipModeState(mode);
    updateFirebase({ relationshipMode: mode });
  };

  const setHusbandTimezone = (tz: string) => {
    setHusbandTimezoneState(tz);
    updateFirebase({ husbandTimezone: tz });
  };
  const setWifeTimezone = (tz: string) => {
    setWifeTimezoneState(tz);
    updateFirebase({ wifeTimezone: tz });
  };

  const setHusbandName = (name: string) => {
    setHusbandNameState(name);
    updateFirebase({ husbandName: name });
  };
  const setWifeName = (name: string) => {
    setWifeNameState(name);
    updateFirebase({ wifeName: name });
  };

  const setHusbandPhoto = (photo: string | null) => {
    setHusbandPhotoState(photo);
    updateFirebase({ husbandPhoto: photo });
  };
  const setWifePhoto = (photo: string | null) => {
    setWifePhotoState(photo);
    updateFirebase({ wifePhoto: photo });
  };

  const setPendingAnimation = (anim: "HUG" | "KISS" | null) => {
    setPendingAnimationState(anim);
    updateFirebase({ pendingAnimation: anim });
  };

  const setPrayers = (p: Prayer[]) => {
    setPrayersState(p);
    updateFirebase({ prayers: p });
  };
  
  const setTasks = (t: Task[]) => {
    setTasksState(t);
    updateFirebase({ tasks: t });
  };
  
  const setBills = (b: Bill[]) => {
    setBillsState(b);
    updateFirebase({ bills: b });
  };

  if (!isMounted) return null;

  return (
    <GlobalContext.Provider value={{
      isAuthenticated, login, logout,
      activeUser, setActiveUser,
      relationshipMode, setRelationshipMode,
      husbandTimezone, setHusbandTimezone,
      wifeTimezone, setWifeTimezone,
      husbandName, setHusbandName,
      wifeName, setWifeName,
      husbandPhoto, setHusbandPhoto,
      wifePhoto, setWifePhoto,
      pendingAnimation, setPendingAnimation,
      householdPin,
      prayers, setPrayers,
      tasks, setTasks,
      bills, setBills
    }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }
  return context;
}
