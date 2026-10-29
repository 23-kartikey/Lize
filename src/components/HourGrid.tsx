import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";
import type { DayMarks, HourMark } from "../types/hour";
import type { UsageByHour } from "../types/appUsage";
import { formatUsageDuration } from "../utils/usage";
import { formatHour, HOURS } from "../utils/time";

type Props = {
  dayNotes: Record<string, string>,
  disabled: boolean,
  currentHour: number;
  dayMarks: DayMarks;
  onSelectHour: (hour: number) => void;
  onShowUsage: (hour: number) => void;
  usageByHour: UsageByHour;
  accentColor: string;
};

export default function HourGrid({
  dayNotes,
  disabled,
  currentHour,
  dayMarks,
  onSelectHour,
  onShowUsage,
  usageByHour,
  accentColor,
}: Props) {
  return (
    <>
      <View style={styles.heading}>
        <View>
          <Text style={styles.title}>Your 24 hours</Text>
          <Text style={styles.subtitle}>
            Tap a box to classify the hour. Tap its app below for details.
          </Text>
        </View>

        <Text style={styles.count}>24 BOXES</Text>
      </View>

      <View style={styles.grid}>
        {HOURS.map((hour) => {
          const hasPassed = hour < currentHour;
          const isCurrent = hour === currentHour;

          const mark: HourMark | undefined = dayMarks[String(hour)];
          const topApp = usageByHour[hour]?.[0];

          const statusLabel =
            mark === "wasted"
              ? "WASTED"
              : mark === "not-wasted"
                ? "NOT WASTED"
                : isCurrent
                  ? "NOW"
                  : hasPassed
                    ? "PASSED"
                    : "UPCOMING";

          return (
            <View key={hour} style={styles.hourItem}>
              {/* First action: classify the hour. */}
              <Pressable
                onPress={() => onSelectHour(hour)}
                disabled = {disabled}
                accessibilityRole="button"
                accessibilityLabel={`${formatHour(hour)}, ${statusLabel}. Tap to classify.`}
                style={({ pressed }) => [
                  styles.hourBox,
                  mark === "wasted" && styles.wastedBox,
                  mark === "not-wasted" && styles.notWastedBox,
                  isCurrent && styles.currentBox,
                  pressed && styles.pressedBox,
                ]}
              >
                <Text
                  style={[
                    styles.hourText,
                    hasPassed && styles.passedText,
                    mark === "wasted" && styles.wastedText,
                    mark === "not-wasted" && styles.notWastedText,
                    isCurrent && styles.currentText,
                  ]}
                >
                  {formatHour(hour)}
                </Text>
                {dayNotes[String(hour)] ? (
                  <Text style={styles.notePreview} numberOfLines={2}>
                  {dayNotes[String(hour)]}
                  </Text>
                ) : null}

                <Text
                  numberOfLines={1}
                  style={[
                    styles.hourStatus,
                    mark === "wasted" && styles.wastedStatus,
                    mark === "not-wasted" && styles.notWastedStatus,
                    !mark && styles.unmarkedStatus,
                    isCurrent && !mark && styles.nowStatus,
                  ]}
                >
                  {statusLabel}
                </Text>

                {hasPassed && (
                  <View
                    pointerEvents="none"
                    style={[
                      styles.crossOut,
                      { backgroundColor: accentColor },
                    ]}
                  />
                )}

                {isCurrent && (
                  <View
                    style={[
                      styles.currentIndicator,
                      { backgroundColor: accentColor },
                    ]}
                  />
                )}
              </Pressable>

              {/* Second action: open this hour's app-usage breakdown. */}
              <Pressable
                onPress={() => onShowUsage(hour)}
                accessibilityRole="button"
                accessibilityLabel={
                  topApp
                    ? `App usage for ${formatHour(hour)}. Most used: ${topApp.appName}, ${formatUsageDuration(topApp.totalTimeMs)}. Tap for all apps.`
                    : `View app usage for ${formatHour(hour)}`
                }
                style={({ pressed }) => [
                  styles.usageButton,
                  pressed && styles.usagePressed,
                ]}
              >
                <View
                  style={[
                    styles.appMonogram,
                    {
                      backgroundColor: topApp
                        ? accentColor
                        : colors.border,
                    },
                  ]}
                >
                  <Text style={styles.appMonogramText}>
                    {topApp ? topApp.appName.charAt(0).toUpperCase() : "·"}
                  </Text>
                </View>

                <View style={styles.appInfo}>
                  <Text numberOfLines={1} style={styles.appName}>
                    {topApp ? topApp.appName : "App usage"}
                  </Text>

                  <Text numberOfLines={1} style={styles.appDuration}>
                    {topApp
                      ? formatUsageDuration(topApp.totalTimeMs)
                      : "Tap for details"}
                  </Text>
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  subtitle: {
    color: "#85838E",
    fontSize: 11,
    marginTop: 5,
  },
  count: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  hourItem: {
    width: "23.3%",
    marginBottom: 10,
  },
  hourBox: {
    width: "100%",
    height: 69,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  hourText: {
    color: "#DDD9E0",
    fontSize: 12,
    fontWeight: "700",
  },
  hourStatus: {
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 0.35,
    marginTop: 7,
  },
  unmarkedStatus: { color: "#666570" },
  nowStatus: { color: colors.text },
  wastedBox: {
    backgroundColor: colors.wastedBackground,
    borderColor: colors.wastedBorder,
  },
  wastedText: { color: colors.wastedText },
  wastedStatus: { color: colors.wastedStatus },
  notWastedBox: {
    backgroundColor: colors.notWastedBackground,
    borderColor: colors.notWastedBorder,
  },
  notWastedText: { color: colors.notWastedText },
  notWastedStatus: { color: colors.notWastedStatus },
  currentBox: { borderColor: colors.text, borderWidth: 1.5 },
  currentText: { fontWeight: "900" },
  pressedBox: { opacity: 0.7, transform: [{ scale: 0.97 }] },
  passedText: { textDecorationLine: "line-through", opacity: 0.8 },
  crossOut: {
    position: "absolute",
    height: 2,
    width: "150%",
    left: "-25%",
    top: "50%",
    opacity: 0.9,
    transform: [{ rotate: "-35deg" }],
  },
  currentIndicator: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 5,
    height: 5,
    borderRadius: 3,
  },

  usageButton: {
    height: 29,
    width: "100%",
    marginTop: 4,
    paddingHorizontal: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  usagePressed: { opacity: 0.65 },
  appMonogram: {
    width: 13,
    height: 13,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  appMonogramText: {
    color: colors.background,
    fontSize: 8,
    fontWeight: "900",
  },
  appInfo: { flex: 1, minWidth: 0 },
  appName: {
    color: colors.text,
    fontSize: 7,
    fontWeight: "700",
  },
  appDuration: {
    color: colors.textSecondary,
    fontSize: 6.5,
    marginTop: 2,
  },
  notePreview: {
    color: colors.textMuted,
    fontSize: 9,
    lineHeight: 11,
    textAlign: "center",
    marginTop: 3,
    paddingHorizontal: 3,
  },
});