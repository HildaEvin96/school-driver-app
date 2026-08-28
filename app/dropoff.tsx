import React, { useEffect, useMemo, useRef, useState } from "react";
import { saveTripHistory } from "../database/tripHistory";
import EndTripBottomSheet from "../components/EndTripBottomSheet";
import DelayBottomSheet from "../components/DelayBottomSheet";


import {
  Alert,
  FlatList,
  LayoutAnimation,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { getRouteByIdUseCase } from "../usecases/GetRouteByIdUseCase";
import { Student } from "../types";
import { useAppTheme } from "../context/ThemeContext";
import { useTripStore } from "../store/useTripStore";

type DropOffStudentStatus = "pending" | "droppedOff" | "absent";

type DropOffStudent = Omit<Student, "status"> & {
  status: DropOffStudentStatus;
};

type DropOffLocationGroup = {
  location: string;
  students: DropOffStudent[];
};

const HOURS = Array.from({ length: 13 }, (_, index) => String(index));
const MINUTES = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, "0")
);
const QUICK_DELAY_OPTIONS = [5, 10, 15];

const WHEEL_ITEM_HEIGHT = 44;
const WHEEL_VISIBLE_ITEMS = 3;
const WHEEL_HEIGHT = WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ITEMS;

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ROUTE_DISTANCE: Record<string, string> = {
  "1": "8.6 km",
  "2": "12.4 km",
  "3": "14.2 km",
  "4": "10.8 km",
  "5": "7.9 km",
};

