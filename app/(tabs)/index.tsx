import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Alert,
  Animated,
  Easing,
  Modal,
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
  Picker,
} from "@react-native-picker/picker";

import {
  useRouter,
} from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import { routes } from "../../data/routes";
import {
  useAuth,
} from "../../context/AuthContext";

import {
  useAppTheme,
} from "../../context/ThemeContext";

import {
  useTripStore,
} from "../../store/useTripStore";

export default function HomeScreen() {
 const router =
    useRouter();

  const {
    isDarkMode,
  } = useAppTheme();


  const {
    appUser,
    logout,
  } = useAuth();


  // =============================
  // LOGGED-IN DRIVER ROUTES
  // =============================

  const driverRoutes = useMemo(() => {
    if (!appUser?.phone) {
      return [];
    }

    return routes.filter(
      (route) =>
        route.driverPhone === appUser.phone
    );
  }, [appUser?.phone]);


  const [
    profileVisible,
    setProfileVisible,
  ] = useState(false);

  const [
    selectedRouteId,
    setSelectedRouteId,
  ] = useState("");

  const [
    showDropOffStudents,
    setShowDropOffStudents,
  ] = useState(false);

  const [
    selectedStudentIds,
    setSelectedStudentIds,
  ] = useState<string[]>([]);

  const selectedRoute = driverRoutes.find(
    (route) =>
      route.id === selectedRouteId
  );

  const storeStudents =
    useTripStore(
      (state) => state.students
    );

  const loadStudents =
    useTripStore(
      (state) => state.loadStudents
    );

  const routeStudents = useMemo(
    () =>
      storeStudents.filter(
        (student) =>
          student.routeId ===
          selectedRouteId
      ),
    [storeStudents, selectedRouteId]
  );

  
  // Group students by drop-off location for the Home drop-off list.
  const groupedDropOffStudents = useMemo(() => {
    return routeStudents.reduce<Record<string, typeof routeStudents>>(
      (groups, student) => {
        const location = student.dropOffLocation || "Unknown Location";

        if (!groups[location]) {
          groups[location] = [];
        }

        groups[location].push(student);
        return groups;
      },
      {}
    );
  }, [routeStudents]);

  const saveSelectedRouteId =
    useTripStore(
      (state) =>
        state.setSelectedRouteId
    );

  const storedRouteId =
    useTripStore(
      (state) =>
        state.selectedRouteId
    );

  const syncStudentsFromApi =
    useTripStore(
      (state) =>
        state.syncStudentsFromApi
    );

  const apiStudents =
    useTripStore(
      (state) =>
        state.apiStudents
    );

  const apiLoading =
    useTripStore(
      (state) =>
        state.apiLoading
    );

  const apiError =
    useTripStore(
      (state) =>
        state.apiError
    );

  useEffect(() => {
    console.log(
      "ZUSTAND ROUTE:",
      storedRouteId
    );
  }, [storedRouteId]);

  useEffect(() => {
    const syncStudents = async () => {
      await syncStudentsFromApi();

      console.log(
        "STUDENT SYNC COMPLETED"
      );
    };

    syncStudents();
  }, [syncStudentsFromApi]);

  useEffect(() => {
    console.log(
      "API LOADING:",
      apiLoading
    );
    console.log(
      "API STUDENTS:",
      apiStudents.length
    );
    console.log(
      "API ERROR:",
      apiError
    );
  }, [
    apiLoading,
    apiStudents,
    apiError,
  ]);

  // Load the selected route from SQLite into Zustand.
  // Home, Pickup and Drop-off now use the same data source.
  useEffect(() => {
    if (selectedRouteId) {
      loadStudents(selectedRouteId);
    }
  }, [selectedRouteId, loadStudents]);

  // After API -> SQLite sync finishes, refresh the currently
  // selected route so Home never keeps the old seeded list.
  useEffect(() => {
    if (
      selectedRouteId &&
      !apiLoading &&
      apiStudents.length > 0
    ) {
      loadStudents(selectedRouteId);
    }
  }, [
    selectedRouteId,
    apiLoading,
    apiStudents.length,
    loadStudents,
  ]);

  const allStudentsSelected =
    routeStudents.length > 0 &&
    selectedStudentIds.length ===
      routeStudents.length;

  const colors = {
    background: isDarkMode
      ? "#081726"
      : "#F4F8FD",

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

    pickerText: isDarkMode
      ? "#F7FBFF"
      : "#08285C",

    selectedRouteBackground:
      isDarkMode
        ? "#102D46"
        : "#EAF3FC",

    selectedRouteTitle:
      isDarkMode
        ? "#71D9D2"
        : "#0A6D73",

    selectedRouteText:
      isDarkMode
        ? "#D0DCE8"
        : "#536B83",

    studentBackground:
      isDarkMode
        ? "#10263A"
        : "#F7FAFD",

    selectedStudentBackground:
      isDarkMode
        ? "#123837"
        : "#E7F6F4",

    accentText: isDarkMode
      ? "#76E2D8"
      : "#0B7C76",

    checkboxBackground:
      isDarkMode
        ? "#10243A"
        : "#FFFFFF",

    inactiveBackground:
      isDarkMode
        ? "#1A2E43"
        : "#EEF3F8",
  };

  const resetDropOffSelection = () => {
    setSelectedStudentIds([]);
    setShowDropOffStudents(false);
  };

  // Keep the selected route inside the currently logged-in driver's routes.
  // This prevents one driver's selected route from appearing for another driver.
  useEffect(() => {
    if (!appUser?.phone) {
      return;
    }

    const selectedRouteBelongsToDriver =
      driverRoutes.some(
        (route) =>
          route.id === selectedRouteId
      );

    if (selectedRouteId && !selectedRouteBelongsToDriver) {
      setSelectedRouteId("");
      saveSelectedRouteId("");
      setSelectedStudentIds([]);
      setShowDropOffStudents(false);
      return;
    }

    if (!selectedRouteId && storedRouteId) {
      const storedRouteBelongsToDriver =
        driverRoutes.some(
          (route) =>
            route.id === storedRouteId
        );

      if (storedRouteBelongsToDriver) {
        setSelectedRouteId(storedRouteId);
      } else {
        saveSelectedRouteId("");
      }
    }
  }, [
    appUser?.phone,
    driverRoutes,
    selectedRouteId,
    storedRouteId,
    saveSelectedRouteId,
  ]);

  const handleRouteChange = (
    routeId: string
  ) => {
    setSelectedRouteId(routeId);
    saveSelectedRouteId(routeId);

    resetDropOffSelection();
  };

  const openPickupScreen = () => {
    if (!selectedRouteId) {
      Alert.alert(
        "Select Route",
        "Please select a route before starting pickup."
      );

      return;
    }

    router.push({
      pathname: "/pickup",
      params: {
        routeId: selectedRouteId,
      },
    });
  };

  const handleDropOffButton = () => {
    if (!selectedRouteId) {
      Alert.alert(
        "Select Route",
        "Please select a route before starting drop off."
      );

      return;
    }

    setShowDropOffStudents(
      (currentValue) =>
        !currentValue
    );
  };

  const toggleStudentSelection = (
    studentId: string
  ) => {
    setSelectedStudentIds(
      (currentStudentIds) => {
        const alreadySelected =
          currentStudentIds.includes(
            studentId
          );

        if (alreadySelected) {
          return currentStudentIds.filter(
            (id) => id !== studentId
          );
        }

        return [
          ...currentStudentIds,
          studentId,
        ];
      }
    );
  };

  const toggleSelectAll = () => {
    if (allStudentsSelected) {
      setSelectedStudentIds([]);
      return;
    }

    setSelectedStudentIds(
      routeStudents.map(
        (student) => student.id
      )
    );
  };

  const cancelDropOffSelection = () => {
    resetDropOffSelection();
  };

  const continueDropOff = () => {
    if (
      selectedStudentIds.length === 0
    ) {
      Alert.alert(
        "Select Students",
        "Please select at least one student for drop off."
      );

      return;
    }

    router.push({
      pathname: "/dropoff",
      params: {
        routeId: selectedRouteId,

        selectedStudentIds:
          selectedStudentIds.join(","),
      },
    });
  };


// =============================
// GREETING
// =============================

  const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning";
  }

  if (hour < 17) {
    return "Good Afternoon";
  }

  return "Good Evening";
};

