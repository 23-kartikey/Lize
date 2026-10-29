
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors } from "../constants/theme";
import type { HourMark, SelectedHour } from "../types/hour";
import { formatHourRange } from "../utils/time";

type Props = {
  selectedTarget: SelectedHour;
  selectedMark: HourMark | undefined;
  selectedNote: string;
  todayKey: string;
  currentHour: number;
  onClose: () => void;
  onSaveMark: (mark: HourMark | null) => void;
  onSaveNote: (note: string) => void;
  accentColor: string;
};

export default function HourClassificationModal({
  selectedTarget,
  selectedMark,
  selectedNote,
  todayKey,
  currentHour,
  onClose,
  onSaveMark,
  onSaveNote,
  accentColor,
}: Props) {
  const [draftNote, setDraftNote] = useState(selectedNote);

  useEffect(() => {
    setDraftNote(selectedNote);
  }, [selectedTarget?.dayKey, selectedTarget?.hour, selectedNote]);

  const hour = selectedTarget?.hour;
  const isToday = selectedTarget?.dayKey === todayKey;

  const description =
    hour === undefined
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
            <Text style={[styles.eyebrow, { color: accentColor }]}>
              CLASSIFY THIS HOUR
            </Text>

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

          <Text style={styles.noteLabel}>NOTE FOR THIS HOUR</Text>

          <TextInput
            style={styles.noteInput}
            value={draftNote}
            onChangeText={setDraftNote}
            placeholder="What did you do during this hour?"
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={180}
            textAlignVertical="top"
          />

          <View style={styles.noteFooter}>
            <Text style={styles.noteCount}>{draftNote.length}/180</Text>

            <Pressable
              onPress={() => onSaveNote(draftNote)}
              style={({ pressed }) => [
                styles.saveNoteButton,
                { backgroundColor: accentColor },
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.saveNoteText}>Save note</Text>
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => onSaveMark("wasted")}
            style={({ pressed }) => [
              styles.choiceButton,
              styles.wastedChoice,
              selectedMark === "wasted" && styles.selectedChoice,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.choiceIcon, styles.wastedChoiceIcon]}>
              <Text style={styles.choiceIconText}>×</Text>
            </View>

            <View style={styles.choiceTextContainer}>
              <Text style={styles.choiceTitle}>Wasted</Text>
              <Text style={styles.choiceDescription}>
                Time that wasn't well spent
              </Text>
            </View>

            {selectedMark === "wasted" && (
              <Text style={styles.selectedCheck}>✓</Text>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => onSaveMark("not-wasted")}
            style={({ pressed }) => [
              styles.choiceButton,
              styles.notWastedChoice,
              selectedMark === "not-wasted" && styles.selectedChoice,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.choiceIcon, styles.notWastedChoiceIcon]}>
              <Text style={styles.choiceIconText}>✓</Text>
            </View>

            <View style={styles.choiceTextContainer}>
              <Text style={styles.choiceTitle}>Not wasted</Text>
              <Text style={styles.choiceDescription}>
                Time spent on something worthwhile
              </Text>
            </View>

            {selectedMark === "not-wasted" && (
              <Text style={styles.selectedCheck}>✓</Text>
            )}
          </Pressable>

          {selectedMark && (
            <Pressable
              onPress={() => onSaveMark(null)}
              style={styles.clearButton}
            >
              <Text style={[styles.clearButtonText, { color: accentColor }]}>
                Clear classification
              </Text>
            </Pressable>
          )}

          <Pressable onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Close</Text>
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
    padding: 18,
    maxHeight: "90%",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#29292F",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { color: "#D9D5DE", fontSize: 22, lineHeight: 25 },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginTop: 12,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 15,
  },
  noteLabel: {
    color: colors.text,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 7,
  },
  noteInput: {
    minHeight: 66,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    color: colors.text,
    backgroundColor: colors.surface,
    fontSize: 13,
  },
  noteFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 7,
    marginBottom: 15,
  },
  noteCount: { color: colors.textMuted, fontSize: 10 },
  saveNoteButton: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  saveNoteText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  choiceButton: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 13,
    padding: 10,
    marginBottom: 9,
    gap: 12,
  },
  wastedChoice: { backgroundColor: "#2D191D", borderColor: "#633035" },
  notWastedChoice: { backgroundColor: "#182820", borderColor: "#355744" },
  selectedChoice: { borderWidth: 1.5 },
  pressed: { opacity: 0.75 },
  wastedChoiceIcon: { backgroundColor: "#683035" },
  notWastedChoiceIcon: { backgroundColor: "#2D6046" },
  choiceIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceIconText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "700",
  },
  choiceTextContainer: { flex: 1, gap: 4 },
  choiceTitle: { color: colors.text, fontSize: 13, fontWeight: "800" },
  choiceDescription: { color: "#A9A4AF", fontSize: 10, lineHeight: 15 },
  selectedCheck: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginHorizontal: 4,
  },
  clearButton: { alignItems: "center", paddingVertical: 10 },
  clearButtonText: { fontSize: 12, fontWeight: "700" },
  cancelButton: { alignItems: "center", paddingVertical: 8 },
  cancelButtonText: {
    color: "#A9A6B1",
    fontWeight: "700",
    fontSize: 12,
  },
});
