import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  useAppTheme,
} from "../../context/ThemeContext";

import {
  useTripStore,
} from "../../store/useTripStore";


// =====================================
// TYPES
// =====================================

type StopStatus =
  | "completed"
  | "current"
  | "upcoming";


type RouteStop = {
  id: string;
  name: string;
  time: string;
  status: StopStatus;
};


// =====================================
// ROUTE STOPS
// TEMPORARY STATIC DATA
// Later this can come from API / SQLite
// =====================================

const routeStops: RouteStop[] = [

  {
    id: "stop-1",
    name: "Kaloor Junction",
    time: "07:15 AM",
    status: "completed",
  },

  {
    id: "stop-2",
    name: "Palarivattom",
    time: "07:25 AM",
    status: "completed",
  },

  {
    id: "stop-3",
    name: "Edappally",
    time: "07:40 AM",
    status: "current",
  },

  {
    id: "stop-4",
    name: "Pathadipalam",
    time: "07:50 AM",
    status: "upcoming",
  },

  {
    id: "stop-5",
    name: "St. Mary’s School",
    time: "08:10 AM",
    status: "upcoming",
  },

];


// =====================================
// ROUTE DETAILS
// Based on current route IDs
// =====================================

const getRouteDetails = (
  routeId: string
) => {

  switch (routeId) {

    case "1":

      return {
        routeName:
          "Route 1",

        routePath:
          "Kaloor Junction → Edappally Toll",

        currentLocation:
          "Edappally",

        nextStop:
          "Pathadipalam",

        nextStopTime:
          "07:50 AM",
      };


    case "2":

      return {
        routeName:
          "Route 2",

        routePath:
          "Vyttila Mobility Hub → Palarivattom Junction",

        currentLocation:
          "Kadavanthra",

        nextStop:
          "Elamkulam",

        nextStopTime:
          "07:50 AM",
      };


    case "3":

      return {
        routeName:
          "Route 3",

        routePath:
          "Aluva Metro Station → Kalamassery",

        currentLocation:
          "Companypady",

        nextStop:
          "Muttom",

        nextStopTime:
          "07:50 AM",
      };


    default:

      return {
        routeName:
          "Selected Route",

        routePath:
          "School Bus Route",

        currentLocation:
          "Current Location",

        nextStop:
          "Next Stop",

        nextStopTime:
          "--:--",
      };

  }

};


// =====================================
// CURRENT TRIP SCREEN
// =====================================

