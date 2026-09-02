"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";

export type PrayerStatus = "ON_TIME" | "LATE" | "QADA" | null;
export interface Prayer { id: string; name: string; time: string; husband: PrayerStatus; wife: PrayerStatus; }
export interface Task { id: string; title: string; urgency: "HIGH"|"MEDIUM"|"LOW"; category: string; due: string; }
export interface FinanceTransaction { id: string; name: string; amount: number; date: string; type: "PENDING" | "SPENT"; allocation: "HUSBAND" | "WIFE" | "SHARED"; }
export interface LiquidBalances { husband: number; wife: number; }

export interface PantryItem { id: number; name: string; quantity: string; category: string; checked: boolean; }
export interface Workout { id: number; activity: string; duration: number; notes: string; spender: string; }
export interface DailyNutrition { protein: number; proteinGoal: number; }
export interface NutritionDay { husband: DailyNutrition; wife: DailyNutrition; }
export interface CallLog { id: number; name: string; relation: string; lastContacted: string; frequency: number; due: string; status: string; }
export interface VaultRecord { id: number; name: string; location: string; reference: string; notes: string; }

export interface HealthProfile { height: string; weight: string; bloodType: string; allergies: string; notes: string; }
export interface DoctorVisit { id: number; date: string; doctorName: string; patient: string; reason: string; notes: string; }

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

  pendingAnimation: "HUG" | "KISS" | "TASK_ALERT" | "PRAYER_ALERT" | "PRAYER_COMPLETE" | "PRAYER_CELEBRATION" | null;
  interactionPayload: string | null;
  sendInteraction: (type: "HUG" | "KISS" | "TASK_ALERT" | "PRAYER_ALERT" | "PRAYER_COMPLETE" | "PRAYER_CELEBRATION", payload?: string, target?: "PARTNER" | "BOTH") => void;
  clearPendingAnimation: () => void;
  hasHusbandPush: boolean;
  hasWifePush: boolean;
  
  reminderTone: "GENTLE" | "DIRECT" | "PLAYFUL";
  setReminderTone: (tone: "GENTLE" | "DIRECT" | "PLAYFUL") => void;
  madhhab: "STANDARD" | "HANAFI";
  setMadhhab: (m: "STANDARD" | "HANAFI") => void;

  currency: string;
  setCurrency: (currency: string) => void;
  
  householdPin: string | null;

  // App Data
  globalSelectedDate: string;
  setGlobalSelectedDate: (date: string) => void;
  prayersByDate: Record<string, Prayer[]>;
  setPrayersByDate: (prayers: Record<string, Prayer[]>) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;

  // New Modules
  pantryItems: PantryItem[];
  setPantryItems: (items: PantryItem[]) => void;
  workoutsByDate: Record<string, Workout[]>;
  setWorkoutsByDate: (workouts: Record<string, Workout[]>) => void;
  nutritionByDate: Record<string, NutritionDay>;
  setNutritionByDate: (nutrition: Record<string, NutritionDay>) => void;
  callsByDate: Record<string, CallLog[]>;
  setCallsByDate: (calls: Record<string, CallLog[]>) => void;
  vaultRecords: VaultRecord[];
  setVaultRecords: (records: VaultRecord[]) => void;
  healthProfiles: { husband: HealthProfile; wife: HealthProfile };
  setHealthProfiles: (profiles: { husband: HealthProfile; wife: HealthProfile }) => void;
  doctorVisits: DoctorVisit[];
  setDoctorVisits: (visits: DoctorVisit[]) => void;
  financeTransactions: FinanceTransaction[];
  setFinanceTransactions: (transactions: FinanceTransaction[]) => void;
  liquidBalances: LiquidBalances;
  setLiquidBalances: (balances: LiquidBalances) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const initialPrayers: Prayer[] = [
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
  const [wifeTimezone, setWifeTimezoneState] = useState("America/Los_Angeles");
  const [husbandName, setHusbandNameState] = useState("Husband");
  const [wifeName, setWifeNameState] = useState("Wife");
  const [husbandPhoto, setHusbandPhotoState] = useState<string | null>(null);
  const [wifePhoto, setWifePhotoState] = useState<string | null>(null);
  const [pendingAnimation, setPendingAnimationState] = useState<"HUG" | "KISS" | "TASK_ALERT" | "PRAYER_ALERT" | null>(null);
  const [interactionPayload, setInteractionPayload] = useState<string | null>(null);
  const [lastInteractionTimestamp, setLastInteractionTimestamp] = useState<number>(0);
  const lastInteractionTimestampRef = useRef<number>(0);
  const [hasHusbandPush, setHasHusbandPush] = useState<boolean>(false);
  const [hasWifePush, setHasWifePush] = useState<boolean>(false);
  const [reminderTone, setReminderToneState] = useState<"GENTLE" | "DIRECT" | "PLAYFUL">("GENTLE");
  const [madhhab, setMadhhabState] = useState<"STANDARD" | "HANAFI">("STANDARD");
  const [currency, setCurrencyState] = useState<string>("$");
  
  const [globalSelectedDate, setGlobalSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [prayersByDate, setPrayersByDateState] = useState<Record<string, Prayer[]>>({});
  const [tasks, setTasksState] = useState<Task[]>([]);

  // New modules state
  const [pantryItems, setPantryItemsState] = useState<PantryItem[]>([]);
  const [workoutsByDate, setWorkoutsByDateState] = useState<Record<string, Workout[]>>({});
  const [nutritionByDate, setNutritionByDateState] = useState<Record<string, NutritionDay>>({});
  const [callsByDate, setCallsByDateState] = useState<Record<string, CallLog[]>>({});
  const [vaultRecords, setVaultRecordsState] = useState<VaultRecord[]>([]);
  const [healthProfiles, setHealthProfilesState] = useState<{ husband: HealthProfile; wife: HealthProfile }>({
    husband: { height: "", weight: "", bloodType: "", allergies: "", notes: "" },
    wife: { height: "", weight: "", bloodType: "", allergies: "", notes: "" }
  });
  const [doctorVisits, setDoctorVisitsState] = useState<DoctorVisit[]>([]);
  const [financeTransactions, setFinanceTransactionsState] = useState<FinanceTransaction[]>([]);
  const [liquidBalances, setLiquidBalancesState] = useState<LiquidBalances>({ husband: 0, wife: 0 });

  // 1. Initial Load of Auth from LocalStorage
  useEffect(() => {
    setIsMounted(true);
    const auth = localStorage.getItem("bh_auth") === "true";
    const pin = localStorage.getItem("bh_household_pin");
    const user = localStorage.getItem("bh_user") as "HUSBAND" | "WIFE" | null;

    if (auth) setIsAuthenticated(true);
    if (pin) setHouseholdPin(pin);
    if (user) setActiveUserState(user);

    // Fallback load from localStorage for instant UI before Firebase syncs
    const savedPrayers = localStorage.getItem("bh_prayers_by_date");
    const savedTasks = localStorage.getItem("bh_tasks");
    
    if (savedPrayers) setPrayersByDateState(JSON.parse(savedPrayers));
    if (savedTasks) setTasksState(JSON.parse(savedTasks));

    const savedTone = localStorage.getItem("bh_reminder_tone") as "GENTLE" | "DIRECT" | "PLAYFUL" | null;
    if (savedTone) setReminderToneState(savedTone);

    const savedMadhhab = localStorage.getItem("bh_madhhab") as "STANDARD" | "HANAFI" | null;
    if (savedMadhhab) setMadhhabState(savedMadhhab);
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
        if (data.reminderTone) setReminderToneState(data.reminderTone);
        if (data.madhhab) setMadhhabState(data.madhhab);
        setHasHusbandPush(!!data.husbandPushSubscription);
        setHasWifePush(!!data.wifePushSubscription);
        
        // Handle incoming interactions
        if (data.lastInteraction) {
          const { type, sender, timestamp, payload } = data.lastInteraction;
          const isRecent = Date.now() - timestamp < 10000; // Sent within the last 10 seconds
          if (timestamp > lastInteractionTimestampRef.current) {
            lastInteractionTimestampRef.current = timestamp;
            setLastInteractionTimestamp(timestamp);
            // Only trigger if it was sent by the partner (or celebration for both) AND is recent
            if (isRecent && (sender !== activeUserRef.current || type === "PRAYER_CELEBRATION") && activeUserRef.current) {
              setInteractionPayload(payload || null);
              setPendingAnimationState(type);
              setTimeout(() => setPendingAnimationState(null), 4000);
            }
          }
        }
        
        // Handle legacy flat prayers array migration to object
        if (data.prayersByDate) {
          setPrayersByDateState(data.prayersByDate);
        } else if (data.prayers && Array.isArray(data.prayers)) {
          // Migrate old data
          const todayStr = format(new Date(), "yyyy-MM-dd");
          const migrated = { [todayStr]: data.prayers };
          setPrayersByDateState(migrated);
        }

        if (data.tasks) setTasksState(data.tasks);

        if (data.pantryItems) setPantryItemsState(data.pantryItems);
        if (data.workoutsByDate) setWorkoutsByDateState(data.workoutsByDate);
        if (data.nutritionByDate) setNutritionByDateState(data.nutritionByDate);
        if (data.callsByDate) setCallsByDateState(data.callsByDate);
        if (data.vaultRecords) setVaultRecordsState(data.vaultRecords);
        if (data.healthProfiles) setHealthProfilesState(data.healthProfiles);
        if (data.doctorVisits) setDoctorVisitsState(data.doctorVisits);
        if (data.financeTransactions) setFinanceTransactionsState(data.financeTransactions);
        if (data.liquidBalances) setLiquidBalancesState(data.liquidBalances);
      } else {
        // First time this household is created on Firebase, initialize it
        await setDoc(docRef, {
          relationshipMode: "TOGETHER",
          husbandTimezone: "America/New_York",
          wifeTimezone: "America/Los_Angeles",
          husbandName: "Husband",
          wifeName: "Wife",
          husbandPhoto: null,
          wifePhoto: null,
          pendingAnimation: null,
          currency: "$",
          prayersByDate: {},
          tasks: [],
          pantryItems: [],
          workoutsByDate: {},
          nutritionByDate: {},
          callsByDate: {},
          vaultRecords: [],
          healthProfiles: {
            husband: { height: "", weight: "", bloodType: "", allergies: "", notes: "" },
            wife: { height: "", weight: "", bloodType: "", allergies: "", notes: "" }
          },
          doctorVisits: [],
          financeTransactions: [],
          liquidBalances: { husband: 0, wife: 0 }
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
          setDoc(docRef, { prayersByDate: {}, tasks: [] }, { merge: true });
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

  const clearPendingAnimation = () => {
    setPendingAnimationState(null);
  };

  const sendInteraction = (
    type: "HUG" | "KISS" | "TASK_ALERT" | "PRAYER_ALERT" | "PRAYER_COMPLETE" | "PRAYER_CELEBRATION",
    payload?: string,
    target: "PARTNER" | "BOTH" = "PARTNER"
  ) => {
    updateFirebase({ 
      lastInteraction: {
        type,
        sender: activeUser,
        timestamp: Date.now(),
        payload: payload || null
      }
    });

    if (householdPin) {
      const partner = activeUser === "HUSBAND" ? "WIFE" : "HUSBAND";
      const senderName = activeUser === "HUSBAND" ? husbandName : wifeName;
      const targetUser = target === "BOTH" ? "BOTH" : partner;

      let title = "BetterHalf Alert";
      let body = `${senderName} sent an update!`;

      if (type === "HUG") {
        title = "Virtual Hug!";
        body = `${senderName} sent you a hug 🫂`;
      } else if (type === "KISS") {
        title = "Virtual Kiss!";
        body = `${senderName} sent you a kiss 😘`;
      } else if (type === "PRAYER_ALERT") {
        title = "Prayer Reminder 🕌";
        if (reminderTone === "PLAYFUL") {
          body = `Hey love! ${senderName} is checking in: ${payload || "don't forget prayer!"} ✨🤍`;
        } else if (reminderTone === "DIRECT") {
          body = `${senderName}: ${payload || "Time for prayer"} 🕌`;
        } else {
          body = `Warm reminder from ${senderName}: ${payload || "Time for prayer"} 🌿`;
        }
      } else if (type === "PRAYER_COMPLETE") {
        title = "Prayer Completed ✅";
        body = payload || `${senderName} completed prayer!`;
      } else if (type === "PRAYER_CELEBRATION") {
        title = "Prayer Complete Together 🤍";
        body = payload || "Alhamdulillah! Prayer complete for both of you today!";
      } else if (type === "TASK_ALERT") {
        title = "New Task Assigned";
        body = `${senderName} assigned a task: ${payload || "Check tasks"}`;
      }

      fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          householdPin,
          targetUser,
          title,
          body
        })
      }).catch(err => console.error("Push notification error:", err));
    }
  };

  const setReminderTone = (tone: "GENTLE" | "DIRECT" | "PLAYFUL") => {
    setReminderToneState(tone);
    localStorage.setItem("bh_reminder_tone", tone);
    updateFirebase({ reminderTone: tone });
  };

  const setMadhhab = (m: "STANDARD" | "HANAFI") => {
    setMadhhabState(m);
    localStorage.setItem("bh_madhhab", m);
    updateFirebase({ madhhab: m });
  };

  const setCurrency = (c: string) => {
    setCurrencyState(c);
    updateFirebase({ currency: c });
  };

  const setPrayersByDate = (p: Record<string, Prayer[]>) => {
    setPrayersByDateState(p);
    localStorage.setItem("bh_prayers_by_date", JSON.stringify(p));
    updateFirebase({ prayersByDate: p });
  };
  
  const setTasks = (t: Task[]) => {
    setTasksState(t);
    localStorage.setItem("bh_tasks", JSON.stringify(t));
    updateFirebase({ tasks: t });
  };
  
  const setPantryItems = (items: PantryItem[]) => {
    setPantryItemsState(items);
    updateFirebase({ pantryItems: items });
  };

  const setWorkoutsByDate = (workouts: Record<string, Workout[]>) => {
    setWorkoutsByDateState(workouts);
    updateFirebase({ workoutsByDate: workouts });
  };

  const setNutritionByDate = (nutrition: Record<string, NutritionDay>) => {
    setNutritionByDateState(nutrition);
    updateFirebase({ nutritionByDate: nutrition });
  };

  const setCallsByDate = (calls: Record<string, CallLog[]>) => {
    setCallsByDateState(calls);
    updateFirebase({ callsByDate: calls });
  };

  const setVaultRecords = (records: VaultRecord[]) => {
    setVaultRecordsState(records);
    updateFirebase({ vaultRecords: records });
  };

  const setHealthProfiles = (profiles: { husband: HealthProfile; wife: HealthProfile }) => {
    setHealthProfilesState(profiles);
    updateFirebase({ healthProfiles: profiles });
  };

  const setDoctorVisits = (visits: DoctorVisit[]) => {
    setDoctorVisitsState(visits);
    updateFirebase({ doctorVisits: visits });
  };

  const setFinanceTransactions = (transactions: FinanceTransaction[]) => {
    setFinanceTransactionsState(transactions);
    updateFirebase({ financeTransactions: transactions });
  };

  const setLiquidBalances = (balances: LiquidBalances) => {
    setLiquidBalancesState(balances);
    updateFirebase({ liquidBalances: balances });
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
      pendingAnimation, interactionPayload, sendInteraction, clearPendingAnimation,
      hasHusbandPush, hasWifePush,
      reminderTone, setReminderTone,
      madhhab, setMadhhab,
      currency, setCurrency,
      householdPin,
      globalSelectedDate, setGlobalSelectedDate,
      prayersByDate, setPrayersByDate,
      tasks, setTasks,
      pantryItems, setPantryItems,
      workoutsByDate, setWorkoutsByDate,
      nutritionByDate, setNutritionByDate,
      callsByDate, setCallsByDate,
      vaultRecords, setVaultRecords,
      healthProfiles, setHealthProfiles,
      doctorVisits, setDoctorVisits,
      financeTransactions, setFinanceTransactions,
      liquidBalances, setLiquidBalances
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
