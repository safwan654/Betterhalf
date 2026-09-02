import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeUserToPush(activeUser: "HUSBAND" | "WIFE", householdPin: string) {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { success: false, reason: "Push notifications are not supported on this device/browser. (Note: On iOS/iPhone, you must tap 'Share' -> 'Add to Home Screen' first!)" };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { success: false, reason: "Notification permission was denied." };
    }

    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    const publicVapidKey = "BIuzEdSjTjc7Jv2TLbkiz76KjuzA71LFh1CtHaMuPJbq624HYqvQN_kf55cgJgecsB_s2pIGQU2j6GEeRyHRMOc";
    const convertedKey = urlBase64ToUint8Array(publicVapidKey);

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey
      });
    }

    // Save subscription object to Firebase
    const subField = activeUser === "HUSBAND" ? "husbandPushSubscription" : "wifePushSubscription";
    const docRef = doc(db, "households", householdPin);
    await setDoc(docRef, { [subField]: subscription.toJSON() }, { merge: true });

    return { success: true };
  } catch (err: any) {
    console.error("Failed to subscribe to push notifications:", err);
    return { success: false, reason: err.message || "Failed to subscribe." };
  }
}