export default function CurrentTripScreen() {

  const {
    isDarkMode,
  } =
    useAppTheme();


  // =====================================
  // ZUSTAND STORE
  // =====================================

  const selectedRouteId =
    useTripStore(
      (state) =>
        state.selectedRouteId
    );


  const students =
    useTripStore(
      (state) =>
        state.students
    );


  const loadStudents =
    useTripStore(
      (state) =>
        state.loadStudents
    );


  // =====================================
  // LOCAL UI STATE
  // =====================================

  const [
    tripType,
    setTripType,
  ] =
    useState<
      "pickup" | "dropoff"
    >("pickup");


  // =====================================
  // LOAD STUDENTS FOR SELECTED ROUTE
  // =====================================

  useEffect(() => {

    console.log(
      "CURRENT TRIP ROUTE:",
      selectedRouteId
    );


    if (!selectedRouteId) {

      console.log(
        "CURRENT TRIP: NO ROUTE SELECTED"
      );

      return;

    }


    console.log(
      "CURRENT TRIP: LOADING STUDENTS"
    );


    loadStudents(
      selectedRouteId
    );


  }, [
    selectedRouteId,
    loadStudents,
  ]);


  // =====================================
  // IS TRIP ACTIVE
  //
  // For current implementation:
  // route selected = active trip
  //
  // Later we will move this to Zustand
  // =====================================

  const isTripActive =
    selectedRouteId !== "";


  // =====================================
  // ROUTE DETAILS
  // =====================================

  const routeDetails =
    useMemo(
      () =>
        getRouteDetails(
          selectedRouteId
        ),
      [selectedRouteId]
    );


  // =====================================
  // STUDENT COUNTS
  // =====================================

  const totalStudents =
    students.length;


  const completedStudents =
    students.filter(
      (student) => {

        if (
          tripType === "pickup"
        ) {

          return (
            student.status ===
            "pickedUp"
          );

        }


        return (
          student.status ===
          "droppedOff"
        );

      }
    ).length;


  const absentStudents =
    students.filter(
      (student) =>
        student.status ===
        "absent"
    ).length;


  const pendingStudents =
    students.filter(
      (student) =>
        student.status ===
        "pending"
    ).length;


  // =====================================
  // PROGRESS
  // =====================================

  const completedPercentage =
    totalStudents === 0

      ? 0

      : Math.round(
          (
            completedStudents /
            totalStudents
          ) *
            100
        );


  // =====================================
  // DEBUG LOG
  // =====================================

  useEffect(() => {

    console.log(
      "CURRENT TRIP STUDENTS:",
      students.length
    );


    console.log(
      "CURRENT TRIP TOTAL:",
      totalStudents
    );


    console.log(
      "CURRENT TRIP COMPLETED:",
      completedStudents
    );


    console.log(
      "CURRENT TRIP ABSENT:",
      absentStudents
    );


    console.log(
      "CURRENT TRIP PENDING:",
      pendingStudents
    );


  }, [
    students,
    totalStudents,
    completedStudents,
    absentStudents,
    pendingStudents,
  ]);


  // =====================================
  // COLORS
  // =====================================

  const colors = {

    background:
      isDarkMode
        ? "#081726"
        : "#F4F8FD",

    card:
      isDarkMode
        ? "#10243A"
        : "#FFFFFF",

    text:
      isDarkMode
        ? "#F7FBFF"
        : "#08285C",

    secondaryText:
      isDarkMode
        ? "#A8BAD0"
        : "#66758E",

    border:
      isDarkMode
        ? "#27405B"
        : "#D8E4F0",

    inactiveButton:
      isDarkMode
        ? "#10243A"
        : "#FFFFFF",

    progressTrack:
      isDarkMode
        ? "#27405B"
        : "#EAF3FC",

    blueBackground:
      isDarkMode
        ? "#102D46"
        : "#EAF3FC",

    blueText:
      isDarkMode
        ? "#8EC7FF"
        : "#1768C4",

    liveBackground:
      isDarkMode
        ? "#123837"
        : "#E7F6F4",

    liveText:
      isDarkMode
        ? "#76E2D8"
        : "#0B7C76",

    pendingBackground:
      isDarkMode
        ? "#4a4018"
        : "#FFF5D8",

    pendingText:
      isDarkMode
        ? "#fde68a"
        : "#A56A00",

    successBackground:
      isDarkMode
        ? "#123837"
        : "#E7F6F4",

    successText:
      isDarkMode
        ? "#76E2D8"
        : "#0B7C76",

    absentBackground:
      isDarkMode
        ? "#4a2020"
        : "#fee2e2",

    absentText:
      isDarkMode
        ? "#fca5a5"
        : "#b91c1c",

    currentStopBackground:
      isDarkMode
        ? "#102D46"
        : "#EAF3FC",

    upcomingCircle:
      isDarkMode
        ? "#10243A"
        : "#FFFFFF",

    timeline:
      isDarkMode
        ? "#51677E"
        : "#C9D7E5",

    nextStopBackground:
      isDarkMode
        ? "#081726"
        : "#08285C",

  };


  // =====================================
  // CURRENT LOCATION
  // =====================================

  const showCurrentLocation =
    () => {

      Alert.alert(
        "Current Bus Location",
        `The bus is currently near ${routeDetails.currentLocation}.`
      );

    };


  // =====================================
  // NEXT STOP
  // =====================================

  const showNextStop =
    () => {

      Alert.alert(
        "Next Stop",
        `${routeDetails.nextStop} • Expected at ${routeDetails.nextStopTime}`
      );

    };


  // =====================================
  // NO ACTIVE TRIP
  // =====================================

  if (!isTripActive) {

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
            styles.header
          }
        >

          <Text
            style={[
              styles.heading,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Current Trip
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
            View your active school trip
          </Text>

        </View>


        <View
          style={[
            styles.noTripContainer,
            {
              backgroundColor:
                colors.card,

              borderColor:
                colors.border,
            },
          ]}
        >

          <View
            style={[
              styles.noTripIcon,
              {
                backgroundColor:
                  colors.blueBackground,
              },
            ]}
          >

            <Text
              style={
                styles.noTripIconText
              }
            >
              🚌
            </Text>

          </View>


          <Text
            style={[
              styles.noTripTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            No Active Trip
          </Text>


          <Text
            style={[
              styles.noTripDescription,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Select a route from the Home
            screen and start Pickup or
            Drop Off.
          </Text>

        </View>

      </SafeAreaView>

    );

  }


  // =====================================
  // ACTIVE TRIP UI
  // =====================================

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
        "left",
        "right",
      ]}
    >

      {/* HEADER */}

      <View
        style={
          styles.header
        }
      >

        <View
          style={
            styles.headerContent
          }
        >

          <Text
            style={[
              styles.heading,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Current Trip
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
            Active school service
          </Text>

        </View>


        <View
          style={[
            styles.liveBadge,
            {
              backgroundColor:
                colors.liveBackground,
            },
          ]}
        >

          <View
            style={
              styles.liveDot
            }
          />


          <Text
            style={[
              styles.liveText,
              {
                color:
                  colors.liveText,
              },
            ]}
          >
            LIVE
          </Text>

        </View>

      </View>


      <FlatList
        data={
          routeStops
        }

        keyExtractor={(
          item
        ) =>
          item.id
        }

        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={
          styles.listContent
        }


        // =================================
        // HEADER CONTENT
        // =================================

        ListHeaderComponent={

          <>

            {/* ========================= */}
            {/* MAIN TRIP CARD */}
            {/* ========================= */}

            <View
              style={
                styles.tripCard
              }
            >

              <View
                style={
                  styles.tripTopRow
                }
              >

                <View>

                  <Text
                    style={
                      styles.tripSmallLabel
                    }
                  >
                    {tripType ===
                    "pickup"
                      ? "PICKUP TRIP"
                      : "DROP OFF TRIP"}
                  </Text>


                  <Text
                    style={
                      styles.routeName
                    }
                  >
                    {
                      routeDetails.routeName
                    }
                  </Text>


                  <Text
                    style={
                      styles.routePath
                    }
                  >
                    {
                      routeDetails.routePath
                    }
                  </Text>

                </View>


                <Text
                  style={
                    styles.tripBusIcon
                  }
                >
                  🚌
                </Text>

              </View>


              <View
                style={
                  styles.busInfoRow
                }
              >

                <View
                  style={
                    styles.busInfoItem
                  }
                >

                  <Text
                    style={
                      styles.busInfoLabel
                    }
                  >
                    Bus Number
                  </Text>


                  <Text
                    style={
                      styles.busInfoValue
                    }
                  >
                    KL 07 AB 1234
                  </Text>

                </View>


                <View
                  style={
                    styles.busInfoDivider
                  }
                />


                <View
                  style={
                    styles.busInfoItem
                  }
                >

                  <Text
                    style={
                      styles.busInfoLabel
                    }
                  >
                    Students
                  </Text>


                  <Text
                    style={
                      styles.busInfoValue
                    }
                  >
                    {totalStudents}
                  </Text>

                </View>

              </View>

            </View>


            {/* ========================= */}
            {/* TRIP TYPE */}
            {/* ========================= */}

            <Text
              style={[
                styles.sectionTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Trip Type
            </Text>


            <View
              style={
                styles.tripTypeContainer
              }
            >

              {/* PICKUP */}

              <Pressable
                style={({ pressed }) => [

                  styles.tripTypeButton,

                  {
                    backgroundColor:
                      tripType ===
                      "pickup"
                        ? "#079A96"
                        : colors.inactiveButton,

                    borderColor:
                      tripType ===
                      "pickup"
                        ? "#079A96"
                        : colors.border,
                  },

                  pressed &&
                    styles.buttonPressed,

                ]}
                onPress={() =>
                  setTripType(
                    "pickup"
                  )
                }
              >

                <Text
                  style={
                    styles.tripTypeIcon
                  }
                >
                  🚌
                </Text>


                <Text
                  style={[
                    styles.tripTypeText,
                    {
                      color:
                        tripType ===
                        "pickup"
                          ? "#FFFFFF"
                          : colors.text,
                    },
                  ]}
                >
                  Pick Up
                </Text>

              </Pressable>


              {/* DROP OFF */}

              <Pressable
                style={({ pressed }) => [

                  styles.tripTypeButton,

                  {
                    backgroundColor:
                      tripType ===
                      "dropoff"
                        ? "#E8793E"
                        : colors.inactiveButton,

                    borderColor:
                      tripType ===
                      "dropoff"
                        ? "#E8793E"
                        : colors.border,
                  },

                  pressed &&
                    styles.buttonPressed,

                ]}
                onPress={() =>
                  setTripType(
                    "dropoff"
                  )
                }
              >

                <Text
                  style={
                    styles.tripTypeIcon
                  }
                >
                  🏠
                </Text>


                <Text
                  style={[
                    styles.tripTypeText,
                    {
                      color:
                        tripType ===
                        "dropoff"
                          ? "#FFFFFF"
                          : colors.text,
                    },
                  ]}
                >
                  Drop Off
                </Text>

              </Pressable>

            </View>


            {/* ========================= */}
            {/* STUDENT SUMMARY */}
            {/* ========================= */}

            <Text
              style={[
                styles.sectionTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Student Summary
            </Text>


            <View
              style={[
                styles.summaryContainer,
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
                  styles.progressHeader
                }
              >

                <Text
                  style={[
                    styles.progressTitle,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  Trip Progress
                </Text>


                <Text
                  style={[
                    styles.progressPercentage,
                    {
                      color:
                        colors.blueText,
                    },
                  ]}
                >
                  {
                    completedPercentage
                  }
                  %
                </Text>

              </View>


              <View
                style={[
                  styles.progressTrack,
                  {
                    backgroundColor:
                      colors.progressTrack,
                  },
                ]}
              >

                <View
                  style={[
                    styles.progressFill,
                    {
                      width:
                        `${completedPercentage}%`,
                    },
                  ]}
                />

              </View>


              <View
                style={
                  styles.statsRow
                }
              >

                <TripStat
                  count={
                    totalStudents
                  }
                  label="Total"
                  backgroundColor={
                    colors.blueBackground
                  }
                  textColor={
                    colors.blueText
                  }
                />


                <TripStat
                  count={
                    completedStudents
                  }
                  label={
                    tripType ===
                    "pickup"
                      ? "Picked"
                      : "Dropped"
                  }
                  backgroundColor={
                    colors.successBackground
                  }
                  textColor={
                    colors.successText
                  }
                />


                <TripStat
                  count={
                    pendingStudents
                  }
                  label="Pending"
                  backgroundColor={
                    colors.pendingBackground
                  }
                  textColor={
                    colors.pendingText
                  }
                />


                <TripStat
                  count={
                    absentStudents
                  }
                  label="Absent"
                  backgroundColor={
                    colors.absentBackground
                  }
                  textColor={
                    colors.absentText
                  }
                />

              </View>

            </View>


            {/* ========================= */}
            {/* LIVE LOCATION */}
            {/* ========================= */}

            <Text
              style={[
                styles.sectionTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Live Location
            </Text>


            <View
              style={[
                styles.locationCard,
                {
                  backgroundColor:
                    colors.card,

                  borderColor:
                    colors.border,
                },
              ]}
            >

              <View
                style={[
                  styles.locationIconContainer,
                  {
                    backgroundColor:
                      colors.blueBackground,
                  },
                ]}
              >

                <Text
                  style={
                    styles.locationIcon
                  }
                >
                  📍
                </Text>

              </View>


              <View
                style={
                  styles.locationContent
                }
              >

                <Text
                  style={[
                    styles.locationLabel,
                    {
                      color:
                        colors.secondaryText,
                    },
                  ]}
                >
                  Current Location
                </Text>


                <Text
                  style={[
                    styles.locationValue,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  {
                    routeDetails.currentLocation
                  }
                </Text>


                <Text
                  style={[
                    styles.locationUpdate,
                    {
                      color:
                        colors.successText,
                    },
                  ]}
                >
                  Updated just now
                </Text>

              </View>


              <Pressable
                style={({ pressed }) => [

                  styles.viewMapButton,

                  {
                    backgroundColor:
                      colors.blueBackground,
                  },

                  pressed &&
                    styles.buttonPressed,

                ]}
                onPress={
                  showCurrentLocation
                }
              >

                <Text
                  style={[
                    styles.viewMapText,
                    {
                      color:
                        colors.blueText,
                    },
                  ]}
                >
                  View Map
                </Text>

              </Pressable>

            </View>


            {/* ========================= */}
            {/* NEXT STOP */}
            {/* ========================= */}

            <Pressable
              style={({ pressed }) => [

                styles.nextStopCard,

                {
                  backgroundColor:
                    colors.nextStopBackground,
                },

                pressed &&
                  styles.buttonPressed,

              ]}
              onPress={
                showNextStop
              }
            >

              <View
                style={
                  styles.nextStopIconContainer
                }
              >

                <Text
                  style={
                    styles.nextStopIcon
                  }
                >
                  ➜
                </Text>

              </View>


              <View
                style={
                  styles.nextStopContent
                }
              >

                <Text
                  style={
                    styles.nextStopLabel
                  }
                >
                  Next Stop
                </Text>


                <Text
                  style={
                    styles.nextStopName
                  }
                >
                  {
                    routeDetails.nextStop
                  }
                </Text>

              </View>


              <View
                style={
                  styles.nextStopTimeContainer
                }
              >

                <Text
                  style={
                    styles.nextStopTime
                  }
                >
                  {
                    routeDetails.nextStopTime
                  }
                </Text>

              </View>

            </Pressable>


            {/* ROUTE STOPS */}

            <Text
              style={[
                styles.sectionTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Route Stops
            </Text>

          </>

        }


        // =================================
        // ROUTE STOP
        // =================================

        renderItem={({
          item,
        }) => {

          const isCompleted =
            item.status ===
            "completed";


          const isCurrent =
            item.status ===
            "current";


          return (

            <View
              style={
                styles.stopRow
              }
            >

              <View
                style={
                  styles.stopTimeline
                }
              >

                <View
                  style={[

                    styles.stopCircle,

                    isCompleted &&
                      styles.completedStopCircle,

                    isCurrent &&
                      styles.currentStopCircle,

                    item.status ===
                      "upcoming" && {

                      backgroundColor:
                        colors.upcomingCircle,

                      borderColor:
                        colors.timeline,

                      borderWidth: 1,

                    },

                  ]}
                >

                  <Text
                    style={
                      styles.stopCircleText
                    }
                  >
                    {
                      isCompleted
                        ? "✓"
                        : isCurrent
                          ? "●"
                          : ""
                    }
                  </Text>

                </View>


                {item.id !==
                  routeStops[
                    routeStops.length -
                      1
                  ].id && (

                  <View
                    style={[
                      styles.stopLine,
                      {
                        backgroundColor:
                          isCompleted
                            ? "#76E2D8"
                            : colors.timeline,
                      },
                    ]}
                  />

                )}

              </View>


              <View
                style={[
                  styles.stopCard,
                  {
                    backgroundColor:
                      isCurrent
                        ? colors.currentStopBackground
                        : colors.card,

                    borderColor:
                      isCurrent
                        ? "#1768C4"
                        : colors.border,
                  },
                ]}
              >

                <View
                  style={
                    styles.stopContent
                  }
                >

                  <Text
                    style={[
                      styles.stopName,
                      {
                        color:
                          isCurrent
                            ? colors.blueText
                            : colors.text,
                      },
                    ]}
                  >
                    {item.name}
                  </Text>


                  <Text
                    style={[
                      styles.stopStatus,
                      {
                        color:
                          colors.secondaryText,
                      },
                    ]}
                  >
                    {
                      isCompleted
                        ? "Completed"
                        : isCurrent
                          ? "Bus is here"
                          : "Upcoming"
                    }
                  </Text>

                </View>


                <Text
                  style={[
                    styles.stopTime,
                    {
                      color:
                        colors.secondaryText,
                    },
                  ]}
                >
                  {item.time}
                </Text>

              </View>

            </View>

          );

        }}

      />

    </SafeAreaView>

  );

}


// =====================================
// TRIP STAT
// =====================================

type TripStatProps = {
  count: number;
  label: string;
  backgroundColor: string;
  textColor: string;
};


function TripStat({
  count,
  label,
  backgroundColor,
  textColor,
}: TripStatProps) {

  return (

    <View
      style={[
        styles.statCard,
        {
          backgroundColor,
        },
      ]}
    >

      <Text
        style={[
          styles.statCount,
          {
            color:
              textColor,
          },
        ]}
      >
        {count}
      </Text>


      <Text
        style={[
          styles.statLabel,
          {
            color:
              textColor,
          },
        ]}
      >
        {label}
      </Text>

    </View>

  );

}


// =====================================
// STYLES
// =====================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      paddingHorizontal: 18,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
      marginBottom: 14,
    },

    headerContent: {
      flex: 1,
    },

    heading: {
      fontSize: 27,
      fontWeight: "900",
    },

    subHeading: {
      fontSize: 12,
      marginTop: 3,
    },

    liveBadge: {
      paddingHorizontal: 11,
      paddingVertical: 7,
      borderRadius: 13,
      flexDirection: "row",
      alignItems: "center",
    },

    liveDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: "#079A96",
      marginRight: 6,
    },

    liveText: {
      fontSize: 10,
      fontWeight: "900",
    },

    listContent: {
      paddingBottom: 20,
    },

    tripCard: {
      backgroundColor: "#0F5DA8",
      borderRadius: 22,
      padding: 19,
      marginBottom: 23,
      elevation: 4,
    },

    tripTopRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
    },

    tripSmallLabel: {
      color: "#CFE3F7",
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1,
    },

    routeName: {
      color: "#FFFFFF",
      fontSize: 24,
      fontWeight: "900",
      marginTop: 5,
    },

    routePath: {
      color: "#D9EAFB",
      fontSize: 13,
      marginTop: 5,
    },

    tripBusIcon: {
      fontSize: 53,
    },

    busInfoRow: {
      backgroundColor:
        "rgba(255,255,255,0.13)",
      borderRadius: 14,
      flexDirection: "row",
      marginTop: 18,
      paddingVertical: 12,
    },

    busInfoItem: {
      flex: 1,
      alignItems: "center",
    },

    busInfoDivider: {
      width: 1,
      backgroundColor:
        "rgba(255,255,255,0.22)",
    },

    busInfoLabel: {
      color: "#D1E4F7",
      fontSize: 9,
    },

    busInfoValue: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "800",
      marginTop: 4,
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: "900",
      marginBottom: 10,
    },

    tripTypeContainer: {
      flexDirection: "row",
      marginHorizontal: -5,
      marginBottom: 23,
    },

    tripTypeButton: {
      flex: 1,
      minHeight: 58,
      marginHorizontal: 5,
      borderRadius: 15,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    tripTypeIcon: {
      fontSize: 19,
      marginRight: 7,
    },

    tripTypeText: {
      fontSize: 13,
      fontWeight: "800",
    },

    summaryContainer: {
      borderWidth: 1,
      borderRadius: 18,
      padding: 15,
      marginBottom: 23,
      elevation: 2,
    },

    progressHeader: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    progressTitle: {
      fontSize: 13,
      fontWeight: "800",
    },

    progressPercentage: {
      fontSize: 14,
      fontWeight: "900",
    },

    progressTrack: {
      height: 8,
      borderRadius: 4,
      marginTop: 10,
      overflow: "hidden",
    },

    progressFill: {
      height: "100%",
      borderRadius: 4,
      backgroundColor: "#1768C4",
    },

    statsRow: {
      flexDirection: "row",
      marginHorizontal: -3,
      marginTop: 15,
    },

    statCard: {
      flex: 1,
      minHeight: 62,
      marginHorizontal: 3,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },

    statCount: {
      fontSize: 18,
      fontWeight: "900",
    },

    statLabel: {
      fontSize: 8,
      fontWeight: "800",
      marginTop: 3,
    },

    locationCard: {
      borderWidth: 1,
      borderRadius: 17,
      padding: 13,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },

    locationIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 11,
    },

    locationIcon: {
      fontSize: 21,
    },

    locationContent: {
      flex: 1,
    },

    locationLabel: {
      fontSize: 9,
    },

    locationValue: {
      fontSize: 15,
      fontWeight: "800",
      marginTop: 2,
    },

    locationUpdate: {
      fontSize: 9,
      fontWeight: "700",
      marginTop: 3,
    },

    viewMapButton: {
      paddingHorizontal: 11,
      paddingVertical: 9,
      borderRadius: 10,
    },

    viewMapText: {
      fontSize: 10,
      fontWeight: "800",
    },

    nextStopCard: {
      borderRadius: 17,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 23,
    },

    nextStopIconContainer: {
      width: 41,
      height: 41,
      borderRadius: 13,
      backgroundColor:
        "rgba(255,255,255,0.12)",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 11,
    },

    nextStopIcon: {
      color: "#FFFFFF",
      fontSize: 19,
    },

    nextStopContent: {
      flex: 1,
    },

    nextStopLabel: {
      color: "#A8BAD0",
      fontSize: 9,
    },

    nextStopName: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "800",
      marginTop: 3,
    },

    nextStopTimeContainer: {
      alignItems: "flex-end",
    },

    nextStopTime: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "800",
    },

    stopRow: {
      flexDirection: "row",
      minHeight: 78,
    },

    stopTimeline: {
      width: 28,
      alignItems: "center",
    },

    stopCircle: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
    },

    completedStopCircle: {
      backgroundColor: "#079A96",
    },

    currentStopCircle: {
      backgroundColor: "#1768C4",
      borderWidth: 4,
      borderColor: "#CFE3F7",
    },

    stopCircleText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "900",
    },

    stopLine: {
      width: 2,
      flex: 1,
    },

    stopCard: {
      flex: 1,
      minHeight: 61,
      borderWidth: 1,
      borderRadius: 14,
      marginLeft: 8,
      marginBottom: 12,
      paddingHorizontal: 13,
      flexDirection: "row",
      alignItems: "center",
    },

    stopContent: {
      flex: 1,
    },

    stopName: {
      fontSize: 13,
      fontWeight: "800",
    },

    stopStatus: {
      fontSize: 9,
      marginTop: 4,
    },

    stopTime: {
      fontSize: 10,
      fontWeight: "700",
    },

    noTripContainer: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 25,
      marginBottom: 20,
    },

    noTripIcon: {
      width: 85,
      height: 85,
      borderRadius: 43,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 17,
    },

    noTripIconText: {
      fontSize: 39,
    },

    noTripTitle: {
      fontSize: 21,
      fontWeight: "900",
    },

    noTripDescription: {
      fontSize: 13,
      lineHeight: 20,
      textAlign: "center",
      marginTop: 8,
    },

    buttonPressed: {
      opacity: 0.72,
    },

  });