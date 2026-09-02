import { NextResponse } from "next/server";
import webpush from "web-push";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BIuzEdSjTjc7Jv2TLbkiz76KjuzA71LFh1CtHaMuPJbq624HYqvQN_kf55cgJgecsB_s2pIGQU2j6GEeRyHRMOc";
const PRIVATE_VAPID_KEY = process.env.VAPID_PRIVATE_KEY || "U3VLJLjVIhkMKoLXY_m3uwkJPsBX4KpcWMZYWaYhKJE";

webpush.setVapidDetails(
  "mailto:support@betterhalf.app",
  PUBLIC_VAPID_KEY,
  PRIVATE_VAPID_KEY
);

export async function POST(request: Request) {
  try {
    const { householdPin, targetUser, title, body, icon, url } = await request.json();

    if (!householdPin || !targetUser) {
      return NextResponse.json({ error: "Missing householdPin or targetUser" }, { status: 400 });
    }

    const docRef = doc(db, "households", householdPin);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return NextResponse.json({ error: "Household not found" }, { status: 404 });
    }

    const data = snap.data();
    const subField = targetUser === "HUSBAND" ? "husbandPushSubscription" : "wifePushSubscription";
    const subscription = data[subField];

    if (!subscription) {
      return NextResponse.json({ message: "No push subscription found for target user" }, { status: 200 });
    }

    const payload = JSON.stringify({
      title: title || "BetterHalf",
      body: body || "You have a new update",
      icon: icon || "/icon-192.png",
      url: url || "/"
    });

    await webpush.sendNotification(subscription, payload);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending push notification:", error);
    return NextResponse.json({ error: error.message || "Failed to send notification" }, { status: 500 });
  }
}
