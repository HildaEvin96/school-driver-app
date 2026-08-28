import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import {
  Stack,
} from "expo-router";

import {
  StatusBar,
} from "expo-status-bar";

import {
  useEffect,
} from "react";

import {
  SafeAreaProvider,
} from "react-native-safe-area-context";

import {
  initializeDatabase,
} from "../database/migrations";

import {
  AuthProvider,
  useAuth,
} from "../context/AuthContext";

import {
  AppThemeProvider,
  useAppTheme,
} from "../context/ThemeContext";


function RootNavigation() {

  const {
    isDarkMode,
  } = useAppTheme();


  const {
    loading,
    isAuthenticated,
    isDriver,
    appUser,
  } = useAuth();


  useEffect(() => {
    initializeDatabase();
  }, []);


  if (loading) {
    return null;
  }


  return (
    <ThemeProvider
      value={
        isDarkMode
          ? DarkTheme
          : DefaultTheme
      }
    >

      <Stack
        screenOptions={{
          headerShown: false,

          animation:
            "slide_from_right",

          contentStyle: {
            backgroundColor:
              isDarkMode
                ? "#081726"
                : "#F4F8FD",
          },
        }}
      >

        {/* ======================
            NOT LOGGED IN
        ====================== */}

        <Stack.Protected
          guard={
            !isAuthenticated
          }
        >

          <Stack.Screen
            name="login"
          />

          <Stack.Screen
            name="otp"
          />

        </Stack.Protected>


        {/* ======================
            NEW USER
            AUTHENTICATED BUT
            PROFILE NOT CREATED
        ====================== */}

        <Stack.Protected
          guard={
            isAuthenticated &&
            appUser === null
          }
        >

          <Stack.Screen
            name="signup"
          />

        </Stack.Protected>


        {/* ======================
            DRIVER AUTHORIZED
        ====================== */}

        <Stack.Protected
          guard={
            isAuthenticated &&
            isDriver
          }
        >

          <Stack.Screen
            name="(tabs)"
          />

          <Stack.Screen
            name="pickup"
          />

          <Stack.Screen
            name="dropoff"
          />

          <Stack.Screen
            name="student-details"
          />

          <Stack.Screen
            name="modal"
            options={{
              presentation:
                "modal",
            }}
          />

        </Stack.Protected>

      </Stack>


      <StatusBar
        style={
          isDarkMode
            ? "light"
            : "dark"
        }
      />

    </ThemeProvider>
  );
}


export default function RootLayout() {

  return (
    <SafeAreaProvider>

      <AppThemeProvider>

        <AuthProvider>

          <RootNavigation />

        </AuthProvider>

      </AppThemeProvider>

    </SafeAreaProvider>
  );
}