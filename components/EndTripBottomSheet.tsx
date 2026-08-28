import React from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

type EndTripBottomSheetProps = {
  visible: boolean;

  tripType: "pickup" | "dropoff";

  routeName: string;

  presentCount: number;

  absentCount: number;

  pendingCount: number;

  distance: string;

  startTime: string;

  endTime: string;

  isDarkMode: boolean;

  onCancel: () => void;

  onEndTrip: () => void;
};

export default function EndTripBottomSheet({
  visible,
  tripType,
  routeName,
  presentCount,
  absentCount,
  pendingCount,
  distance,
  startTime,
  endTime,
  isDarkMode,
  onCancel,
  onEndTrip,
}: EndTripBottomSheetProps) {

  const insets = useSafeAreaInsets();

  const colors = {
    card: isDarkMode ? "#10243A" : "#FFFFFF",

    text: isDarkMode
      ? "#F7FBFF"
      : "#08285C",

    secondaryText: isDarkMode
      ? "#A8BAD0"
      : "#66758E",

    border: isDarkMode
      ? "#27405B"
      : "#D8E4F0",

    inactiveBackground: isDarkMode
      ? "#27405B"
      : "#EEF3F8",

    successText: isDarkMode
      ? "#76E2D8"
      : "#0B7C76",

    absentText: isDarkMode
      ? "#fca5a5"
      : "#b91c1c",

    pendingBackground: isDarkMode
      ? "#4a4018"
      : "#fff4c7",

    pendingText: isDarkMode
      ? "#fde68a"
      : "#9a6700",

    sheetHandle: isDarkMode
      ? "#51677E"
      : "#C9D7E5",

    overlay: "rgba(0,0,0,0.55)",
  };

  const title =
    tripType === "pickup"
      ? "End Pickup Trip?"
      : "End Dropoff Trip?";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >

      <View
        style={[
          styles.sheetOverlay,
          {
            backgroundColor:
              colors.overlay,
          },
        ]}
      >

        <Pressable
          style={styles.sheetDismissArea}
          onPress={onCancel}
        />


        <View
          style={[
            styles.bottomSheet,
            {
              backgroundColor:
                colors.card,

              borderColor:
                colors.border,

              // ✅ Important fix
              paddingBottom:
                Math.max(
                  insets.bottom,
                  Platform.OS === "android"
                    ? 20
                    : 16
                ) + 8,
            },
          ]}
        >

          <View
            style={[
              styles.sheetHandle,
              {
                backgroundColor:
                  colors.sheetHandle,
              },
            ]}
          />


          <Text
            style={[
              styles.sheetTitle,
              {
                color: colors.text,
              },
            ]}
          >
            {title}
          </Text>


          <Text
            style={[
              styles.sheetDescription,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Are you sure you want to end this trip?
          </Text>


          <View
            style={
              styles.compactDetailsList
            }
          >

            <DetailRow
              label="Route"
              value={routeName}
              textColor={colors.text}
              secondaryColor={
                colors.secondaryText
              }
            />

            <DetailRow
              label={
                tripType === "pickup"
                  ? "Present"
                  : "Dropped"
              }
              value={`${presentCount}`}
              textColor={
                colors.successText
              }
              secondaryColor={
                colors.secondaryText
              }
            />

            <DetailRow
              label="Absent"
              value={`${absentCount}`}
              textColor={
                colors.absentText
              }
              secondaryColor={
                colors.secondaryText
              }
            />

            <DetailRow
              label="Kilometre"
              value={distance}
              textColor={colors.text}
              secondaryColor={
                colors.secondaryText
              }
            />

            <DetailRow
              label="Start Time"
              value={startTime}
              textColor={colors.text}
              secondaryColor={
                colors.secondaryText
              }
            />

            <DetailRow
              label="End Time"
              value={endTime}
              textColor={colors.text}
              secondaryColor={
                colors.secondaryText
              }
            />

          </View>


          {pendingCount > 0 && (

            <View
              style={[
                styles.pendingWarning,
                {
                  backgroundColor:
                    colors.pendingBackground,
                },
              ]}
            >

              <Text
                style={
                  styles.pendingWarningIcon
                }
              >
                ⚠️
              </Text>

              <Text
                style={[
                  styles.pendingWarningText,
                  {
                    color:
                      colors.pendingText,
                  },
                ]}
              >
                {pendingCount} student
                {pendingCount === 1
                  ? ""
                  : "s"}{" "}
                still pending.
              </Text>

            </View>

          )}


          <View
            style={
              styles.sheetActionRow
            }
          >

            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                {
                  backgroundColor:
                    colors.inactiveBackground,

                  borderColor:
                    colors.border,
                },

                pressed &&
                  styles.buttonPressed,
              ]}
              onPress={onCancel}
            >

              <Text
                style={[
                  styles.cancelText,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Cancel
              </Text>

            </Pressable>


            <Pressable
              disabled={
                pendingCount > 0
              }
              style={({ pressed }) => [
                styles.endButton,

                pendingCount > 0 &&
                  styles.disabledButton,

                pressed &&
                  pendingCount === 0 &&
                  styles.buttonPressed,
              ]}
              onPress={onEndTrip}
            >

              <Text
                style={
                  styles.endButtonText
                }
              >
                End Trip
              </Text>

            </Pressable>

          </View>

        </View>

      </View>

    </Modal>
  );
}


type DetailRowProps = {
  label: string;
  value: string;
  textColor: string;
  secondaryColor: string;
};

function DetailRow({
  label,
  value,
  textColor,
  secondaryColor,
}: DetailRowProps) {

  return (
    <View
      style={
        styles.compactDetailRow
      }
    >

      <Text
        style={[
          styles.compactDetailLabel,
          {
            color:
              secondaryColor,
          },
        ]}
      >
        {label} :
      </Text>

      <Text
        style={[
          styles.compactDetailValue,
          {
            color: textColor,
          },
        ]}
      >
        {value}
      </Text>

    </View>
  );
}


const styles = StyleSheet.create({

  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  sheetDismissArea: {
    flex: 1,
  },

  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

    borderWidth: 1,

    paddingHorizontal: 18,

    paddingTop: 10,
  },

  sheetHandle: {
    width: 40,
    height: 4,

    borderRadius: 2,

    alignSelf: "center",

    marginBottom: 12,
  },

  sheetTitle: {
    fontSize: 18,

    fontWeight: "900",

    textAlign: "center",
  },

  sheetDescription: {
    fontSize: 10,

    lineHeight: 15,

    textAlign: "center",

    marginTop: 4,
  },

  compactDetailsList: {
    marginTop: 18,
  },

  compactDetailRow: {
    flexDirection: "row",

    alignItems: "center",

    minHeight: 36,
  },

  compactDetailLabel: {
    width: 102,

    fontSize: 11,

    fontWeight: "700",
  },

  compactDetailValue: {
    flex: 1,

    fontSize: 11,

    fontWeight: "900",
  },

  pendingWarning: {
    minHeight: 46,

    borderRadius: 12,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 12,

    marginTop: 14,
  },

  pendingWarningIcon: {
    fontSize: 18,

    marginRight: 9,
  },

  pendingWarningText: {
    flex: 1,

    fontSize: 10,

    fontWeight: "800",
  },

  sheetActionRow: {
    flexDirection: "row",

    marginTop: 16,

    gap: 10,
  },

  cancelButton: {
    flex: 1,

    minHeight: 48,

    borderRadius: 13,

    borderWidth: 1,

    alignItems: "center",

    justifyContent: "center",
  },

  cancelText: {
    fontSize: 12,

    fontWeight: "900",
  },

  endButton: {
    flex: 1,

    minHeight: 48,

    borderRadius: 13,

    backgroundColor: "#0F5DA8",

    alignItems: "center",

    justifyContent: "center",
  },

  disabledButton: {
    opacity: 0.45,
  },

  endButtonText: {
    color: "#FFFFFF",

    fontSize: 12,

    fontWeight: "900",
  },

  buttonPressed: {
    opacity: 0.72,
  },

});