import React from "react";

import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import { useTripStore } from "../store/useTripStore";
import { useAppTheme } from "../context/ThemeContext";

export default function StudentDetailsScreen() {
  const router = useRouter();

  const { isDarkMode } = useAppTheme();

  const params = useLocalSearchParams<{
    studentId?: string;
    mode?: string;
  }>();

  const studentId =
    typeof params.studentId === "string"
      ? params.studentId
      : "";

  const mode =
    typeof params.mode === "string"
      ? params.mode
      : "pickup";

  const storeStudents =
    useTripStore(
      (state) => state.students
    );

  const updateStudentStatus =
    useTripStore(
      (state) => state.updateStudentStatus
    );

  const student =
    storeStudents.find(
      (item) =>
        String(item.id) ===
        String(studentId)
    );

  console.log(
    "DETAIL STUDENT ID:",
    studentId
  );

  console.log(
    "DETAIL STORE COUNT:",
    storeStudents.length
  );

  console.log(
    "DETAIL STUDENT:",
    student
  );

  const colors = {
    background: isDarkMode
      ? "#111827"
      : "#F4F8FD",

    card: isDarkMode
      ? "#1f2937"
      : "#ffffff",

    text: isDarkMode
      ? "#f9fafb"
      : "#08285C",

    secondaryText: isDarkMode
      ? "#9ca3af"
      : "#66758E",

    border: isDarkMode
      ? "#374151"
      : "#D8E4F0",

    divider: isDarkMode
      ? "#374151"
      : "#E7EEF6",

    iconBackground: isDarkMode
      ? "#263354"
      : "#EAF3FC",

    blueText: isDarkMode
      ? "#9db4ff"
      : "#1768C4",

    pickupBackground: isDarkMode
      ? "#183f2b"
      : "#E7F6F4",

    pickupText: isDarkMode
      ? "#86efac"
      : "#0B7C76",

    dropOffBackground: isDarkMode
      ? "#4a2f18"
      : "#FFF1E6",

    dropOffText: isDarkMode
      ? "#fdba74"
      : "#E8793E",

    pendingBackground: isDarkMode
      ? "#4a4018"
      : "#FFF5D8",

    pendingText: isDarkMode
      ? "#fde68a"
      : "#A56A00",

    absentBackground: isDarkMode
      ? "#4a2020"
      : "#fee2e2",

    absentText: isDarkMode
      ? "#fca5a5"
      : "#b91c1c",

    droppedBackground: isDarkMode
      ? "#263354"
      : "#E8F1FC",

    droppedText: isDarkMode
      ? "#9db4ff"
      : "#1768C4",
  };

  const callParent = async () => {
    if (!student) {
      return;
    }

    const phoneUrl =
      `tel:${student.parentPhone}`;

    try {
      const canOpen =
        await Linking.canOpenURL(
          phoneUrl
        );

      if (!canOpen) {
        Alert.alert(
          "Call Error",
          "Phone dialer could not be opened."
        );

        return;
      }

      await Linking.openURL(phoneUrl);
    } catch (error) {
      console.log(
        "CALL ERROR:",
        error
      );

      Alert.alert(
        "Call Error",
        "Could not call the parent."
      );
    }
  };

  const showPickupLocation = () => {
    if (!student) {
      return;
    }

    Alert.alert(
      "Pickup Location",
      student.pickupLocation
    );
  };

  const showDropOffLocation = () => {
    if (!student) {
      return;
    }

    Alert.alert(
      "Drop-off Location",
      student.dropOffLocation
    );
  };

  const confirmPickup = () => {
    if (!student) {
      return;
    }

    Alert.alert(
      "Pick Up Student",
      `Mark ${student.name} as picked up?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Pick Up",
          onPress: () => {
            updateStudentStatus(
              student.id,
              "pickedUp"
            );

            const currentTime =
              new Date().toLocaleTimeString(
                "en-IN",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              );

            Alert.alert(
              "Picked Up Successfully",
              `${student.name} was picked up at ${currentTime}.\n\nParent message:\nYour child ${student.name} was picked up by the school bus.`
            );
          },
        },
      ]
    );
  };

  const confirmDropOff = () => {
    if (!student) {
      return;
    }

    Alert.alert(
      "Drop Off Student",
      `Mark ${student.name} as dropped off?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Drop Off",
          onPress: () => {
            updateStudentStatus(
              student.id,
              "droppedOff"
            );

            const currentTime =
              new Date().toLocaleTimeString(
                "en-IN",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              );

            Alert.alert(
              "Dropped Off Successfully",
              `${student.name} was dropped off safely at ${currentTime}.\n\nParent message:\nYour child ${student.name} was dropped off safely by the school bus.`
            );
          },
        },
      ]
    );
  };

  if (!student) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor:
              colors.background,
          },
        ]}
        edges={[
          "top",
          "bottom",
          "left",
          "right",
        ]}
      >
        <View
          style={
            styles.notFoundContainer
          }
        >
          <Text
            style={styles.notFoundIcon}
          >
            👦
          </Text>

          <Text
            style={[
              styles.notFoundTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Student Not Found
          </Text>

          <Text
            style={[
              styles.notFoundText,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            The selected student details
            could not be loaded.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.backToListButton,
              pressed &&
                styles.buttonPressed,
            ]}
            onPress={() => router.back()}
          >
            <Text
              style={
                styles.backToListText
              }
            >
              Back to Student List
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const statusText =
    student.status === "pickedUp"
      ? "Picked Up"
      : student.status === "droppedOff"
        ? "Dropped Off"
        : student.status === "absent"
          ? "Absent"
          : "Pending";

  const statusBackground =
    student.status === "pickedUp"
      ? colors.pickupBackground
      : student.status === "droppedOff"
        ? colors.droppedBackground
        : student.status === "absent"
          ? colors.absentBackground
          : colors.pendingBackground;

  const statusColor =
    student.status === "pickedUp"
      ? colors.pickupText
      : student.status === "droppedOff"
        ? colors.droppedText
        : student.status === "absent"
          ? colors.absentText
          : colors.pendingText;

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
      edges={[
        "top",
        "bottom",
        "left",
        "right",
      ]}
    >
      {/* Header */}

      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor:
                colors.card,
              borderColor:
                colors.border,
            },
            pressed &&
              styles.buttonPressed,
          ]}
          onPress={() => router.back()}
        >
          <Text
            style={[
              styles.backIcon,
              {
                color: colors.text,
              },
            ]}
          >
            ‹
          </Text>
        </Pressable>

        <View style={styles.headerContent}>
          <Text
            style={[
              styles.heading,
              {
                color: colors.text,
              },
            ]}
          >
            Student Details
          </Text>

          <Text
            style={[
              styles.subHeading,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            View student and parent information
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* Profile */}

        <View style={styles.profileCard}>
          <View
            style={[
              styles.largeAvatar,
              {
                backgroundColor:
                  isDarkMode
                    ? "#1f2937"
                    : "#ffffff",
              },
            ]}
          >
            <Text
              style={[
                styles.largeAvatarText,
                {
                  color:
                    colors.blueText,
                },
              ]}
            >
              {student.name
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>

          <Text style={styles.studentName}>
            {student.name}
          </Text>

          <Text style={styles.classText}>
            Class {student.className} -{" "}
            {student.division}
          </Text>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  statusBackground,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: statusColor,
                },
              ]}
            >
              {statusText}
            </Text>
          </View>
        </View>

        {/* Parent Information */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Parent Information
        </Text>

        <View
          style={[
            styles.detailsCard,
            {
              backgroundColor:
                colors.card,
              borderColor:
                colors.border,
            },
          ]}
        >
          <DetailRow
            icon="👤"
            label="Parent Name"
            value={student.parentName}
            textColor={colors.text}
            secondaryColor={
              colors.secondaryText
            }
            iconBackground={
              colors.iconBackground
            }
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor:
                  colors.divider,
              },
            ]}
          />

          <DetailRow
            icon="☎️"
            label="Phone Number"
            value={student.parentPhone}
            textColor={colors.text}
            secondaryColor={
              colors.secondaryText
            }
            iconBackground={
              colors.iconBackground
            }
          />

          <Pressable
            style={({ pressed }) => [
              styles.callButton,
              pressed &&
                styles.buttonPressed,
            ]}
            onPress={() => {
              void callParent();
            }}
          >
            <Text
              style={
                styles.callButtonText
              }
            >
              ☎️ Call Parent
            </Text>
          </Pressable>
        </View>

        {/* Locations */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Route Locations
        </Text>

        <View
          style={[
            styles.detailsCard,
            {
              backgroundColor:
                colors.card,
              borderColor:
                colors.border,
            },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.locationItem,
              pressed &&
                styles.locationPressed,
            ]}
            onPress={showPickupLocation}
          >
            <View
              style={[
                styles.pickupIconContainer,
                {
                  backgroundColor:
                    colors.pickupBackground,
                },
              ]}
            >
              <Text
                style={
                  styles.locationIcon
                }
              >
                🚌
              </Text>
            </View>

            <View
              style={
                styles.locationContent
              }
            >
              <Text
                style={[
                  styles.detailLabel,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Pickup Location
              </Text>

              <Text
                style={[
                  styles.detailValue,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {student.pickupLocation}
              </Text>
            </View>

            <Text
              style={[
                styles.locationArrow,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              ›
            </Text>
          </Pressable>

          <View
            style={[
              styles.divider,
              {
                backgroundColor:
                  colors.divider,
              },
            ]}
          />

          <Pressable
            style={({ pressed }) => [
              styles.locationItem,
              pressed &&
                styles.locationPressed,
            ]}
            onPress={
              showDropOffLocation
            }
          >
            <View
              style={[
                styles.dropOffIconContainer,
                {
                  backgroundColor:
                    colors.dropOffBackground,
                },
              ]}
            >
              <Text
                style={
                  styles.locationIcon
                }
              >
                🏠
              </Text>
            </View>

            <View
              style={
                styles.locationContent
              }
            >
              <Text
                style={[
                  styles.detailLabel,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Drop-off Location
              </Text>

              <Text
                style={[
                  styles.detailValue,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {student.dropOffLocation}
              </Text>
            </View>

            <Text
              style={[
                styles.locationArrow,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              ›
            </Text>
          </Pressable>
        </View>

        {/* Trip Action */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Trip Action
        </Text>

        {mode === "dropoff" ? (
          <Pressable
            style={({ pressed }) => [
              styles.dropOffButton,
              pressed &&
                styles.buttonPressed,
            ]}
            onPress={confirmDropOff}
          >
            <Text
              style={
                styles.mainButtonIcon
              }
            >
              🏠
            </Text>

            <View style={styles.actionContent}>
              <Text
                style={
                  styles.mainButtonTitle
                }
              >
                Drop Off Student
              </Text>

              <Text
                style={
                  styles.mainButtonDescription
                }
              >
                Mark the student as safely
                dropped off
              </Text>
            </View>

            <Text
              style={styles.actionArrow}
            >
              ›
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.pickupButton,
              pressed &&
                styles.buttonPressed,
            ]}
            onPress={confirmPickup}
          >
            <Text
              style={
                styles.mainButtonIcon
              }
            >
              🚌
            </Text>

            <View style={styles.actionContent}>
              <Text
                style={
                  styles.mainButtonTitle
                }
              >
                Pick Up Student
              </Text>

              <Text
                style={
                  styles.mainButtonDescription
                }
              >
                Mark the student as picked up
              </Text>
            </View>

            <Text
              style={styles.actionArrow}
            >
              ›
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

type DetailRowProps = {
  icon: string;
  label: string;
  value: string;
  textColor: string;
  secondaryColor: string;
  iconBackground: string;
};

function DetailRow({
  icon,
  label,
  value,
  textColor,
  secondaryColor,
  iconBackground,
}: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <View
        style={[
          styles.detailIconContainer,
          {
            backgroundColor:
              iconBackground,
          },
        ]}
      >
        <Text style={styles.detailIcon}>
          {icon}
        </Text>
      </View>

      <View style={styles.detailContent}>
        <Text
          style={[
            styles.detailLabel,
            {
              color: secondaryColor,
            },
          ]}
        >
          {label}
        </Text>

        <Text
          style={[
            styles.detailValue,
            {
              color: textColor,
            },
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 16,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  backIcon: {
    fontSize: 34,
    lineHeight: 36,
  },

  headerContent: {
    flex: 1,
  },

  heading: {
    fontSize: 24,
    fontWeight: "900",
  },

  subHeading: {
    fontSize: 12,
    marginTop: 3,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  profileCard: {
    backgroundColor: "#0F5DA8",
    borderRadius: 22,
    paddingVertical: 25,
    paddingHorizontal: 18,
    alignItems: "center",
    marginBottom: 24,
    elevation: 3,
  },

  largeAvatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  largeAvatarText: {
    fontSize: 31,
    fontWeight: "900",
  },

  studentName: {
    color: "#ffffff",
    fontSize: 23,
    fontWeight: "900",
  },

  classText: {
    color: "#D8E9FA",
    fontSize: 13,
    marginTop: 5,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 13,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 10,
  },

  detailsCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 23,
    elevation: 1,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 59,
  },

  detailIconContainer: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  detailIcon: {
    fontSize: 18,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 10,
  },

  detailValue: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 3,
  },

  divider: {
    height: 1,
  },

  callButton: {
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: "#079A96",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 13,
  },

  callButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },

  locationItem: {
    minHeight: 73,
    flexDirection: "row",
    alignItems: "center",
  },

  pickupIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  dropOffIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  locationIcon: {
    fontSize: 19,
  },

  locationContent: {
    flex: 1,
  },

  locationArrow: {
    fontSize: 27,
  },

  locationPressed: {
    opacity: 0.6,
  },

  pickupButton: {
    minHeight: 76,
    backgroundColor: "#079A96",
    borderRadius: 17,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  dropOffButton: {
    minHeight: 76,
    backgroundColor: "#E8793E",
    borderRadius: 17,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  mainButtonIcon: {
    fontSize: 29,
    marginRight: 14,
  },

  actionContent: {
    flex: 1,
  },

  mainButtonTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "900",
  },

  mainButtonDescription: {
    color: "#f3f4f6",
    fontSize: 10,
    marginTop: 3,
  },

  actionArrow: {
    color: "#ffffff",
    fontSize: 28,
  },

  buttonPressed: {
    opacity: 0.72,
  },

  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  notFoundIcon: {
    fontSize: 55,
    marginBottom: 13,
  },

  notFoundTitle: {
    fontSize: 21,
    fontWeight: "900",
  },

  notFoundText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 7,
  },

  backToListButton: {
    minHeight: 45,
    backgroundColor: "#1768C4",
    borderRadius: 12,
    paddingHorizontal: 17,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  backToListText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },
});