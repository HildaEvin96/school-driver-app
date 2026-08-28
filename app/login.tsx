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
  useRouter,
} from "expo-router";

import {
  getAuth,
  signInWithPhoneNumber,
} from "@react-native-firebase/auth";


export default function LoginScreen() {

  const router = useRouter();

  const auth = getAuth();


  const [
    phoneNumber,
    setPhoneNumber,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  const cleanPhoneNumber =
    phoneNumber.replace(
      /\D/g,
      ""
    );


  // =========================
  // SEND OTP
  // =========================

  const sendOtp = async () => {

    if (
      cleanPhoneNumber.length !== 10
    ) {

      Alert.alert(
        "Invalid Number",
        "Please enter a valid 10 digit mobile number."
      );

      return;
    }


    try {

      setLoading(true);


      const fullPhoneNumber =
        `+91${cleanPhoneNumber}`;


      console.log(
        "SENDING OTP TO:",
        fullPhoneNumber
      );


      const confirmation =
        await signInWithPhoneNumber(
          auth,
          fullPhoneNumber
        );


      console.log(
        "OTP SENT SUCCESSFULLY"
      );


      console.log(
        "VERIFICATION ID:",
        confirmation.verificationId
      );


      // =========================
      // OPEN OTP SCREEN
      // =========================

      router.push({
        pathname: "/otp",

        params: {
          verificationId:
            confirmation.verificationId,

          phoneNumber:
            fullPhoneNumber,
        },
      });


    } catch (error: any) {

      console.log(
        "OTP SEND ERROR:",
        error
      );


      let message =
        "Could not send OTP. Please try again.";


      if (
        error?.code ===
        "auth/invalid-phone-number"
      ) {

        message =
          "Please enter a valid mobile number.";

      }


      if (
        error?.code ===
        "auth/too-many-requests"
      ) {

        message =
          "Too many OTP requests. Please try again later.";

      }


      if (
        error?.code ===
        "auth/quota-exceeded"
      ) {

        message =
          "SMS quota has been exceeded.";

      }


      if (
        error?.code ===
          "auth/billing-not" ||
        error?.code ===
          "auth/billing-not-enabled"
      ) {

        message =
          "Real SMS requires Firebase billing. Please use the Firebase test phone number.";

      }


      if (
        error?.code ===
        "auth/operation-not-allowed"
      ) {

        message =
          "Phone authentication or SMS region is not enabled in Firebase.";

      }


      Alert.alert(
        "OTP Error",
        message
      );


    } finally {

      setLoading(false);

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

        {/* LOGO */}

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
            🚌
          </Text>

        </View>


        {/* TITLE */}

        <Text
          style={
            styles.title
          }
        >
          Driver Login
        </Text>


        <Text
          style={
            styles.description
          }
        >
          Enter your registered mobile
          number to continue
        </Text>


        {/* MOBILE NUMBER */}

        <Text
          style={
            styles.label
          }
        >
          Mobile Number
        </Text>


        <View
          style={
            styles.phoneContainer
          }
        >

          <View
            style={
              styles.countryCode
            }
          >

            <Text
              style={
                styles.countryCodeText
              }
            >
              +91
            </Text>

          </View>


          <TextInput
            style={
              styles.input
            }

            placeholder=
              "Enter mobile number"

            placeholderTextColor=
              "#8A98AA"

            keyboardType=
              "phone-pad"

            maxLength={10}

            value={
              phoneNumber
            }

            onChangeText={text => {

              // Numbers only

              const numbersOnly =
                text.replace(
                  /\D/g,
                  ""
                );

              setPhoneNumber(
                numbersOnly
              );

            }}

            editable={
              !loading
            }
          />

        </View>


        {/* SEND OTP */}

        <Pressable

          disabled={
            loading ||
            cleanPhoneNumber.length !== 10
          }

          style={({ pressed }) => [

            styles.continueButton,

            cleanPhoneNumber.length !==
              10 &&
              styles.disabledButton,

            loading &&
              styles.disabledButton,

            pressed &&
              cleanPhoneNumber.length ===
                10 &&
              !loading &&
              styles.buttonPressed,

          ]}

          onPress={
            sendOtp
          }
        >

          {loading ? (

            <ActivityIndicator
              color="#FFFFFF"
            />

          ) : (

            <Text
              style={
                styles.continueText
              }
            >
              Send OTP
            </Text>

          )}

        </Pressable>


        <Text
          style={
            styles.footerText
          }
        >
          An OTP will be sent to your
          registered mobile number
        </Text>


        {/* TEST MODE INFO */}

        <View
          style={
            styles.testInfo
          }
        >

          <Text
            style={
              styles.testInfoText
            }
          >
            Firebase test phone numbers can
            be used during development
            without sending a real SMS.
          </Text>

        </View>

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

      paddingHorizontal:
        24,

      justifyContent:
        "center",

    },


    logoContainer: {

      width: 76,

      height: 76,

      borderRadius: 24,

      backgroundColor:
        "#EAF3FC",

      alignItems:
        "center",

      justifyContent:
        "center",

      alignSelf:
        "center",

      marginBottom: 22,

    },


    logoIcon: {

      fontSize: 37,

    },


    title: {

      color:
        "#08285C",

      fontSize: 28,

      fontWeight:
        "900",

      textAlign:
        "center",

    },


    description: {

      color:
        "#66758E",

      fontSize: 13,

      lineHeight: 20,

      textAlign:
        "center",

      marginTop: 8,

      marginBottom: 30,

      paddingHorizontal: 12,

    },


    label: {

      color:
        "#08285C",

      fontSize: 12,

      fontWeight:
        "800",

      marginBottom: 8,

    },


    phoneContainer: {

      height: 56,

      backgroundColor:
        "#FFFFFF",

      borderWidth: 1,

      borderColor:
        "#D8E4F0",

      borderRadius: 15,

      flexDirection:
        "row",

      alignItems:
        "center",

      overflow:
        "hidden",

    },


    countryCode: {

      height:
        "100%",

      paddingHorizontal:
        15,

      backgroundColor:
        "#EAF3FC",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRightWidth: 1,

      borderRightColor:
        "#D8E4F0",

    },


    countryCodeText: {

      color:
        "#1768C4",

      fontSize: 14,

      fontWeight:
        "900",

    },


    input: {

      flex: 1,

      height:
        "100%",

      paddingHorizontal:
        14,

      color:
        "#08285C",

      fontSize: 15,

      fontWeight:
        "600",

    },


    continueButton: {

      minHeight: 54,

      backgroundColor:
        "#0F5DA8",

      borderRadius: 15,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginTop: 18,

    },


    disabledButton: {

      opacity: 0.45,

    },


    continueText: {

      color:
        "#FFFFFF",

      fontSize: 15,

      fontWeight:
        "900",

    },


    footerText: {

      color:
        "#7A899B",

      fontSize: 10,

      textAlign:
        "center",

      marginTop: 14,

    },


    testInfo: {

      marginTop: 28,

      backgroundColor:
        "#EAF3FC",

      borderRadius: 12,

      padding: 12,

    },


    testInfoText: {

      color:
        "#66758E",

      fontSize: 10,

      lineHeight: 16,

      textAlign:
        "center",

    },


    buttonPressed: {

      opacity: 0.75,

    },

  });