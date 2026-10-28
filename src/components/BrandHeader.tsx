import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { accentOptions, colors } from "../constants/theme";
import type { AccentId } from "../constants/theme";

type Props = {
  accentId: AccentId;
  accentColor: string;
  onSelectAccent: (accentId: AccentId) => void;
};

export default function BrandHeader({ accentId, accentColor, onSelectAccent }: Props) {
  const [pickerVisible, setPickerVisible] = useState(false);

  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={styles.brandIdentity}>
          <View style={styles.wordmarkRow}>
            <Text style={styles.brand}>lize</Text>
            <View style={styles.brandMark} accessibilityElementsHidden>
              <View style={[styles.brandMarkCell, { backgroundColor: accentColor }]} />
              <View style={[styles.brandMarkCell, { backgroundColor: accentColor }]} />
              <View style={[styles.brandMarkCell, { backgroundColor: accentColor }]} />
              <View style={[styles.brandMarkCell, { backgroundColor: accentColor }]} />
            </View>
          </View>
          <Text style={styles.brandSubtitle}>KARTI TIME. KARTWHEEL LIFE.</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change accent color"
          onPress={() => setPickerVisible(true)}
          style={({ pressed }) => [styles.colorButton, pressed && styles.pressed]}
        >
          <View style={[styles.activeSwatch, { backgroundColor: accentColor }]} />
          <Text style={styles.colorButtonText}>COLOR</Text>
        </Pressable>
      </View>

      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setPickerVisible(false)}
            accessibilityLabel="Close color picker"
          />

          <View style={styles.modalCard}>
            <View style={styles.modalTopRow}>
              <View>
                <Text style={styles.modalEyebrow}>PERSONALISE LIZE</Text>
                <Text style={styles.modalTitle}>Accent colour</Text>
              </View>
              <Pressable
                onPress={() => setPickerVisible(false)}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>

            <Text style={styles.modalDescription}>
              Change the accent without changing the app's dark background.
            </Text>

            <View style={styles.options}>
              {accentOptions.map((option) => {
                const selected = option.id === accentId;
                return (
                  <Pressable
                    key={option.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${option.label} accent`}
                    onPress={() => {
                      onSelectAccent(option.id);
                      setPickerVisible(false);
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      selected && styles.selectedOption,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={[styles.optionSwatch, { backgroundColor: option.color }]} />
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    {selected && <Text style={styles.checkmark}>✓</Text>}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 20,
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#25252B",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  brandIdentity: { flex: 1 },
  wordmarkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brand: {
    color: colors.text,
    fontSize: 37,
    lineHeight: 43,
    fontWeight: "900",
    letterSpacing: -2.5,
  },
  brandMark: {
    width: 21,
    height: 21,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
    transform: [{ rotate: "-8deg" }],
  },
  brandMarkCell: { width: 9, height: 9, borderRadius: 3 },
  brandSubtitle: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2.5,
  },
  colorButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  activeSwatch: { width: 11, height: 11, borderRadius: 6 },
  colorButtonText: { color: colors.textSecondary, fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  pressed: { opacity: 0.7 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.76)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 20,
    padding: 21,
  },
  modalTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalEyebrow: { color: colors.textMuted, fontSize: 9, fontWeight: "800", letterSpacing: 1.5 },
  modalTitle: { color: colors.text, fontSize: 24, fontWeight: "800", marginTop: 8 },
  closeButton: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#29292F", alignItems: "center", justifyContent: "center" },
  closeText: { color: colors.text, fontSize: 22, lineHeight: 25 },
  modalDescription: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 9, marginBottom: 17 },
  options: { gap: 9 },
  option: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 13,
    gap: 12,
  },
  selectedOption: { borderColor: colors.textSecondary, backgroundColor: "#202026" },
  optionSwatch: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  optionLabel: { color: colors.text, fontSize: 14, fontWeight: "700", flex: 1 },
  checkmark: { color: colors.text, fontSize: 18, fontWeight: "800" },
});
