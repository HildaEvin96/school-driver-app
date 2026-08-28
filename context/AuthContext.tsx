import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "@react-native-firebase/auth";

import type {
  User,
} from "@react-native-firebase/auth";

import {
  doc,
  getDoc,
  getFirestore,
} from "@react-native-firebase/firestore";


export type UserRole =
  | "driver"
  | "parent"
  | "admin";


export type AppUser = {
  uid: string;
  name: string;
  phone: string;
  role: UserRole;
  active: boolean;
};


type AuthContextType = {
  firebaseUser: User | null;

  appUser: AppUser | null;

  loading: boolean;

  isAuthenticated: boolean;

  isDriver: boolean;

  logout: () => Promise<void>;

  refreshUser: () => Promise<void>;
};


const AuthContext =
  createContext<
    AuthContextType | undefined
  >(undefined);


type Props = {
  children: ReactNode;
};


// =====================================
// VALIDATE ROLE
// =====================================

const isValidRole = (
  role: unknown
): role is UserRole => {

  return (
    role === "driver" ||
    role === "parent" ||
    role === "admin"
  );

};


// =====================================
// AUTH PROVIDER
// =====================================

export function AuthProvider({
  children,
}: Props) {

  const firebaseAuth =
    getAuth();


  const firestore =
    getFirestore();


  const [
    firebaseUser,
    setFirebaseUser,
  ] =
    useState<User | null>(
      null
    );


  const [
    appUser,
    setAppUser,
  ] =
    useState<AppUser | null>(
      null
    );


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  // =====================================
  // LOAD USER PROFILE FROM FIRESTORE
  // =====================================

  const loadAppUser =
    async (
      user: User
    ) => {

      try {

        console.log(
          "LOADING FIRESTORE USER:",
          user.uid
        );


        const userRef =
          doc(
            firestore,
            "users",
            user.uid
          );


        const userSnapshot =
          await getDoc(
            userRef
          );


        // ===============================
        // PROFILE DOES NOT EXIST
        // ===============================

       if (!userSnapshot.exists()) {

          console.log(
            "USER DOCUMENT NOT FOUND:",
            user.uid
          );

          setAppUser(null);

          return;
        }


        const data =
          userSnapshot.data();


        if (!data) {

          console.log(
            "USER DOCUMENT EMPTY:",
            user.uid
          );


          setAppUser(
            null
          );


          return;

        }


        // ===============================
        // ROLE VALIDATION
        // ===============================

        if (
          !isValidRole(
            data.role
          )
        ) {

          console.log(
            "INVALID USER ROLE:",
            data.role
          );


          setAppUser(
            null
          );


          return;

        }


        // ===============================
        // CREATE APP USER
        // ===============================

        const loadedUser:
          AppUser = {

          uid:
            user.uid,

          name:
            typeof data.name ===
            "string"
              ? data.name
              : "",

          phone:
            typeof data.phone ===
            "string"
              ? data.phone
              : user.phoneNumber ??
                "",

          role:
            data.role,

          active:
            data.active ===
            true,

        };


        setAppUser(
          loadedUser
        );


        console.log(
          "APP USER LOADED:",
          loadedUser
        );


      } catch (error: any) {

        console.log(
          "LOAD USER ERROR:",
          error
        );


        console.log(
          "LOAD USER ERROR CODE:",
          error?.code
        );


        console.log(
          "LOAD USER ERROR MESSAGE:",
          error?.message
        );


        setAppUser(
          null
        );

      }

    };


  // =====================================
  // REFRESH USER
  // =====================================

  const refreshUser =
    async () => {

      const currentUser =
        firebaseAuth.currentUser;


      if (!currentUser) {

        console.log(
          "REFRESH USER: NO FIREBASE USER"
        );


        setFirebaseUser(
          null
        );


        setAppUser(
          null
        );


        return;

      }


      try {

        setLoading(
          true
        );


        setFirebaseUser(
          currentUser
        );


        await loadAppUser(
          currentUser
        );


      } catch (error) {

        console.log(
          "REFRESH USER ERROR:",
          error
        );


      } finally {

        setLoading(
          false
        );

      }

    };


  // =====================================
  // LOGOUT
  // =====================================

  const logout =
    async () => {

      try {

        console.log(
          "LOGOUT STARTED"
        );


        await signOut(
          firebaseAuth
        );


        setFirebaseUser(
          null
        );


        setAppUser(
          null
        );


        console.log(
          "LOGOUT SUCCESS"
        );


      } catch (error) {

        console.log(
          "LOGOUT ERROR:",
          error
        );


        throw error;

      }

    };


  // =====================================
  // FIREBASE AUTH LISTENER
  // =====================================

  useEffect(() => {

    console.log(
      "AUTH LISTENER STARTED"
    );


    const unsubscribe =
      onAuthStateChanged(
        firebaseAuth,

        async (user) => {

          try {

            setLoading(
              true
            );


            console.log(
              "AUTH STATE CHANGED:",
              user?.uid ??
                "NO USER"
            );


            // ===========================
            // LOGGED OUT
            // ===========================

            if (!user) {

              setFirebaseUser(
                null
              );


              setAppUser(
                null
              );


              return;

            }


            // ===========================
            // LOGGED IN
            // ===========================

            setFirebaseUser(
              user
            );


            console.log(
              "FIREBASE USER UID:",
              user.uid
            );


            console.log(
              "FIREBASE PHONE:",
              user.phoneNumber
            );


            await loadAppUser(
              user
            );


          } catch (error) {

            console.log(
              "AUTH STATE ERROR:",
              error
            );


            setAppUser(
              null
            );


          } finally {

            setLoading(
              false
            );

          }

        }
      );


    return () => {

      console.log(
        "AUTH LISTENER STOPPED"
      );


      unsubscribe();

    };

  }, []);


  // =====================================
  // AUTH STATUS
  // =====================================

  const isAuthenticated =
    firebaseUser !== null;


  const isDriver =
    firebaseUser !== null &&
    appUser?.role ===
      "driver" &&
    appUser.active ===
      true;


  // =====================================
  // PROVIDER
  // =====================================

  return (

    <AuthContext.Provider
      value={{

        firebaseUser,

        appUser,

        loading,

        isAuthenticated,

        isDriver,

        logout,

        refreshUser,

      }}
    >

      {children}

    </AuthContext.Provider>

  );

}


// =====================================
// USE AUTH
// =====================================

export function useAuth() {

  const context =
    useContext(
      AuthContext
    );


  if (!context) {

    throw new Error(
      "useAuth must be used inside AuthProvider"
    );

  }


  return context;

}