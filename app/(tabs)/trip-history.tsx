import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  useFocusEffect,
} from "expo-router";

import {
  useAppTheme,
} from "../../context/ThemeContext";

import {
  getTripHistory,
  TripHistory,
} from "../../database/tripHistory";


type FilterType =
  | "All"
  | "Pickup"
  | "Drop Off";


const filters: FilterType[] = [
  "All",
  "Pickup",
  "Drop Off",
];


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

  if (
    remainingMinutes === 0
  ) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMinutes} min`;
};


// =====================================
// SCREEN
// =====================================

export default function TripHistoryScreen() {

  const { isDarkMode } =
    useAppTheme();


  // =====================================
  // SQLITE TRIP HISTORY
  // =====================================

  const [
    tripHistoryData,
    setTripHistoryData,
  ] =
    useState<TripHistory[]>(
      []
    );


  // =====================================
  // SEARCH
  // =====================================

  const [
    searchText,
    setSearchText,
  ] =
    useState("");


  // =====================================
  // FILTER
  // =====================================

  const [
    selectedFilter,
    setSelectedFilter,
  ] =
    useState<FilterType>(
      "All"
    );


  // =====================================
  // EXPANDED CARD
  // =====================================

  const [
    expandedTripId,
    setExpandedTripId,
  ] =
    useState<string | null>(
      null
    );


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

    inactive:
      isDarkMode
        ? "#27405B"
        : "#EEF3F8",

    input:
      isDarkMode
        ? "#10243A"
        : "#FFFFFF",

    countBackground:
      isDarkMode
        ? "#163657"
        : "#EAF3FC",

    countText:
      isDarkMode
        ? "#8EC7FF"
        : "#1768C4",

    pickupBackground:
      isDarkMode
        ? "#123837"
        : "#E7F6F4",

    dropOffBackground:
      isDarkMode
        ? "#3B2A20"
        : "#FFF1E6",

    completedBackground:
      isDarkMode
        ? "#123837"
        : "#E7F6F4",

    completedText:
      isDarkMode
        ? "#76E2D8"
        : "#0B7C76",

    timeBackground:
      isDarkMode
        ? "#102D46"
        : "#F7FAFD",

    busBackground:
      isDarkMode
        ? "#163657"
        : "#EAF3FC",

    progressBackground:
      isDarkMode
        ? "#27405B"
        : "#EAF3FC",

  };


  // =====================================
  // LOAD SQLITE HISTORY
  // =====================================

  useFocusEffect(

    useCallback(() => {

      try {

        console.log(
          "HISTORY SCREEN OPENED"
        );


        const trips =
          getTripHistory();


        console.log(
          "HISTORY TRIPS:",
          trips.length
        );


        console.log(
          "HISTORY DATA:",
          trips
        );


        setTripHistoryData(
          trips
        );


      } catch (error) {

        console.log(
          "LOAD HISTORY ERROR:",
          error
        );


        setTripHistoryData(
          []
        );

      }


      return () => {};

    }, [])

  );


  // =====================================
  // FILTER + SEARCH
  // =====================================

  const filteredTrips =
    useMemo(() => {

      const normalizedSearch =
        searchText
          .trim()
          .toLowerCase();


      return tripHistoryData.filter(
        (trip) => {

          const matchesSearch =

            normalizedSearch === "" ||

            trip.routeName
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||

            trip.routePath
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||

            trip.busNumber
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||

            trip.tripDate
              .toLowerCase()
              .includes(
                normalizedSearch
              );


          const matchesFilter =

            selectedFilter ===
            "All"

              ? true

              : selectedFilter ===
                "Pickup"

                ? trip.tripType ===
                  "pickup"

                : trip.tripType ===
                  "dropoff";


          return (
            matchesSearch &&
            matchesFilter
          );

        }
      );

    }, [
      searchText,
      selectedFilter,
      tripHistoryData,
    ]);


  // =====================================
  // COUNTS
  // =====================================

  const pickupCount =
    tripHistoryData.filter(
      (trip) =>
        trip.tripType ===
        "pickup"
    ).length;


  const dropOffCount =
    tripHistoryData.filter(
      (trip) =>
        trip.tripType ===
        "dropoff"
    ).length;


  // =====================================
  // EXPAND / COLLAPSE
  // =====================================

  const toggleTripDetails = (
    tripId: string
  ) => {

    setExpandedTripId(
      (currentId) =>
        currentId === tripId
          ? null
          : tripId
    );

  };


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
        "left",
        "right",
      ]}
    >

      {/* ============================= */}
      {/* HEADER */}
      {/* ============================= */}

      <View
        style={
          styles.header
        }
      >

        <View
          style={
            styles.headerTextArea
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
            Trip History
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
            View completed school trips
          </Text>

        </View>


        <View
          style={[
            styles.totalCountContainer,
            {
              backgroundColor:
                colors.countBackground,
            },
          ]}
        >

          <Text
            style={[
              styles.totalCountText,
              {
                color:
                  colors.countText,
              },
            ]}
          >
            {tripHistoryData.length}
          </Text>


          <Text
            style={[
              styles.totalCountLabel,
              {
                color:
                  colors.countText,
              },
            ]}
          >
            Trips
          </Text>

        </View>

      </View>


      {/* ============================= */}
      {/* SUMMARY */}
      {/* ============================= */}

      <View
        style={
          styles.summaryRow
        }
      >

        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor:
                colors.pickupBackground,
            },
          ]}
        >

          <Text
            style={
              styles.summaryIcon
            }
          >
            🚌
          </Text>


          <View>

            <Text
              style={[
                styles.summaryCount,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {pickupCount}
            </Text>


            <Text
              style={[
                styles.summaryLabel,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Pickups
            </Text>

          </View>

        </View>


        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor:
                colors.dropOffBackground,
            },
          ]}
        >

          <Text
            style={
              styles.summaryIcon
            }
          >
            🏠
          </Text>


          <View>

            <Text
              style={[
                styles.summaryCount,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {dropOffCount}
            </Text>


            <Text
              style={[
                styles.summaryLabel,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Drop Offs
            </Text>

          </View>

        </View>

      </View>


      {/* ============================= */}
      {/* SEARCH */}
      {/* ============================= */}

      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor:
              colors.input,

            borderColor:
              colors.border,
          },
        ]}
      >

        <Text
          style={
            styles.searchIcon
          }
        >
          🔍
        </Text>


        <TextInput
          style={[
            styles.searchInput,
            {
              color:
                colors.text,
            },
          ]}
          placeholder=
            "Search route, date or bus"
          placeholderTextColor={
            colors.secondaryText
          }
          value={
            searchText
          }
          onChangeText={
            setSearchText
          }
          autoCorrect={
            false
          }
          returnKeyType=
            "search"
        />


        {searchText.length >
          0 && (

          <Pressable
            style={[
              styles.clearSearchButton,
              {
                backgroundColor:
                  colors.inactive,
              },
            ]}
            onPress={() =>
              setSearchText("")
            }
          >

            <Text
              style={[
                styles.clearSearchText,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              ✕
            </Text>

          </Pressable>

        )}

      </View>


      {/* ============================= */}
      {/* FILTER */}
      {/* ============================= */}

      <View
        style={
          styles.filterRow
        }
      >

        {filters.map(
          (filter) => {

            const isSelected =
              selectedFilter ===
              filter;


            return (

              <Pressable
                key={
                  filter
                }
                style={[
                  styles.filterButton,
                  {
                    backgroundColor:
                      isSelected
                        ? "#1768C4"
                        : colors.inactive,

                    borderColor:
                      isSelected
                        ? "#1768C4"
                        : colors.border,
                  },
                ]}
                onPress={() =>
                  setSelectedFilter(
                    filter
                  )
                }
              >

                <Text
                  style={[
                    styles.filterText,
                    {
                      color:
                        isSelected
                          ? "#FFFFFF"
                          : colors.text,
                    },
                  ]}
                >
                  {filter}
                </Text>

              </Pressable>

            );

          }
        )}

      </View>


      {/* ============================= */}
      {/* RESULT HEADER */}
      {/* ============================= */}

      <View
        style={
          styles.resultHeader
        }
      >

        <Text
          style={[
            styles.resultTitle,
            {
              color:
                colors.text,
            },
          ]}
        >
          Recent Trips
        </Text>


        <Text
          style={[
            styles.resultCount,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          {filteredTrips.length} found
        </Text>

      </View>


      {/* ============================= */}
      {/* EMPTY / LIST */}
      {/* ============================= */}

      {filteredTrips.length ===
      0 ? (

        <View
          style={[
            styles.emptyContainer,
            {
              backgroundColor:
                colors.card,

              borderColor:
                colors.border,
            },
          ]}
        >

          <Text
            style={
              styles.emptyIcon
            }
          >
            🕘
          </Text>


          <Text
            style={[
              styles.emptyTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            No trips found
          </Text>


          <Text
            style={[
              styles.emptyDescription,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Try another search or filter.
          </Text>


          <Pressable
            style={
              styles.resetButton
            }
            onPress={() => {

              setSearchText("");

              setSelectedFilter(
                "All"
              );

            }}
          >

            <Text
              style={
                styles.resetButtonText
              }
            >
              Reset Filters
            </Text>

          </Pressable>

        </View>

      ) : (

        <FlatList
          data={
            filteredTrips
          }
          keyExtractor={(
            item
          ) =>
            item.id
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps=
            "handled"
          contentContainerStyle={
            styles.listContent
          }
          renderItem={({
            item,
          }) => {

            const isExpanded =
              expandedTripId ===
              item.id;


            const completionRate =
              item.totalStudents ===
              0

                ? 0

                : Math.round(
                    (
                      item.completedStudents /
                      item.totalStudents
                    ) *
                      100
                  );


            return (

              <Pressable
                style={({
                  pressed,
                }) => [

                  styles.tripCard,

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
                  toggleTripDetails(
                    item.id
                  )
                }
              >

                {/* CARD TOP */}

                <View
                  style={
                    styles.cardTopRow
                  }
                >

                  <View
                    style={[
                      styles.tripTypeIconContainer,
                      {
                        backgroundColor:
                          item.tripType ===
                          "pickup"
                            ? colors.pickupBackground
                            : colors.dropOffBackground,
                      },
                    ]}
                  >

                    <Text
                      style={
                        styles.tripTypeIcon
                      }
                    >
                      {item.tripType ===
                      "pickup"
                        ? "🚌"
                        : "🏠"}
                    </Text>

                  </View>


                  <View
                    style={
                      styles.tripMainInfo
                    }
                  >

                    <View
                      style={
                        styles.routeTitleRow
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
                        {item.routeName}
                      </Text>


                      <View
                        style={[
                          styles.completedBadge,
                          {
                            backgroundColor:
                              colors.completedBackground,
                          },
                        ]}
                      >

                        <Text
                          style={[
                            styles.completedBadgeText,
                            {
                              color:
                                colors.completedText,
                            },
                          ]}
                        >
                          Completed
                        </Text>

                      </View>

                    </View>


                    <Text
                      style={[
                        styles.routePath,
                        {
                          color:
                            colors.secondaryText,
                        },
                      ]}
                    >
                      {item.routePath}
                    </Text>


                    <Text
                      style={[
                        styles.tripDate,
                        {
                          color:
                            colors.secondaryText,
                        },
                      ]}
                    >
                      📅 {item.tripDate}
                    </Text>

                  </View>


                  <Text
                    style={[
                      styles.expandIcon,
                      {
                        color:
                          colors.secondaryText,
                      },
                    ]}
                  >
                    {isExpanded
                      ? "⌃"
                      : "⌄"}
                  </Text>

                </View>


                {/* DIVIDER */}

                <View
                  style={[
                    styles.divider,
                    {
                      backgroundColor:
                        colors.divider,
                    },
                  ]}
                />


                {/* STATS */}

                <View
                  style={
                    styles.tripStatsRow
                  }
                >

                  <TripInfo
                    label="Students"
                    value={`${item.completedStudents}/${item.totalStudents}`}
                    textColor={
                      colors.text
                    }
                    secondaryColor={
                      colors.secondaryText
                    }
                  />


                  <TripInfo
                    label="Absent"
                    value={
                      item.absentStudents.toString()
                    }
                    textColor={
                      colors.text
                    }
                    secondaryColor={
                      colors.secondaryText
                    }
                  />


                  <TripInfo
                    label="Duration"
                    value={
                      formatDuration(
                        item.durationMinutes
                      )
                    }
                    textColor={
                      colors.text
                    }
                    secondaryColor={
                      colors.secondaryText
                    }
                  />


                  <TripInfo
                    label="Progress"
                    value={`${completionRate}%`}
                    textColor={
                      colors.text
                    }
                    secondaryColor={
                      colors.secondaryText
                    }
                  />

                </View>


                {/* EXPANDED */}

                {isExpanded && (

                  <View
                    style={
                      styles.expandedContainer
                    }
                  >

                    <View
                      style={[
                        styles.expandedDivider,
                        {
                          backgroundColor:
                            colors.divider,
                        },
                      ]}
                    />


                    {/* TIME */}

                    <View
                      style={
                        styles.timeRow
                      }
                    >

                      <TimeItem
                        icon="▶"
                        label=
                          "Start Time"
                        value={
                          item.startTime
                        }
                        textColor={
                          colors.text
                        }
                        secondaryColor={
                          colors.secondaryText
                        }
                        backgroundColor={
                          colors.timeBackground
                        }
                      />


                      <View
                        style={
                          styles.timeArrow
                        }
                      >

                        <Text
                          style={[
                            styles.timeArrowText,
                            {
                              color:
                                colors.secondaryText,
                            },
                          ]}
                        >
                          →
                        </Text>

                      </View>


                      <TimeItem
                        icon="■"
                        label=
                          "End Time"
                        value={
                          item.endTime
                        }
                        textColor={
                          colors.text
                        }
                        secondaryColor={
                          colors.secondaryText
                        }
                        backgroundColor={
                          colors.timeBackground
                        }
                      />

                    </View>


                    {/* BUS NUMBER */}

                    <View
                      style={[
                        styles.busNumberRow,
                        {
                          backgroundColor:
                            colors.busBackground,
                        },
                      ]}
                    >

                      <Text
                        style={
                          styles.busNumberIcon
                        }
                      >
                        🚌
                      </Text>


                      <View>

                        <Text
                          style={[
                            styles.busNumberLabel,
                            {
                              color:
                                colors.secondaryText,
                            },
                          ]}
                        >
                          Bus Number
                        </Text>


                        <Text
                          style={[
                            styles.busNumberValue,
                            {
                              color:
                                colors.countText,
                            },
                          ]}
                        >
                          {item.busNumber ||
                            "Not Assigned"}
                        </Text>

                      </View>

                    </View>


                    {/* PROGRESS */}

                    <View
                      style={
                        styles.progressHeader
                      }
                    >

                      <Text
                        style={[
                          styles.progressLabel,
                          {
                            color:
                              colors.secondaryText,
                          },
                        ]}
                      >
                        Student completion
                      </Text>


                      <Text
                        style={[
                          styles.progressValue,
                          {
                            color:
                              colors.countText,
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

                )}

              </Pressable>

            );

          }}
        />

      )}

    </SafeAreaView>

  );

}


// =====================================
// TRIP INFO
// =====================================

type TripInfoProps = {
  label: string;
  value: string;
  textColor: string;
  secondaryColor: string;
};


function TripInfo({
  label,
  value,
  textColor,
  secondaryColor,
}: TripInfoProps) {

  return (

    <View
      style={
        styles.tripInfoItem
      }
    >

      <Text
        style={[
          styles.tripInfoValue,
          {
            color:
              textColor,
          },
        ]}
      >
        {value}
      </Text>


      <Text
        style={[
          styles.tripInfoLabel,
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
// TIME ITEM
// =====================================

type TimeItemProps = {
  icon: string;
  label: string;
  value: string;
  textColor: string;
  secondaryColor: string;
  backgroundColor: string;
};


function TimeItem({
  icon,
  label,
  value,
  textColor,
  secondaryColor,
  backgroundColor,
}: TimeItemProps) {

  return (

    <View
      style={[
        styles.timeItem,
        {
          backgroundColor,
        },
      ]}
    >

      <Text
        style={
          styles.timeItemIcon
        }
      >
        {icon}
      </Text>


      <View>

        <Text
          style={[
            styles.timeItemLabel,
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
            styles.timeItemValue,
            {
              color:
                textColor,
            },
          ]}
        >
          {value}
        </Text>

      </View>

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
      marginBottom: 16,
    },

    headerTextArea: {
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

    totalCountContainer: {
      minWidth: 64,
      borderRadius: 15,
      paddingHorizontal: 10,
      paddingVertical: 7,
      alignItems: "center",
    },

    totalCountText: {
      fontSize: 19,
      fontWeight: "900",
    },

    totalCountLabel: {
      fontSize: 9,
      fontWeight: "800",
    },

    summaryRow: {
      flexDirection: "row",
      marginHorizontal: -5,
      marginBottom: 14,
    },

    summaryCard: {
      flex: 1,
      minHeight: 76,
      marginHorizontal: 5,
      borderRadius: 16,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
    },

    summaryIcon: {
      fontSize: 25,
      marginRight: 12,
    },

    summaryCount: {
      fontSize: 20,
      fontWeight: "900",
    },

    summaryLabel: {
      fontSize: 10,
      fontWeight: "700",
      marginTop: 2,
    },

    searchContainer: {
      height: 50,
      borderWidth: 1,
      borderRadius: 15,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 13,
      elevation: 2,
    },

    searchIcon: {
      fontSize: 17,
      marginRight: 9,
    },

    searchInput: {
      flex: 1,
      fontSize: 14,
    },

    clearSearchButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
    },

    clearSearchText: {
      fontSize: 13,
      fontWeight: "800",
    },

    filterRow: {
      flexDirection: "row",
      marginHorizontal: -4,
      marginTop: 12,
      marginBottom: 15,
    },

    filterButton: {
      flex: 1,
      minHeight: 39,
      marginHorizontal: 4,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    filterText: {
      fontSize: 11,
      fontWeight: "800",
    },

    resultHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },

    resultTitle: {
      fontSize: 17,
      fontWeight: "900",
    },

    resultCount: {
      fontSize: 11,
      fontWeight: "600",
    },

    listContent: {
      paddingBottom: 20,
    },

    tripCard: {
      borderWidth: 1,
      borderRadius: 18,
      padding: 15,
      marginBottom: 13,
      elevation: 2,
    },

    cardTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },

    tripTypeIconContainer: {
      width: 46,
      height: 46,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 11,
    },

    tripTypeIcon: {
      fontSize: 21,
    },

    tripMainInfo: {
      flex: 1,
    },

    routeTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
    },

    routeName: {
      fontSize: 16,
      fontWeight: "900",
      marginRight: 8,
    },

    completedBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 9,
    },

    completedBadgeText: {
      fontSize: 8,
      fontWeight: "900",
    },

    routePath: {
      fontSize: 12,
      marginTop: 5,
    },

    tripDate: {
      fontSize: 10,
      marginTop: 6,
    },

    expandIcon: {
      fontSize: 20,
      marginLeft: 7,
    },

    divider: {
      height: 1,
      marginVertical: 13,
    },

    tripStatsRow: {
      flexDirection: "row",
    },

    tripInfoItem: {
      flex: 1,
      alignItems: "center",
    },

    tripInfoValue: {
      fontSize: 13,
      fontWeight: "900",
    },

    tripInfoLabel: {
      fontSize: 8,
      fontWeight: "600",
      marginTop: 3,
    },

    expandedContainer: {
      marginTop: 13,
    },

    expandedDivider: {
      height: 1,
      marginBottom: 14,
    },

    timeRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    timeItem: {
      flex: 1,
      borderRadius: 13,
      padding: 11,
      flexDirection: "row",
      alignItems: "center",
    },

    timeItemIcon: {
      color: "#1768C4",
      fontSize: 12,
      marginRight: 8,
    },

    timeItemLabel: {
      fontSize: 8,
    },

    timeItemValue: {
      fontSize: 11,
      fontWeight: "800",
      marginTop: 3,
    },

    timeArrow: {
      width: 28,
      alignItems: "center",
    },

    timeArrowText: {
      fontSize: 17,
    },

    busNumberRow: {
      borderRadius: 13,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      marginTop: 12,
    },

    busNumberIcon: {
      fontSize: 20,
      marginRight: 10,
    },

    busNumberLabel: {
      fontSize: 8,
    },

    busNumberValue: {
      fontSize: 12,
      fontWeight: "900",
      marginTop: 2,
    },

    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 14,
    },

    progressLabel: {
      fontSize: 10,
      fontWeight: "700",
    },

    progressValue: {
      fontSize: 10,
      fontWeight: "900",
    },

    progressTrack: {
      height: 7,
      borderRadius: 4,
      marginTop: 8,
      overflow: "hidden",
    },

    progressFill: {
      height: "100%",
      backgroundColor: "#1768C4",
      borderRadius: 4,
    },

    emptyContainer: {
      borderWidth: 1,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 50,
      paddingHorizontal: 20,
    },

    emptyIcon: {
      fontSize: 48,
      marginBottom: 12,
    },

    emptyTitle: {
      fontSize: 19,
      fontWeight: "900",
    },

    emptyDescription: {
      fontSize: 13,
      marginTop: 7,
      textAlign: "center",
    },

    resetButton: {
      minHeight: 43,
      backgroundColor: "#1768C4",
      borderRadius: 12,
      paddingHorizontal: 17,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 17,
    },

    resetButtonText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "800",
    },

    buttonPressed: {
      opacity: 0.72,
    },

  });