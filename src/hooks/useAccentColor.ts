import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAccentColor } from "../constants/theme";
import type { AccentId } from "../constants/theme";

const STORAGE_KEY = "lize-accent-color-v1";

function isAccentId(value: unknown): value is AccentId {
  return value === "orange" || value === "pink" || value === "white" || value=== "green";
}

export function useAccentColor() {
  const [accentId, setAccentIdState] = useState<AccentId>("orange");
  const [ready, setReady] = useState(false);
  const pendingChoiceRef = useRef<AccentId | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadAccent() {
      let savedAccent: AccentId = "orange";

      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored !== null && isAccentId(stored)) savedAccent = stored;
      } catch (error) {
        console.warn("Lize could not load the accent color:", error);
      }

      if (!mounted) return;

      // Preserve a tap made before the first storage read completes.
      const initialAccent = pendingChoiceRef.current ?? savedAccent;
      pendingChoiceRef.current = null;
      setAccentIdState(initialAccent);
      setReady(true);
    }

    void loadAccent();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    AsyncStorage.setItem(STORAGE_KEY, accentId).catch((error) => {
      console.warn("Lize could not save the accent color:", error);
    });
  }, [accentId, ready]);

  const setAccentId = useCallback((nextAccent: AccentId) => {
    if (!ready) pendingChoiceRef.current = nextAccent;
    setAccentIdState(nextAccent);
  }, [ready]);

  return {
    accentId,
    accentColor: getAccentColor(accentId),
    setAccentId,
    accentReady: ready,
  };
}
