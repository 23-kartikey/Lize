import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";

export default function BrandHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <Text style={styles.brand}>lize</Text>
        <View style={styles.brandMark} accessibilityElementsHidden>
          <View style={styles.brandMarkCell} />
          <View style={styles.brandMarkCell} />
          <View style={styles.brandMarkCell} />
          <View style={styles.brandMarkCell} />
        </View>
      </View>
      <Text style={styles.brandSubtitle}>YOUR TIME. YOUR LIFE.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#25252B",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
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
  brandMarkCell: {
    width: 9,
    height: 9,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  brandSubtitle: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2.5,
  },
});
