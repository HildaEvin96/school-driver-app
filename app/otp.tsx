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
  PhoneAuthProvider,
  signInWithCredential,
  signOut,
} from "@react-native-firebase/auth";

import {
  doc,
  getDoc,
  getFirestore,
} from "@react-native-firebase/firestore";


// =====================================
// OTP SCREEN
// =====================================

export default function OtpScreen() {

  const router =
    useRouter();


  // =====================================
  // ROUTE PARAMS
  // =====================================

  const params =
    useLocalSearchParams<{
      verificationId?: string;
      phoneNumber?: string;
    }>();


  const verificationId =
    typeof params.verificationId ===
    "string"
      ? params.verificationId
      : "";


  const phoneNumber =
    typeof params.phoneNumber ===
    "string"
      ? params.phoneNumber
      : "";


  // =====================================
  // STATE
  // =====================================

  const [
    otp,
    setOtp,
  ] =
    useState("");


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  // =====================================
  // FIREBASE
  // =====================================

  const auth =
    getAuth();


  const firestore =
    getFirestore();


  // =====================================
  // OTP INPUT
  // =====================================

  const handleOtpChange = (
    value: string
  ) => {

    const numbersOnly =
      value.replace(
        /\D/g,
        ""
      );


    setOtp(
      numbersOnly.slice(
        0,
        6
      )
    );

  };


  // =====================================
  // VERIFY OTP
  // =====================================

  const verifyOtp =
    async () => {

      const cleanOtp =
        otp.replace(
          /\D/g,
          ""
        );


      // =================================
      // VALIDATE OTP
      // =================================

      if (
        cleanOtp.length !==
        6
      ) {

        Alert.alert(
          "Invalid OTP",
          "Please enter the 6 digit verification code."
        );

        return;

      }


      // =================================
      // VERIFICATION ID CHECK
      // =================================

      if (
        !verificationId
      ) {

        Alert.alert(
          "Verification Error",
          "Verification session is missing. Please request OTP again.",
          [
            {
              text: "OK",

              onPress: () => {

                router.back();

              },
            },
          ]
        );

        return;

      }


      try {

        setLoading(
          true
        );


        console.log(
          "VERIFYING OTP FOR:",
          phoneNumber
        );


        // =================================
        // CREATE PHONE CREDENTIAL
        // =================================

        const credential =
          PhoneAuthProvider.credential(
            verificationId,
            cleanOtp
          );


        // =================================
        // FIREBASE SIGN IN
        // =================================

        const result =
          await signInWithCredential(
            auth,
            credential
          );


        const firebaseUser =
          result.user;


        console.log(
          "OTP VERIFIED:",
          firebaseUser.uid
        );


        console.log(
          "LOGGED IN PHONE:",
          firebaseUser.phoneNumber
        );


        // =================================
        // FIRESTORE PROFILE CHECK
        // =================================

        console.log(
          "CHECKING FIRESTORE PROFILE:",
          firebaseUser.uid
        );


        const userRef =
          doc(
            firestore,
            "users",
            firebaseUser.uid
          );


        const userSnapshot =
          await getDoc(
            userRef
          );


        // =================================
        // NEW USER
        // =================================

      if (!userSnapshot.exists()) {

          console.log(
            "USER PROFILE NOT FOUND"
          );


          console.log(
            "NEW USER -> SIGNUP"
          );


          router.replace({
            pathname: "/signup",

            params: {
              phoneNumber:
                firebaseUser.phoneNumber ??
                phoneNumber,
            },
          });


          return;

        }


        // =================================
        // EXISTING USER
        // =================================

        const userData =
          userSnapshot.data();


        if (
          !userData
        ) {

          console.log(
            "USER PROFILE EMPTY"
          );


          Alert.alert(
            "Profile Error",
            "Unable to read your driver profile."
          );


          return;

        }


        console.log(
          "EXISTING USER PROFILE:",
          userData
        );


        // =================================
        // DRIVER ROLE CHECK
        // =================================

        if (
          userData.role !==
          "driver"
        ) {

          console.log(
            "INVALID DRIVER ROLE:",
            userData.role
          );


          await signOut(
            auth
          );


          Alert.alert(
            "Access Denied",
            "This account is not registered as a driver.",
            [
              {
                text: "OK",

                onPress: () => {

                  router.replace(
                    "/login"
                  );

                },
              },
            ]
          );


          return;

        }


        // =================================
        // ACTIVE STATUS CHECK
        // =================================

        if (
          userData.active !==
          true
        ) {

          console.log(
            "DRIVER ACCOUNT INACTIVE"
          );


          await signOut(
            auth
          );


          Alert.alert(
            "Account Inactive",
            "Your driver account is currently inactive. Please contact the administrator.",
            [
              {
                text: "OK",

                onPress: () => {

                  router.replace(
                    "/login"
                  );

                },
              },
            ]
          );


          return;

        }


        // =================================
        // VALID DRIVER
        // =================================

        console.log(
          "VALID DRIVER PROFILE FOUND"
        );


        console.log(
          "DRIVER NAME:",
          userData.name
        );


        console.log(
          "OPENING HOME SCREEN"
        );


        router.replace(
          "/(tabs)"
        );


      } catch (
        error: any
      ) {

        console.log(
          "OTP VERIFY ERROR:",
          error
        );


        console.log(
          "OTP VERIFY ERROR CODE:",
          error?.code
        );


        console.log(
          "OTP VERIFY ERROR MESSAGE:",
          error?.message
        );


        let message =
          "OTP verification failed. Please try again.";


        // =================================
        // WRONG OTP
        // =================================

        if (
          error?.code ===
          "auth/invalid-verification-code"
        ) {

          message =
            "The verification code is incorrect.";

        }


        // =================================
        // OTP EXPIRED
        // =================================

        else if (
          error?.code ===
          "auth/session-expired"
        ) {

          message =
            "This OTP has expired. Please request a new OTP.";

        }


        // =================================
        // INVALID CREDENTIAL
        // =================================

        else if (
          error?.code ===
          "auth/invalid-credential"
        ) {

          message =
            "The verification session is invalid. Please request a new OTP.";

        }


        // =================================
        // TOO MANY REQUESTS
        // =================================

        else if (
          error?.code ===
          "auth/too-many-requests"
        ) {

          message =
            "Too many attempts. Please try again later.";

        }


        // =================================
        // FIRESTORE PERMISSION
        // =================================

        else if (
          error?.code ===
            "firestore/permission-denied" ||
          error?.code ===
            "permission-denied"
        ) {

          message =
            "Unable to access your driver profile. Please check Firestore permissions.";

        }


        Alert.alert(
          "Verification Failed",
          message
        );


      } finally {

        setLoading(
          false
        );

      }

    };


  // =====================================
  // BACK TO LOGIN
  // =====================================

  const goBack =
    () => {

      if (
        loading
      ) {

        return;

      }


      router.back();

    };


  // =====================================
  // UI
  // =====================================

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

        {/* BACK BUTTON */}

        <Pressable
          style={
            styles.backButton
          }
          onPress={
            goBack
          }
          disabled={
            loading
          }
        >

          <Text
            style={
              styles.backIcon
            }
          >
            ‹
          </Text>

        </Pressable>


        {/* ICON */}

        <View
          style={
            styles.logoContainer
          }
        >

          <Text
            style={
              styles.logoIcon
            }
          >
            🔐
          </Text>

        </View>


        {/* TITLE */}

        <Text
          style={
            styles.title
          }
        >
          Verify OTP
        </Text>


        {/* DESCRIPTION */}

        <Text
          style={
            styles.description
          }
        >
          Enter the 6 digit verification
          code sent to
        </Text>


        {/* PHONE */}

        <Text
          style={
            styles.phoneText
          }
        >
          {phoneNumber ||
            "your mobile number"}
        </Text>


        {/* OTP INPUT */}

        <TextInput
          style={
            styles.otpInput
          }

          value={
            otp
          }

          onChangeText={
            handleOtpChange
          }

          placeholder="------"

          placeholderTextColor={
            "#9AA7B7"
          }

          keyboardType="number-pad"

          maxLength={6}

          textAlign="center"

          editable={
            !loading
          }

          autoFocus

          textContentType=
            "oneTimeCode"

          onSubmitEditing={() => {

            if (
              otp.length ===
              6
            ) {

              verifyOtp();

            }

          }}
        />


        {/* VERIFY BUTTON */}

        <Pressable
          disabled={
            loading ||
            otp.length !==
              6
          }

          style={({
            pressed,
          }) => [

            styles.verifyButton,

            (
              otp.length !==
                6 ||
              loading
            ) &&
              styles.disabledButton,

            pressed &&
              otp.length ===
                6 &&
              !loading &&
              styles.buttonPressed,

          ]}

          onPress={
            verifyOtp
          }
        >

          {loading ? (

            <ActivityIndicator
              color="#FFFFFF"
            />

          ) : (

            <Text
              style={
                styles.verifyText
              }
            >
              Verify OTP
            </Text>

          )}

        </Pressable>


        {/* HELPER */}

        <Text
          style={
            styles.helperText
          }
        >
          Enter the verification code
          sent to your registered
          mobile number.
        </Text>

      </View>

    </SafeAreaView>

  );

}


