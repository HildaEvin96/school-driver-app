import React from "react";

import {
  Alert,
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
  AppThemeMode,
  useAppTheme,
} from "../../context/ThemeContext";

import {
  useAuth,
} from "../../context/AuthContext";


type ThemeOption = {
  id: AppThemeMode;
  title: string;
  description: string;
  icon: string;
};


const themeOptions: ThemeOption[] = [
  {
    id: "light",
    title: "Light Mode",
    description:
      "Use a bright appearance throughout the app",
    icon: "☀️",
  },
  {
    id: "dark",
    title: "Dark Mode",
    description:
      "Use a dark appearance throughout the app",
    icon: "🌙",
  },
];


export default function SettingsScreen() {

  // =========================
  // THEME
  // =========================

  const {
    themeMode,
    isDarkMode,
    setThemeMode,
  } = useAppTheme();


  // =========================
  // AUTH
  // =========================

  const {
    appUser,
    logout,
  } = useAuth();


  // =========================
  // COLORS
  // =========================

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

    selectedBackground:
      isDarkMode
        ? "#163657"
        : "#EAF3FC",

    iconBackground:
      isDarkMode
        ? "#27405B"
        : "#F4F8FD",

    previewBackground:
      isDarkMode
        ? "#07131F"
        : "#FFFFFF",

    previewInner:
      isDarkMode
        ? "#10243A"
        : "#F4F8FD",

    blueText:
      isDarkMode
        ? "#8EC7FF"
        : "#1768C4",

    statusBackground:
      isDarkMode
        ? "#123837"
        : "#E7F6F4",

    statusText:
      isDarkMode
        ? "#76E2D8"
        : "#0B7C76",

  };


  // =========================
  // DRIVER INITIALS
  // =========================

  const driverInitials =
    appUser?.name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (name) =>
          name.charAt(0)
            .toUpperCase()
      )
      .join("") || "DR";


  // =========================
  // CHANGE THEME
  // =========================

  const selectTheme = async (
    selectedTheme: AppThemeMode
  ) => {

    try {

      await setThemeMode(
        selectedTheme
      );

    } catch (error) {

      console.log(
        "THEME CHANGE ERROR:",
        error
      );


      Alert.alert(
        "Theme Error",
        "Could not change the app theme."
      );

    }

  };


  // =========================
  // NOTIFICATIONS
  // =========================

  const showNotifications = () => {

    Alert.alert(
      "Notifications",
      "Parent alerts, pickup messages and trip updates will be added later."
    );

  };


  // =========================
  // ABOUT
  // =========================

  const showAbout = () => {

    Alert.alert(
      "School Driver App",
      "Version 1.0.0\n\nSchool bus pickup, drop-off and trip management application."
    );

  };


  // =========================
  // LOGOUT
  // =========================

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

              console.log(
                "LOGOUT BUTTON PRESSED"
              );


              await logout();


              console.log(
                "USER LOGGED OUT"
              );


              /*
                IMPORTANT:

                No router.replace("/login")
                is needed here.

                logout()
                    ↓
                Firebase Auth user = null
                    ↓
                AuthContext onAuthStateChanged()
                    ↓
                firebaseUser = null
                    ↓
                Root protected routes
                    ↓
                Login screen
              */

            } catch (error) {

              console.log(
                "SETTINGS LOGOUT ERROR:",
                error
              );


              Alert.alert(
                "Logout Failed",
                "Could not logout. Please try again."
              );

            }

          },

        },

      ]
    );

  };


  // =========================
  // UI
  // =========================

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

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* =========================
            HEADER
        ========================= */}

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
            Settings
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
            Customize your driver app
          </Text>

        </View>


        {/* =========================
            CURRENT APPEARANCE
        ========================= */}

        <View
          style={[
            styles.appearancePreview,
            {
              backgroundColor:
                colors.previewBackground,

              borderColor:
                colors.border,
            },
          ]}
        >

          <View
            style={[
              styles.previewIconContainer,
              {
                backgroundColor:
                  colors.previewInner,
              },
            ]}
          >

            <Text
              style={
                styles.previewIcon
              }
            >
              {isDarkMode
                ? "🌙"
                : "☀️"}
            </Text>

          </View>


          <View
            style={
              styles.previewContent
            }
          >

            <Text
              style={[
                styles.previewLabel,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Current Appearance
            </Text>


            <Text
              style={[
                styles.previewTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {isDarkMode
                ? "Dark Mode"
                : "Light Mode"}
            </Text>

          </View>


          <View
            style={[
              styles.activeBadge,
              {
                backgroundColor:
                  colors.statusBackground,
              },
            ]}
          >

            <Text
              style={[
                styles.activeBadgeText,
                {
                  color:
                    colors.statusText,
                },
              ]}
            >
              Active
            </Text>

          </View>

        </View>


        {/* =========================
            APPEARANCE
        ========================= */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                colors.text,
            },
          ]}
        >
          Appearance
        </Text>


        <View
          style={[
            styles.settingsCard,
            {
              backgroundColor:
                colors.card,

              borderColor:
                colors.border,
            },
          ]}
        >

          {themeOptions.map(
            (
              option,
              index
            ) => {

              const isSelected =
                themeMode ===
                option.id;


              return (

                <React.Fragment
                  key={
                    option.id
                  }
                >

                  <Pressable
                    style={({
                      pressed,
                    }) => [

                      styles.themeOption,

                      isSelected && {
                        backgroundColor:
                          colors.selectedBackground,
                      },

                      pressed &&
                        styles.buttonPressed,

                    ]}
                    onPress={() => {

                      void selectTheme(
                        option.id
                      );

                    }}
                  >

                    <View
                      style={[
                        styles.optionIconContainer,
                        {
                          backgroundColor:
                            colors.iconBackground,
                        },
                      ]}
                    >

                      <Text
                        style={
                          styles.optionIcon
                        }
                      >
                        {option.icon}
                      </Text>

                    </View>


                    <View
                      style={
                        styles.optionContent
                      }
                    >

                      <Text
                        style={[
                          styles.optionTitle,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {option.title}
                      </Text>


                      <Text
                        style={[
                          styles.optionDescription,
                          {
                            color:
                              colors.secondaryText,
                          },
                        ]}
                      >
                        {option.description}
                      </Text>

                    </View>


                    <View
                      style={[
                        styles.radioOuter,
                        {
                          borderColor:
                            isSelected
                              ? "#1768C4"
                              : colors.secondaryText,
                        },
                      ]}
                    >

                      {isSelected && (

                        <View
                          style={
                            styles.radioInner
                          }
                        />

                      )}

                    </View>

                  </Pressable>


                  {index <
                    themeOptions.length -
                      1 && (

                    <View
                      style={[
                        styles.divider,
                        {
                          backgroundColor:
                            colors.border,
                        },
                      ]}
                    />

                  )}

                </React.Fragment>

              );

            }
          )}

        </View>


        {/* =========================
            DRIVER INFORMATION
        ========================= */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                colors.text,
            },
          ]}
        >
          Driver Information
        </Text>


        <View
          style={[
            styles.profileCard,
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
              styles.avatarContainer
            }
          >

            <Text
              style={
                styles.avatarText
              }
            >
              {driverInitials}
            </Text>

          </View>


          <View
            style={
              styles.profileContent
            }
          >

            <Text
              style={[
                styles.driverName,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {appUser?.name ||
                "Driver"}
            </Text>


            <Text
              style={[
                styles.driverDetails,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              {appUser?.phone ||
                "No phone number"}
            </Text>


            <Text
              style={[
                styles.driverDetails,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Driver Account
            </Text>

          </View>


          <View
            style={[
              styles.driverStatus,
              {
                backgroundColor:
                  appUser?.active
                    ? colors.statusBackground
                    : "#FDECEC",
              },
            ]}
          >

            <Text
              style={[
                styles.driverStatusText,
                {
                  color:
                    appUser?.active
                      ? colors.statusText
                      : "#D32F2F",
                },
              ]}
            >
              {appUser?.active
                ? "Active"
                : "Inactive"}
            </Text>

          </View>

        </View>


        {/* =========================
            APPLICATION
        ========================= */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                colors.text,
            },
          ]}
        >
          Application
        </Text>


        <View
          style={[
            styles.settingsCard,
            {
              backgroundColor:
                colors.card,

              borderColor:
                colors.border,
            },
          ]}
        >

          {/* NOTIFICATIONS */}

          <SettingsItem
            icon="🔔"
            title="Notifications"
            description="Parent alerts and trip updates"
            textColor={
              colors.text
            }
            secondaryColor={
              colors.secondaryText
            }
            iconBackground={
              colors.iconBackground
            }
            onPress={
              showNotifications
            }
          />


          <View
            style={[
              styles.divider,
              {
                backgroundColor:
                  colors.border,
              },
            ]}
          />


          {/* ABOUT */}

          <SettingsItem
            icon="ℹ️"
            title="About App"
            description="Version and application information"
            textColor={
              colors.text
            }
            secondaryColor={
              colors.secondaryText
            }
            iconBackground={
              colors.iconBackground
            }
            onPress={
              showAbout
            }
          />


          <View
            style={[
              styles.divider,
              {
                backgroundColor:
                  colors.border,
              },
            ]}
          />


          {/* LOGOUT */}

          <SettingsItem
            icon="🚪"
            title="Logout"
            description="Sign out from your driver account"
            textColor="#D32F2F"
            secondaryColor={
              colors.secondaryText
            }
            iconBackground={
              colors.iconBackground
            }
            onPress={
              handleLogout
            }
          />

        </View>


        {/* =========================
            FOOTER
        ========================= */}

        <Text
          style={[
            styles.footerText,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          School Driver App • Version 1.0.0
        </Text>

      </ScrollView>

    </SafeAreaView>

  );

}


// =========================
// SETTINGS ITEM
// =========================

type SettingsItemProps = {

  icon: string;

  title: string;

  description: string;

  textColor: string;

  secondaryColor: string;

  iconBackground: string;

  onPress: () => void;

};


function SettingsItem({

  icon,

  title,

  description,

  textColor,

  secondaryColor,

  iconBackground,

  onPress,

}: SettingsItemProps) {

  return (

    <Pressable
      style={({
        pressed,
      }) => [

        styles.settingsItem,

        pressed &&
          styles.buttonPressed,

      ]}
      onPress={
        onPress
      }
    >

      <View
        style={[
          styles.optionIconContainer,
          {
            backgroundColor:
              iconBackground,
          },
        ]}
      >

        <Text
          style={
            styles.optionIcon
          }
        >
          {icon}
        </Text>

      </View>


      <View
        style={
          styles.optionContent
        }
      >

        <Text
          style={[
            styles.optionTitle,
            {
              color:
                textColor,
            },
          ]}
        >
          {title}
        </Text>


        <Text
          style={[
            styles.optionDescription,
            {
              color:
                secondaryColor,
            },
          ]}
        >
          {description}
        </Text>

      </View>


      <Text
        style={[
          styles.arrow,
          {
            color:
              secondaryColor,
          },
        ]}
      >
        ›
      </Text>

    </Pressable>

  );

}


// =========================
// STYLES
// =========================

const styles =
  StyleSheet.create({

    container: {

      flex: 1,

    },


    scrollContent: {

      paddingHorizontal:
        18,

      paddingBottom:
        20,

    },


    header: {

      marginTop:
        4,

      marginBottom:
        18,

    },


    heading: {

      fontSize:
        27,

      fontWeight:
        "900",

    },


    subHeading: {

      fontSize:
        12,

      marginTop:
        3,

    },


    appearancePreview: {

      minHeight:
        90,

      borderWidth:
        1,

      borderRadius:
        19,

      padding:
        14,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        24,

      elevation:
        2,

    },


    previewIconContainer: {

      width:
        52,

      height:
        52,

      borderRadius:
        16,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        12,

    },


    previewIcon: {

      fontSize:
        25,

    },


    previewContent: {

      flex:
        1,

    },


    previewLabel: {

      fontSize:
        10,

    },


    previewTitle: {

      fontSize:
        16,

      fontWeight:
        "900",

      marginTop:
        4,

    },


    activeBadge: {

      borderRadius:
        10,

      paddingHorizontal:
        9,

      paddingVertical:
        5,

    },


    activeBadgeText: {

      fontSize:
        9,

      fontWeight:
        "900",

    },


    sectionTitle: {

      fontSize:
        16,

      fontWeight:
        "900",

      marginBottom:
        10,

    },


    settingsCard: {

      borderWidth:
        1,

      borderRadius:
        18,

      overflow:
        "hidden",

      marginBottom:
        24,

      elevation:
        2,

    },


    themeOption: {

      minHeight:
        78,

      paddingHorizontal:
        14,

      flexDirection:
        "row",

      alignItems:
        "center",

    },


    settingsItem: {

      minHeight:
        75,

      paddingHorizontal:
        14,

      flexDirection:
        "row",

      alignItems:
        "center",

    },


    optionIconContainer: {

      width:
        44,

      height:
        44,

      borderRadius:
        14,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        12,

    },


    optionIcon: {

      fontSize:
        21,

    },


    optionContent: {

      flex:
        1,

    },


    optionTitle: {

      fontSize:
        14,

      fontWeight:
        "800",

    },


    optionDescription: {

      fontSize:
        10,

      marginTop:
        4,

    },


    radioOuter: {

      width:
        23,

      height:
        23,

      borderRadius:
        12,

      borderWidth:
        2,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginLeft:
        10,

    },


    radioInner: {

      width:
        13,

      height:
        13,

      borderRadius:
        7,

      backgroundColor:
        "#1768C4",

    },


    divider: {

      height:
        1,

      marginLeft:
        70,

    },


    profileCard: {

      borderWidth:
        1,

      borderRadius:
        18,

      padding:
        15,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        24,

      elevation:
        2,

    },


    avatarContainer: {

      width:
        57,

      height:
        57,

      borderRadius:
        29,

      backgroundColor:
        "#1768C4",

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        13,

    },


    avatarText: {

      color:
        "#FFFFFF",

      fontSize:
        17,

      fontWeight:
        "900",

    },


    profileContent: {

      flex:
        1,

    },


    driverName: {

      fontSize:
        16,

      fontWeight:
        "900",

      marginBottom:
        5,

    },


    driverDetails: {

      fontSize:
        11,

      marginTop:
        2,

    },


    driverStatus: {

      borderRadius:
        10,

      paddingHorizontal:
        8,

      paddingVertical:
        5,

      marginLeft:
        8,

    },


    driverStatusText: {

      fontSize:
        8,

      fontWeight:
        "900",

    },


    arrow: {

      fontSize:
        27,

      marginLeft:
        10,

    },


    footerText: {

      fontSize:
        10,

      textAlign:
        "center",

      marginTop:
        8,

      marginBottom:
        4,

    },


    buttonPressed: {

      opacity:
        0.65,

    },

  });