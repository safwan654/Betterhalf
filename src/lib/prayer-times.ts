import { Coordinates, CalculationMethod, PrayerTimes, Madhab, CalculationParameters } from "adhan";

export interface UserLocation {
  city: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string; // IANA e.g. 'Asia/Dubai', 'Asia/Kolkata'
  method: string;   // 'Dubai' | 'MuslimWorldLeague' | 'ISNA' | 'UmmAlQura' | 'Karachi' | 'Egyptian'
}

export const CITY_PRESETS: Record<string, UserLocation> = {
  "Dubai, UAE": {
    city: "Dubai",
    country: "UAE",
    lat: 25.2048,
    lng: 55.2708,
    timezone: "Asia/Dubai",
    method: "Dubai"
  },
  "Abu Dhabi, UAE": {
    city: "Abu Dhabi",
    country: "UAE",
    lat: 24.4539,
    lng: 54.3773,
    timezone: "Asia/Dubai",
    method: "Dubai"
  },
  "Mumbai, India": {
    city: "Mumbai",
    country: "India",
    lat: 19.0760,
    lng: 72.8777,
    timezone: "Asia/Kolkata",
    method: "Karachi"
  },
  "Delhi, India": {
    city: "Delhi",
    country: "India",
    lat: 28.6139,
    lng: 77.2090,
    timezone: "Asia/Kolkata",
    method: "Karachi"
  },
  "Bengaluru, India": {
    city: "Bengaluru",
    country: "India",
    lat: 12.9716,
    lng: 77.5946,
    timezone: "Asia/Kolkata",
    method: "Karachi"
  },
  "Hyderabad, India": {
    city: "Hyderabad",
    country: "India",
    lat: 17.3850,
    lng: 78.4867,
    timezone: "Asia/Kolkata",
    method: "Karachi"
  },
  "Kozhikode (Calicut), India": {
    city: "Kozhikode",
    country: "India",
    lat: 11.2588,
    lng: 75.7804,
    timezone: "Asia/Kolkata",
    method: "MuslimWorldLeague"
  },
  "Kochi, India": {
    city: "Kochi",
    country: "India",
    lat: 9.9312,
    lng: 76.2673,
    timezone: "Asia/Kolkata",
    method: "MuslimWorldLeague"
  },
  "Riyadh, Saudi Arabia": {
    city: "Riyadh",
    country: "Saudi Arabia",
    lat: 24.7136,
    lng: 46.6753,
    timezone: "Asia/Riyadh",
    method: "UmmAlQura"
  },
  "Makkah, Saudi Arabia": {
    city: "Makkah",
    country: "Saudi Arabia",
    lat: 21.3891,
    lng: 39.8579,
    timezone: "Asia/Riyadh",
    method: "UmmAlQura"
  },
  "Madinah, Saudi Arabia": {
    city: "Madinah",
    country: "Saudi Arabia",
    lat: 24.5247,
    lng: 39.5692,
    timezone: "Asia/Riyadh",
    method: "UmmAlQura"
  },
  "Doha, Qatar": {
    city: "Doha",
    country: "Qatar",
    lat: 25.2854,
    lng: 51.5310,
    timezone: "Asia/Qatar",
    method: "Qatar"
  },
  "Muscat, Oman": {
    city: "Muscat",
    country: "Oman",
    lat: 23.5880,
    lng: 58.3829,
    timezone: "Asia/Muscat",
    method: "MuslimWorldLeague"
  },
  "Kuwait City, Kuwait": {
    city: "Kuwait City",
    country: "Kuwait",
    lat: 29.3759,
    lng: 47.9774,
    timezone: "Asia/Kuwait",
    method: "Kuwait"
  },
  "Cairo, Egypt": {
    city: "Cairo",
    country: "Egypt",
    lat: 30.0444,
    lng: 31.2357,
    timezone: "Africa/Cairo",
    method: "Egyptian"
  },
  "Karachi, Pakistan": {
    city: "Karachi",
    country: "Pakistan",
    lat: 24.8607,
    lng: 67.0011,
    timezone: "Asia/Karachi",
    method: "Karachi"
  },
  "Dhaka, Bangladesh": {
    city: "Dhaka",
    country: "Bangladesh",
    lat: 23.8103,
    lng: 90.4125,
    timezone: "Asia/Dhaka",
    method: "Karachi"
  },
  "London, UK": {
    city: "London",
    country: "UK",
    lat: 51.5074,
    lng: -0.1278,
    timezone: "Europe/London",
    method: "MuslimWorldLeague"
  },
  "New York, USA": {
    city: "New York",
    country: "USA",
    lat: 40.7128,
    lng: -74.0060,
    timezone: "America/New_York",
    method: "ISNA"
  },
  "Toronto, Canada": {
    city: "Toronto",
    country: "Canada",
    lat: 43.6532,
    lng: -79.3832,
    timezone: "America/Toronto",
    method: "ISNA"
  },
  "Kuala Lumpur, Malaysia": {
    city: "Kuala Lumpur",
    country: "Malaysia",
    lat: 3.1390,
    lng: 101.6869,
    timezone: "Asia/Kuala_Lumpur",
    method: "MuslimWorldLeague"
  },
  "Jakarta, Indonesia": {
    city: "Jakarta",
    country: "Indonesia",
    lat: -6.2088,
    lng: 106.8456,
    timezone: "Asia/Jakarta",
    method: "MuslimWorldLeague"
  },
  "Sydney, Australia": {
    city: "Sydney",
    country: "Australia",
    lat: -33.8688,
    lng: 151.2093,
    timezone: "Australia/Sydney",
    method: "MuslimWorldLeague"
  }
};