// =====================================
// STYLES
// =====================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,

      backgroundColor:
        "#F4F8FD",
    },


    content: {
      flex: 1,

      paddingHorizontal:
        24,

      justifyContent:
        "center",
    },


    backButton: {
      position:
        "absolute",

      top: 20,

      left: 22,

      width: 44,

      height: 44,

      borderRadius:
        14,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#D8E4F0",

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    backIcon: {
      color:
        "#08285C",

      fontSize:
        34,

      lineHeight:
        36,
    },


    logoContainer: {
      width: 76,

      height: 76,

      borderRadius:
        24,

      backgroundColor:
        "#EAF3FC",

      alignItems:
        "center",

      justifyContent:
        "center",

      alignSelf:
        "center",

      marginBottom:
        22,
    },


    logoIcon: {
      fontSize:
        34,
    },


    title: {
      color:
        "#08285C",

      fontSize:
        28,

      fontWeight:
        "900",

      textAlign:
        "center",
    },


    description: {
      color:
        "#66758E",

      fontSize:
        13,

      lineHeight:
        20,

      textAlign:
        "center",

      marginTop:
        8,
    },


    phoneText: {
      color:
        "#1768C4",

      fontSize:
        14,

      fontWeight:
        "900",

      textAlign:
        "center",

      marginTop:
        4,

      marginBottom:
        28,
    },


    otpInput: {
      height:
        58,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#D8E4F0",

      borderRadius:
        15,

      color:
        "#08285C",

      fontSize:
        22,

      fontWeight:
        "900",

      letterSpacing:
        8,

      paddingHorizontal:
        14,
    },


    verifyButton: {
      minHeight:
        54,

      backgroundColor:
        "#0F5DA8",

      borderRadius:
        15,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginTop:
        18,
    },


    verifyText: {
      color:
        "#FFFFFF",

      fontSize:
        15,

      fontWeight:
        "900",
    },


    disabledButton: {
      opacity:
        0.45,
    },


    buttonPressed: {
      opacity:
        0.75,
    },


    helperText: {
      color:
        "#7A899B",

      fontSize:
        10,

      lineHeight:
        16,

      textAlign:
        "center",

      marginTop:
        16,

      paddingHorizontal:
        20,
    },

  });