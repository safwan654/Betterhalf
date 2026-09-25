export type MoodType =
  | "IN_LOVE"      // 🥰
  | "SPICY"        // 🔥
  | "PLAYFUL"      // 😉
  | "COZY"         // ☕
  | "HAPPY"        // 😄
  | "EMOTIONAL"    // 🥺
  | "TIRED"        // 😴
  | "CHILL"        // 😎
  | "MISCHIEVOUS"  // 😈
  | "GRATEFUL";    // 🤍

export interface MoodConfig {
  id: MoodType;
  label: string;
  emoji: string;
  avatarWifeEmoji: string;
  avatarHusbandEmoji: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export const MOOD_CONFIGS: Record<MoodType, MoodConfig> = {
  IN_LOVE: {
    id: "IN_LOVE",
    label: "In Love & Smitten",
    emoji: "🥰",
    avatarWifeEmoji: "👧💖",
    avatarHusbandEmoji: "👦💖",
    color: "from-rose-400 to-pink-500",
    bgColor: "bg-rose-50 border-rose-200",
    textColor: "text-rose-600",
  },
  SPICY: {
    id: "SPICY",
    label: "Spicy & Flirty",
    emoji: "🔥",
    avatarWifeEmoji: "👧🔥",
    avatarHusbandEmoji: "👦🔥",
    color: "from-red-500 to-amber-500",
    bgColor: "bg-red-50 border-red-200",
    textColor: "text-red-600",
  },
  PLAYFUL: {
    id: "PLAYFUL",
    label: "Playful & Teasing",
    emoji: "😉",
    avatarWifeEmoji: "👧✨",
    avatarHusbandEmoji: "👦✨",
    color: "from-amber-400 to-orange-400",
    bgColor: "bg-amber-50 border-amber-200",
    textColor: "text-amber-600",
  },
  COZY: {
    id: "COZY",
    label: "Cozy & Snuggled",
    emoji: "☕",
    avatarWifeEmoji: "👧☕",
    avatarHusbandEmoji: "👦☕",
    color: "from-stone-400 to-amber-600",
    bgColor: "bg-stone-50 border-stone-200",
    textColor: "text-stone-600",
  },
  HAPPY: {
    id: "HAPPY",
    label: "Happy & Radiant",
    emoji: "😄",
    avatarWifeEmoji: "👧🌸",
    avatarHusbandEmoji: "👦🌿",
    color: "from-emerald-400 to-teal-500",
    bgColor: "bg-emerald-50 border-emerald-200",
    textColor: "text-emerald-600",
  },
  EMOTIONAL: {
    id: "EMOTIONAL",
    label: "Cuddle Needy / Soft",
    emoji: "🥺",
    avatarWifeEmoji: "👧🥺",
    avatarHusbandEmoji: "👦🥺",
    color: "from-indigo-400 to-purple-400",
    bgColor: "bg-indigo-50 border-indigo-200",
    textColor: "text-indigo-600",
  },
  TIRED: {
    id: "TIRED",
    label: "Exhausted & Sleepy",
    emoji: "😴",
    avatarWifeEmoji: "👧💤",
    avatarHusbandEmoji: "👦💤",
    color: "from-blue-400 to-slate-500",
    bgColor: "bg-blue-50 border-blue-200",
    textColor: "text-blue-600",
  },
  CHILL: {
    id: "CHILL",
    label: "Cool & Relaxed",
    emoji: "😎",
    avatarWifeEmoji: "👧🕶️",
    avatarHusbandEmoji: "👦🕶️",
    color: "from-teal-400 to-cyan-500",
    bgColor: "bg-teal-50 border-teal-200",
    textColor: "text-teal-600",
  },
  MISCHIEVOUS: {
    id: "MISCHIEVOUS",
    label: "Mischievous & Cheeky",
    emoji: "😈",
    avatarWifeEmoji: "👧😈",
    avatarHusbandEmoji: "👦😈",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 border-purple-200",
    textColor: "text-purple-600",
  },
  GRATEFUL: {
    id: "GRATEFUL",
    label: "Peaceful & Grateful",
    emoji: "🤍",
    avatarWifeEmoji: "👧🤍",
    avatarHusbandEmoji: "👦🤍",
    color: "from-amber-300 to-rose-300",
    bgColor: "bg-orange-50 border-orange-200",
    textColor: "text-amber-700",
  },
};

export interface SingleJournalEntry {
  mood: MoodType;
  text: string;
  timestamp: number;
  tags?: string[];
  photo?: string;
  spicyScore?: number; // 1-5 scale for spicy moods
}

export interface JournalDayEntry {
  date: string; // yyyy-MM-dd
  wife?: SingleJournalEntry;
  husband?: SingleJournalEntry;
  reactions?: Record<string, string>; // "❤️", "🔥", "💋", "🥺", "💬"
}

// Initial seed entries for current month to create that adorable filled calendar look
export const INITIAL_JOURNAL_ENTRIES: Record<string, JournalDayEntry> = {
  "2026-09-01": {
    date: "2026-09-01",
    wife: { mood: "IN_LOVE", text: "Started September thinking about how blessed I am to have you in my life. Love you forever! 💖", timestamp: 1788220800000, tags: ["#love", "#september"] },
    husband: { mood: "HAPPY", text: "Excited for this month with my queen. Making big plans for us! 🌿", timestamp: 1788224400000, tags: ["#goals"] }
  },
  "2026-09-06": {
    date: "2026-09-06",
    wife: { mood: "PLAYFUL", text: "You looked so handsome today on video call! Can't wait till we hug. ✨", timestamp: 1788652800000, tags: ["#ldr", "#sweet"] },
    husband: { mood: "EMOTIONAL", text: "Missing you extra today, looking at our photos. 🥺", timestamp: 1788656400000 }
  },
  "2026-09-07": {
    date: "2026-09-07",
    wife: { mood: "IN_LOVE", text: "Late night sweet talks make all distance disappear. 🥰", timestamp: 1788739200000 },
    husband: { mood: "CHILL", text: "Night was so calm and peaceful talking to you. 😎", timestamp: 1788742800000 }
  },
  "2026-09-08": {
    date: "2026-09-08",
    wife: { mood: "IN_LOVE", text: "Thinking of that sweet forehead kiss. 🤍", timestamp: 1788825600000 },
    husband: { mood: "SPICY", text: "You drive me crazy even miles away! 🔥", timestamp: 1788829200000, spicyScore: 5 }
  },
  "2026-09-10": {
    date: "2026-09-10",
    wife: { mood: "EMOTIONAL", text: "Tired day today, but hearing your voice recharged me completely. 🥺", timestamp: 1788998400000 },
    husband: { mood: "HAPPY", text: "Made sure she went to sleep smiling. My favorite job. 🌙", timestamp: 1789002000000 }
  },
  "2026-09-15": {
    date: "2026-09-15",
    wife: { mood: "IN_LOVE", text: "Wore the perfume you love today! 🥰", timestamp: 1789430400000 },
    husband: { mood: "SPICY", text: "I wish I was there to hold you tight right now... 🔥", timestamp: 1789434000000, spicyScore: 4 }
  },
  "2026-09-18": {
    date: "2026-09-18",
    wife: { mood: "EMOTIONAL", text: "Need extra warm cuddles today. 🧸", timestamp: 1789689600000 },
    husband: { mood: "COZY", text: "Sending virtual warmth and infinite hugs. ☕", timestamp: 1789693200000 }
  },
  "2026-09-22": {
    date: "2026-09-22",
    wife: { mood: "HAPPY", text: "Cooked our favorite meal and imagined having it across the table with you! 🍲", timestamp: 1790035200000 },
    husband: { mood: "HAPPY", text: "You are the best wife in the whole world! 🤍", timestamp: 1790038800000 }
  },
  "2026-09-25": {
    date: "2026-09-25",
    wife: { mood: "SPICY", text: "Counting every single hour until our next reunion. You have no idea what I have planned! 🔥💋", timestamp: 1790294400000, spicyScore: 5, tags: ["#spicy", "#reunion"] },
    husband: { mood: "IN_LOVE", text: "My heart only beats for you. Today and every single day forever! 🥰", timestamp: 1790298000000, tags: ["#forever"] }
  }
};