const handleLogout = () => {
  Alert.alert(
    "Logout",
    "Are you sure you want to logout?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            setProfileVisible(false);

            await logout();

            console.log("USER LOGGED OUT");
          } catch (error) {
            console.log(
              "LOGOUT ERROR:",
              error
            );

            Alert.alert(
              "Logout Failed",
              "Unable to logout. Please try again."
            );
          }
        },
      },
    ]
  );
};

  return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
          },
        ]}
        edges={[
          "top",
          "left",
          "right",
        ]}
      >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* Header */}

       {/* ========================= */}
{/* HEADER */}
{/* ========================= */}

<View style={styles.header}>

  <View style={styles.headerUserContent}>

    <Text
      style={[
        styles.greetingText,
        {
          color:
            colors.secondaryText,
        },
      ]}
    >
      {getGreeting()},
    </Text>

    <Text
      style={[
        styles.welcomeText,
        {
          color: colors.text,
        },
      ]}
      numberOfLines={1}
    >
      {appUser?.name || "Driver"} 👋
    </Text>

  </View>


  <Pressable
    style={({ pressed }) => [
      styles.profileButton,
      {
        backgroundColor:
          colors.card,

        borderColor:
          colors.border,
      },

      pressed &&
        styles.buttonPressed,
    ]}
    onPress={() =>
      setProfileVisible(true)
    }
  >

    <Ionicons
      name="person-outline"
      size={23}
      color={colors.text}
    />

  </Pressable>

