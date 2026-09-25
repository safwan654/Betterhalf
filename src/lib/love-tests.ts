export type TestCategory = "SPICY" | "ROMANTIC" | "DEEP" | "QUIRKS" | "SPIRITUAL";

export interface LoveTestQuestion {
  id: string;
  question: string;
  emoji: string;
  category: TestCategory;
  options: string[];
  wifeDefaultAnswer?: string;
  husbandDefaultAnswer?: string;
}

export interface LoveTest {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  category: TestCategory;
  bannerGradient: string;
  badgeColor: string;
  questions: LoveTestQuestion[];
}

export interface TestAnswerEntry {
  questionId: string;
  husbandAnswer?: string;
  wifeAnswer?: string;
  husbandTimestamp?: number;
  wifeTimestamp?: number;
}

export interface DiscussionMessage {
  id: string;
  sender: "HUSBAND" | "WIFE";
  senderName: string;
  text: string;
  timestamp: number;
  isSpicy?: boolean;
  reaction?: string;
}

export interface LoveTestDataState {
  testId: string;
  answers: Record<string, TestAnswerEntry>;
  discussions: DiscussionMessage[];
}

export const LOVE_TESTS: LoveTest[] = [
  {
    id: "view_of_love",
    title: "View of Love",
    subtitle: "Discover how we cherish romance, gestures & feelings",
    icon: "💖",
    category: "ROMANTIC",
    bannerGradient: "from-rose-400 via-pink-400 to-amber-300",
    badgeColor: "bg-rose-50 text-rose-600 border-rose-200",
    questions: [
      {
        id: "vol_1",
        question: "Who's more romantic? 💗",
        emoji: "💗",
        category: "ROMANTIC",
        options: [
          "Both. Being romantic is about making each other feel loved & cherished every day. ✨",
          "Husband is the master of romantic gestures 🤴",
          "Wife brings all the magic and sweetness 👸",
          "It changes day by day depending on who spoils who! 🥰"
        ],
        wifeDefaultAnswer: "Both. Being romantic isn't about gifts or surprises. It's about making someone feel loved, appreciated, and cared for every day.",
        husbandDefaultAnswer: "Both. Love shows up in the little things we do for each other. That's what makes a relationship special."
      },
      {
        id: "vol_2",
        question: "What is the sweetest gesture your partner did that melted you? 🥺",
        emoji: "✨",
        category: "ROMANTIC",
        options: [
          "Remembering a tiny detail I mentioned months ago 🧠",
          "A random forehead kiss and warm embrace when I was stressed 🤍",
          "Surprising me with my favorite snack/drink out of nowhere ☕",
          "Looking into my eyes and saying 'I am so lucky to have you' 🥺"
        ],
        wifeDefaultAnswer: "A random forehead kiss and warm embrace when I was stressed 🤍",
        husbandDefaultAnswer: "Looking into my eyes and saying 'I am so lucky to have you' 🥺"
      },
      {
        id: "vol_3",
        question: "What's our ultimate couple love language?",
        emoji: "💌",
        category: "ROMANTIC",
        options: [
          "Quality Time together without phones ⏳",
          "Physical Touch, long cuddles & holding hands 🫂",
          "Words of Affirmation & sweet praise 💬",
          "Acts of Service & looking after each other 🍵"
        ],
        wifeDefaultAnswer: "Physical Touch, long cuddles & holding hands 🫂",
        husbandDefaultAnswer: "Physical Touch, long cuddles & holding hands 🫂"
      },
      {
        id: "vol_4",
        question: "When we are apart, what makes you miss me the most? ✈️",
        emoji: "🕊️",
        category: "ROMANTIC",
        options: [
          "The cozy warmth of going to sleep beside each other 🌙",
          "Our spontaneous laughter and funny inside jokes 😂",
          "Morning coffee and seeing your sleepy smile ☕",
          "Everything... silence feels too quiet without you 🤍"
        ],
        wifeDefaultAnswer: "The cozy warmth of going to sleep beside each other 🌙",
        husbandDefaultAnswer: "Everything... silence feels too quiet without you 🤍"
      }
    ]
  },
  {
    id: "spicy_midnight",
    title: "Spicy & Midnight Chemistry 🔥",
    subtitle: "Flirty desires, butterflies & intimate confessions",
    icon: "🔥",
    category: "SPICY",
    bannerGradient: "from-red-500 via-rose-500 to-amber-500",
    badgeColor: "bg-red-50 text-red-600 border-red-200",
    questions: [
      {
        id: "spicy_1",
        question: "What little touch or whisper instantly gives you butterflies / chills? 🦋🔥",
        emoji: "🦋",
        category: "SPICY",
        options: [
          "A slow whisper in the ear from behind 🤫",
          "Hands running through hair or touching the waist 🔥",
          "A lingering neck kiss that doesn't rush 💋",
          "Intense eye contact before a slow kiss ✨"
        ],
        wifeDefaultAnswer: "A lingering neck kiss that doesn't rush 💋",
        husbandDefaultAnswer: "A slow whisper in the ear from behind 🤫"
      },
      {
        id: "spicy_2",
        question: "What's your ideal romantic midnight mood vibe? 🕯️🍷",
        emoji: "🌙",
        category: "SPICY",
        options: [
          "Dim candlelights, soft jazz, and slow playful teasing all night 🕯️",
          "Spontaneous passion the second the door closes 🔥",
          "A warm bubble bath together followed by a soothing massage 🫧",
          "Late night cuddles turning into unforgettable intimacy 🛌"
        ],
        wifeDefaultAnswer: "A warm bubble bath together followed by a soothing massage 🫧",
        husbandDefaultAnswer: "Dim candlelights, soft jazz, and slow playful teasing all night 🕯️"
      },
      {
        id: "spicy_3",
        question: "Which look or outfit on your partner drives you crazy? 😈",
        emoji: "👗",
        category: "SPICY",
        options: [
          "Fresh out of the shower with messy hair & glowing skin ✨",
          "Dressed up fancy in that stunning elegant outfit 👠",
          "Oversized t-shirt/hoodie lounging around cozily 🧸",
          "That special secret silk nightwear just for us 🔥"
        ],
        wifeDefaultAnswer: "Fresh out of the shower with messy hair & glowing skin ✨",
        husbandDefaultAnswer: "That special secret silk nightwear just for us 🔥"
      },
      {
        id: "spicy_4",
        question: "A flirty dare for tonight or our next reunion date: 💋",
        emoji: "🎲",
        category: "SPICY",
        options: [
          "A 5-minute continuous hug and kiss without speaking a word 🫂",
          "Husband gives wife a 20-minute full body massage 💆‍♀️",
          "Whisper 3 unfiltered secrets you find attractive about each other 🤫",
          "Re-enact our most romantic kiss ever 🔥"
        ],
        wifeDefaultAnswer: "Husband gives wife a 20-minute full body massage 💆‍♀️",
        husbandDefaultAnswer: "A 5-minute continuous hug and kiss without speaking a word 🫂"
      }
    ]
  },
  {
    id: "deep_soul",
    title: "Soulmate Connection & Safe Space 🧠",
    subtitle: "Unspoken feelings, emotional depth & growing together",
    icon: "🤍",
    category: "DEEP",
    bannerGradient: "from-indigo-400 via-purple-400 to-pink-300",
    badgeColor: "bg-indigo-50 text-indigo-600 border-indigo-200",
    questions: [
      {
        id: "deep_1",
        question: "What makes you feel the most emotionally safe with each other? 🛡️",
        emoji: "🤍",
        category: "DEEP",
        options: [
          "Knowing I can be 100% vulnerable without fear of judgment 🌿",
          "How patiently we listen when things get overwhelming 👂",
          "Never going to sleep angry without resolving our hearts 🌙",
          "Holding hands during difficult conversations 🤝"
        ],
        wifeDefaultAnswer: "Knowing I can be 100% vulnerable without fear of judgment 🌿",
        husbandDefaultAnswer: "Knowing I can be 100% vulnerable without fear of judgment 🌿"
      },
      {
        id: "deep_2",
        question: "If you could freeze one moment from our relationship in time, which would it be?",
        emoji: "⏳",
        category: "DEEP",
        options: [
          "Our wedding day and the first time our eyes locked as one 💍",
          "That late night drive under the stars talking about our future 🌌",
          "The first time we hugged after being apart ✈️",
          "A simple quiet morning having breakfast together at home 🏡"
        ],
        wifeDefaultAnswer: "The first time we hugged after being apart ✈️",
        husbandDefaultAnswer: "That late night drive under the stars talking about our future 🌌"
      }
    ]
  },
  {
    id: "couple_quirks",
    title: "Couple Quirks & Daily Wars 😂",
    subtitle: "Playful truths, stubborn moments & funny habits",
    icon: "🤪",
    category: "QUIRKS",
    bannerGradient: "from-amber-400 via-orange-400 to-rose-400",
    badgeColor: "bg-amber-50 text-amber-600 border-amber-200",
    questions: [
      {
        id: "cq_1",
        question: "Who is the boss of what to watch on TV / Netflix? 📺",
        emoji: "🍿",
        category: "QUIRKS",
        options: [
          "Wife picks, husband falls asleep 10 minutes in 😴",
          "Husband spends 45 minutes scrolling through trailers 😅",
          "We debate for an hour and end up rewatching our comfort show 🎬",
          "50/50 fair turns! ⚖️"
        ],
        wifeDefaultAnswer: "Wife picks, husband falls asleep 10 minutes in 😴",
        husbandDefaultAnswer: "Wife picks, husband falls asleep 10 minutes in 😴"
      },
      {
        id: "cq_2",
        question: "Who takes longer to get ready to leave the house? ⏰",
        emoji: "👗",
        category: "QUIRKS",
        options: [
          "Wife (choosing outfits, styling, perfect touches) 👸",
          "Husband (spent 20 minutes finding keys/wallet at the door) 🤦‍♂️",
          "Both of us are ready at the exact same minute ✨",
          "We are perpetually 10 minutes 'on the way' 😂"
        ],
        wifeDefaultAnswer: "Husband (spent 20 minutes finding keys/wallet at the door) 🤦‍♂️",
        husbandDefaultAnswer: "Wife (choosing outfits, styling, perfect touches) 👸"
      }
    ]
  }
];