export default function DropOffScreen() {
  const router = useRouter();
  const { isDarkMode } = useAppTheme();

  const params = useLocalSearchParams<{
    routeId?: string;
    selectedStudentIds?: string;
  }>();

  const routeId =
    typeof params.routeId === "string" ? params.routeId : "";

  const delayMinutes =
    useTripStore(
      (state) => state.delayMinutes
    );

  const setDelayMinutes =
    useTripStore(
      (state) => state.setDelayMinutes
    );

  const storeStudents =
    useTripStore(
      (state) => state.students
    );

  const loadStudents =
    useTripStore(
      (state) => state.loadStudents
    );

  const updateStoreStudentStatus =
    useTripStore(
      (state) => state.updateStudentStatus
    );

  const resetStoreStudentStatus =
    useTripStore(
      (state) => state.resetStudentStatus
    );

  const selectedStudentIdsParam =
    typeof params.selectedStudentIds === "string"
      ? params.selectedStudentIds
      : "";

  const selectedStudentIds = useMemo(
    () =>
      selectedStudentIdsParam
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    [selectedStudentIdsParam]
  );

  const selectedRoute = useMemo(
    () => getRouteByIdUseCase(routeId),
    [routeId]
  );

  useEffect(() => {
    if (routeId) {
      loadStudents(routeId);
    }
  }, [routeId, loadStudents]);

  const studentList = useMemo<DropOffStudent[]>(() => {
    // Get all students for the selected route from SQLite/Zustand.
    const routeStudents = storeStudents.filter(
      (student) => student.routeId === routeId
    );

    // Home -> Drop-off flow:
    // Home passes selectedStudentIds. Show exactly those selected students
    // even if their SQLite status is still pending.
    if (selectedStudentIds.length > 0) {
      return routeStudents
        .filter((student) =>
          selectedStudentIds.includes(student.id)
        )
        .map((student) => ({
          ...student,
          status:
            student.status === "droppedOff"
              ? "droppedOff"
              : student.status === "absent"
                ? "absent"
                : "pending",
        }));
    }

    // Pickup -> Drop-off flow:
    // If no IDs were passed, only picked-up/already-dropped students
    // are eligible for drop-off.
    return routeStudents
      .filter(
        (student) =>
          student.status === "pickedUp" ||
          student.status === "droppedOff"
      )
      .map((student) => ({
        ...student,
        status:
          student.status === "droppedOff"
            ? "droppedOff"
            : "pending",
      }));
  }, [storeStudents, routeId, selectedStudentIds]);

  useEffect(() => {
    console.log("DROPOFF ROUTE:", routeId);
    console.log("DROPOFF STORE STUDENTS:", storeStudents.length);
    console.log("DROPOFF ELIGIBLE STUDENTS:", studentList.length);
  }, [routeId, storeStudents.length, studentList.length]);

  useEffect(() => {
    console.log(
      "ZUSTAND DROPOFF DELAY:",
      delayMinutes
    );
  }, [delayMinutes]);

  const [expandedLocations, setExpandedLocations] = useState<string[]>([]);

  const [delaySheetVisible, setDelaySheetVisible] = useState(false);
  const [endTripSheetVisible, setEndTripSheetVisible] = useState(false);

  const [selectedHour, setSelectedHour] = useState("0");
  const [selectedMinute, setSelectedMinute] = useState("05");

  const distance = ROUTE_DISTANCE[routeId] ?? "10.0 km";

  const [tripStartedAt] = useState<Date>(
  () => new Date()
);

const tripStartTime =
  tripStartedAt.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );

  const currentLocation =
    selectedRoute?.endLocation ?? "Current location unavailable";

  const colors = {
    background: isDarkMode ? "#081726" : "#F4F8FD",
    card: isDarkMode ? "#10243A" : "#FFFFFF",
    text: isDarkMode ? "#F7FBFF" : "#08285C",
    secondaryText: isDarkMode ? "#A8BAD0" : "#66758E",
    border: isDarkMode ? "#27405B" : "#D8E4F0",
    softBackground: isDarkMode ? "#10263A" : "#F7FAFD",
    inactiveBackground: isDarkMode ? "#1A2E43" : "#EEF3F8",

    successBackground: isDarkMode ? "#123837" : "#E7F6F4",
    successText: isDarkMode ? "#76E2D8" : "#0B7C76",

    absentBackground: isDarkMode ? "#3A2026" : "#FDECEF",
    absentText: isDarkMode ? "#FDA4AF" : "#B94A5A",

    pendingBackground: isDarkMode ? "#102D46" : "#EAF3FC",
    pendingText: isDarkMode ? "#A7CDDA" : "#4F6F8C",

    blueBackground: isDarkMode ? "#102D46" : "#EAF3FC",
    blueText: isDarkMode ? "#76E2D8" : "#0B7C76",

    sheetHandle: isDarkMode ? "#51677E" : "#C9D7E5",
    overlay: "rgba(4,12,24,0.60)",
  };

  // Grouping preserves the order of the students in data/students.ts.
  // So keep each route's students in the same order as the physical stops.
  const locationGroups = useMemo<DropOffLocationGroup[]>(() => {
    const groupMap = new Map<string, DropOffStudent[]>();

    studentList.forEach((student) => {
      const location = student.dropOffLocation || "Location Not Available";
      const current = groupMap.get(location) ?? [];
      groupMap.set(location, [...current, student]);
    });

    return Array.from(groupMap.entries())
      .map(([location, groupedStudents]) => ({
        location,
        students: groupedStudents,
      }))
      .reverse();
  }, [studentList]);

  const droppedOffCount = studentList.filter(
    (student) => student.status === "droppedOff"
  ).length;

  const absentCount = studentList.filter(
    (student) => student.status === "absent"
  ).length;

  const pendingCount = studentList.filter(
    (student) => student.status === "pending"
  ).length;

  const getCurrentTime = () =>
    new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const updateStudentStatus = (
    studentId: string,
    status: DropOffStudentStatus
  ) => {
    updateStoreStudentStatus(
      studentId,
      status
    );
  };

  const markDroppedOff = (selectedStudent: DropOffStudent) => {
    Alert.alert(
      "Drop Off Student",
      `Mark ${selectedStudent.name} as safely dropped off?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Drop Off",
          onPress: () => {
            updateStudentStatus(selectedStudent.id, "droppedOff");

            Alert.alert(
              "Dropped Off Successfully",
              `${selectedStudent.name} was dropped off safely at ${getCurrentTime()}.\n\nParent message: Your child was dropped off safely by the school bus.`
            );
          },
        },
      ]
    );
  };

  const markAbsent = (selectedStudent: DropOffStudent) => {
    Alert.alert(
      "Mark Student Absent",
      `Mark ${selectedStudent.name} as absent?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark Absent",
          style: "destructive",
          onPress: () => updateStudentStatus(selectedStudent.id, "absent"),
        },
      ]
    );
  };

  const toggleLocation = (location: string) => {
    LayoutAnimation.configureNext({
      duration: 360,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });

    setExpandedLocations((currentLocations) =>
      currentLocations.includes(location)
        ? currentLocations.filter((item) => item !== location)
        : [...currentLocations, location]
    );
  };

  const markAllStudentsDroppedOffAtLocation = (
    location: string,
    groupStudents: DropOffStudent[]
  ) => {
    const pendingStudents = groupStudents.filter(
      (student) => student.status === "pending"
    );

    if (pendingStudents.length === 0) {
      Alert.alert(
        "Drop-off Updated",
        `All students at ${location} have already been updated.`
      );
      return;
    }

    Alert.alert(
      "Drop Off Students",
      `Mark all ${pendingStudents.length} pending student${
        pendingStudents.length === 1 ? "" : "s"
      } at ${location} as dropped off?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Drop Off All",
          onPress: () => {
            pendingStudents.forEach(
              (student) => {
                updateStoreStudentStatus(
                  student.id,
                  "droppedOff"
                );
              }
            );
          },
        },
      ]
    );
  };

  const resetStudentStatus = (
    studentId: string
  ) => {
    resetStoreStudentStatus(
      studentId
    );
  };

  const showLocation = async (location: string) => {
  try {
    const encodedLocation = encodeURIComponent(location);

    if (Platform.OS === "android") {
      const googleMapsUrl = `geo:0,0?q=${encodedLocation}`;

      try {
        await Linking.openURL(googleMapsUrl);
      } catch {
        await Linking.openURL(
          `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`
        );
      }

      return;
    }

    // iOS
    await Linking.openURL(
      `http://maps.apple.com/?q=${encodedLocation}`
    );
  } catch (error) {
    console.log("MAP OPEN ERROR:", error);

    Alert.alert(
      "Map Error",
      "Unable to open this location."
    );
  }
};
  const setDelayDuration = (totalMinutes: number) => {
    const safeMinutes = Math.max(0, Math.min(totalMinutes, 12 * 60 + 59));
    const hours = Math.floor(safeMinutes / 60);
    const minutes = safeMinutes % 60;

    setSelectedHour(String(hours));
    setSelectedMinute(String(minutes).padStart(2, "0"));
  };

  const getSelectedDelayMinutes = () =>
    Number(selectedHour) * 60 + Number(selectedMinute);

  const formatDelayDuration = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours} hr ${minutes} min`;
    }

    if (hours > 0) {
      return `${hours} hr`;
    }

    return `${minutes} min`;
  };

  const openDelaySheet = () => {
    const initialDelay = delayMinutes ?? 5;
    setDelayDuration(initialDelay);
    setDelaySheetVisible(true);
  };

  const applyQuickDelay = (minutes: number) => {
    setDelayDuration(minutes);
  };

  const confirmDelay = () => {
    const delayMinutes = getSelectedDelayMinutes();

    if (delayMinutes <= 0) {
      Alert.alert(
        "Select Delay",
        "Please select at least 1 minute of delay."
      );
      return;
    }

    setDelayMinutes(delayMinutes);
    setDelaySheetVisible(false);

    Alert.alert(
      "Delay Added",
      `Trip delayed by ${formatDelayDuration(delayMinutes)}.`
    );
  };

 const confirmEndTrip = () => {

  if (pendingCount > 0) {

    Alert.alert(
      "Pending Students",
      `${pendingCount} student${
        pendingCount === 1 ? "" : "s"
      } still pending. Mark each student as dropped off or absent first.`
    );

    return;
  }


  try {

    const tripEndedAt =
      new Date();


    const durationMilliseconds =
      tripEndedAt.getTime() -
      tripStartedAt.getTime();


    const durationMinutes =
      Math.max(
        1,
        Math.round(
          durationMilliseconds /
            (1000 * 60)
        )
      );


    const routeName =
      selectedRoute
        ? `${selectedRoute.endLocation} → ${selectedRoute.startLocation}`
        : "Unknown Route";


    const tripDate =
      tripEndedAt.toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );


    const startTime =
      tripStartedAt.toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      );


    const endTime =
      tripEndedAt.toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      );


    const tripId =
      `trip_${Date.now()}`;


    saveTripHistory({

      id: tripId,

      routeId: routeId,

      routeName: routeName,

      routePath: routeName,

      busNumber:
        "KL 07 AB 1234",

      tripType:
        "dropoff",

      tripDate:
        tripDate,

      startTime:
        startTime,

      endTime:
        endTime,

      durationMinutes:
        durationMinutes,

      totalStudents:
        studentList.length,

      completedStudents:
        droppedOffCount,

      absentStudents:
        absentCount,

      status:
        "completed",

      createdAt:
        tripEndedAt.toISOString(),

    });


    console.log(
      "DROPOFF TRIP HISTORY SAVED:",
      {
        id: tripId,
        routeId,
        routeName,
        totalStudents:
          studentList.length,
        droppedOffCount,
        absentCount,
        startTime,
        endTime,
        durationMinutes,
      }
    );


    setEndTripSheetVisible(
      false
    );


    Alert.alert(
      "Trip Completed",
      "Drop-off trip completed successfully.",
      [
        {
          text: "OK",

          onPress: () => {

            router.replace(
              "/(tabs)"
            );

          },
        },
      ]
    );


  } catch (error) {

    console.log(
      "DROPOFF HISTORY SAVE ERROR:",
      error
    );


    Alert.alert(
      "Error",
      "Unable to save drop-off trip history."
    );

  }

};

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "bottom", "left", "right"]}
    >
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backIcon, { color: colors.text }]}>‹</Text>
        </Pressable>

        <View style={styles.headerContent}>
          <Text style={[styles.heading, { color: colors.text }]}>Drop-off Trip</Text>
        </View>

        <View
          style={[
            styles.liveBadge,
            { backgroundColor: colors.successBackground },
          ]}
        >
          <View style={styles.liveDot} />
          <Text style={[styles.liveText, { color: colors.successText }]}>LIVE</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Compact Current Route + Current Location */}
        <View style={styles.routeCard}>
          <View style={styles.routeTopRow}>
            <View style={styles.routeContent}>
              <Text style={styles.routeSmallLabel}>CURRENT ROUTE</Text>

              <Text style={styles.routePathMain} numberOfLines={2}>
                {selectedRoute
                  ? `${selectedRoute.endLocation} → ${selectedRoute.startLocation}`
                  : "Route not available"}
              </Text>
            </View>

            <View style={styles.routeBusIconContainer}>
              <Ionicons name="shield-checkmark-outline" size={27} color="#78E2D7" />
            </View>
          </View>

          <View style={styles.routeMetaRow}>
            <Text style={styles.routeMetaText}>KL 07 AB 1234</Text>
            <View style={styles.routeMetaDot} />
            <Text style={styles.routeMetaText}>Start {tripStartTime}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.currentLocationInline,
              pressed && styles.currentLocationInlinePressed,
            ]}
            onPress={() => showLocation(currentLocation)}
          >
            <View style={styles.currentLocationInlineIcon}>
              <Ionicons name="location-outline" size={17} color="#78E2D7" />
            </View>

            <View style={styles.currentLocationInlineContent}>
              <Text style={styles.currentLocationInlineLabel}>
                CURRENT LOCATION
              </Text>
              <Text style={styles.currentLocationInlineName}>
                {currentLocation}
              </Text>
            </View>

            <Text style={styles.currentLocationInlineMap}>Map ›</Text>
          </Pressable>
        </View>

        {delayMinutes !== null && (
          <View
            style={[
              styles.delayNotice,
              {
                backgroundColor: colors.pendingBackground,
                borderColor: colors.pendingText,
              },
            ]}
          >
            <Ionicons name="time-outline" size={20} color={colors.pendingText} style={styles.delayNoticeIcon} />

            <View style={styles.delayNoticeContent}>
              <Text
                style={[styles.delayNoticeTitle, { color: colors.pendingText }]}
              >
                Trip Delay
              </Text>
              <Text
                style={[
                  styles.delayNoticeText,
                  { color: colors.secondaryText },
                ]}
              >
                {formatDelayDuration(delayMinutes)}
              </Text>
            </View>

            <Pressable
              style={[
                styles.editDelayButton,
                { backgroundColor: colors.inactiveBackground },
              ]}
              onPress={openDelaySheet}
            >
              <Text style={[styles.editDelayText, { color: colors.text }]}>Edit</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.pickupSectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Drop-off Locations
          </Text>
        </View>

        {locationGroups.length === 0 ? (
          <View
            style={[
              styles.emptyContainer,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="people-outline" size={36} color={colors.secondaryText} style={styles.emptyIcon} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No students found
            </Text>
            <Text
              style={[styles.emptyDescription, { color: colors.secondaryText }]}
            >
              No students are selected for this drop-off route.
            </Text>
          </View>
        ) : (
          locationGroups.map((group, groupIndex) => {
            const isExpanded = expandedLocations.includes(group.location);

            const groupPickedCount = group.students.filter(
              (student) => student.status === "droppedOff"
            ).length;

            const groupAbsentCount = group.students.filter(
              (student) => student.status === "absent"
            ).length;

            const groupPendingCount = group.students.filter(
              (student) => student.status === "pending"
            ).length;

            const allStudentsUpdated = groupPendingCount === 0;

            return (
              <View
                key={group.location}
                style={[
                  styles.locationGroupCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.stopHeader,
                    pressed && styles.locationHeaderPressed,
                  ]}
                  onPress={() => toggleLocation(group.location)}
                >
                  <View
                    style={[
                      styles.stopNumber,
                      { backgroundColor: colors.blueBackground },
                    ]}
                  >
                    <Text
                      style={[
                        styles.stopNumberText,
                        { color: colors.blueText },
                      ]}
                    >
                      {groupIndex + 1}
                    </Text>
                  </View>

                  <View style={styles.stopHeaderContent}>
                    <Text style={[styles.stopName, { color: colors.text }]}>
                      {group.location}
                    </Text>

                    <Text
                      style={[
                        styles.stopStudentCount,
                        { color: colors.secondaryText },
                      ]}
                    >
                      {group.students.length} student
                      {group.students.length === 1 ? "" : "s"}
                      {groupPickedCount > 0 ? ` • ${groupPickedCount} dropped` : ""}
                      {groupAbsentCount > 0 ? ` • ${groupAbsentCount} absent` : ""}
                    </Text>
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.stopMapButton,
                      { backgroundColor: colors.blueBackground },
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={(event) => {
                      event.stopPropagation();
                      showLocation(group.location);
                    }}
                  >
                    <Ionicons name="location-outline" size={17} color={colors.blueText} />
                  </Pressable>

                  <Pressable
                    disabled={allStudentsUpdated}
                    style={({ pressed }) => [
                      styles.locationSelectAllButton,
                      {
                        backgroundColor: allStudentsUpdated
                          ? colors.inactiveBackground
                          : colors.successBackground,
                        borderColor: allStudentsUpdated
                          ? colors.border
                          : colors.successText,
                      },
                      pressed && !allStudentsUpdated && styles.buttonPressed,
                    ]}
                    onPress={(event) => {
                      event.stopPropagation();
                      markAllStudentsDroppedOffAtLocation(
                        group.location,
                        group.students
                      );
                    }}
                  >
                    <Text
                      style={[
                        styles.locationSelectAllText,
                        {
                          color: allStudentsUpdated
                            ? colors.secondaryText
                            : colors.successText,
                        },
                      ]}
                    >
                      {allStudentsUpdated ? "Done" : "✓ All"}
                    </Text>
                  </Pressable>

                  <View style={styles.expandIconContainer}>
                    <Text
                      style={[styles.expandIcon, { color: colors.secondaryText }]}
                    >
                      {isExpanded ? "⌃" : "⌄"}
                    </Text>
                  </View>
                </Pressable>

                {isExpanded && (
                  <>
                    <View
                      style={[styles.divider, { backgroundColor: colors.border }]}
                    />

                    {group.students.map((student, index) => {
                      const isDroppedOff =
                        student.status === "droppedOff";
                      const isAbsent =
                        student.status === "absent";
                      const isLastStudent =
                        index === group.students.length - 1;

                      return (
                        <View
                          key={student.id}
                          style={styles.studentTimelineRow}
                        >
                          <View style={styles.timelineColumn}>
                            <View
                              style={[
                                styles.timelineDot,
                                {
                                  backgroundColor: isDroppedOff
                                    ? colors.successText
                                    : isAbsent
                                      ? colors.absentText
                                      : colors.blueText,
                                },
                              ]}
                            />

                            {!isLastStudent && (
                              <View
                                style={[
                                  styles.timelineLine,
                                  {
                                    backgroundColor:
                                      colors.border,
                                  },
                                ]}
                              />
                            )}
                          </View>

                          <Pressable
                            style={styles.timelineStudentContent}
                            onPress={() =>
                              router.push(
                                `/student-details?studentId=${student.id}&mode=dropoff`
                              )
                            }
                          >
                            <Text
                              style={[
                                styles.timelineStudentName,
                                {
                                  color: colors.text,
                                },
                              ]}
                            >
                              {student.name}
                            </Text>

                            <Text
                              style={[
                                styles.timelineStudentClass,
                                {
                                  color:
                                    colors.secondaryText,
                                },
                              ]}
                            >
                              Class {student.className} - {student.division}
                            </Text>

                            {(isDroppedOff || isAbsent) && (
                              <Text
                                style={[
                                  styles.timelineStatusText,
                                  {
                                    color: isDroppedOff
                                      ? colors.successText
                                      : colors.absentText,
                                  },
                                ]}
                              >
                                {isDroppedOff
                                  ? "✓ Dropped Off"
                                  : "✕ Absent"}
                              </Text>
                            )}
                          </Pressable>

                          {!isDroppedOff && !isAbsent ? (
                            <View style={styles.timelineActions}>
                              <Pressable
                                style={({ pressed }) => [
                                  styles.timelineActionButton,
                                  {
                                    backgroundColor:
                                      colors.absentBackground,
                                    borderColor:
                                      colors.absentText,
                                  },
                                  pressed &&
                                    styles.buttonPressed,
                                ]}
                                onPress={() =>
                                  markAbsent(student)
                                }
                              >
                                <Text
                                  style={[
                                    styles.timelineActionIcon,
                                    {
                                      color:
                                        colors.absentText,
                                    },
                                  ]}
                                >
                                  ✕
                                </Text>
                              </Pressable>

                              <Pressable
                                style={({ pressed }) => [
                                  styles.timelineActionButton,
                                  styles.timelinePickupButton,
                                  pressed &&
                                    styles.buttonPressed,
                                ]}
                                onPress={() =>
                                  markDroppedOff(student)
                                }
                              >
                                <Text
                                  style={
                                    styles.timelinePickupIcon
                                  }
                                >
                                  ✓
                                </Text>
                              </Pressable>
                            </View>
                          ) : (
                            <Pressable
                              style={({ pressed }) => [
                                styles.timelineUndoButton,
                                {
                                  backgroundColor:
                                    colors.inactiveBackground,
                                },
                                pressed &&
                                  styles.buttonPressed,
                              ]}
                              onPress={() =>
                                resetStudentStatus(
                                  student.id
                                )
                              }
                            >
                              <Text
                                style={[
                                  styles.timelineUndoText,
                                  {
                                    color: colors.text,
                                  },
                                ]}
                              >
                                Undo
                              </Text>
                            </Pressable>
                          )}
                        </View>
                      );
                    })}
                  </>
                )}
              </View>
            );
          })
        )}

      </ScrollView>

      {/* FIXED BOTTOM BUTTONS */}
<View
  style={[
    styles.bottomActionRow,
    {
      backgroundColor: colors.background,
      borderTopColor: colors.border,
    },
  ]}
>
  <Pressable
    style={({ pressed }) => [
      styles.delayButton,
      pressed && styles.buttonPressed,
    ]}
    onPress={openDelaySheet}
  >
    <Text style={styles.bottomButtonIcon}>⏱️</Text>
    <Text style={styles.delayButtonText}>Delay</Text>
  </Pressable>

  <Pressable
    style={({ pressed }) => [
      styles.endTripButton,
      pressed && styles.buttonPressed,
    ]}
    onPress={() => setEndTripSheetVisible(true)}
  >
    <Text style={styles.bottomButtonIcon}>■</Text>
    <Text style={styles.endTripButtonText}>End Trip</Text>
  </Pressable>
</View>

   <DelayBottomSheet
      visible={delaySheetVisible}
      selectedHour={selectedHour}
      selectedMinute={selectedMinute}
      isDarkMode={isDarkMode}
      onHourChange={setSelectedHour}
      onMinuteChange={setSelectedMinute}
      onQuickDelay={applyQuickDelay}
      onCancel={() => setDelaySheetVisible(false)}
      onConfirm={confirmDelay}
    />

      {/* End Trip Bottom Sheet */}
      <EndTripBottomSheet
        visible={endTripSheetVisible}
        tripType="dropoff"
       routeName={
          selectedRoute
            ? `${selectedRoute.endLocation} → ${selectedRoute.startLocation}`
            : "-"
        }
        presentCount={droppedOffCount}
        absentCount={absentCount}
        pendingCount={pendingCount}
        distance={distance}
        startTime={tripStartTime}
        endTime={getCurrentTime()}
        isDarkMode={isDarkMode}
        onCancel={() => setEndTripSheetVisible(false)}
        onEndTrip={confirmEndTrip}
      />

    </SafeAreaView>
  );
}

type CompactDetailRowProps = {
  label: string;
  value: string;
  textColor: string;
  secondaryColor: string;
};

function CompactDetailRow({
  label,
  value,
  textColor,
  secondaryColor,
}: CompactDetailRowProps) {
  return (
    <View style={styles.compactDetailRow}>
      <Text style={[styles.compactDetailLabel, { color: secondaryColor }]}>
        {label} :
      </Text>
      <Text style={[styles.compactDetailValue, { color: textColor }]}>{value}</Text>
    </View>
  );
}

type WheelColumnProps = {
  values: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
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
  const listRef = useRef<FlatList<string>>(null);
  const internalSelectionRef = useRef(false);
  const mountedRef = useRef(false);

  const selectedIndex = Math.max(0, values.indexOf(selectedValue));

  useEffect(() => {
    const timer = setTimeout(() => {
      if (internalSelectionRef.current) {
        internalSelectionRef.current = false;
        return;
      }

      listRef.current?.scrollToOffset({
        offset: selectedIndex * WHEEL_ITEM_HEIGHT,
        animated: mountedRef.current,
      });

      mountedRef.current = true;
    }, 30);

    return () => clearTimeout(timer);
  }, [selectedIndex]);

  const commitOffset = (offsetY: number) => {
    const index = Math.max(
      0,
      Math.min(values.length - 1, Math.round(offsetY / WHEEL_ITEM_HEIGHT))
    );

    const nextValue = values[index];

    if (nextValue !== selectedValue) {
      internalSelectionRef.current = true;
      onValueChange(nextValue);
    }
  };

  return (
    <View style={styles.wheelColumn}>
      <FlatList
        ref={listRef}
        data={values}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        nestedScrollEnabled
        snapToInterval={WHEEL_ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={styles.wheelContent}
        getItemLayout={(_, index) => ({
          length: WHEEL_ITEM_HEIGHT,
          offset: WHEEL_ITEM_HEIGHT * index,
          index,
        })}
        onMomentumScrollEnd={(event) =>
          commitOffset(event.nativeEvent.contentOffset.y)
        }
        onScrollEndDrag={(event) => {
          const velocity = Math.abs(event.nativeEvent.velocity?.y ?? 0);
          if (velocity < 0.08) {
            commitOffset(event.nativeEvent.contentOffset.y);
          }
        }}
        renderItem={({ item }) => {
          const isSelected = item === selectedValue;

          return (
            <View style={styles.wheelItem}>
              <Text
                style={[
                  styles.wheelItemText,
                  {
                    color: isSelected ? textColor : fadedTextColor,
                    opacity: isSelected ? 1 : 0.3,
                  },
                  isSelected && styles.selectedWheelItemText,
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    marginTop: 4,
    marginBottom: 12,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  backIcon: {
    fontSize: 31,
    lineHeight: 33,
  },

  headerContent: {
    flex: 1,
  },

  heading: {
    fontSize: 22,
    fontWeight: "900",
  },

  liveBadge: {
    borderRadius: 11,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#079A96",
    marginRight: 5,
  },

  liveText: {
    fontSize: 9,
    fontWeight: "900",
  },

scrollContent: {
  paddingHorizontal: 18,
  paddingBottom: 10,
},
  routeCard: {
    backgroundColor: "#0F5DA8",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#1768C4",
    paddingHorizontal: 17,
    paddingVertical: 15,
    marginBottom: 18,
    elevation: 3,
  },

  routeTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  routeContent: {
    flex: 1,
  },

  routeSmallLabel: {
    color: "#CFE3F7",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  routePathMain: {
    color: "#ffffff",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
    marginTop: 4,
  },

  routeBusIconContainer: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "rgba(114,222,210,0.13)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  routeBusIcon: {
    fontSize: 23,
  },

  routeMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
  },

  routeMetaText: {
    color: "#CFE3F7",
    fontSize: 9,
    fontWeight: "700",
  },

  routeMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#CFE3F7",
    marginHorizontal: 8,
  },

  currentLocationInline: {
    marginTop: 11,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.25)",
    flexDirection: "row",
    alignItems: "center",
  },

  currentLocationInlinePressed: {
    opacity: 0.75,
  },

  currentLocationInlineIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "rgba(114,222,210,0.13)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  currentLocationInlineEmoji: {
    fontSize: 15,
  },

  currentLocationInlineContent: {
    flex: 1,
  },

  currentLocationInlineLabel: {
    color: "#CFE3F7",
    fontSize: 7.5,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  currentLocationInlineName: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },

  currentLocationInlineMap: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 8,
  },

  delayNotice: {
    borderWidth: 1,
    borderRadius: 13,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  delayNoticeIcon: {
    fontSize: 19,
    marginRight: 8,
  },

  delayNoticeContent: {
    flex: 1,
  },

  delayNoticeTitle: {
    fontSize: 11,
    fontWeight: "900",
  },

  delayNoticeText: {
    fontSize: 9,
    marginTop: 2,
  },

  editDelayButton: {
    minWidth: 48,
    minHeight: 31,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 7,
  },

  editDelayText: {
    fontSize: 9,
    fontWeight: "900",
  },

  pickupSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 9,
  },

  locationHeaderPressed: {
    opacity: 0.75,
  },

  locationSelectAllButton: {
    minWidth: 54,
    height: 31,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },

  locationSelectAllText: {
    fontSize: 9,
    fontWeight: "900",
  },

  expandIconContainer: {
    width: 25,
    height: 31,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 3,
  },

  expandIcon: {
    fontSize: 18,
    fontWeight: "900",
  },


  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 0,
  },

  locationGroupCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
  },

  stopHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  stopNumber: {
    width: 33,
    height: 33,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  stopNumberText: {
    fontSize: 12,
    fontWeight: "900",
  },

  stopHeaderContent: {
    flex: 1,
  },

  stopName: {
    fontSize: 14,
    fontWeight: "900",
  },

  stopStudentCount: {
    fontSize: 8,
    marginTop: 3,
  },

  stopMapButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },

  stopMapIcon: {
    fontSize: 16,
  },

  divider: {
    height: 1,
    marginVertical: 9,
  },

  studentRow: {
    minHeight: 64,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },

  studentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  studentAvatarText: {
    fontSize: 14,
    fontWeight: "900",
  },

  studentContent: {
    flex: 1,
  },

  studentName: {
    fontSize: 13,
    fontWeight: "900",
  },

  studentMeta: {
    fontSize: 8.5,
    marginTop: 2,
  },

  studentStatusText: {
    fontSize: 8.5,
    fontWeight: "900",
    marginTop: 3,
  },

  studentActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 6,
  },

  statusActionButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 5,
  },

  successActionButton: {
    backgroundColor: "#079A96",
    borderColor: "#079A96",
  },

  statusActionIcon: {
    fontSize: 16,
    fontWeight: "900",
  },

  successActionIcon: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "900",
  },

  undoButton: {
    minWidth: 50,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },

  undoText: {
    fontSize: 9,
    fontWeight: "900",
  },


  studentTimelineRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "stretch",
  },

  timelineColumn: {
    width: 24,
    alignItems: "center",
  },

  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 11,
  },

  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 3,
    marginBottom: -1,
  },

  timelineStudentContent: {
    flex: 1,
    paddingLeft: 8,
    paddingTop: 5,
    paddingBottom: 9,
  },

  timelineStudentName: {
    fontSize: 13,
    fontWeight: "900",
  },

  timelineStudentClass: {
    fontSize: 9,
    marginTop: 2,
  },

  timelineStatusText: {
    fontSize: 8.5,
    fontWeight: "900",
    marginTop: 3,
  },

  timelineActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 5,
  },

  timelineActionButton: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 5,
  },

  timelinePickupButton: {
    backgroundColor: "#079A96",
    borderColor: "#079A96",
  },

  timelineActionIcon: {
    fontSize: 15,
    fontWeight: "900",
  },

  timelinePickupIcon: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },

  timelineUndoButton: {
    minWidth: 48,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginLeft: 6,
  },

  timelineUndoText: {
    fontSize: 9,
    fontWeight: "900",
  },

bottomActionRow: {
  flexDirection: "row",
  paddingHorizontal: 18,
  paddingTop: 10,
  paddingBottom: 10,
  borderTopWidth: 1,
},

  delayButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#D8E4F0",
    backgroundColor: "#EEF3F8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  endTripButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#0F5DA8",
    backgroundColor: "#0F5DA8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  bottomButtonIcon: {
    color: "#08285C",
    fontSize: 13,
    marginRight: 6,
  },

  delayButtonText: {
    color: "#08285C",
    fontSize: 12,
    fontWeight: "900",
  },

  endTripButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },

  emptyContainer: {
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 14,
  },

  emptyIcon: {
    fontSize: 38,
    marginBottom: 8,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "900",
  },

  emptyDescription: {
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 5,
  },

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
    paddingBottom: Platform.OS === "android" ? 32 : 24,
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

  wheelTimeContainer: {
    height: WHEEL_HEIGHT,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    overflow: "hidden",
    position: "relative",
    paddingHorizontal: 18,
  },

  wheelSelectionBand: {
    position: "absolute",
    left: 14,
    right: 14,
    top: WHEEL_ITEM_HEIGHT,
    height: WHEEL_ITEM_HEIGHT,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
  },

  wheelColumn: {
    flex: 1,
    height: WHEEL_HEIGHT,
  },

  wheelContent: {
    paddingVertical: WHEEL_ITEM_HEIGHT,
  },

  wheelItem: {
    height: WHEEL_ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
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
  },

  sheetCancelButton: {
    minWidth: 96,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  sheetCancelText: {
    fontSize: 11,
    fontWeight: "900",
  },

  addDelayButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#079A96",
    alignItems: "center",
    justifyContent: "center",
  },

  addDelayText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
  },

  compactDetailsList: {
    marginTop: 14,
  },

  compactDetailRow: {
    minHeight: 31,
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 3,
  },

  compactDetailLabel: {
    width: 88,
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 17,
  },

  compactDetailValue: {
    flex: 1,
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 17,
  },

  pendingWarning: {
    minHeight: 40,
    borderRadius: 11,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  pendingWarningIcon: {
    fontSize: 14,
    marginRight: 7,
  },

  pendingWarningText: {
    flex: 1,
    fontSize: 9,
    fontWeight: "800",
  },

  confirmEndButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#0F5DA8",
    alignItems: "center",
    justifyContent: "center",
  },

  disabledEndButton: {
    opacity: 0.5,
  },

  confirmEndText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
  },

  buttonPressed: {
    opacity: 0.72,
  },
});