"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [householdPin, setHouseholdPin] = useState<string | null>(null);
  const [activeUser, setActiveUserState] = useState<"HUSBAND" | "WIFE">("HUSBAND");
  const [relationshipMode, setRelationshipModeState] = useState<"TOGETHER" | "DISTANCE">("TOGETHER");
  const [husbandTimezone, setHusbandTimezoneState] = useState("America/New_York");
  const [wifeTimezone, setWifeTimezoneState] = useState("Asia/Dubai");
  
  const [husbandName, setHusbandNameState] = useState("Husband");
  const [wifeName, setWifeNameState] = useState("Wife");
  const [husbandPhoto, setHusbandPhotoState] = useState<string | null>(null);
  const [wifePhoto, setWifePhotoState] = useState<string | null>(null);

  const [pendingAnimation, setPendingAnimationState] = useState<"HUG" | "KISS" | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const auth = localStorage.getItem("bh_auth") === "true";
    const pin = localStorage.getItem("bh_household_pin");
    const user = localStorage.getItem("bh_user") as "HUSBAND" | "WIFE";
    const mode = localStorage.getItem("bh_mode") as "TOGETHER" | "DISTANCE";
    const hTz = localStorage.getItem("bh_hTz");
    const wTz = localStorage.getItem("bh_wTz");
    const hName = localStorage.getItem("bh_hName");
    const wName = localStorage.getItem("bh_wName");
    const hPhoto = localStorage.getItem("bh_hPhoto");
    const wPhoto = localStorage.getItem("bh_wPhoto");
    const anim = localStorage.getItem("bh_pending_anim") as "HUG" | "KISS" | null;

    if (auth) setIsAuthenticated(true);
    if (pin) setHouseholdPin(pin);
    if (user) setActiveUserState(user);
    if (mode) setRelationshipModeState(mode);
    if (hTz) setHusbandTimezoneState(hTz);
    if (wTz) setWifeTimezoneState(wTz);
    
    if (hName) setHusbandNameState(hName);
    if (wName) setWifeNameState(wName);
    if (hPhoto) setHusbandPhotoState(hPhoto);
    if (wPhoto) setWifePhotoState(wPhoto);

    if (anim) setPendingAnimationState(anim);
  }, []);

  const login = (pin: string, user: "HUSBAND" | "WIFE") => {
    // Modified to accept ANY 4+ character PIN to conceptually "Create" or "Join" a household
    if (pin.length >= 4) { 
      setIsAuthenticated(true);
      setActiveUserState(user);
      setHouseholdPin(pin);
      localStorage.setItem("bh_auth", "true");
      localStorage.setItem("bh_user", user);
      localStorage.setItem("bh_household_pin", pin);
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

  const setRelationshipMode = (mode: "TOGETHER" | "DISTANCE") => {
    setRelationshipModeState(mode);
    localStorage.setItem("bh_mode", mode);
  };

  const setHusbandTimezone = (tz: string) => {
    setHusbandTimezoneState(tz);
    localStorage.setItem("bh_hTz", tz);
  };
  const setWifeTimezone = (tz: string) => {
    setWifeTimezoneState(tz);
    localStorage.setItem("bh_wTz", tz);
  };

  const setHusbandName = (name: string) => {
    setHusbandNameState(name);
    localStorage.setItem("bh_hName", name);
  };
  const setWifeName = (name: string) => {
    setWifeNameState(name);
    localStorage.setItem("bh_wName", name);
  };

  const setHusbandPhoto = (photo: string | null) => {
    setHusbandPhotoState(photo);
    if (photo) localStorage.setItem("bh_hPhoto", photo);
    else localStorage.removeItem("bh_hPhoto");
  };
  const setWifePhoto = (photo: string | null) => {
    setWifePhotoState(photo);
    if (photo) localStorage.setItem("bh_wPhoto", photo);
    else localStorage.removeItem("bh_wPhoto");
  };

  const setPendingAnimation = (anim: "HUG" | "KISS" | null) => {
    setPendingAnimationState(anim);
    if (anim) localStorage.setItem("bh_pending_anim", anim);
    else localStorage.removeItem("bh_pending_anim");
  };

  if (!isMounted) return null; // Prevent SSR hydration mismatch

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
      householdPin
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