export const INITIAL_TEST_DATA: Record<string, LoveTestDataState> = {
  view_of_love: {
    testId: "view_of_love",
    answers: {
      vol_1: {
        questionId: "vol_1",
        wifeAnswer: "Both. Being romantic isn't about gifts or surprises. It's about making someone feel loved, appreciated, and cared for every day.",
        husbandAnswer: "Both. Love shows up in the little things we do for each other. That's what makes a relationship special.",
        wifeTimestamp: 1790294400000,
        husbandTimestamp: 1790294500000
      },
      vol_2: {
        questionId: "vol_2",
        wifeAnswer: "A random forehead kiss and warm embrace when I was stressed 🤍",
        husbandAnswer: "Looking into my eyes and saying 'I am so lucky to have you' 🥺",
        wifeTimestamp: 1790294600000,
        husbandTimestamp: 1790294700000
      },
      vol_3: {
        questionId: "vol_3",
        wifeAnswer: "Physical Touch, long cuddles & holding hands 🫂",
        husbandAnswer: "Physical Touch, long cuddles & holding hands 🫂",
        wifeTimestamp: 1790294800000,
        husbandTimestamp: 1790294900000
      },
      vol_4: {
        questionId: "vol_4",
        wifeAnswer: "The cozy warmth of going to sleep beside each other 🌙",
        husbandAnswer: "Everything... silence feels too quiet without you 🤍",
        wifeTimestamp: 1790295000000,
        husbandTimestamp: 1790295100000
      }
    },
    discussions: [
      {
        id: "msg_1",
        sender: "WIFE",
        senderName: "Shahna",
        text: "I loved your answer for question 1! You always make me feel so cherished. 🥰",
        timestamp: 1790295200000,
        reaction: "💖"
      },
      {
        id: "msg_2",
        sender: "HUSBAND",
        senderName: "Safwan",
        text: "Seeing how aligned we are on love languages is the best feeling in the world. Forever yours! 🤍",
        timestamp: 1790295300000,
        reaction: "✨"
      }
    ]
  },
  spicy_midnight: {
    testId: "spicy_midnight",
    answers: {
      spicy_1: {
        questionId: "spicy_1",
        wifeAnswer: "A lingering neck kiss that doesn't rush 💋",
        husbandAnswer: "A slow whisper in the ear from behind 🤫",
        wifeTimestamp: 1790296000000,
        husbandTimestamp: 1790296100000
      },
      spicy_2: {
        questionId: "spicy_2",
        wifeAnswer: "A warm bubble bath together followed by a soothing massage 🫧",
        husbandAnswer: "Dim candlelights, soft jazz, and slow playful teasing all night 🕯️",
        wifeTimestamp: 1790296200000,
        husbandTimestamp: 1790296300000
      }
    },
    discussions: [
      {
        id: "msg_s1",
        sender: "WIFE",
        senderName: "Shahna",
        text: "You better prepare that massage next time we are together! 🔥💆‍♀️",
        timestamp: 1790296400000,
        isSpicy: true,
        reaction: "🔥"
      },
      {
        id: "msg_s2",
        sender: "HUSBAND",
        senderName: "Safwan",
        text: "Deal! Get ready for the best pampering of your life. 💋🔥",
        timestamp: 1790296500000,
        isSpicy: true,
        reaction: "💋"
      }
    ]
  }
};

export function calculateTestSimilarity(test: LoveTest, answers: Record<string, TestAnswerEntry>): number {
  const answeredQuestions = test.questions.filter(q => {
    const entry = answers[q.id];
    return entry && entry.wifeAnswer && entry.husbandAnswer;
  });

  if (answeredQuestions.length === 0) return 100; // Default sweet preview

  let matchCount = 0;
  answeredQuestions.forEach(q => {
    const entry = answers[q.id];
    const w = entry.wifeAnswer?.trim().toLowerCase() || "";
    const h = entry.husbandAnswer?.trim().toLowerCase() || "";
    
    // Direct match or partial semantic match
    if (w === h) {
      matchCount += 1;
    } else if (w.slice(0, 15) === h.slice(0, 15) || (w.includes("both") && h.includes("both"))) {
      matchCount += 1;
    } else {
      matchCount += 0.8; // High baseline couple chemistry
    }
  });

  const percentage = Math.round((matchCount / answeredQuestions.length) * 100);
  return Math.min(100, Math.max(75, percentage)); // Warm couple friendly scoring (75-100%)
}
