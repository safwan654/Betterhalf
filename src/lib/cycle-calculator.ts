import { 
  parseISO, 
  differenceInDays, 
  addDays, 
  format, 
  isSameDay, 
  isBefore, 
  isAfter, 
  startOfDay 
} from "date-fns";

export type CyclePhase = 
  | "MENSTRUAL" 
  | "FOLLICULAR" 
  | "FERTILE_WINDOW" 
  | "OVULATION_DAY" 
  | "LUTEAL" 
  | "LATE_LUTEAL"
  | "UNKNOWN";

export type FertilityChance = "PEAK" | "HIGH" | "MEDIUM" | "LOW" | "NONE";

export interface CyclePhaseInfo {
  phase: CyclePhase;
  phaseTitle: string;
  phaseSubtitle: string;
  fertilityChance: FertilityChance;
  fertilityBadge: string;
  cycleDay: number;
  totalCycleDays: number;
  ovulationDate: Date;
  ovulationDateStr: string;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  fertileWindowStr: string;
  nextPeriodDate: Date;
  nextPeriodDateStr: string;
  daysUntilOvulation: number;
  daysUntilNextPeriod: number;
  tips: {
    physical: string;
    nutrition: string;
    spiritual: string;
  };
  husbandAdvice: string;
}

export function calculateCyclePhases({
  startDateStr,
  periodActive = false,
  cycleLength = 28,
  periodDuration = 5,
  lutealLength = 14,
  currentDate = new Date()
}: {
  startDateStr?: string | null;
  periodActive?: boolean;
  cycleLength?: number;
  periodDuration?: number;
  lutealLength?: number;
  currentDate?: Date;
}): CyclePhaseInfo | null {
  if (!startDateStr) return null;

  try {
    const rawStart = parseISO(startDateStr);
    const startDate = startOfDay(rawStart);
    const today = startOfDay(currentDate);

    // Days since cycle start (1-indexed)
    const rawDiff = differenceInDays(today, startDate);
    const cycleDay = Math.max(1, rawDiff + 1);

    // Ovulation occurs approximately (cycleLength - lutealLength) days after start
    const ovulationOffset = Math.max(1, cycleLength - lutealLength);
    const ovulationDate = addDays(startDate, ovulationOffset);
    const ovulationDateStr = format(ovulationDate, "yyyy-MM-dd");

    // Fertile window: 5 days before ovulation up to ovulation day (6 days total)
    const fertileWindowStart = addDays(ovulationDate, -5);
    const fertileWindowEnd = ovulationDate;
    const fertileWindowStr = `${format(fertileWindowStart, "MMM d")} – ${format(fertileWindowEnd, "MMM d")}`;

    // Next period estimation
    const nextPeriodDate = addDays(startDate, cycleLength);
    const nextPeriodDateStr = format(nextPeriodDate, "yyyy-MM-dd");

    const daysUntilOvulation = differenceInDays(ovulationDate, today);
    const daysUntilNextPeriod = differenceInDays(nextPeriodDate, today);

    // Determine current phase & fertility chance
    let phase: CyclePhase = "UNKNOWN";
    let fertilityChance: FertilityChance = "LOW";
    let phaseTitle = "Cycle Day " + cycleDay;
    let phaseSubtitle = "Tracking menstrual and hormonal rhythm";

    if (periodActive || (cycleDay <= periodDuration && !isAfter(today, addDays(startDate, periodDuration)))) {
      phase = "MENSTRUAL";
      fertilityChance = "LOW";
      phaseTitle = "🌸 Menstrual Phase";
      phaseSubtitle = `Day ${cycleDay} · Prayer Exemption (رخصة)`;
    } else if (isSameDay(today, ovulationDate)) {
      phase = "OVULATION_DAY";
      fertilityChance = "PEAK";
      phaseTitle = "🌟 Ovulation Day (Peak)";
      phaseSubtitle = "Egg released · Highest chance of conception";
    } else if (
      (isAfter(today, fertileWindowStart) || isSameDay(today, fertileWindowStart)) &&
      (isBefore(today, fertileWindowEnd) || isSameDay(today, fertileWindowEnd))
    ) {
      phase = "FERTILE_WINDOW";
      fertilityChance = "HIGH";
      const dayOfWindow = differenceInDays(today, fertileWindowStart) + 1;
      phaseTitle = "✨ Fertile Window";
      phaseSubtitle = `Day ${dayOfWindow} of 6 · High chance of conception`;
    } else if (isBefore(today, fertileWindowStart)) {
      phase = "FOLLICULAR";
      fertilityChance = differenceInDays(fertileWindowStart, today) <= 2 ? "MEDIUM" : "LOW";
      phaseTitle = "🌿 Follicular Phase";
      phaseSubtitle = "Estrogen rising · Energy & vitality building";
    } else if (isBefore(today, nextPeriodDate)) {
      phase = "LUTEAL";
      fertilityChance = "LOW";
      phaseTitle = "🌙 Luteal Phase";
      phaseSubtitle = "Progesterone dominant · Rest & nourishment";
    } else {
      phase = "LATE_LUTEAL";
      fertilityChance = "LOW";
      phaseTitle = "⏳ Pre-Period Window";
      phaseSubtitle = `Day ${cycleDay} of ${cycleLength} · Awaiting next cycle`;
    }

    // Fertility badge text
    const fertilityBadges: Record<FertilityChance, string> = {
      PEAK: "🔥 Peak Fertility",
      HIGH: "✨ High Chance",
      MEDIUM: "🌱 Moderate Chance",
      LOW: "⚪ Low Chance",
      NONE: "⚪ Minimal"
    };

    // Contextual health & spiritual tips
    const tipsByPhase: Record<CyclePhase, { physical: string; nutrition: string; spiritual: string }> = {
      MENSTRUAL: {
        physical: "Gentle stretching, warm baths, restorative sleep.",
        nutrition: "Warm herbal teas (ginger, chamomile), iron-rich foods & dark chocolate.",
        spiritual: "Rukhsah (Exemption) active. Increase Dhikr, Istighfar & Quran listening."
      },
      FOLLICULAR: {
        physical: "High stamina — ideal for strength workouts, cardio & high-energy tasks.",
        nutrition: "Fermented foods, leafy greens, lean proteins & fresh citrus.",
        spiritual: "Clean window (Taharah) — focus on Khushu in Salah and voluntary prayers."
      },
      FERTILE_WINDOW: {
        physical: "Peak vitality, elevated mood, and natural energy boost.",
        nutrition: "Antioxidant-rich berries, avocados, leafy greens & optimal hydration.",
        spiritual: "Duas for righteous family (رَبِّ هَبْ لِي مِن لَّدُنكَ ذُرِّيَّةً طَيِّبَةً)."
      },
      OVULATION_DAY: {
        physical: "Peak hormonal balance; highest natural confidence and energy.",
        nutrition: "Folate, zinc-rich seeds (pumpkin/sunflower), and plenty of fresh water.",
        spiritual: "Blessed opportunity for marital connection and righteous intention (Niyyah)."
      },
      LUTEAL: {
        physical: "Moderate intensity exercise, yoga, magnesium for muscle relaxation.",
        nutrition: "Complex carbs (sweet potatoes, oats), magnesium & warming soups.",
        spiritual: "Nourishing Salah routine, evening Adhkar and calm spiritual reflection."
      },
      LATE_LUTEAL: {
        physical: "Gentle walks, warm heating pads on standby, restorative rest.",
        nutrition: "Limit excess sodium and caffeine; stay well-hydrated.",
        spiritual: "Constant remembrance and gratitude for the body's natural blessing."
      },
      UNKNOWN: {
        physical: "Regular daily movement & restorative sleep.",
        nutrition: "Balanced whole foods and adequate water intake.",
        spiritual: "Consistent daily prayers and morning/evening remembrance."
      }
    };

    // Husband guidance
    const husbandAdviceByPhase: Record<CyclePhase, string> = {
      MENSTRUAL: "She may feel cramps and fatigue. Offer warmth, tea, back rubs, and take care of dinner 🤍",
      FOLLICULAR: "Her energy is high! Great time to plan outdoor dates, activities, and meaningful projects together ✨",
      FERTILE_WINDOW: "Fertile window active — highest intimacy harmony and ideal window for family planning 🌸",
      OVULATION_DAY: "Peak ovulation today! She is glowing — express your love, admiration, and closeness 💖",
      LUTEAL: "Progesterone is high; she might appreciate extra gentleness, emotional reassurance, and favorite comfort snacks 🍵",
      LATE_LUTEAL: "Cycle approaching soon — be extra patient, attentive, and supportive of her comfort 🕊️",
      UNKNOWN: "Keep her supported, hydrated, and loved throughout her wellness journey ✨"
    };

    return {
      phase,
      phaseTitle,
      phaseSubtitle,
      fertilityChance,
      fertilityBadge: fertilityBadges[fertilityChance],
      cycleDay,
      totalCycleDays: cycleLength,
      ovulationDate,
      ovulationDateStr,
      fertileWindowStart,
      fertileWindowEnd,
      fertileWindowStr,
      nextPeriodDate,
      nextPeriodDateStr,
      daysUntilOvulation,
      daysUntilNextPeriod,
      tips: tipsByPhase[phase],
      husbandAdvice: husbandAdviceByPhase[phase]
    };
  } catch (error) {
    console.error("Cycle calculation error:", error);
    return null;
  }
}
