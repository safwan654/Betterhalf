export interface CoupleQuestion {
  id: string;
  category: "Romantic" | "Fun" | "Deep" | "Daily Life" | "Spiritual";
  question: string;
  emoji: string;
  options?: string[]; // Quick choice options or open text
}

export const COUPLE_QUESTIONS: CoupleQuestion[] = [
  {
    id: "q_romantic_1",
    category: "Romantic",
    question: "Who fell in love first?",
    emoji: "💖",
    options: ["Husband 🙋‍♂️", "Wife 🙋‍♀️", "At the exact same moment ✨", "It was gradual & sweet 🌿"]
  },
  {
    id: "q_romantic_2",
    category: "Romantic",
    question: "What was your favorite memory together this past month?",
    emoji: "✨",
    options: ["Late night deep talks 🌙", "Going out for delicious food 🍽️", "Praying and making Dua together 🤲", "Laughing at funny moments 😂"]
  },
  {
    id: "q_fun_1",
    category: "Fun",
    question: "Who is more dramatic when they have a cold?",
    emoji: "🤧",
    options: ["Definitely Husband 🙋‍♂️", "Definitely Wife 🙋‍♀️", "Both of us equally 😅", "Neither, we are tough 💪"]
  },
  {
    id: "q_fun_2",
    category: "Fun",
    question: "If we could teleport to a vacation spot right now, where are we going?",
    emoji: "✈️",
    options: ["Cozy mountain cabin in the snow 🏔️", "Sunny tropical beach 🏖️", "Umrah in Makkah & Madinah 🕋", "Historic European city stroll 🏛️"]
  },
  {
    id: "q_deep_1",
    category: "Deep",
    question: "What is one little thing your partner does that always makes you feel loved?",
    emoji: "💌",
    options: ["Making warm tea/coffee ☕", "A sudden forehead kiss or hug 🤍", "Remembering small details 🧠", "Listening attentively when I speak 👂"]
  },
  {
    id: "q_spiritual_1",
    category: "Spiritual",
    question: "What is our biggest shared spiritual goal for this year?",
    emoji: "🤲",
    options: ["Memorizing more Quran together 📖", "Never missing Fajr on time ⏰", "Planning Hajj / Umrah together 🕋", "Giving regular secret charity 🤍"]
  },
  {
    id: "q_daily_1",
    category: "Daily Life",
    question: "Who usually decides what we're having for dinner?",
    emoji: "🍳",
    options: ["Wife decides 👩‍🍳", "Husband decides 👨‍🍳", "It takes 30 minutes of 'I don't know, you choose' 😅", "We cook together 🥘"]
  },
  {
    id: "q_romantic_3",
    category: "Romantic",
    question: "What's our couple love language?",
    emoji: "💞",
    options: ["Quality Time together ⏳", "Words of Affirmation 💬", "Physical Touch & Hugs 🫂", "Acts of Service 🍵"]
  }
];

export function getTodayCoupleQuestion(): CoupleQuestion {
  // Rotate smoothly based on days since epoch
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return COUPLE_QUESTIONS[dayIndex % COUPLE_QUESTIONS.length];
}
