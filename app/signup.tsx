import React, {
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
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
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import {
  getAuth,
} from "@react-native-firebase/auth";

import {
  doc,
  getFirestore,
  setDoc,
} from "@react-native-firebase/firestore";

import {
  useAuth,
} from "../context/AuthContext";


export default function SignupScreen() {

  const router =
    useRouter();


  const params =
    useLocalSearchParams<{
      phoneNumber?: string;
    }>();


  const phoneNumber =
    typeof params.phoneNumber ===
    "string"
      ? params.phoneNumber
      : "";


  const {
    refreshUser,
  } = useAuth();


  const [
    name,
    setName,
  ] =
    useState("");


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const auth =
    getAuth();


  const firestore =
    getFirestore();


  const createProfile =
    async () => {

      const cleanName =
        name.trim();


      if (
        cleanName.length < 2
      ) {

        Alert.alert(
          "Enter Name",
          "Please enter your full name."
        );

        return;

      }


      const currentUser =
        auth.currentUser;


      if (!currentUser) {

        Alert.alert(
          "Authentication Error",
          "Your login session is missing. Please login again."
        );

        router.replace(
          "/login"
        );

        return;

      }


      try {

        setLoading(
          true
        );


        console.log(
          "CREATING DRIVER PROFILE:",
          currentUser.uid
        );


        const userRef =
          doc(
            firestore,
            "users",
            currentUser.uid
          );


        await setDoc(
          userRef,
          {
            name:
              cleanName,

            phone:
              currentUser.phoneNumber ??
              phoneNumber,

            role:
              "driver",

            active:
              true,

            createdAt:
              new Date().toISOString(),
          }
        );


        console.log(
          "DRIVER PROFILE CREATED"
        );


        await refreshUser();


        router.replace(
          "/(tabs)"
        );


      } catch (error: any) {

        console.log(
          "SIGNUP ERROR:",
          error
        );


        Alert.alert(
          "Signup Failed",
          "Unable to create your driver profile. Please try again."
        );


      } finally {

        setLoading(
          false
        );

      }

    };


  return (

    <SafeAreaView
      style={
        styles.container
      }
      edges={[
        "top",
        "bottom",
        "left",
        "right",
      ]}
    >

      <View
        style={
          styles.content
        }
      >

        <View
          style={
            styles.iconContainer
          }
        >

          <Text
            style={
              styles.icon
            }
          >
            👤
          </Text>

        </View>


        <Text
          style={
            styles.title
          }
        >
          Complete Profile
        </Text>


        <Text
          style={
            styles.description
          }
        >
          Enter your name to complete
          your driver account.
        </Text>


        <Text
          style={
            styles.label
          }
        >
          Full Name
        </Text>


        <TextInput
          style={
            styles.input
          }
          value={
            name
          }
          onChangeText={
            setName
          }
          placeholder=
            "Enter your full name"
          placeholderTextColor=
            "#8A98AA"
          autoCapitalize="words"
          editable={
            !loading
          }
        />


        <Text
          style={[
            styles.label,
            styles.phoneLabel,
          ]}
        >
          Mobile Number
        </Text>


        <View
          style={
            styles.phoneContainer
          }
        >

          <Text
            style={
              styles.phoneText
            }
          >
            {phoneNumber ||
              auth.currentUser
                ?.phoneNumber ||
              ""}
          </Text>

        </View>


        <Pressable
          disabled={
            loading
          }
          style={({ pressed }) => [

            styles.button,

            (
              loading ||
              name.trim().length <
                2
            ) &&
              styles.disabledButton,

            pressed &&
              !loading &&
              styles.buttonPressed,

          ]}
          onPress={
            createProfile
          }
        >

          {loading ? (

            <ActivityIndicator
              color="#FFFFFF"
            />

          ) : (

            <Text
              style={
                styles.buttonText
              }
            >
              Continue
            </Text>

          )}

        </Pressable>


        <Text
          style={
            styles.helperText
          }
        >
          Your verified mobile number
          cannot be changed here.
        </Text>

      </View>

    </SafeAreaView>

  );

}


const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        "#F4F8FD",
    },

    content: {
      flex: 1,
      justifyContent:
        "center",
      paddingHorizontal: 24,
    },

    iconContainer: {
      width: 76,
      height: 76,
      borderRadius: 24,
      backgroundColor:
        "#EAF3FC",
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginBottom: 22,
    },

    icon: {
      fontSize: 35,
    },

    title: {
      color: "#08285C",
      fontSize: 28,
      fontWeight: "900",
      textAlign: "center",
    },

    description: {
      color: "#66758E",
      fontSize: 13,
      lineHeight: 20,
      textAlign: "center",
      marginTop: 8,
      marginBottom: 30,
    },

    label: {
      color: "#08285C",
      fontSize: 12,
      fontWeight: "800",
      marginBottom: 8,
    },

    phoneLabel: {
      marginTop: 18,
    },

    input: {
      height: 56,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#D8E4F0",
      borderRadius: 15,
      paddingHorizontal: 14,
      color: "#08285C",
      fontSize: 15,
      fontWeight: "600",
    },

    phoneContainer: {
      height: 56,
      backgroundColor:
        "#EAF3FC",
      borderWidth: 1,
      borderColor:
        "#D8E4F0",
      borderRadius: 15,
      paddingHorizontal: 14,
      justifyContent:
        "center",
    },

    phoneText: {
      color: "#1768C4",
      fontSize: 14,
      fontWeight: "800",
    },

    button: {
      minHeight: 54,
      backgroundColor:
        "#0F5DA8",
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 22,
    },

    buttonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "900",
    },

    disabledButton: {
      opacity: 0.45,
    },

    buttonPressed: {
      opacity: 0.75,
    },

    helperText: {
      color: "#7A899B",
      fontSize: 10,
      lineHeight: 16,
      textAlign: "center",
      marginTop: 14,
    },

  });