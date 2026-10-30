import { useState } from "react";
import { useHourNotes } from "../hooks/useHourNotes";
import AnalyticsScreen from "./AnalyticsScreen";

import {
  Pressable,
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
import HourUsageModal from "../components/HourUsageModal";
import TimeSummary from "../components/TimeSummary";

import { colors } from "../constants/theme";
import { useClock } from "../hooks/useClock";
import { useHourMarks } from "../hooks/useHourMarks";
import { useAccentColor } from "../hooks/useAccentColor";
import { useAppUsage } from "../hooks/useAppUsage";

import type { HourMark, SelectedHour } from "../types/hour";
import { getDayKey } from "../utils/time";

export default function HomeScreen() {
  const now = useClock();

  const { marksByDay, storageReady, setHourMark } = useHourMarks();
  const { accentId, accentColor, setAccentId } = useAccentColor();
  const {  notesByDay, notesReady, setHourNote } = useHourNotes();
  const [showAnalytics, setShowAnalytics] = useState(false);

  const {
    permissionGranted,
    permissionChecked,
    loading: usageLoading,
    usageByHour,
    error: usageError,
    refresh: refreshUsage,
    requestPermission,
  } = useAppUsage();

  const [selectedTarget, setSelectedTarget] =
    useState<SelectedHour>(null);

  const [selectedUsageHour, setSelectedUsageHour] =
    useState<number | null>(null);

  const todayKey = getDayKey(now);
  
  const todayNotes = notesByDay[todayKey] ?? {};

  const selectedNote = selectedTarget ?
                        notesByDay[selectedTarget.dayKey]?.[
                          String(selectedTarget.hour)
                        ] ?? ""
                      : "";

  const todayMarks = marksByDay[todayKey] ?? {};

  const currentHour = now.getHours();
  const elapsedMinutes = currentHour * 60 + now.getMinutes();
  const remainingMinutes = 24 * 60 - elapsedMinutes;

  const markValues = Object.values(todayMarks);
  const wastedHours = markValues.filter(
    (mark) => mark === "wasted",
  ).length;
  const notWastedHours = markValues.filter(
    (mark) => mark === "not-wasted",
  ).length;

  const selectedMark = selectedTarget
    ? marksByDay[selectedTarget.dayKey]?.[String(selectedTarget.hour)]
    : undefined;

  const selectedUsage =
    selectedUsageHour === null
      ? []
      : usageByHour[selectedUsageHour] ?? [];

  function saveSelectedMark(mark: HourMark | null) {
    if (!selectedTarget) return;

    setHourMark(selectedTarget.dayKey, selectedTarget.hour, mark);
    setSelectedTarget(null);
  }

  function saveSelectedNote(note: string) {
    if(!selectedTarget) return;

    setHourNote(
      selectedTarget.dayKey,
      selectedTarget.hour,
      note
    );
  }

  function openUsage(hour: number) {
    setSelectedUsageHour(hour);
    void refreshUsage();
  }

  if (showAnalytics) {
  return (
    <AnalyticsScreen
      accentColor={accentColor}
      onBack={() => setShowAnalytics(false)}
    />
  );
}

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <BrandHeader
          accentId={accentId}
          accentColor={accentColor}
          onSelectAccent={setAccentId}
        />

        <Pressable
          onPress={() => setShowAnalytics(true)}
          style={{
            alignSelf: "flex-end",
            paddingVertical: 10,
            paddingHorizontal: 13,
            marginBottom: 12,
            marginVertical: 8,
            borderWidth: 1,
            borderColor: accentColor,
            borderRadius: 10,
          }}
        >
          <Text
            style={{
              color: accentColor,
              fontSize: 11,
              fontWeight: "800",
            }}
          >
            VIEW ANALYTICS →
          </Text>
        </Pressable>

        <TimeSummary
          now={now}
          elapsedMinutes={elapsedMinutes}
          remainingMinutes={remainingMinutes}
          wastedHours={wastedHours}
          classifiedHours={wastedHours + notWastedHours}
          accentColor={accentColor}
        />

        {permissionChecked && !permissionGranted && (
          <View style={styles.permissionCard}>
            <Text style={styles.permissionTitle}>
              See which apps used your hours
            </Text>

            <Text style={styles.permissionDescription}>
              Allow Usage Access so Lize can display the most-used app
              and the app-by-app breakdown for each hour.
              Usage data is processed on this device.
            </Text>

            <Pressable
              onPress={() => {
                void requestPermission();
              }}
              style={[
                styles.permissionButton,
                { backgroundColor: accentColor },
              ]}
            >
              <Text style={styles.permissionButtonText}>
                Enable Usage Access
              </Text>
            </Pressable>
          </View>
        )}

        <HourGrid
          disabled = {!storageReady || !notesReady}
          dayNotes={todayNotes}
          currentHour={currentHour}
          dayMarks={todayMarks}
          onSelectHour={(hour) =>
            setSelectedTarget({ hour, dayKey: todayKey })
          }
          onShowUsage={openUsage}
          usageByHour={usageByHour}
          accentColor={accentColor}
        />

        {usageLoading && permissionGranted && (
          <Text style={styles.usageNotice}>
            Updating app usage…
          </Text>
        )}

        {usageError && permissionGranted && (
          <Pressable
            onPress={() => {
              void refreshUsage();
            }}
          >
            <Text style={styles.usageError}>
              {usageError} Tap to retry.
            </Text>
          </Pressable>
        )}

        <HourLegend accentColor={accentColor} />

        <Text style={styles.footer}>
          A diagonal strike means the hour has passed.{"\n"}
          Your marks and usage calculations stay on this device.
        </Text>

        {!storageReady && (
          <View style={styles.loadingNotice}>
            <Text style={styles.loadingText}>
              Loading saved hours…
            </Text>
          </View>
        )}
      </ScrollView>

      <HourClassificationModal
        selectedNote = {selectedNote}
        onSaveNote = {saveSelectedNote}
        selectedTarget={selectedTarget}
        selectedMark={selectedMark}
        todayKey={todayKey}
        currentHour={currentHour}
        onClose={() => setSelectedTarget(null)}
        onSaveMark={saveSelectedMark}
        accentColor={accentColor}
      />

      <HourUsageModal
        hour={selectedUsageHour}
        usage={selectedUsage}
        permissionGranted={permissionGranted}
        loading={usageLoading}
        error={usageError}
        accentColor={accentColor}
        onClose={() => setSelectedUsageHour(null)}
        onGrantAccess={() => {
          void requestPermission();
        }}
        onRefresh={() => {
          void refreshUsage();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 38,
  },
  permissionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  permissionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  permissionDescription: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 7,
    marginBottom: 12,
  },
  permissionButton: {
    minHeight: 38,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  permissionButtonText: {
    color: colors.background,
    fontSize: 11,
    fontWeight: "800",
  },
  usageNotice: {
    color: colors.textMuted,
    fontSize: 10,
    textAlign: "center",
    marginTop: 4,
  },
  usageError: {
    color: colors.wastedStatus,
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
  },
  footer: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 23,
  },
  loadingNotice: {
    alignItems: "center",
    marginTop: 12,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 11,
  },
});