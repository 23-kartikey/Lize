import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";
import type { DayMarks, HourMark } from "../types/hour";
import { formatHour, HOURS } from "../utils/time";

type Props = {
  currentHour: number;
  dayMarks: DayMarks;
  disabled?: boolean;
  onSelectHour: (hour: number) => void;
};

export default function HourGrid({
  currentHour,
  dayMarks,
  disabled = false,
  onSelectHour,
}: Props) {
  return (
    <>
      <View style={styles.heading}>
        <View>
          <Text style={styles.title}>Your 24 hours</Text>
          <Text style={styles.subtitle}>Tap any box to classify that hour.</Text>
        </View>
        <Text style={styles.count}>24 BOXES</Text>
      </View>

      <View style={styles.grid}>
        {HOURS.map((hour) => {
          const hasPassed = hour < currentHour;
          const isCurrent = hour === currentHour;
          const mark: HourMark | undefined = dayMarks[String(hour)];
          const statusLabel = mark === "wasted"
            ? "WASTED"
            : mark === "not-wasted"
              ? "NOT WASTED"
              : isCurrent
                ? "NOW"
                : hasPassed
                  ? "PASSED"
                  : "UPCOMING";

          return (
            <Pressable
              key={hour}
              disabled={disabled}
              onPress={() => onSelectHour(hour)}
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

              {hasPassed && <View pointerEvents="none" style={styles.crossOut} />}
              {isCurrent && <View style={styles.currentIndicator} />}
            </Pressable>
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
  title: { color: colors.text, fontSize: 17, fontWeight: "700" },
  subtitle: { color: "#85838E", fontSize: 11, marginTop: 5 },
  count: { color: colors.textMuted, fontSize: 9, fontWeight: "700", letterSpacing: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  hourBox: {
    width: "23.3%",
    height: 69,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  hourText: { color: "#DDD9E0", fontSize: 12, fontWeight: "700" },
  hourStatus: { fontSize: 7, fontWeight: "800", letterSpacing: 0.35, marginTop: 7 },
  unmarkedStatus: { color: "#666570" },
  nowStatus: { color: colors.text },
  wastedBox: { backgroundColor: colors.wastedBackground, borderColor: colors.wastedBorder },
  wastedText: { color: colors.wastedText },
  wastedStatus: { color: colors.wastedStatus },
  notWastedBox: { backgroundColor: colors.notWastedBackground, borderColor: colors.notWastedBorder },
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
    backgroundColor: colors.accent,
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
    backgroundColor: colors.accent,
  },
});
