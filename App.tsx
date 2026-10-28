import { useEffect, useState } from "react";
import {
  AppState,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

export default function HomeScreen() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const updateTime = () => setNow(new Date());

    // Refresh while the app is open.
    const timer = setInterval(updateTime, 15_000);

    // Refresh immediately when returning to the app.
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        updateTime();
      }
    });

    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, []);

  const currentHour = now.getHours();
  const elapsedMinutes = currentHour * 60 + now.getMinutes();
  const remainingMinutes = 24 * 60 - elapsedMinutes;

  const today = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor="#0B0B0D"
        barStyle="light-content"
      />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>YOUR DAY · 24 HOURS</Text>

        <Text style={styles.title}>Time is passing.</Text>

        <Text style={styles.date}>{today}</Text>

        <Text style={styles.subtitle}>
          Every hour is a part of your life.
        </Text>

        {/* Time summary */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>ELAPSED</Text>
            <Text style={styles.statValue}>
              {formatDuration(elapsedMinutes)}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>TIME LEFT</Text>
            <Text style={styles.remainingValue}>
              {formatDuration(remainingMinutes)}
            </Text>
          </View>
        </View>

        {/* 24-hour calendar grid */}
        <View style={styles.gridHeading}>
          <Text style={styles.sectionTitle}>Today, hour by hour</Text>
          <Text style={styles.gridCount}>24 BOXES</Text>
        </View>

        <View style={styles.grid}>
          {HOURS.map((hour) => {
            const hasPassed = hour < currentHour;
            const isCurrent = hour === currentHour;

            return (
              <View
                key={hour}
                accessible
                accessibilityLabel={
                  `${formatHour(hour)}. ${
                    hasPassed
                      ? "Hour completed"
                      : isCurrent
                        ? "Current hour"
                        : "Upcoming hour"
                  }`
                }
                style={[
                  styles.hourBox,
                  hasPassed && styles.passedBox,
                  isCurrent && styles.currentBox,
                ]}
              >
                <Text
                  style={[
                    styles.hourText,
                    hasPassed && styles.passedText,
                    isCurrent && styles.currentText,
                  ]}
                >
                  {formatHour(hour)}
                </Text>

                {isCurrent && (
                  <Text style={styles.nowLabel}>NOW</Text>
                )}

                {hasPassed && (
                  <View
                    pointerEvents="none"
                    style={styles.crossOut}
                  />
                )}
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.passedDot]} />
            <Text style={styles.legendText}>Passed</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.currentDot]} />
            <Text style={styles.legendText}>Now</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.upcomingDot]} />
            <Text style={styles.legendText}>Remaining</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          The grid follows your phone's clock and resets every midnight.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B0B0D",
  },
  container: {
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 36,
  },
  eyebrow: {
    color: "#F16A60",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    color: "#F4F1EA",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
  },
  date: {
    color: "#B9B7C0",
    fontSize: 15,
    marginTop: 10,
  },
  subtitle: {
    color: "#777780",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28,
    marginBottom: 32,
  },
  statCard: {
    width: "48%",
    minHeight: 92,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#29292F",
    backgroundColor: "#17171B",
    justifyContent: "center",
  },
  statLabel: {
    color: "#8A8993",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 9,
  },
  statValue: {
    color: "#F4F1EA",
    fontSize: 23,
    fontWeight: "700",
  },
  remainingValue: {
    color: "#F16A60",
    fontSize: 23,
    fontWeight: "700",
  },
  gridHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    color: "#F4F1EA",
    fontSize: 17,
    fontWeight: "700",
  },
  gridCount: {
    color: "#797883",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  hourBox: {
    width: "23.5%",
    height: 62,
    marginBottom: 10,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#29292F",
    backgroundColor: "#151518",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  hourText: {
    color: "#C5C3CC",
    fontSize: 13,
    fontWeight: "600",
  },
  passedBox: {
    backgroundColor: "#191719",
    borderColor: "#302426",
  },
  passedText: {
    color: "#777078",
    textDecorationLine: "line-through",
  },
  crossOut: {
    position: "absolute",
    height: 2,
    width: "150%",
    left: "-25%",
    top: "50%",
    backgroundColor: "#F16A60",
    opacity: 0.9,
    transform: [{ rotate: "-35deg" }],
  },
  currentBox: {
    backgroundColor: "#281917",
    borderColor: "#F16A60",
    borderWidth: 1.5,
  },
  currentText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  nowLabel: {
    color: "#F16A60",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 4,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#29292F",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  passedDot: {
    backgroundColor: "#F16A60",
  },
  currentDot: {
    backgroundColor: "#F4F1EA",
  },
  upcomingDot: {
    backgroundColor: "#55545D",
  },
  legendText: {
    color: "#9D9BA6",
    fontSize: 12,
  },
  footer: {
    color: "#686771",
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 14,
  },
});