export function getCalculationParameters(methodName: string): CalculationParameters {
  switch (methodName) {
    case "Dubai":
      return CalculationMethod.Dubai();
    case "UmmAlQura":
      return CalculationMethod.UmmAlQura();
    case "Karachi":
      return CalculationMethod.Karachi();
    case "Egyptian":
      return CalculationMethod.Egyptian();
    case "ISNA":
      return CalculationMethod.NorthAmerica();
    case "Qatar":
      return CalculationMethod.Qatar();
    case "Kuwait":
      return CalculationMethod.Kuwait();
    case "MuslimWorldLeague":
    default:
      return CalculationMethod.MuslimWorldLeague();
  }
}

export function formatTimeWithTZ(date: Date, timezone: string, includeTZName: boolean = true): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZoneName: includeTZName ? "short" : undefined
    });
    return formatter.format(date);
  } catch (err) {
    // Fallback if timezone invalid
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

export function getTimezoneAbbr(date: Date, timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "short"
    });
    const parts = formatter.formatToParts(date);
    return parts.find(p => p.type === "timeZoneName")?.value || "";
  } catch (err) {
    return "";
  }
}

export interface FormattedPrayerDay {
  fajr: { timeStr: string; date: Date };
  sunrise: { timeStr: string; date: Date };
  dhuhr: { timeStr: string; date: Date };
  asr: { timeStr: string; date: Date };
  maghrib: { timeStr: string; date: Date };
  isha: { timeStr: string; date: Date };
  midnight: { timeStr: string; date: Date };
  tzAbbr: string;
}

export function calculatePrayerTimes(
  location: UserLocation,
  date: Date = new Date(),
  madhab: "STANDARD" | "HANAFI" = "STANDARD"
): FormattedPrayerDay {
  const coordinates = new Coordinates(location.lat, location.lng);
  const params = getCalculationParameters(location.method || "MuslimWorldLeague");
  params.madhab = madhab === "HANAFI" ? Madhab.Hanafi : Madhab.Shafi;

  const pt = new PrayerTimes(coordinates, date, params);

  const tz = location.timezone || "UTC";
  const tzAbbr = getTimezoneAbbr(date, tz);

  // Calculate Isha preferred window cutoff (halfway between Maghrib and next Fajr)
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextPt = new PrayerTimes(coordinates, nextDay, params);
  const midnightMs = (pt.maghrib.getTime() + nextPt.fajr.getTime()) / 2;
  const midnightDate = new Date(midnightMs);

  return {
    fajr: { timeStr: formatTimeWithTZ(pt.fajr, tz, false), date: pt.fajr },
    sunrise: { timeStr: formatTimeWithTZ(pt.sunrise, tz, false), date: pt.sunrise },
    dhuhr: { timeStr: formatTimeWithTZ(pt.dhuhr, tz, false), date: pt.dhuhr },
    asr: { timeStr: formatTimeWithTZ(pt.asr, tz, false), date: pt.asr },
    maghrib: { timeStr: formatTimeWithTZ(pt.maghrib, tz, false), date: pt.maghrib },
    isha: { timeStr: formatTimeWithTZ(pt.isha, tz, false), date: pt.isha },
    midnight: { timeStr: formatTimeWithTZ(midnightDate, tz, false), date: midnightDate },
    tzAbbr
  };
}

export function checkMakruhWindow(
  prayerDay: FormattedPrayerDay,
  now: Date = new Date()
): { isMakruh: boolean; reason?: string } {
  const nowMs = now.getTime();

  // 1. Sunrise to +15 mins
  const sunriseMs = prayerDay.sunrise.date.getTime();
  if (nowMs >= sunriseMs && nowMs <= sunriseMs + 15 * 60 * 1000) {
    return { isMakruh: true, reason: "Sunrise window (Makruh Tahrimi — prayer prohibited until sun fully rises)" };
  }

  // 2. Solar noon / Zawal (10 mins before Dhuhr)
  const dhuhrMs = prayerDay.dhuhr.date.getTime();
  if (nowMs >= dhuhrMs - 12 * 60 * 1000 && nowMs < dhuhrMs) {
    return { isMakruh: true, reason: "Zenith / Zawal (Makruh — sun at peak before Dhuhr)" };
  }

  // 3. Sunset / Gurub (15 mins before Maghrib until Maghrib)
  const maghribMs = prayerDay.maghrib.date.getTime();
  if (nowMs >= maghribMs - 15 * 60 * 1000 && nowMs < maghribMs) {
    return { isMakruh: true, reason: "Sunset window (Makruh — sun setting before Maghrib)" };
  }

  return { isMakruh: false };
}
