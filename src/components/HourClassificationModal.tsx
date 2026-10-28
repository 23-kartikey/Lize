import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";
import type { HourMark, SelectedHour } from "../types/hour";
import { formatHourRange } from "../utils/time";

type Props = {
  selectedTarget: SelectedHour;
  selectedMark: HourMark | undefined;
  todayKey: string;
  currentHour: number;
  onClose: () => void;
  onSaveMark: (mark: HourMark | null) => void;
  accentColor: string;
};

export default function HourClassificationModal({
  selectedTarget,
  selectedMark,
  todayKey,
  currentHour,
  onClose,
  onSaveMark,
  accentColor,
}: Props) {
  const hour = selectedTarget?.hour;
  const isToday = selectedTarget?.dayKey === todayKey;

  const description = hour === undefined
    ? "Choose how you want to classify this hour."
    : isToday
      ? hour < currentHour
        ? "This hour has passed. How did you spend it?"
        : hour === currentHour
          ? "This hour is in progress. How are you spending it?"
          : "This hour hasn't started yet. You can mark it now or leave it unclassified."
      : "Choose how you want to classify this hour.";

  return (
    <Modal
      visible={selectedTarget !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close popup"
        />

        <View style={styles.card}>
          <View style={styles.topRow}>
            <Text style={[styles.eyebrow, { color: accentColor }]}>CLASSIFY THIS HOUR</Text>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>

          <Text style={styles.title}>
            {hour !== undefined ? formatHourRange(hour) : ""}
          </Text>
          <Text style={styles.description}>{description}</Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => onSaveMark("wasted")}
            style={({ pressed }) => [
              styles.choiceButton,
              styles.wastedChoice,
              selectedMark === "wasted" && styles.selectedChoice,
              pressed && styles.choicePressed,
            ]}
          >
            <View style={[styles.choiceIcon, styles.wastedChoiceIcon]}>
              <Text style={styles.choiceIconText}>×</Text>
            </View>
            <View style={styles.choiceTextContainer}>
              <Text style={styles.choiceTitle}>Wasted</Text>
              <Text style={styles.choiceDescription}>Time that wasn't well spent</Text>
            </View>
            {selectedMark === "wasted" && <Text style={styles.selectedCheck}>✓</Text>}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => onSaveMark("not-wasted")}
            style={({ pressed }) => [
              styles.choiceButton,
              styles.notWastedChoice,
              selectedMark === "not-wasted" && styles.selectedChoice,
              pressed && styles.choicePressed,
            ]}
          >
            <View style={[styles.choiceIcon, styles.notWastedChoiceIcon]}>
              <Text style={styles.choiceIconText}>✓</Text>
            </View>
            <View style={styles.choiceTextContainer}>
              <Text style={styles.choiceTitle}>Not wasted</Text>
              <Text style={styles.choiceDescription}>Time spent on something worthwhile</Text>
            </View>
            {selectedMark === "not-wasted" && <Text style={styles.selectedCheck}>✓</Text>}
          </Pressable>

          {selectedMark && (
            <Pressable onPress={() => onSaveMark(null)} style={styles.clearButton}>
              <Text style={[styles.clearButtonText, { color: accentColor }]}>Clear classification</Text>
            </Pressable>
          )}

          <Pressable onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.76)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 20,
    padding: 21,
  },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  eyebrow: { color: colors.accent, fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#29292F",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { color: "#D9D5DE", fontSize: 22, lineHeight: 25 },
  title: { color: colors.text, fontSize: 28, fontWeight: "800", letterSpacing: -0.5, marginTop: 17 },
  description: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 8, marginBottom: 22 },
  choiceButton: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 13,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  wastedChoice: { backgroundColor: "#2D191D", borderColor: "#633035" },
  notWastedChoice: { backgroundColor: "#182820", borderColor: "#355744" },
  selectedChoice: { borderWidth: 1.5 },
  choicePressed: { opacity: 0.75 },
  wastedChoiceIcon: { backgroundColor: "#683035" },
  notWastedChoiceIcon: { backgroundColor: "#2D6046" },
  choiceIcon: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  choiceIconText: { color: colors.white, fontSize: 20, fontWeight: "700" },
  choiceTextContainer: { flex: 1, gap: 4 },
  choiceTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  choiceDescription: { color: "#A9A4AF", fontSize: 10, lineHeight: 15 },
  selectedCheck: { color: colors.text, fontSize: 18, fontWeight: "800", marginHorizontal: 4 },
  clearButton: { alignItems: "center", paddingVertical: 13 },
  clearButtonText: { color: colors.accent, fontSize: 12, fontWeight: "700" },
  cancelButton: { alignItems: "center", paddingVertical: 12, marginTop: 2 },
  cancelButtonText: { color: "#A9A6B1", fontWeight: "700", fontSize: 13 },
});
