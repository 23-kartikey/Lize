import { useEffect, useState } from "react";
import { AppState } from "react-native";

export function useClock(refreshIntervalMs = 15_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const updateTime = () => setNow(new Date());
    const timer = setInterval(updateTime, refreshIntervalMs);

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") updateTime();
    });

    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [refreshIntervalMs]);

  return now;
}
