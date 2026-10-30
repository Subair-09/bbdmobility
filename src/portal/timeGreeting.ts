import { useState, useEffect } from 'react';

export type TimeOfDayGreeting = 'Good morning' | 'Good afternoon' | 'Good evening';

/**
 * Returns the current hour (0-23) in Nigerian Time (Africa/Lagos, West Africa Time UTC+1).
 */
export function getNigerianHour(date: Date = new Date()): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Lagos',
      hour: 'numeric',
      hour12: false,
    });
    const hourStr = formatter.format(date);
    const parsed = parseInt(hourStr, 10);
    return isNaN(parsed) ? (date.getUTCHours() + 1) % 24 : parsed % 24;
  } catch {
    // Nigeria is strictly UTC+1 all year round (WAT, no DST)
    return (date.getUTCHours() + 1) % 24;
  }
}

/**
 * Computes greeting based strictly on Nigerian Time (WAT, UTC+1):
 * - 00:00 to 11:59: "Good morning"
 * - 12:00 to 16:59: "Good afternoon"
 * - 17:00 to 23:59: "Good evening"
 */
export function getNigerianGreeting(date: Date = new Date()): TimeOfDayGreeting {
  const hour = getNigerianHour(date);
  if (hour < 12) {
    return 'Good morning';
  } else if (hour < 17) {
    return 'Good afternoon';
  } else {
    return 'Good evening';
  }
}

/**
 * Formats current Nigerian time (e.g. "3:45 PM")
 */
export function getNigerianTimeFormatted(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-NG', {
      timeZone: 'Africa/Lagos',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    const d = new Date(date.getTime() + (date.getTimezoneOffset() + 60) * 60000);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
}

/**
 * React hook that returns dynamic Nigerian greeting, auto-updating every 30 seconds.
 */
export function useNigerianGreeting() {
  const [data, setData] = useState(() => ({
    greeting: getNigerianGreeting(),
    timeFormatted: getNigerianTimeFormatted(),
    hour: getNigerianHour(),
  }));

  useEffect(() => {
    const tick = () => {
      setData({
        greeting: getNigerianGreeting(),
        timeFormatted: getNigerianTimeFormatted(),
        hour: getNigerianHour(),
      });
    };

    const timer = setInterval(tick, 30000);
    return () => clearInterval(timer);
  }, []);

  return data;
}
