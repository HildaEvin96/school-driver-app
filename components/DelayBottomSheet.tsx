import React, { useEffect, useRef } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

const HOURS = Array.from({ length: 13 }, (_, index) => String(index));

const MINUTES = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, "0")
);

const QUICK_DELAY_OPTIONS = [5, 10, 15];

const WHEEL_ITEM_HEIGHT = 44;
const WHEEL_VISIBLE_ITEMS = 3;
const WHEEL_HEIGHT =
  WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ITEMS;

type DelayBottomSheetProps = {
  visible: boolean;

  selectedHour: string;
  selectedMinute: string;

  isDarkMode: boolean;

  onHourChange: (value: string) => void;
  onMinuteChange: (value: string) => void;

  onQuickDelay: (minutes: number) => void;

  onCancel: () => void;

  onConfirm: () => void;
};

export default function DelayBottomSheet({
  visible,
  selectedHour,
  selectedMinute,
  isDarkMode,
  onHourChange,
  onMinuteChange,
  onQuickDelay,
  onCancel,
  onConfirm,
}: DelayBottomSheetProps) {
  const insets = useSafeAreaInsets();

  const colors = {
    card: isDarkMode
      ? "#10243A"
      : "#FFFFFF",

    text: isDarkMode
      ? "#F7FBFF"
      : "#08285C",

    secondaryText: isDarkMode
      ? "#A8BAD0"
      : "#66758E",

    border: isDarkMode
      ? "#27405B"
      : "#D8E4F0",

    softBackground: isDarkMode
      ? "#102D46"
      : "#F7FAFD",

    inactiveBackground: isDarkMode
      ? "#27405B"
      : "#EEF3F8",

    blueBackground: isDarkMode
      ? "#163657"
      : "#EAF3FC",

    blueText: isDarkMode
      ? "#8EC7FF"
      : "#1768C4",

    sheetHandle: isDarkMode
      ? "#51677E"
      : "#C9D7E5",

    overlay: "rgba(0,0,0,0.55)",
  };

  const selectedDelayMinutes =
    Number(selectedHour) * 60 +
    Number(selectedMinute);

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
            backgroundColor: colors.overlay,
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
              backgroundColor: colors.card,
              borderColor: colors.border,

              // IMPORTANT:
              // Android navigation bar / gesture area safe gap
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
            Add Trip Delay
          </Text>

          <View
            style={[
              styles.wheelTimeContainer,
              {
                backgroundColor:
                  colors.softBackground,
                borderColor:
                  colors.border,
              },
            ]}
          >
            <View
              pointerEvents="none"
              style={[
                styles.wheelSelectionBand,
                {
                  backgroundColor:
                    isDarkMode
                      ? "rgba(23,104,196,0.22)"
                      : "rgba(23,104,196,0.09)",

                  borderColor:
                    colors.blueText,
                },
              ]}
            />

            <WheelColumn
              values={HOURS}
              selectedValue={selectedHour}
              onValueChange={onHourChange}
              textColor={colors.text}
              fadedTextColor={
                colors.secondaryText
              }
            />

            <Text
              style={[
                styles.wheelSeparator,
                {
                  color: colors.text,
                },
              ]}
            >
              :
            </Text>

            <WheelColumn
              values={MINUTES}
              selectedValue={selectedMinute}
              onValueChange={onMinuteChange}
              textColor={colors.text}
              fadedTextColor={
                colors.secondaryText
              }
            />
          </View>

          <View style={styles.delayUnitRow}>
            <Text
              style={[
                styles.delayUnitText,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Hours
            </Text>

            <Text
              style={[
                styles.delayUnitText,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Minutes
            </Text>
          </View>

          <View style={styles.quickDelayRow}>
            {QUICK_DELAY_OPTIONS.map(
              (minutes) => {
                const selected =
                  selectedDelayMinutes ===
                  minutes;

                return (
                  <Pressable
                    key={minutes}
                    style={({ pressed }) => [
                      styles.quickDelayButton,

                      {
                        backgroundColor:
                          selected
                            ? "#1768C4"
                            : colors.blueBackground,

                        borderColor:
                          selected
                            ? "#1768C4"
                            : colors.border,
                      },

                      pressed &&
                        styles.buttonPressed,
                    ]}
                    onPress={() =>
                      onQuickDelay(minutes)
                    }
                  >
                    <Text
                      style={[
                        styles.quickDelayText,
                        {
                          color: selected
                            ? "#FFFFFF"
                            : colors.blueText,
                        },
                      ]}
                    >
                      {minutes} min
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>

          <View style={styles.sheetActionRow}>
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
                    color: colors.text,
                  },
                ]}
              >
                Cancel
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.confirmButton,

                pressed &&
                  styles.buttonPressed,
              ]}
              onPress={onConfirm}
            >
              <Text
                style={
                  styles.confirmText
                }
              >
                Add Delay
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

type WheelColumnProps = {
  values: string[];

  selectedValue: string;

  onValueChange: (
    value: string
  ) => void;

  textColor: string;

  fadedTextColor: string;
};

function WheelColumn({
  values,
  selectedValue,
  onValueChange,
  textColor,
  fadedTextColor,
}: WheelColumnProps) {
  const listRef =
    useRef<FlatList<string>>(null);

  const internalSelectionRef =
    useRef(false);

  const mountedRef =
    useRef(false);

  const selectedIndex =
    Math.max(
      0,
      values.indexOf(
        selectedValue
      )
    );

  useEffect(() => {
    const timer =
      setTimeout(() => {
        if (
          internalSelectionRef.current
        ) {
          internalSelectionRef.current =
            false;

          return;
        }

        listRef.current?.scrollToOffset({
          offset:
            selectedIndex *
            WHEEL_ITEM_HEIGHT,

          animated:
            mountedRef.current,
        });

        mountedRef.current =
          true;
      }, 30);

    return () =>
      clearTimeout(timer);
  }, [
    selectedIndex,
  ]);

  const commitOffset = (
    offsetY: number
  ) => {
    const index =
      Math.max(
        0,
        Math.min(
          values.length - 1,
          Math.round(
            offsetY /
              WHEEL_ITEM_HEIGHT
          )
        )
      );

    const nextValue =
      values[index];

    if (
      nextValue !==
      selectedValue
    ) {
      internalSelectionRef.current =
        true;

      onValueChange(
        nextValue
      );
    }
  };

  return (
    <View
      style={
        styles.wheelColumn
      }
    >
      <FlatList
        ref={listRef}
        data={values}
        keyExtractor={(item) =>
          item
        }
        showsVerticalScrollIndicator={
          false
        }
        bounces={false}
        overScrollMode="never"
        nestedScrollEnabled
        snapToInterval={
          WHEEL_ITEM_HEIGHT
        }
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={
          styles.wheelContent
        }
        getItemLayout={(
          _,
          index
        ) => ({
          length:
            WHEEL_ITEM_HEIGHT,

          offset:
            WHEEL_ITEM_HEIGHT *
            index,

          index,
        })}
        onMomentumScrollEnd={(
          event
        ) =>
          commitOffset(
            event.nativeEvent
              .contentOffset.y
          )
        }
        onScrollEndDrag={(
          event
        ) => {
          const velocity =
            Math.abs(
              event.nativeEvent
                .velocity?.y ??
                0
            );

          if (
            velocity < 0.08
          ) {
            commitOffset(
              event.nativeEvent
                .contentOffset.y
            );
          }
        }}
        renderItem={({ item }) => {
          const isSelected =
            item ===
            selectedValue;

          return (
            <View
              style={
                styles.wheelItem
              }
            >
              <Text
                style={[
                  styles.wheelItemText,

                  {
                    color:
                      isSelected
                        ? textColor
                        : fadedTextColor,

                    opacity:
                      isSelected
                        ? 1
                        : 0.3,
                  },

                  isSelected &&
                    styles.selectedWheelItemText,
                ]}
              >
                {item}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles =
  StyleSheet.create({

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

    wheelTimeContainer: {
      height:
        WHEEL_HEIGHT,

      borderWidth: 1,

      borderRadius: 16,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      marginTop: 14,

      overflow: "hidden",

      position: "relative",

      paddingHorizontal: 18,
    },

    wheelSelectionBand: {
      position: "absolute",

      left: 14,

      right: 14,

      top:
        WHEEL_ITEM_HEIGHT,

      height:
        WHEEL_ITEM_HEIGHT,

      borderTopWidth:
        StyleSheet.hairlineWidth,

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderRadius: 10,
    },

    wheelColumn: {
      flex: 1,

      height:
        WHEEL_HEIGHT,
    },

    wheelContent: {
      paddingVertical:
        WHEEL_ITEM_HEIGHT,
    },

    wheelItem: {
      height:
        WHEEL_ITEM_HEIGHT,

      alignItems: "center",

      justifyContent:
        "center",
    },

    wheelItemText: {
      fontSize: 22,

      fontWeight: "600",
    },

    selectedWheelItemText: {
      fontSize: 30,

      fontWeight: "900",
    },

    wheelSeparator: {
      fontSize: 28,

      fontWeight: "900",

      marginHorizontal: 5,

      zIndex: 2,
    },

    delayUnitRow: {
      flexDirection: "row",

      paddingHorizontal: 24,

      marginTop: 6,
    },

    delayUnitText: {
      flex: 1,

      textAlign: "center",

      fontSize: 9,

      fontWeight: "800",
    },

    quickDelayRow: {
      flexDirection: "row",

      justifyContent: "center",

      marginTop: 10,

      gap: 7,
    },

    quickDelayButton: {
      minWidth: 54,

      height: 30,

      borderWidth: 1,

      borderRadius: 9,

      paddingHorizontal: 10,

      alignItems: "center",

      justifyContent: "center",
    },

    quickDelayText: {
      fontSize: 10,

      fontWeight: "900",
    },

    sheetActionRow: {
      flexDirection: "row",

      marginTop: 15,

      gap: 8,
    },

    cancelButton: {
      flex: 1,

      minHeight: 46,

      borderWidth: 1,

      borderRadius: 12,

      alignItems: "center",

      justifyContent: "center",
    },

    cancelText: {
      fontSize: 11,

      fontWeight: "900",
    },

    confirmButton: {
      flex: 1,

      minHeight: 46,

      borderRadius: 12,

      backgroundColor:
        "#1768C4",

      alignItems: "center",

      justifyContent: "center",
    },

    confirmText: {
      color: "#FFFFFF",

      fontSize: 11,

      fontWeight: "900",
    },

    buttonPressed: {
      opacity: 0.72,
    },

  });