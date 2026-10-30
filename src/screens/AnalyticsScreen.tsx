
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getInstalledApps,
  getUsageStats,
  hasUsageStatsPermission,
  requestUsageStatsPermission,
} from "expo-android-usagestats";
import { colors } from "../constants/theme";
import { formatUsageDuration } from "../utils/usage";

const CACHE_KEY = "lize-analytics-history-v1";
const OWN_PACKAGE = "com.anonymous.lize";

type UsageRow = {
  packageName: string;
  appName: string;
  totalTimeMs: number;
};

type CachedDay = {
  rows: UsageRow[];
  savedAt: number;
};

type HistoryCache = Record<string, CachedDay>;

function dayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDayBounds(date: Date) {
  const start = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const end = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1,
  );

  return {
    start: start.getTime(),
    end: end.getTime(),
  };
}

function readCacheSafely(): Promise<HistoryCache> {
  return AsyncStorage.getItem(CACHE_KEY).then((raw) => {
    if (!raw) return {};

    try {
      return JSON.parse(raw) as HistoryCache;
    } catch {
      return {};
    }
  }).catch(() => ({}));
}

type Props = {
  accentColor: string;
  onBack: () => void;
};

export default function AnalyticsScreen({ accentColor, onBack }: Props) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const [rows, setRows] = useState<UsageRow[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usingCache, setUsingCache] = useState(false);
  const [noSystemData, setNoSystemData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestId = useRef(0);
  const appNames = useRef<Map<string, string>>(new Map());

  const selectedKey = dayKey(selectedDate);
  const todayKey = dayKey(new Date());
  const isToday = selectedKey === todayKey;

  const totalUsageMs = rows.reduce(
    (sum, row) => sum + row.totalTimeMs,
    0,
  );

  const loadDay = useCallback(async () => {
    const id = ++requestId.current;
    const key = dayKey(selectedDate);

    setLoading(true);
    setError(null);
    setNoSystemData(false);
    setUsingCache(false);

    try {
      const cache = await readCacheSafely();
      const cachedDay = cache[key];

      // Show saved data immediately while checking Android for fresh data.
      if (cachedDay) {
        setRows(cachedDay.rows);
        setUsingCache(true);
      } else {
        setRows([]);
      }

      if (Platform.OS !== "android") {
        setPermissionChecked(true);
        setPermissionGranted(false);
        setError("App usage analytics requires Android.");
        return;
      }

      const granted = await hasUsageStatsPermission();
      if (id !== requestId.current) return;

      setPermissionGranted(granted);
      setPermissionChecked(true);

      if (!granted) return;

      const { start, end } = getDayBounds(selectedDate);
      const stats = await getUsageStats(start, end);

      if (id !== requestId.current) return;

      if (!appNames.current.size) {
        const installedApps = await getInstalledApps();

        appNames.current = new Map(
          installedApps
            .filter((app) => app.packageName && app.appName)
            .map((app) => [app.packageName, app.appName]),
        );
      }

      if (id !== requestId.current) return;

      const byPackage = new Map<string, number>();

      for (const stat of stats) {
        if (!stat.packageName || stat.packageName === OWN_PACKAGE) {
          continue;
        }

        const duration = Number(stat.totalTimeInForeground ?? 0);

        if (!Number.isFinite(duration) || duration <= 0) continue;

        byPackage.set(
          stat.packageName,
          (byPackage.get(stat.packageName) ?? 0) + duration,
        );
      }

      const freshRows: UsageRow[] = [...byPackage.entries()]
        .map(([packageName, totalTimeMs]) => ({
          packageName,
          appName: appNames.current.get(packageName) ?? packageName,
          totalTimeMs,
        }))
        .sort((a, b) => b.totalTimeMs - a.totalTimeMs);

      if (stats.length > 0) {
        // Store successful day queries so viewed dates remain available
        // even if Android later stops returning that day's statistics.
        setRows(freshRows);
        setUsingCache(false);

        cache[key] = {
          rows: freshRows,
          savedAt: Date.now(),
        };

        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      } else if (cachedDay) {
        setRows(cachedDay.rows);
        setUsingCache(true);
        setNoSystemData(true);
      } else {
        setRows([]);
        setNoSystemData(true);
      }
    } catch (e) {
      console.warn("Lize analytics query failed:", e);

      const cache = await readCacheSafely();
      const cachedDay = cache[key];

      if (id !== requestId.current) return;

      if (cachedDay) {
        setRows(cachedDay.rows);
        setUsingCache(true);
      } else {
        setError("Unable to retrieve app usage for this date.");
      }
    } finally {
      if (id === requestId.current) {
        setLoading(false);
      }
    }
  }, [selectedDate]);

  useEffect(() => {
    void loadDay();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void loadDay();
    });

    return () => {
      requestId.current++;
      subscription.remove();
    };
  }, [loadDay]);

  function changeDay(offset: number) {
    setSelectedDate((previous) => {
      const next = new Date(previous);
      next.setDate(next.getDate() + offset);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (next > today) return previous;
      return next;
    });
  }

  async function enableAccess() {
    try {
      await requestUsageStatsPermission();
    } catch (e) {
      console.warn("Could not open Usage Access settings:", e);
      setError("Couldn't open Usage Access settings.");
    }
  }

  const dateLabel = selectedDate.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const maxUsage = rows[0]?.totalTimeMs ?? 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backText, { color: accentColor }]}>
            ← Back to your day
          </Text>
        </Pressable>

        <Text style={styles.eyebrow}>YOUR DIGITAL HABITS</Text>
        <Text style={styles.title}>App analytics</Text>
        <Text style={styles.subtitle}>
          See where your time went, one day at a time.
        </Text>

        <View style={styles.dateSelector}>
          <Pressable
            onPress={() => changeDay(-1)}
            style={styles.dateArrow}
            accessibilityLabel="Previous day"
          >
            <Text style={styles.arrowText}>‹</Text>
          </Pressable>

          <View style={styles.dateCenter}>
            <Text style={styles.dateText}>{dateLabel}</Text>
            <Text style={styles.dateSubtext}>
              {isToday ? "TODAY" : selectedKey}
            </Text>
          </View>

          <Pressable
            onPress={() => changeDay(1)}
            disabled={isToday}
            style={[styles.dateArrow, isToday && styles.disabledArrow]}
            accessibilityLabel="Next day"
          >
            <Text style={styles.arrowText}>›</Text>
          </Pressable>
        </View>

        {!permissionChecked && loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={accentColor} />
            <Text style={styles.stateText}>Checking Usage Access…</Text>
          </View>
        ) : !permissionGranted ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Usage Access required</Text>
            <Text style={styles.stateText}>
              Allow Lize to read Android app-usage statistics to display
              usage durations for this and previous days.
            </Text>
            <Pressable
              onPress={() => void enableAccess()}
              style={[styles.primaryButton, { backgroundColor: accentColor }]}
            >
              <Text style={styles.primaryButtonText}>
                Enable Usage Access
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.cardLabel}>COMBINED FOREGROUND USAGE</Text>
              <Text style={styles.totalTime}>
                {formatUsageDuration(totalUsageMs)}
              </Text>
              <Text style={styles.summaryCaption}>
                Across {rows.length} {rows.length === 1 ? "app" : "apps"}
              </Text>
            </View>

            <View style={styles.listHeading}>
              <Text style={styles.sectionTitle}>Apps by usage</Text>
              <Text style={styles.sectionMeta}>
                {loading ? "UPDATING" : "LONGEST FIRST"}
              </Text>
            </View>

            {error ? (
              <View style={styles.stateCard}>
                <Text style={styles.stateText}>{error}</Text>
                <Pressable onPress={() => void loadDay()}>
                  <Text style={[styles.retryText, { color: accentColor }]}>
                    Try again
                  </Text>
                </Pressable>
              </View>
            ) : rows.length > 0 ? (
              rows.map((row, index) => {
                const percentage = maxUsage
                  ? Math.round((row.totalTimeMs / maxUsage) * 100)
                  : 0;

                return (
                  <View key={row.packageName} style={styles.appCard}>
                    <View style={styles.appRow}>
                      <View
                        style={[
                          styles.appRank,
                          index === 0 && { backgroundColor: accentColor },
                        ]}
                      >
                        <Text
                          style={[
                            styles.rankText,
                            index === 0 && { color: colors.background },
                          ]}
                        >
                          {index + 1}
                        </Text>
                      </View>

                      <View style={styles.appInfo}>
                        <Text numberOfLines={1} style={styles.appName}>
                          {row.appName}
                        </Text>
                        <Text style={styles.appPackage} numberOfLines={1}>
                          {row.packageName}
                        </Text>
                      </View>

                      <Text style={styles.appDuration}>
                        {formatUsageDuration(row.totalTimeMs)}
                      </Text>
                    </View>

                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${percentage}%`,
                            backgroundColor: accentColor,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.stateCard}>
                <Text style={styles.stateTitle}>
                  {noSystemData
                    ? "No usage data returned"
                    : "No app usage recorded"}
                </Text>
                <Text style={styles.stateText}>
                  {noSystemData
                    ? "Android returned no usage records for this date. This doesn't necessarily mean no apps were used; older data may no longer be available."
                    : "No foreground usage was reported for this date."}
                </Text>
                {loading && <ActivityIndicator color={accentColor} />}
              </View>
            )}

            {usingCache && (
              <Text style={styles.cacheNotice}>
                Showing a previously saved result for this date.
                {noSystemData ? " Android did not return fresh records." : ""}
              </Text>
            )}

            <Text style={styles.footer}>
              Usage data is read from Android and cached locally on this
              device. Total foreground time can differ from Digital
              Wellbeing, particularly if apps overlap or the device reports
              incomplete statistics.
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 22, paddingBottom: 40 },
  backButton: { alignSelf: "flex-start", marginBottom: 24 },
  backText: { fontSize: 12, fontWeight: "800" },
  eyebrow: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  title: {
    color: colors.text,
    fontSize: 29,
    fontWeight: "900",
    marginTop: 7,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
    marginBottom: 22,
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 9,
    marginBottom: 17,
  },
  dateArrow: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledArrow: { opacity: 0.3 },
  arrowText: { color: colors.text, fontSize: 29, lineHeight: 32 },
  dateCenter: { flex: 1, alignItems: "center" },
  dateText: { color: colors.text, fontSize: 13, fontWeight: "800" },
  dateSubtext: {
    color: colors.textMuted,
    fontSize: 9,
    letterSpacing: 1,
    marginTop: 5,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    marginBottom: 26,
  },
  cardLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  totalTime: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "900",
    marginTop: 11,
  },
  summaryCaption: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 5,
  },
  listHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "800" },
  sectionMeta: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  appCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 13,
    marginBottom: 9,
  },
  appRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  appRank: {
    width: 27,
    height: 27,
    borderRadius: 8,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: { color: colors.textSecondary, fontSize: 11, fontWeight: "900" },
  appInfo: { flex: 1, minWidth: 0 },
  appName: { color: colors.text, fontSize: 12, fontWeight: "800" },
  appPackage: { color: colors.textMuted, fontSize: 8, marginTop: 3 },
  appDuration: { color: colors.text, fontSize: 12, fontWeight: "800" },
  barTrack: {
    height: 4,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginTop: 12,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 3 },
  stateCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 17,
    marginTop: 12,
  },
  stateTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  stateText: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 8,
  },
  centerState: { alignItems: "center", padding: 30 },
  primaryButton: {
    borderRadius: 9,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    marginTop: 15,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 11,
    fontWeight: "900",
  },
  retryText: { fontSize: 12, fontWeight: "800", marginTop: 15 },
  cacheNotice: {
    color: colors.textSecondary,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 12,
  },
  footer: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 17,
    marginTop: 25,
  },
});
