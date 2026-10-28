import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";

export default function HourLegend() {
  return (
    <View style={styles.legend}>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, styles.wastedDot]} />
        <Text style={styles.legendText}>Wasted</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, styles.notWastedDot]} />
        <Text style={styles.legendText}>Not wasted</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, styles.unmarkedDot]} />
        <Text style={styles.legendText}>Unmarked</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    paddingTop: 17,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  wastedDot: { backgroundColor: colors.accent },
  notWastedDot: { backgroundColor: colors.notWastedDot },
  unmarkedDot: { backgroundColor: "#666570" },
  legendText: { color: "#A29FA9", fontSize: 10 },
});
