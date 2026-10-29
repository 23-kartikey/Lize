import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import {
  getInstalledApps,
  getUsageEvents,
  hasUsageStatsPermission,
  requestUsageStatsPermission,
} from "expo-android-usagestats";
import type { AppInfo, UsageEvent } from "expo-android-usagestats";
import type { HourAppUsage, UsageByHour } from "../types/appUsage.ts";

const DAY_MS = 24 * 60 * 60 * 1000;

// This matches the Android package name from your successful build.
const OWN_PACKAGE_NAME = "com.anonymous.lize";

function buildHourlyUsage(
  events: UsageEvent[],
  appNames: Map<string, string>,
  dayStart: number,
  now: number,
): UsageByHour {
  const totals: Partial<Record<number, Map<string, number>>> = {};
  const activeStarts = new Map<string, number>();

  function addInterval(
    packageName: string,
    intervalStart: number,
    intervalEnd: number,
  ) {
    let cursor = Math.max(intervalStart, dayStart);
    const end = Math.min(intervalEnd, now);

    if (end <= cursor) return;

    // Split a foreground session at every local hour boundary.
    while (cursor < end) {
      const hourDate = new Date(cursor);
      const hour = hourDate.getHours();

      const nextHour = new Date(cursor);
      nextHour.setMinutes(0, 0, 0);
      nextHour.setHours(nextHour.getHours() + 1);

      const segmentEnd = Math.min(end, nextHour.getTime());
      if (segmentEnd <= cursor) break;

      if (!totals[hour]) totals[hour] = new Map<string, number>();

      const hourTotals = totals[hour]!;
      hourTotals.set(
        packageName,
        (hourTotals.get(packageName) ?? 0) + segmentEnd - cursor,
      );

      cursor = segmentEnd;
    }
  }

  const sortedEvents = [...events].sort(
    (a, b) => a.timeStamp - b.timeStamp,
  );

  for (const event of sortedEvents) {
    const packageName = event.packageName;

    // Show the apps used by the person, not Lize itself.
    if (
      !packageName ||
      packageName === OWN_PACKAGE_NAME ||
      packageName === "android" ||
      packageName.startsWith("com.android.systemui") ||
      !appNames.has(packageName)
    ) {
      continue;
    }

    // 1 = activity resumed / moved to foreground.
    if (event.eventType === 1) {
      const previousStart = activeStarts.get(packageName);

      // Close any previous session for this app before starting another.
      if (
        previousStart !== undefined &&
        event.timeStamp >= previousStart
      ) {
        addInterval(packageName, previousStart, event.timeStamp);
      }

      activeStarts.set(packageName, event.timeStamp);
    }

    // 2 = activity paused / moved to background.
    // 23 = activity stopped on Android.
    else if (event.eventType === 2 || event.eventType === 23) {
      const start = activeStarts.get(packageName);

      if (start !== undefined && event.timeStamp >= start) {
        addInterval(packageName, start, event.timeStamp);
      }

      activeStarts.delete(packageName);
    }
  }

  // Count the currently foregrounded app up to the present moment.
  for (const [packageName, start] of activeStarts) {
    addInterval(packageName, start, now);
  }

  const result: UsageByHour = {};

  for (let hour = 0; hour < 24; hour++) {
    const hourTotals = totals[hour];
    if (!hourTotals) continue;

    const apps: HourAppUsage[] = [];

    for (const [packageName, totalTimeMs] of hourTotals) {
      if (totalTimeMs <= 0) continue;

      apps.push({
        packageName,
        appName: appNames.get(packageName) ?? packageName,
        totalTimeMs,
      });
    }

    apps.sort((a, b) => b.totalTimeMs - a.totalTimeMs);

    if (apps.length > 0) {
      result[hour] = apps;
    }
  }

  return result;
}

export function useAppUsage() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usageByHour, setUsageByHour] = useState<UsageByHour>({});
  const [error, setError] = useState<string | null>(null);

  const appNamesRef = useRef<Map<string, string>>(new Map());
  const appsLoadedRef = useRef(false);
  const refreshingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (Platform.OS !== "android") {
      setPermissionChecked(true);
      setPermissionGranted(false);
      setUsageByHour({});
      setLoading(false);
      return;
    }

    // Avoid overlapping native queries.
    if (refreshingRef.current) return;

    refreshingRef.current = true;
    setLoading(true);

    try {
      const granted = await hasUsageStatsPermission();

      setPermissionGranted(granted);
      setPermissionChecked(true);

      if (!granted) {
        setUsageByHour({});
        setError(null);
        return;
      }

      if (!appsLoadedRef.current) {
        const apps: AppInfo[] = await getInstalledApps();

        appNamesRef.current = new Map(
          apps
            .filter((app) => app.packageName && app.appName)
            .map((app) => [app.packageName, app.appName]),
        );

        appsLoadedRef.current = true;
      }

      const now = Date.now();

      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);
      const dayStart = startOfToday.getTime();

      // Look back one day so an app that was already in the foreground
      // near midnight can still contribute to today's first hour.
      const events = await getUsageEvents(dayStart - DAY_MS, now);

      const hourlyUsage = buildHourlyUsage(
        events,
        appNamesRef.current,
        dayStart,
        now,
      );

      setUsageByHour(hourlyUsage);
      setError(null);
    } catch (e) {
      console.warn("Lize could not read Android app usage:", e);
      setError(
        "Couldn't read app usage. Check Lize's Usage Access permission and try again.",
      );
    } finally {
      refreshingRef.current = false;
      setLoading(false);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (Platform.OS !== "android") return;

    try {
      await requestUsageStatsPermission();
      // Android opens Settings. refresh runs when Lize becomes active again.
    } catch (e) {
      console.warn("Lize could not open Usage Access settings:", e);
      setError("Lize couldn't open Usage Access settings.");
    }
  }, []);

  useEffect(() => {
    void refresh();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void refresh();
      }
    });

    return () => subscription.remove();
  }, [refresh]);

  // Refresh current-hour usage while Lize remains open.
  useEffect(() => {
    if (!permissionGranted) return;

    const interval = setInterval(() => {
      if (AppState.currentState === "active") {
        void refresh();
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, [permissionGranted, refresh]);

  return {
    permissionGranted,
    permissionChecked,
    loading,
    usageByHour,
    error,
    refresh,
    requestPermission,
  };
}