</View>

        {/* Today's Trip */}

        <View style={styles.tripCard}>
          <View style={styles.tripTopRow}>
            <View style={styles.tripContent}>
              <Text
                style={styles.tripLabel}
              >
                Today&apos;s Trip
              </Text>

              <Text
                style={styles.tripTitle}
              >
                Morning School Trip
              </Text>

              <Text
                style={styles.busNumber}
              >
                Bus: KL 07 AB 1234
              </Text>
            </View>

            <View
              style={
                styles.busIconContainer
              }
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={31}
                color="#78E2D7"
              />
            </View>
          </View>

          <View style={styles.tripInfoRow}>
            <View
              style={styles.tripInfoItem}
            >
              <Text
                style={
                  styles.tripInfoLabel
                }
              >
                Trip Type
              </Text>

              <Text
                style={
                  styles.tripInfoValue
                }
              >
                Morning Pickup
              </Text>
            </View>

            <View
              style={
                styles.tripInfoDivider
              }
            />

            <View
              style={styles.tripInfoItem}
            >
              <Text
                style={
                  styles.tripInfoLabel
                }
              >
                Status
              </Text>

              <Text
                style={
                  styles.tripInfoValue
                }
              >
                Ready to Start
              </Text>
            </View>
          </View>

          {selectedRoute && (
            <View style={styles.currentRouteContainer}>
              <View style={styles.currentRouteHeader}>
                <Ionicons
                  name="location-outline"
                  size={18}
                  color="#78E2D7"
                  style={styles.currentRouteIcon}
                />

                <Text style={styles.currentRouteLabel}>
                  Current Route
                </Text>
              </View>

              <MarqueeText
                text={`${selectedRoute.startLocation} → ${selectedRoute.endLocation}`}
              />
            </View>
          )}


        </View>

        {/* Route Selection */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Select Route
        </Text>

        <Text
          style={[
            styles.sectionDescription,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          Select a route before starting
          pickup or drop off.
        </Text>

        <View
          style={[
            styles.pickerContainer,
            {
              backgroundColor:
                colors.card,

              borderColor:
                colors.border,
            },
          ]}
        >
          <Picker
            selectedValue={
              selectedRouteId
            }
            onValueChange={
              handleRouteChange
            }
            style={[
              styles.picker,
              {
                color:
                  colors.pickerText,
              },
            ]}
            dropdownIconColor={
              colors.pickerText
            }
          >
            <Picker.Item
              label="Choose a route"
              value=""
              color={
                isDarkMode
                  ? "#9ca3af"
                  : "#737b8c"
              }
            />

             {driverRoutes.map((route) => (
              <Picker.Item
                key={route.id}
                label={`Route ${route.routeName}: ${route.startLocation} → ${route.endLocation}`}
                value={route.id}
                color={
                  isDarkMode
                    ? "#f9fafb"
                    : "#172033"
                }
              />
            ))}
          </Picker>
        </View>

        {/* Selected Route */}

      

        {/* Start Trip */}

        <Text
          style={[
            styles.sectionTitle,
            styles.actionSectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Start Trip
        </Text>

        <View style={styles.actionContainer}>
          {/* Pickup */}

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.pickupButton,

              !selectedRouteId &&
                styles.disabledActionButton,

              pressed &&
                selectedRouteId !== "" &&
                styles.buttonPressed,
            ]}
            onPress={openPickupScreen}
          >
            <View
              style={
                styles.actionIconContainer
              }
            >
              <Ionicons
                name="people-outline"
                size={24}
                color="#FFFFFF"
              />
            </View>

            <View
              style={styles.actionContent}
            >
              <Text
                style={styles.actionTitle}
              >
                Pick Up
              </Text>

              <Text
                style={
                  styles.actionDescription
                }
              >
                View students and start
                morning pickup
              </Text>
            </View>

            <Text
              style={styles.actionArrow}
            >
              ›
            </Text>
          </Pressable>

          {/* Drop Off */}

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.dropOffButton,

              !selectedRouteId &&
                styles.disabledActionButton,

              pressed &&
                selectedRouteId !== "" &&
                styles.buttonPressed,
            ]}
            onPress={
              handleDropOffButton
            }
          >
            <View
              style={
                styles.actionIconContainer
              }
            >
              <Ionicons
                name="home-outline"
                size={29}
                color="#FFFFFF"
              />
            </View>

            <View
              style={styles.actionContent}
            >
              <Text
                style={styles.actionTitle}
              >
                Drop Off
              </Text>

              <Text
                style={
                  styles.actionDescription
                }
              >
                Select students for drop off
              </Text>
            </View>

            <Text
              style={styles.actionArrow}
            >
              {showDropOffStudents
                ? "⌃"
                : "⌄"}
            </Text>
          </Pressable>
        </View>

        {/* Drop-off Student List */}

        {showDropOffStudents && (
          <View
            style={[
              styles.dropOffSection,
              {
                backgroundColor:
                  colors.card,

                borderColor:
                  colors.border,
              },
            ]}
          >
            <View
              style={
                styles.dropOffHeader
              }
            >
              <View
                style={
                  styles.dropOffHeaderText
                }
              >
                <Text
                  style={[
                    styles.dropOffHeading,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  Drop-off for Students
                </Text>

                <Text
                  style={[
                    styles.dropOffSubHeading,
                    {
                      color:
                        colors.secondaryText,
                    },
                  ]}
                >
                  Select students travelling
                  on this trip
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.selectAllButton,

                  {
                    backgroundColor:
                      allStudentsSelected
                        ? "#079A96"
                        : colors.selectedStudentBackground,

                    borderColor:
                      colors.accentText,
                  },

                  pressed &&
                    styles.buttonPressed,
                ]}
                onPress={toggleSelectAll}
              >
                <Text
                  style={[
                    styles.selectAllText,
                    {
                      color:
                        allStudentsSelected
                          ? "#ffffff"
                          : colors.accentText,
                    },
                  ]}
                >
                  {allStudentsSelected
                    ? "Unselect All"
                    : "Select All"}
                </Text>
              </Pressable>
            </View>

            {routeStudents.length === 0 ? (
              <View
                style={
                  styles.noStudentsContainer
                }
              >
                <Ionicons
                  name="people-outline"
                  size={34}
                  color={colors.secondaryText}
                  style={styles.noStudentsIcon}
                />

                <Text
                  style={[
                    styles.noStudentsText,
                    {
                      color:
                        colors.secondaryText,
                    },
                  ]}
                >
                  No students are assigned to
                  this route.
                </Text>
              </View>
            ) : (
              Object.entries(groupedDropOffStudents).map(
                ([location, students]) => (
                  <View key={location} style={styles.locationSection}>
                    <View
                      style={[
                        styles.locationHeader,
                        {
                          backgroundColor: colors.studentBackground,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name="location-outline"
                        size={20}
                        color={colors.accentText}
                        style={styles.locationIcon}
                      />

                      <View style={styles.locationHeaderContent}>
                        <Text
                          style={[styles.locationTitle, { color: colors.text }]}
                        >
                          {location}
                        </Text>
                        <Text
                          style={[
                            styles.locationStudentCount,
                            { color: colors.secondaryText },
                          ]}
                        >
                          {students.length}{" "}
                          {students.length === 1 ? "student" : "students"}
                        </Text>
                      </View>
                    </View>

                    {students.map((student) => {
                      const isSelected = selectedStudentIds.includes(student.id);

                      return (
                        <Pressable
                          key={student.id}
                          style={({ pressed }) => [
                            styles.studentRow,
                            {
                              backgroundColor: isSelected
                                ? colors.selectedStudentBackground
                                : colors.studentBackground,
                              borderColor: isSelected
                                ? colors.accentText
                                : colors.border,
                            },
                            pressed && styles.studentPressed,
                          ]}
                          onPress={() => toggleStudentSelection(student.id)}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              {
                                backgroundColor: isSelected
                                  ? "#079A96"
                                  : colors.checkboxBackground,
                                borderColor: isSelected
                                  ? "#079A96"
                                  : colors.secondaryText,
                              },
                            ]}
                          >
                            {isSelected && (
                              <Text style={styles.checkmark}>✓</Text>
                            )}
                          </View>

                          <View
                            style={[
                              styles.studentAvatar,
                              {
                                backgroundColor:
                                  colors.selectedStudentBackground,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.studentAvatarText,
                                { color: colors.accentText },
                              ]}
                            >
                              {student.name.charAt(0).toUpperCase()}
                            </Text>
                          </View>

                          <View style={styles.studentContent}>
                            <Text
                              style={[styles.studentName, { color: colors.text }]}
                            >
                              {student.name}
                            </Text>
                            <Text
                              style={[
                                styles.studentClass,
                                { color: colors.secondaryText },
                              ]}
                            >
                              Class {student.className} - {student.division}
                            </Text>
                            <View style={styles.studentLocationRow}>
                              <Ionicons
                                name="home-outline"
                                size={12}
                                color={colors.secondaryText}
                              />
                              <Text
                                style={[
                                  styles.studentLocation,
                                  { color: colors.secondaryText },
                                ]}
                              >
                                {student.dropOffLocation}
                              </Text>
                            </View>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                )
              )
            )}

            {routeStudents.length > 0 && (
              <>
                {/* Selection Count */}

                <View
                  style={[
                    styles.selectionSummary,
                    {
                      backgroundColor:
                        colors.studentBackground,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.selectionSummaryText,
                      {
                        color:
                          colors.secondaryText,
                      },
                    ]}
                  >
                    {
                      selectedStudentIds.length
                    }{" "}
                    of {routeStudents.length}{" "}
                    students selected
                  </Text>
                </View>

                {/* Cancel + Continue */}

                <View
                  style={
                    styles.bottomActionRow
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
                    onPress={
                      cancelDropOffSelection
                    }
                  >
                    <Text
                      style={[
                        styles.cancelButtonText,
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
                      selectedStudentIds.length ===
                      0
                    }
                    style={({ pressed }) => [
                      styles.continueButton,

                      selectedStudentIds.length ===
                        0 &&
                        styles.disabledContinueButton,

                      pressed &&
                        selectedStudentIds.length >
                          0 &&
                        styles.buttonPressed,
                    ]}
                    onPress={continueDropOff}
                  >
                    <Text
                      style={
                        styles.continueButtonText
                      }
                    >
                      Continue Drop Off
                    </Text>

                    <Text
                      style={
                        styles.continueArrow
                      }
                    >
                      →
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        )}

        {!selectedRouteId && (
          <View
            style={[
              styles.routeHint,
              {
                backgroundColor:
                  isDarkMode
                    ? "#14263D"
                    : "#EAF3FC",

                borderColor:
                  isDarkMode
                    ? "#28445F"
                    : "#D8E4F0",
              },
            ]}
          >
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={
                isDarkMode
                  ? "#8FC7D6"
                  : "#4F6F8C"
              }
              style={styles.routeHintIcon}
            />

            <Text
              style={[
                styles.routeHintText,
                {
                  color: isDarkMode
                    ? "#A7CDDA"
                    : "#4F6F8C",
                },
              ]}
            >
              Select a route to enable Pick
              Up and Drop Off.
            </Text>
          </View>
        )}
           </ScrollView>


      {/* ========================= */}
      {/* PROFILE MODAL */}
      {/* ========================= */}

      <Modal
        visible={profileVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() =>
          setProfileVisible(false)
        }
      >

        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setProfileVisible(false)
          }
        >

          <Pressable
            style={[
              styles.profileModal,
              {
                backgroundColor:
                  colors.card,

                borderColor:
                  colors.border,
              },
            ]}
            onPress={() => {}}
          >

            {/* Avatar */}

            <View
              style={
                styles.profileAvatar
              }
            >
              <Ionicons
                name="person"
                size={29}
                color="#FFFFFF"
              />
            </View>


            {/* Name */}

            <Text
              style={[
                styles.profileName,
                {
                  color:
                    colors.text,
                },
              ]}
              numberOfLines={1}
            >
              {appUser?.name ||
                "Driver"}
            </Text>


            {/* Phone */}

            {!!appUser?.phone && (
              <Text
                style={[
                  styles.profilePhone,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                {appUser.phone}
              </Text>
            )}


            {/* Role */}

            <View
              style={
                styles.roleBadge
              }
            >
              <Text
                style={
                  styles.roleText
                }
              >
                Driver
              </Text>
            </View>


            {/* Divider */}

            <View
              style={[
                styles.profileDivider,
                {
                  backgroundColor:
                    colors.border,
                },
              ]}
            />


            {/* Logout */}

            <Pressable
              style={({
                pressed,
              }) => [
                styles.logoutButton,

                pressed &&
                  styles.buttonPressed,
              ]}
              onPress={
                handleLogout
              }
            >

              <Ionicons
                name="log-out-outline"
                size={21}
                color="#C62828"
              />

              <Text
                style={
                  styles.logoutText
                }
              >
                Logout
              </Text>

            </Pressable>

          </Pressable>

        </Pressable>

      </Modal>


    </SafeAreaView>
  );
}

type MarqueeTextProps = {
  text: string;
};

function MarqueeText({
  text,
}: MarqueeTextProps) {
  const translateX = useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    // First normal position
    translateX.setValue(0);

    const animation = Animated.loop(
      Animated.sequence([
        // First / each round small pause
        Animated.delay(1000),

        // Move from normal position to left
        Animated.timing(translateX, {
          toValue: -700,
          duration: 12000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),

        // Immediately move to right side
        Animated.timing(translateX, {
          toValue: 250,
          duration: 0,
          useNativeDriver: true,
        }),

        // Move continuously from right to left
        Animated.timing(translateX, {
          toValue: -700,
          duration: 15000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),

        // Reset again to right
        Animated.timing(translateX, {
          toValue: 250,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [text, translateX]);

  return (
    <View style={styles.marqueeContainer}>
      <Animated.Text
        numberOfLines={1}
        style={[
          styles.marqueeText,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        {text}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 24,
  },

 // =========================
// Header
// =========================

header: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 4,
  marginBottom: 18,
},

headerUserContent: {
  flex: 1,
},

greetingText: {
  fontSize: 11,
  fontWeight: "600",
  marginBottom: 3,
},

welcomeText: {
  fontSize: 20,
  fontWeight: "800",
  letterSpacing: 0.1,
},

profileButton: {
  width: 46,
  height: 46,
  borderRadius: 23,
  borderWidth: 1,

  alignItems: "center",
  justifyContent: "center",

  marginLeft: 12,

  elevation: 2,

  shadowColor: "#000000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.08,
  shadowRadius: 4,
},

  // =========================
  // Current Trip Card
  // =========================

  tripCard: {
    backgroundColor: "#0F5DA8",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1768C4",
    padding: 20,
    marginBottom: 26,
    elevation: 3,
  },

  tripTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  tripContent: {
    flex: 1,
  },

  tripLabel: {
    color: "#CFE3F7",
    fontSize: 11,
    fontWeight: "700",
  },

  tripTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
    marginTop: 5,
  },

  busNumber: {
    color: "#CFE3F7",
    fontSize: 13,
    marginTop: 8,
  },

  busIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor:
      "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  busIcon: {
    fontSize: 32,
  },

  tripInfoRow: {
    backgroundColor:
      "rgba(255,255,255,0.08)",
    borderRadius: 14,
    flexDirection: "row",
    marginTop: 18,
    paddingVertical: 11,
  },

  tripInfoItem: {
    flex: 1,
    alignItems: "center",
  },

  tripInfoDivider: {
    width: 1,
    backgroundColor:
      "rgba(255,255,255,0.16)",
  },

  tripInfoLabel: {
    color: "#C5DBF0",
    fontSize: 9,
  },

  tripInfoValue: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 4,
  },

  // =========================
  // Sections
  // =========================

  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 5,
  },

  sectionDescription: {
    fontSize: 11,
    marginBottom: 11,
  },

  pickerContainer: {
    borderWidth: 1,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 14,
    elevation: 0,
  },

  picker: {
    minHeight: 54,
  },

  // =========================
  // Selected Route
  // =========================

  selectedRouteCard: {
    borderWidth: 1,
    borderRadius: 17,
    padding: 14,
    marginBottom: 20,
  },

  selectedRouteHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  routeIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#1768C4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  routeIcon: {
    fontSize: 19,
  },

  selectedRouteContent: {
    flex: 1,
  },

  selectedRouteLabel: {
    fontSize: 10,
  },

  selectedRouteName: {
    fontSize: 17,
    fontWeight: "900",
    marginTop: 2,
  },

  selectedBadge: {
    backgroundColor: "#DFF5F2",
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  selectedBadgeText: {
    color: "#0B7C76",
    fontSize: 9,
    fontWeight: "900",
  },

  routePathContainer: {
    minHeight: 42,
    borderRadius: 12,
    marginTop: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  selectedRouteLocation: {
    fontSize: 12,
    fontWeight: "700",
  },

  routeArrow: {
    fontSize: 17,
    fontWeight: "900",
    marginHorizontal: 10,
  },

  // =========================
  // Pickup / Drop-off
  // =========================

  actionSectionTitle: {
    marginBottom: 10,
  },

  actionContainer: {
    flexDirection: "row",
    gap: 12,
  },

  actionButton: {
  flex: 1,
  minHeight: 90,
  borderRadius: 18,
  paddingHorizontal: 10,
  paddingVertical: 12,
  flexDirection: "row",
  alignItems: "center",
  elevation: 2,
},

  pickupButton: {
    backgroundColor: "#079A96",
  },

  dropOffButton: {
    backgroundColor: "#1768C4",
  },

  disabledActionButton: {
    opacity: 0.55,
  },

actionIconContainer: {
  width: 42,
  height: 42,
  borderRadius: 13,
  backgroundColor: "rgba(255,255,255,0.12)",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 8,
},

  actionIcon: {
    fontSize: 27,
  },

  actionContent: {
    flex: 1,
  },

actionTitle: {
  color: "#FFFFFF",
  fontSize: 15,
  fontWeight: "900",
},

actionDescription: {
  color: "#E5E7E2",
  fontSize: 9,
  marginTop: 3,
},

actionArrow: {
  color: "#FFFFFF",
  fontSize: 20,
  marginLeft: 4,
},

  // =========================
  // Drop-off Student Selection
  // =========================

  dropOffSection: {
    borderWidth: 1,
    borderRadius: 19,
    padding: 14,
    marginTop: 14,
    elevation: 0,
  },

  dropOffHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  dropOffHeaderText: {
    flex: 1,
  },

  dropOffHeading: {
    fontSize: 15,
    fontWeight: "900",
  },

  dropOffSubHeading: {
    fontSize: 9,
    marginTop: 3,
  },

  selectAllButton: {
    minHeight: 35,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 11,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  selectAllText: {
    fontSize: 10,
    fontWeight: "900",
  },

  studentRow: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },

  checkbox: {
    width: 23,
    height: 23,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  checkmark: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  studentAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  studentAvatarText: {
    fontSize: 16,
    fontWeight: "900",
  },

  studentContent: {
    flex: 1,
  },

  studentName: {
    fontSize: 14,
    fontWeight: "900",
  },

  studentClass: {
    fontSize: 10,
    marginTop: 3,
  },

  studentLocation: {
    fontSize: 9,
  },

  // =========================
  // Location Grouping
  // =========================

  locationSection: {
    marginBottom: 14,
  },

  locationHeader: {
    minHeight: 56,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  locationIcon: {
    marginRight: 10,
  },

  locationHeaderContent: {
    flex: 1,
  },

  locationTitle: {
    fontSize: 14,
    fontWeight: "900",
  },

  locationStudentCount: {
    fontSize: 10,
    marginTop: 3,
  },

  selectionSummary: {
    minHeight: 39,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 10,
  },

  selectionSummaryText: {
    fontSize: 10,
    fontWeight: "700",
  },

  // =========================
  // Bottom Actions
  // =========================

  bottomActionRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  cancelButton: {
    minWidth: 100,
    minHeight: 49,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  cancelButtonText: {
    fontSize: 13,
    fontWeight: "900",
  },

  continueButton: {
    flex: 1,
    minHeight: 49,
    borderRadius: 13,
    backgroundColor: "#079A96",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  continueArrow: {
    color: "#FFFFFF",
    fontSize: 18,
    marginLeft: 7,
  },

  disabledContinueButton: {
    opacity: 0.42,
  },

  // =========================
  // Empty / Hint
  // =========================

  noStudentsContainer: {
    alignItems: "center",
    paddingVertical: 25,
  },

  noStudentsIcon: {
    marginBottom: 8,
  },

  noStudentsText: {
    fontSize: 11,
    textAlign: "center",
  },

  routeHint: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },

  routeHintIcon: {
    marginRight: 8,
  },

  routeHintText: {
    flex: 1,
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 15,
  },

  studentPressed: {
    opacity: 0.7,
  },

  buttonPressed: {
    opacity: 0.72,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  // =========================
  // Current Route
  // =========================

  currentRouteContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor:
      "rgba(255,255,255,0.16)",
  },

  currentRouteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },

  currentRouteIcon: {
    marginRight: 7,
  },

  currentRouteLabel: {
    color: "#CFE3F7",
    fontSize: 11,
    fontWeight: "700",
  },

  marqueeContainer: {
    height: 22,
    overflow: "hidden",
    justifyContent: "center",
  },

  marqueeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    width: 1000,
  },
  // =========================
// Profile Modal
// =========================

modalOverlay: {
  flex: 1,

  backgroundColor:
    "rgba(0,0,0,0.40)",

  justifyContent: "flex-start",
  alignItems: "flex-end",

  paddingTop: 76,
  paddingRight: 18,
},

profileModal: {
  width: 255,

  borderWidth: 1,
  borderRadius: 20,

  paddingHorizontal: 18,
  paddingTop: 20,
  paddingBottom: 12,

  alignItems: "center",

  elevation: 10,

  shadowColor: "#000000",
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.18,
  shadowRadius: 10,
},

profileAvatar: {
  width: 62,
  height: 62,

  borderRadius: 31,

  backgroundColor:
    "#1768C4",

  alignItems: "center",
  justifyContent: "center",

  marginBottom: 11,
},

profileName: {
  maxWidth: "100%",

  fontSize: 17,
  fontWeight: "900",

  textAlign: "center",
},

profilePhone: {
  fontSize: 11,

  marginTop: 5,

  textAlign: "center",
},

roleBadge: {
  backgroundColor:
    "#E7F6F4",

  borderRadius: 10,

  paddingHorizontal: 12,
  paddingVertical: 5,

  marginTop: 10,
},

roleText: {
  color: "#0B7C76",

  fontSize: 9,
  fontWeight: "900",
},

profileDivider: {
  width: "100%",
  height: 1,

  marginTop: 18,
  marginBottom: 6,
},

logoutButton: {
  width: "100%",
  minHeight: 46,

  flexDirection: "row",

  alignItems: "center",
  justifyContent: "center",

  borderRadius: 12,
},

logoutText: {
  color: "#C62828",

  fontSize: 13,
  fontWeight: "900",

  marginLeft: 8,
},
studentLocationRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 4,
  gap: 5,
},
}); 