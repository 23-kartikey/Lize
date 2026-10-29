import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors } from "../constants/theme";
import type { HourAppUsage } from "../types/appUsage";
import { formatHour } from "../utils/time";
import { formatUsageDuration } from "../utils/usage";

type Props = {
  hour: number | null;
  usage: HourAppUsage[];
  permissionGranted: boolean;
  loading: boolean;
  error: string | null;
  accentColor: string;
  onClose: () => void;
  onGrantAccess: () => void;
  onRefresh: () => void;
};

export default function HourUsageModal({
  hour,
  usage,
  permissionGranted,
  loading,
  error,
  accentColor,
  onClose,
  onGrantAccess,
  onRefresh,
}: Props) {
  const visible = hour !== null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>APP USAGE</Text>

              <Text style={styles.title}>
                {hour === null
                  ? "Usage details"
                  : `${formatHour(hour)} – ${formatHour((hour + 1) % 24)}`}
              </Text>

              <Text style={styles.subtitle}>
                Apps ranked by foreground time
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close usage details"
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          {!permissionGranted ? (
            <View style={styles.messageContainer}>
              <Text style={styles.messageTitle}>Usage access is needed</Text>

              <Text style={styles.message}>
                Allow Lize to access Android's usage statistics to see which
                apps you used during this hour.
              </Text>

              <Pressable
                onPress={onGrantAccess}
                style={[
                  styles.primaryButton,
                  { backgroundColor: accentColor },
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  Open Usage Access settings
                </Text>
              </Pressable>
            </View>
          ) : loading && usage.length === 0 ? (
            <Text style={styles.message}>Loading app usage…</Text>
          ) : error ? (
            <View style={styles.messageContainer}>
              <Text style={styles.messageTitle}>Couldn't load usage</Text>
              <Text style={styles.message}>{error}</Text>

              <Pressable
                onPress={onRefresh}
                style={[
                  styles.primaryButton,
                  { backgroundColor: accentColor },
                ]}
              >
                <Text style={styles.primaryButtonText}>Try again</Text>
              </Pressable>
            </View>
          ) : usage.length === 0 ? (
            <View style={styles.messageContainer}>
              <Text style={styles.messageTitle}>No app usage recorded</Text>

              <Text style={styles.message}>
                Android hasn't reported foreground usage for this hour. This
                may happen for a future hour, or if no eligible app usage
                was recorded.
              </Text>

              <Pressable
                onPress={onRefresh}
                style={[
                  styles.primaryButton,
                  { backgroundColor: accentColor },
                ]}
              >
                <Text style={styles.primaryButtonText}>Refresh usage</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.resultCount}>
                {usage.length} {usage.length === 1 ? "app" : "apps"} found
                {loading ? " · Updating…" : ""}
              </Text>

              <ScrollView
                style={styles.list}
                showsVerticalScrollIndicator={false}
              >
                {usage.map((app, index) => (
                  <View key={app.packageName} style={styles.appRow}>
                    <View
                      style={[
                        styles.rank,
                        index === 0 && { backgroundColor: accentColor },
                      ]}
                    >
                      <Text
                        style={[
                          styles.rankText,
                          index === 0 && { color: colors.background },
                        ]}
                      >
                        {index + 1}
                      </Text>
                    </View>

                    <View style={styles.appText}>
                      <Text numberOfLines={1} style={styles.appName}>
                        {app.appName}
                      </Text>

                      <Text numberOfLines={1} style={styles.packageName}>
                        {app.packageName}
                      </Text>
                    </View>

                    <Text style={styles.duration}>
                      {formatUsageDuration(app.totalTimeMs)}
                    </Text>
                  </View>
                ))}
              </ScrollView>

              <Pressable
                onPress={onRefresh}
                style={[styles.refreshButton, { borderColor: accentColor }]}
              >
                <Text style={[styles.refreshText, { color: accentColor }]}>
                  Refresh usage
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.78)",
    justifyContent: "center",
    padding: 20,
  },
  panel: {
    width: "100%",
    maxHeight: "85%",
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerText: { flex: 1 },
  eyebrow: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  title: {
    color: colors.text,
    fontSize: 23,
    fontWeight: "800",
    marginTop: 6,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 5,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  closeText: { color: colors.textSecondary, fontSize: 15 },
  resultCount: {
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 8,
  },
  list: { flexShrink: 1 },
  appRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: 10,
  },
  rank: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
  },
  appText: { flex: 1, minWidth: 0 },
  appName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  packageName: {
    color: colors.textMuted,
    fontSize: 9,
    marginTop: 3,
  },
  duration: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },
  messageContainer: { paddingVertical: 12 },
  messageTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  message: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 9,
    marginBottom: 16,
  },
  primaryButton: {
    minHeight: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  refreshButton: {
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  refreshText: { fontSize: 12, fontWeight: "800" },
});