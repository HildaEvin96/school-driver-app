import React, {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
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

import {
  useAppTheme,
} from "../context/ThemeContext";

import {
  getTripHistoryById,
  TripHistory,
} from "../database/tripHistory";


// =====================================
// FORMAT DURATION
// =====================================

const formatDuration = (
  minutes: number
) => {

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  const remainingMinutes =
    minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMinutes} min`;
};


// =====================================
// TRIP DETAILS SCREEN
// =====================================

export default function TripDetailsScreen() {

  const router =
    useRouter();


  const {
    isDarkMode,
  } =
    useAppTheme();


  // =====================================
  // GET TRIP ID FROM HISTORY SCREEN
  // =====================================

  const params =
    useLocalSearchParams<{
      tripId?: string;
    }>();


  const tripId =
    typeof params.tripId === "string"
      ? params.tripId
      : "";


  // =====================================
  // STATE
  // =====================================

  const [
    trip,
    setTrip,
  ] =
    useState<TripHistory | null>(
      null
    );


  const [
    loading,
    setLoading,
  ] =
    useState(true);


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

    divider:
      isDarkMode
        ? "#27405B"
        : "#E7EEF6",

    pickupBackground:
      isDarkMode
        ? "#123837"
        : "#E7F6F4",

    pickupText:
      isDarkMode
        ? "#76E2D8"
        : "#0B7C76",

    dropOffBackground:
      isDarkMode
        ? "#3B2A20"
        : "#FFF1E6",

    dropOffText:
      isDarkMode
        ? "#FFBE8A"
        : "#C46620",

    infoBackground:
      isDarkMode
        ? "#102D46"
        : "#F7FAFD",

    blueBackground:
      isDarkMode
        ? "#163657"
        : "#EAF3FC",

    blueText:
      isDarkMode
        ? "#8EC7FF"
        : "#1768C4",

    progressBackground:
      isDarkMode
        ? "#27405B"
        : "#EAF3FC",

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
        ? "#3A2225"
        : "#FDECEC",

    absentText:
      isDarkMode
        ? "#FF9CA5"
        : "#C43C48",

  };


  // =====================================
  // LOAD TRIP FROM SQLITE
  // =====================================

  useEffect(() => {

    const loadTrip = () => {

      try {

        setLoading(
          true
        );


        console.log(
          "TRIP DETAILS SCREEN OPENED"
        );


        console.log(
          "RECEIVED TRIP ID:",
          tripId
        );


        if (!tripId) {

          console.log(
            "TRIP ID NOT RECEIVED"
          );

          setTrip(
            null
          );

          return;
        }


        const selectedTrip =
          getTripHistoryById(
            tripId
          );


        console.log(
          "SELECTED TRIP:",
          selectedTrip
        );


        setTrip(
          selectedTrip
        );


      } catch (error) {

        console.log(
          "TRIP DETAILS LOAD ERROR:",
          error
        );


        setTrip(
          null
        );


      } finally {

        setLoading(
          false
        );

      }

    };


    loadTrip();

  }, [tripId]);


  // =====================================
  // LOADING
  // =====================================

  if (loading) {

    return (

      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >

        <View
          style={
            styles.centerContainer
          }
        >

          <ActivityIndicator
            size="large"
            color="#1768C4"
          />


          <Text
            style={[
              styles.loadingText,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Loading trip details...
          </Text>

        </View>

      </SafeAreaView>

    );

  }


  // =====================================
  // TRIP NOT FOUND
  // =====================================

  if (!trip) {

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
            styles.notFoundHeader
          }
        >

          <Pressable
            style={[
              styles.backButton,
              {
                backgroundColor:
                  colors.card,

                borderColor:
                  colors.border,
              },
            ]}
            onPress={() =>
              router.back()
            }
          >

            <Text
              style={[
                styles.backIcon,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              ‹
            </Text>

          </Pressable>

        </View>


        <View
          style={
            styles.centerContainer
          }
        >

          <Text
            style={
              styles.notFoundIcon
            }
          >
            🕘
          </Text>


          <Text
            style={[
              styles.notFoundTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Trip not found
          </Text>


          <Text
            style={[
              styles.notFoundDescription,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Unable to load this trip from
            local history.
          </Text>


          <Pressable
            style={
              styles.backToHistoryButton
            }
            onPress={() =>
              router.back()
            }
          >

            <Text
              style={
                styles.backToHistoryText
              }
            >
              Back to History
            </Text>

          </Pressable>

        </View>

      </SafeAreaView>

    );

  }


  // =====================================
  // CALCULATIONS
  // =====================================

  const isPickup =
    trip.tripType ===
    "pickup";


  const completedLabel =
    isPickup
      ? "Picked Up"
      : "Dropped Off";


  const tripTypeLabel =
    isPickup
      ? "Pickup Trip"
      : "Drop Off Trip";


  const completionRate =
    trip.totalStudents === 0

      ? 0

      : Math.round(
          (
            trip.completedStudents /
            trip.totalStudents
          ) *
            100
        );


  // =====================================
  // UI
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
        "bottom",
        "left",
        "right",
      ]}
    >

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <View
        style={
          styles.header
        }
      >

        <Pressable
          style={[
            styles.backButton,
            {
              backgroundColor:
                colors.card,

              borderColor:
                colors.border,
            },
          ]}
          onPress={() =>
            router.back()
          }
        >

          <Text
            style={[
              styles.backIcon,
              {
                color:
                  colors.text,
              },
            ]}
          >
            ‹
          </Text>

        </Pressable>


        <View
          style={
            styles.headerTextContainer
          }
        >

          <Text
            style={[
              styles.headerTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Trip Details
          </Text>


          <Text
            style={[
              styles.headerSubtitle,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Completed trip information
          </Text>

        </View>


        <View
          style={
            styles.headerSpacer
          }
        />

      </View>


      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* ================================= */}
        {/* ROUTE CARD */}
        {/* ================================= */}

        <View
          style={[
            styles.routeCard,
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
              styles.routeTopRow
            }
          >

            <View
              style={[
                styles.tripIconContainer,
                {
                  backgroundColor:
                    isPickup
                      ? colors.pickupBackground
                      : colors.dropOffBackground,
                },
              ]}
            >

              <Text
                style={
                  styles.tripIcon
                }
              >
                {isPickup
                  ? "🚌"
                  : "🏠"}
              </Text>

            </View>


            <View
              style={
                styles.routeMainContent
              }
            >

              <Text
                style={[
                  styles.routeName,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {trip.routeName}
              </Text>


              <Text
                style={[
                  styles.routePath,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                {trip.routePath}
              </Text>

            </View>

          </View>


          <View
            style={
              styles.badgeRow
            }
          >

            <View
              style={[
                styles.tripTypeBadge,
                {
                  backgroundColor:
                    isPickup
                      ? colors.pickupBackground
                      : colors.dropOffBackground,
                },
              ]}
            >

              <Text
                style={[
                  styles.tripTypeBadgeText,
                  {
                    color:
                      isPickup
                        ? colors.pickupText
                        : colors.dropOffText,
                  },
                ]}
              >
                {tripTypeLabel}
              </Text>

            </View>


            <View
              style={[
                styles.completedBadge,
                {
                  backgroundColor:
                    colors.successBackground,
                },
              ]}
            >

              <Text
                style={[
                  styles.completedBadgeText,
                  {
                    color:
                      colors.successText,
                  },
                ]}
              >
                ✓ Completed
              </Text>

            </View>

          </View>

        </View>


        {/* ================================= */}
        {/* DATE + BUS */}
        {/* ================================= */}

        <View
          style={
            styles.twoColumnRow
          }
        >

          <InfoCard
            icon="📅"
            label="Trip Date"
            value={
              trip.tripDate
            }
            backgroundColor={
              colors.card
            }
            borderColor={
              colors.border
            }
            textColor={
              colors.text
            }
            secondaryColor={
              colors.secondaryText
            }
          />


          <InfoCard
            icon="🚌"
            label="Bus Number"
            value={
              trip.busNumber ||
              "Not Assigned"
            }
            backgroundColor={
              colors.card
            }
            borderColor={
              colors.border
            }
            textColor={
              colors.text
            }
            secondaryColor={
              colors.secondaryText
            }
          />

        </View>


        {/* ================================= */}
        {/* TIME DETAILS */}
        {/* ================================= */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                colors.text,
            },
          ]}
        >
          Trip Time
        </Text>


        <View
          style={[
            styles.timeCard,
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
              styles.timeItem
            }
          >

            <View
              style={[
                styles.timeIconContainer,
                {
                  backgroundColor:
                    colors.infoBackground,
                },
              ]}
            >

              <Text
                style={
                  styles.timeIcon
                }
              >
                ▶
              </Text>

            </View>


            <Text
              style={[
                styles.timeLabel,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Start Time
            </Text>


            <Text
              style={[
                styles.timeValue,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {trip.startTime}
            </Text>

          </View>


          <View
            style={[
              styles.verticalDivider,
              {
                backgroundColor:
                  colors.divider,
              },
            ]}
          />


          <View
            style={
              styles.timeItem
            }
          >

            <View
              style={[
                styles.timeIconContainer,
                {
                  backgroundColor:
                    colors.infoBackground,
                },
              ]}
            >

              <Text
                style={
                  styles.timeIcon
                }
              >
                ■
              </Text>

            </View>


            <Text
              style={[
                styles.timeLabel,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              End Time
            </Text>


            <Text
              style={[
                styles.timeValue,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {trip.endTime}
            </Text>

          </View>


          <View
            style={[
              styles.verticalDivider,
              {
                backgroundColor:
                  colors.divider,
              },
            ]}
          />


          <View
            style={
              styles.timeItem
            }
          >

            <View
              style={[
                styles.timeIconContainer,
                {
                  backgroundColor:
                    colors.infoBackground,
                },
              ]}
            >

              <Text
                style={
                  styles.timeIcon
                }
              >
                ⏱
              </Text>

            </View>


            <Text
              style={[
                styles.timeLabel,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Duration
            </Text>


            <Text
              style={[
                styles.timeValue,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {formatDuration(
                trip.durationMinutes
              )}
            </Text>

          </View>

        </View>


        {/* ================================= */}
        {/* STUDENT SUMMARY */}
        {/* ================================= */}

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
          style={
            styles.studentSummaryRow
          }
        >

          <StudentCard
            icon="👥"
            label="Total"
            value={
              trip.totalStudents
            }
            backgroundColor={
              colors.blueBackground
            }
            valueColor={
              colors.blueText
            }
            secondaryColor={
              colors.secondaryText
            }
          />


          <StudentCard
            icon="✓"
            label={
              completedLabel
            }
            value={
              trip.completedStudents
            }
            backgroundColor={
              colors.successBackground
            }
            valueColor={
              colors.successText
            }
            secondaryColor={
              colors.secondaryText
            }
          />


          <StudentCard
            icon="✕"
            label="Absent"
            value={
              trip.absentStudents
            }
            backgroundColor={
              colors.absentBackground
            }
            valueColor={
              colors.absentText
            }
            secondaryColor={
              colors.secondaryText
            }
          />

        </View>


        {/* ================================= */}
        {/* COMPLETION */}
        {/* ================================= */}

        <View
          style={[
            styles.progressCard,
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

            <View>

              <Text
                style={[
                  styles.progressTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Student Completion
              </Text>


              <Text
                style={[
                  styles.progressDescription,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                {trip.completedStudents} of{" "}
                {trip.totalStudents} students{" "}
                {isPickup
                  ? "picked up"
                  : "dropped off"}
              </Text>

            </View>


            <Text
              style={[
                styles.progressPercentage,
                {
                  color:
                    colors.blueText,
                },
              ]}
            >
              {completionRate}%
            </Text>

          </View>


          <View
            style={[
              styles.progressTrack,
              {
                backgroundColor:
                  colors.progressBackground,
              },
            ]}
          >

            <View
              style={[
                styles.progressFill,
                {
                  width:
                    `${completionRate}%`,
                },
              ]}
            />

          </View>

        </View>


        {/* ================================= */}
        {/* TRIP INFORMATION */}
        {/* ================================= */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                colors.text,
            },
          ]}
        >
          Trip Information
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
            label="Route ID"
            value={
              trip.routeId
            }
            textColor={
              colors.text
            }
            secondaryColor={
              colors.secondaryText
            }
            dividerColor={
              colors.divider
            }
          />


          <DetailRow
            label="Trip Type"
            value={
              tripTypeLabel
            }
            textColor={
              colors.text
            }
            secondaryColor={
              colors.secondaryText
            }
            dividerColor={
              colors.divider
            }
          />


          <DetailRow
            label="Status"
            value={
              trip.status
            }
            textColor={
              colors.text
            }
            secondaryColor={
              colors.secondaryText
            }
            dividerColor={
              colors.divider
            }
          />


          <DetailRow
            label="Trip ID"
            value={
              trip.id
            }
            textColor={
              colors.text
            }
            secondaryColor={
              colors.secondaryText
            }
            dividerColor={
              colors.divider
            }
            showDivider={
              false
            }
          />

        </View>

      </ScrollView>

    </SafeAreaView>

  );

}


// =====================================
// INFO CARD
// =====================================

type InfoCardProps = {
  icon: string;
  label: string;
  value: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  secondaryColor: string;
};


function InfoCard({
  icon,
  label,
  value,
  backgroundColor,
  borderColor,
  textColor,
  secondaryColor,
}: InfoCardProps) {

  return (

    <View
      style={[
        styles.infoCard,
        {
          backgroundColor,
          borderColor,
        },
      ]}
    >

      <Text
        style={
          styles.infoIcon
        }
      >
        {icon}
      </Text>


      <View
        style={
          styles.infoTextContainer
        }
      >

        <Text
          style={[
            styles.infoLabel,
            {
              color:
                secondaryColor,
            },
          ]}
        >
          {label}
        </Text>


        <Text
          style={[
            styles.infoValue,
            {
              color:
                textColor,
            },
          ]}
          numberOfLines={2}
        >
          {value}
        </Text>

      </View>

    </View>

  );

}


// =====================================
// STUDENT CARD
// =====================================

type StudentCardProps = {
  icon: string;
  label: string;
  value: number;
  backgroundColor: string;
  valueColor: string;
  secondaryColor: string;
};


function StudentCard({
  icon,
  label,
  value,
  backgroundColor,
  valueColor,
  secondaryColor,
}: StudentCardProps) {

  return (

    <View
      style={[
        styles.studentCard,
        {
          backgroundColor,
        },
      ]}
    >

      <Text
        style={[
          styles.studentCardIcon,
          {
            color:
              valueColor,
          },
        ]}
      >
        {icon}
      </Text>


      <Text
        style={[
          styles.studentCardValue,
          {
            color:
              valueColor,
          },
        ]}
      >
        {value}
      </Text>


      <Text
        style={[
          styles.studentCardLabel,
          {
            color:
              secondaryColor,
          },
        ]}
      >
        {label}
      </Text>

    </View>

  );

}


// =====================================
// DETAIL ROW
// =====================================

type DetailRowProps = {
  label: string;
  value: string;
  textColor: string;
  secondaryColor: string;
  dividerColor: string;
  showDivider?: boolean;
};


function DetailRow({
  label,
  value,
  textColor,
  secondaryColor,
  dividerColor,
  showDivider = true,
}: DetailRowProps) {

  return (

    <View>

      <View
        style={
          styles.detailRow
        }
      >

        <Text
          style={[
            styles.detailLabel,
            {
              color:
                secondaryColor,
            },
          ]}
        >
          {label}
        </Text>


        <Text
          style={[
            styles.detailValue,
            {
              color:
                textColor,
            },
          ]}
          numberOfLines={2}
        >
          {value}
        </Text>

      </View>


      {showDivider && (

        <View
          style={[
            styles.detailDivider,
            {
              backgroundColor:
                dividerColor,
            },
          ]}
        />

      )}

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
    },


    header: {
      minHeight: 68,

      paddingHorizontal: 18,

      flexDirection:
        "row",

      alignItems:
        "center",
    },


    backButton: {
      width: 42,
      height: 42,

      borderRadius: 13,

      borderWidth: 1,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    backIcon: {
      fontSize: 32,
      lineHeight: 34,
      marginTop: -3,
    },


    headerTextContainer: {
      flex: 1,

      alignItems:
        "center",
    },


    headerTitle: {
      fontSize: 19,
      fontWeight: "900",
    },


    headerSubtitle: {
      fontSize: 9,
      marginTop: 2,
    },


    headerSpacer: {
      width: 42,
    },


    scrollContent: {
      paddingHorizontal: 18,
      paddingBottom: 35,
    },


    routeCard: {
      borderWidth: 1,

      borderRadius: 20,

      padding: 17,

      marginTop: 5,

      elevation: 2,
    },


    routeTopRow: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },


    tripIconContainer: {
      width: 54,
      height: 54,

      borderRadius: 16,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight: 13,
    },


    tripIcon: {
      fontSize: 25,
    },


    routeMainContent: {
      flex: 1,
    },


    routeName: {
      fontSize: 17,
      fontWeight: "900",
    },


    routePath: {
      fontSize: 11,
      lineHeight: 17,
      marginTop: 4,
    },


    badgeRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop: 15,
    },


    tripTypeBadge: {
      borderRadius: 10,

      paddingHorizontal: 10,
      paddingVertical: 6,

      marginRight: 8,
    },


    tripTypeBadgeText: {
      fontSize: 9,
      fontWeight: "900",
    },


    completedBadge: {
      borderRadius: 10,

      paddingHorizontal: 10,
      paddingVertical: 6,
    },


    completedBadgeText: {
      fontSize: 9,
      fontWeight: "900",
    },


    twoColumnRow: {
      flexDirection: "row",

      marginHorizontal: -5,

      marginTop: 12,
    },


    infoCard: {
      flex: 1,

      minHeight: 78,

      marginHorizontal: 5,

      borderWidth: 1,

      borderRadius: 16,

      paddingHorizontal: 13,

      flexDirection:
        "row",

      alignItems:
        "center",
    },


    infoIcon: {
      fontSize: 21,
      marginRight: 9,
    },


    infoTextContainer: {
      flex: 1,
    },


    infoLabel: {
      fontSize: 8,
      fontWeight: "700",
    },


    infoValue: {
      fontSize: 11,
      fontWeight: "900",
      marginTop: 4,
    },


    sectionTitle: {
      fontSize: 15,
      fontWeight: "900",

      marginTop: 22,
      marginBottom: 10,
    },


    timeCard: {
      borderWidth: 1,

      borderRadius: 18,

      paddingVertical: 16,
      paddingHorizontal: 8,

      flexDirection:
        "row",

      alignItems:
        "center",
    },


    timeItem: {
      flex: 1,

      alignItems:
        "center",
    },


    timeIconContainer: {
      width: 34,
      height: 34,

      borderRadius: 11,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom: 7,
    },


    timeIcon: {
      color: "#1768C4",
      fontSize: 11,
      fontWeight: "900",
    },


    timeLabel: {
      fontSize: 8,
      fontWeight: "600",
    },


    timeValue: {
      fontSize: 11,
      fontWeight: "900",
      marginTop: 4,
    },


    verticalDivider: {
      width: 1,
      height: 52,
    },


    studentSummaryRow: {
      flexDirection: "row",
      marginHorizontal: -4,
    },


    studentCard: {
      flex: 1,

      minHeight: 110,

      marginHorizontal: 4,

      borderRadius: 17,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal: 5,
    },


    studentCardIcon: {
      fontSize: 17,
      fontWeight: "900",
    },


    studentCardValue: {
      fontSize: 24,
      fontWeight: "900",
      marginTop: 5,
    },


    studentCardLabel: {
      fontSize: 8,
      fontWeight: "700",

      textAlign: "center",

      marginTop: 4,
    },


    progressCard: {
      borderWidth: 1,

      borderRadius: 18,

      padding: 16,

      marginTop: 13,
    },


    progressHeader: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",
    },


    progressTitle: {
      fontSize: 13,
      fontWeight: "900",
    },


    progressDescription: {
      fontSize: 9,
      marginTop: 4,
    },


    progressPercentage: {
      fontSize: 20,
      fontWeight: "900",
      marginLeft: 10,
    },


    progressTrack: {
      height: 8,

      borderRadius: 5,

      marginTop: 13,

      overflow: "hidden",
    },


    progressFill: {
      height: "100%",

      backgroundColor:
        "#1768C4",

      borderRadius: 5,
    },


    detailsCard: {
      borderWidth: 1,

      borderRadius: 18,

      paddingHorizontal: 15,

      marginBottom: 10,
    },


    detailRow: {
      minHeight: 54,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },


    detailLabel: {
      fontSize: 10,
      fontWeight: "700",

      marginRight: 15,
    },


    detailValue: {
      flex: 1,

      fontSize: 10,
      fontWeight: "900",

      textAlign: "right",
    },


    detailDivider: {
      height: 1,
    },


    centerContainer: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal: 30,
    },


    loadingText: {
      fontSize: 12,
      marginTop: 12,
    },


    notFoundHeader: {
      paddingHorizontal: 18,
      paddingTop: 5,
    },


    notFoundIcon: {
      fontSize: 48,
      marginBottom: 13,
    },


    notFoundTitle: {
      fontSize: 21,
      fontWeight: "900",
    },


    notFoundDescription: {
      fontSize: 12,

      lineHeight: 19,

      textAlign: "center",

      marginTop: 7,
    },


    backToHistoryButton: {
      minHeight: 45,

      backgroundColor:
        "#1768C4",

      borderRadius: 13,

      paddingHorizontal: 20,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginTop: 18,
    },


    backToHistoryText: {
      color: "#FFFFFF",

      fontSize: 12,

      fontWeight: "900",
    },

  });