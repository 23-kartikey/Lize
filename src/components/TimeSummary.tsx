import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";
import { formatDateLabel, formatDuration } from "../utils/time";

type Props = {
  now: Date;
  elapsedMinutes: number;
  remainingMinutes: number;
  wastedHours: number;
  classifiedHours: number;
  accentColor: string;
};

export default function TimeSummary({
  now,
  elapsedMinutes,
  remainingMinutes,
  wastedHours,
  classifiedHours,
  accentColor,
}: Props) {
  return (
    <>
      <View style={styles.intro}>
        <Text style={[styles.date, { color: accentColor }]}>{formatDateLabel(now)}</Text>
        <Text style={styles.title}>Time is passing.</Text>
        <Text style={styles.subtitle}>Every hour is a part of your life.</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>TIME ELAPSED</Text>
          <Text style={styles.statValue}>{formatDuration(elapsedMinutes)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>TIME LEFT</Text>
          <Text style={[styles.remainingValue, { color: accentColor }]}>{formatDuration(remainingMinutes)}</Text>
        </View>
      </View>

      <View style={styles.wasteSummary}>
        <View style={styles.wasteSummaryLeft}>
          <Text style={styles.wasteSummaryLabel}>MARKED AS WASTED</Text>
          <Text style={[styles.wasteSummaryValue, { color: accentColor }]}>{formatDuration(wastedHours * 60)}</Text>
        </View>
        <View style={styles.summaryRight}>
          <Text style={styles.summaryCount}>{classifiedHours}/24</Text>
          <Text style={styles.summaryCaption}>classified</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  intro: { marginTop: 25 },
  date: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 31,
    fontWeight: "800",
    letterSpacing: -1,
    marginTop: 10,
  },
  subtitle: { color: "#96949F", fontSize: 14, marginTop: 7 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 26,
    marginBottom: 13,
  },
  statCard: {
    flex: 1,
    minHeight: 90,
    padding: 14,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#2C2C33",
    backgroundColor: colors.surface,
    justifyContent: "center",
  },
  statLabel: {
    color: "#92909A",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 9,
  },
  statValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  remainingValue: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  wasteSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#181517",
    borderWidth: 1,
    borderColor: "#382528",
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 13,
    marginBottom: 30,
  },
  wasteSummaryLeft: { gap: 5 },
  wasteSummaryLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.1,
    color: "#B5A4A5",
  },
  wasteSummaryValue: { color: colors.accent, fontSize: 23, fontWeight: "800" },
  summaryRight: { alignItems: "flex-end" },
  summaryCount: { color: colors.text, fontWeight: "700", fontSize: 16 },
  summaryCaption: { color: "#8E8990", fontSize: 10, marginTop: 3 },
});
