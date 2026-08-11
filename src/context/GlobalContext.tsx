"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
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

  pendingAnimation: "HUG" | "KISS" | "TASK_ALERT" | null;
  interactionPayload: string | null;
  sendInteraction: (type: "HUG" | "KISS" | "TASK_ALERT", payload?: string) => void;
  
  currency: string;
  setCurrency: (currency: string) => void;
  
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
  const activeUserRef = useRef<"HUSBAND" | "WIFE">(activeUser);

  useEffect(() => {
    activeUserRef.current = activeUser;
  }, [activeUser]);

  // Shared state default values
  const [relationshipMode, setRelationshipModeState] = useState<"TOGETHER" | "DISTANCE">("TOGETHER");
  const [husbandTimezone, setHusbandTimezoneState] = useState("America/New_York");
  const [wifeTimezone, setWifeTimezoneState] = useState("Asia/Dubai");
  const [husbandName, setHusbandNameState] = useState("Husband");
  const [wifeName, setWifeNameState] = useState("Wife");
  const [husbandPhoto, setHusbandPhotoState] = useState<string | null>(null);
  const [wifePhoto, setWifePhotoState] = useState<string | null>(null);
  const [pendingAnimation, setPendingAnimationState] = useState<"HUG" | "KISS" | "TASK_ALERT" | null>(null);
  const [interactionPayload, setInteractionPayload] = useState<string | null>(null);
  const [lastInteractionTimestamp, setLastInteractionTimestamp] = useState<number>(0);
  const [currency, setCurrencyState] = useState<string>("$");
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

    // Fallback load from localStorage for instant UI before Firebase syncs
    const savedPrayers = localStorage.getItem("bh_prayers");
    const savedTasks = localStorage.getItem("bh_tasks");
    const savedBills = localStorage.getItem("bh_bills");
    
    if (savedPrayers) setPrayersState(JSON.parse(savedPrayers));
    if (savedTasks) setTasksState(JSON.parse(savedTasks));
    if (savedBills) setBillsState(JSON.parse(savedBills));
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
        if (data.currency) setCurrencyState(data.currency);
        
        // Handle incoming interactions
        if (data.lastInteraction) {
          const { type, sender, timestamp, payload } = data.lastInteraction;
          if (timestamp > lastInteractionTimestamp) {
            setLastInteractionTimestamp(timestamp);
            // Only trigger if it was sent by the partner
            if (sender !== activeUserRef.current && activeUserRef.current) {
              setInteractionPayload(payload || null);
              setPendingAnimationState(type);
              setTimeout(() => setPendingAnimationState(null), 4000);
            }
          }
        }
        
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
          currency: "$",
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

  const sendInteraction = (type: "HUG" | "KISS" | "TASK_ALERT", payload?: string) => {
    updateFirebase({ 
      lastInteraction: {
        type,
        sender: activeUser,
        timestamp: Date.now(),
        payload: payload || null
      }
    });
  };

  const setCurrency = (c: string) => {
    setCurrencyState(c);
    updateFirebase({ currency: c });
  };

  const setPrayers = (p: Prayer[]) => {
    setPrayersState(p);
    localStorage.setItem("bh_prayers", JSON.stringify(p));
    updateFirebase({ prayers: p });
  };
  
  const setTasks = (t: Task[]) => {
    setTasksState(t);
    localStorage.setItem("bh_tasks", JSON.stringify(t));
    updateFirebase({ tasks: t });
  };
  
  const setBills = (b: Bill[]) => {
    setBillsState(b);
    localStorage.setItem("bh_bills", JSON.stringify(b));
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
      pendingAnimation, interactionPayload, sendInteraction,
      currency, setCurrency,
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
