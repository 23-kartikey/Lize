import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import BrandHeader from "../components/BrandHeader";
import HourClassificationModal from "../components/HourClassificationModal";
import HourGrid from "../components/HourGrid";
import HourLegend from "../components/HourLegend";
import TimeSummary from "../components/TimeSummary";
import { colors } from "../constants/theme";
import { useClock } from "../hooks/useClock";
import { useHourMarks } from "../hooks/useHourMarks";
import type { HourMark, SelectedHour } from "../types/hour";
import { getDayKey } from "../utils/time";

export default function HomeScreen() {
  const now = useClock();
  const { marksByDay, storageReady, setHourMark } = useHourMarks();
  const [selectedTarget, setSelectedTarget] = useState<SelectedHour>(null);

  const todayKey = getDayKey(now);
  const todayMarks = marksByDay[todayKey] ?? {};
  const currentHour = now.getHours();
  const elapsedMinutes = currentHour * 60 + now.getMinutes();
  const remainingMinutes = 24 * 60 - elapsedMinutes;

  const markValues = Object.values(todayMarks);
  const wastedHours = markValues.filter((mark) => mark === "wasted").length;
  const notWastedHours = markValues.filter((mark) => mark === "not-wasted").length;

  const selectedMark = selectedTarget
    ? marksByDay[selectedTarget.dayKey]?.[String(selectedTarget.hour)]
    : undefined;

  function saveSelectedMark(mark: HourMark | null) {
    if (!selectedTarget) return;
    setHourMark(selectedTarget.dayKey, selectedTarget.hour, mark);
    setSelectedTarget(null);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={colors.background} barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <BrandHeader />

        <TimeSummary
          now={now}
          elapsedMinutes={elapsedMinutes}
          remainingMinutes={remainingMinutes}
          wastedHours={wastedHours}
          classifiedHours={wastedHours + notWastedHours}
        />

        <HourGrid
          currentHour={currentHour}
          dayMarks={todayMarks}
          disabled={!storageReady}
          onSelectHour={(hour) => setSelectedTarget({ hour, dayKey: todayKey })}
        />

        <HourLegend />

        <Text style={styles.footer}>
          A diagonal strike means the hour has passed.{"\n"}
          Your marks are saved on this device.
        </Text>

        {!storageReady && (
          <View style={styles.loadingNotice}>
            <Text style={styles.loadingText}>Loading saved hours…</Text>
          </View>
        )}
      </ScrollView>

      <HourClassificationModal
        selectedTarget={selectedTarget}
        selectedMark={selectedMark}
        todayKey={todayKey}
        currentHour={currentHour}
        onClose={() => setSelectedTarget(null)}
        onSaveMark={saveSelectedMark}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 38 },
  footer: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 23,
  },
  loadingNotice: { alignItems: "center", marginTop: 12 },
  loadingText: { color: colors.textMuted, fontSize: 11 },
});
