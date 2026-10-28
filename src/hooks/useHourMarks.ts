import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { HourMark, SavedMarks } from "../types/hour";

const STORAGE_KEY = "lize-hour-marks-v1";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isHourMark(value: unknown): value is HourMark {
  return value === "wasted" || value === "not-wasted";
}

function parseSavedMarks(value: unknown): SavedMarks {
  if (!isObject(value)) return {};

  const result: SavedMarks = {};

  for (const [dayKey, rawDayMarks] of Object.entries(value)) {
    if (!isObject(rawDayMarks)) continue;

    const dayMarks: Record<string, HourMark> = {};
    for (const [hourKey, mark] of Object.entries(rawDayMarks)) {
      const hour = Number(hourKey);
      if (Number.isInteger(hour) && hour >= 0 && hour < 24 && isHourMark(mark)) {
        dayMarks[String(hour)] = mark;
      }
    }

    result[dayKey] = dayMarks;
  }

  return result;
}

export function useHourMarks() {
  const [marksByDay, setMarksByDay] = useState<SavedMarks>({});
  const [storageReady, setStorageReady] = useState(false);
  // Keep user edits made before the initial AsyncStorage read completes.
  const pendingChangesRef = useRef<Record<string, Record<string, HourMark | null>>>({});

  useEffect(() => {
    let isMounted = true;

    async function loadMarks() {
      let loadedMarks: SavedMarks = {};

      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          loadedMarks = parseSavedMarks(JSON.parse(stored) as unknown);
        }
      } catch (error) {
        console.warn("Lize could not load saved hour marks:", error);
      }

      if (isMounted) {
        // Merge early taps on hour boxes over the stored data so loading
        // cannot overwrite a classification made immediately after launch.
        for (const [dayKey, pendingDay] of Object.entries(pendingChangesRef.current)) {
          const mergedDay = { ...(loadedMarks[dayKey] ?? {}) };

          for (const [hourKey, mark] of Object.entries(pendingDay)) {
            if (mark === null) {
              delete mergedDay[hourKey];
            } else {
              mergedDay[hourKey] = mark;
            }
          }

          loadedMarks[dayKey] = mergedDay;
        }
        pendingChangesRef.current = {};

        setMarksByDay(loadedMarks);
        setStorageReady(true);
      }
    }

    void loadMarks();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!storageReady) return;

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(marksByDay)).catch((error) => {
      console.warn("Lize could not save hour marks:", error);
    });
  }, [marksByDay, storageReady]);

  const setHourMark = useCallback(
    (dayKey: string, hour: number, mark: HourMark | null) => {
      if (!storageReady) {
        const pendingDay = pendingChangesRef.current[dayKey] ?? {};
        pendingChangesRef.current[dayKey] = {
          ...pendingDay,
          [String(hour)]: mark,
        };
      }

      setMarksByDay((previous) => {
        const updatedDay = { ...(previous[dayKey] ?? {}) };
        const hourKey = String(hour);

        if (mark === null) {
          delete updatedDay[hourKey];
        } else {
          updatedDay[hourKey] = mark;
        }

        return { ...previous, [dayKey]: updatedDay };
      });
    },
    [storageReady]
  );

  return { marksByDay, storageReady, setHourMark };
}
