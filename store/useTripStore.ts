import { create } from "zustand";

import { Student } from "../types";

import {
  getStudentsByRouteUseCase,
} from "../usecases/GetStudentsByRouteUseCase";

import {
  updateStudentStatusUseCase,
} from "../usecases/UpdateStudentStatusUseCase";

import {
  resetStudentStatusUseCase,
} from "../usecases/ResetStudentStatusUseCase";

import {
  fetchStudentsFromApiUseCase,
} from "../usecases/FetchStudentsFromApiUseCase";

import {
  syncStudentsFromApiUseCase,
} from "../usecases/SyncStudentsFromApiUseCase";


type StudentStatus =
  | "pending"
  | "pickedUp"
  | "droppedOff"
  | "absent";


type TripStudent =
  Omit<Student, "status"> & {
    status: StudentStatus;
  };


type ApiStudent = {
  id: string;
  name: string;
  className: string;
  division: string;
  routeId: string;
  pickupLocation: string;
  dropOffLocation: string;
  parentName: string;
  parentPhone: string;
  status: string;
};


type TripStore = {
  selectedRouteId: string;

  delayMinutes: number | null;

  students: TripStudent[];

  apiStudents: ApiStudent[];

  apiLoading: boolean;

  apiError: string | null;


  setSelectedRouteId: (
    routeId: string
  ) => void;


  setDelayMinutes: (
    minutes: number | null
  ) => void;


  loadStudents: (
    routeId: string
  ) => void;


  updateStudentStatus: (
    studentId: string,
    status: StudentStatus
  ) => void;


  resetStudentStatus: (
    studentId: string
  ) => void;


  clearStudents: () => void;


  fetchStudentsFromApi:
    () => Promise<void>;


  // API → SQLite
  syncStudentsFromApi:
    () => Promise<void>;
};


export const useTripStore =
  create<TripStore>((set) => ({

    selectedRouteId: "",

    delayMinutes: null,

    students: [],

    apiStudents: [],

    apiLoading: false,

    apiError: null,


    setSelectedRouteId: (
      routeId
    ) =>
      set({
        selectedRouteId: routeId,
      }),


    setDelayMinutes: (
      minutes
    ) =>
      set({
        delayMinutes: minutes,
      }),


    // =========================
    // SQLite → Zustand
    // =========================

    loadStudents: (
      routeId
    ) => {

      const dbStudents =
        getStudentsByRouteUseCase(
          routeId
        );

      set({
        students:
          dbStudents as TripStudent[],
      });
    },


    // =========================
    // Update Student
    // =========================

    updateStudentStatus: (
      studentId,
      status
    ) => {

      updateStudentStatusUseCase(
        studentId,
        status
      );

      set((state) => ({
        students:
          state.students.map(
            (student) =>
              student.id === studentId
                ? {
                    ...student,
                    status,
                  }
                : student
          ),
      }));
    },


    // =========================
    // Reset Student
    // =========================

    resetStudentStatus: (
      studentId
    ) => {

      resetStudentStatusUseCase(
        studentId
      );

      set((state) => ({
        students:
          state.students.map(
            (student) =>
              student.id === studentId
                ? {
                    ...student,
                    status: "pending",
                  }
                : student
          ),
      }));
    },


    clearStudents: () =>
      set({
        students: [],
      }),


    // =========================
    // REST API → Zustand
    // =========================

    fetchStudentsFromApi:
      async () => {

        try {

          set({
            apiLoading: true,
            apiError: null,
          });


          const students =
            await fetchStudentsFromApiUseCase();


          set({
            apiStudents: students,
            apiLoading: false,
          });

        } catch (error) {

          set({
            apiLoading: false,

            apiError:
              error instanceof Error
                ? error.message
                : "Failed to fetch students",
          });
        }
      },


    // =========================
    // REST API → SQLite
    // =========================

    syncStudentsFromApi:
    async () => {

      try {

        set({
          apiLoading: true,
          apiError: null,
        });

        const students =
          await syncStudentsFromApiUseCase();

        set({
          apiStudents: students,
          apiLoading: false,
          apiError: null,
        });

        console.log(
          "ONLINE SYNC SUCCESS:",
          students.length
        );

      } catch (error) {

        console.log(
          "API FAILED - USING SQLITE CACHE"
        );

        set({
          apiLoading: false,
          apiError:
            "Offline mode - using local data",
        });
      }
    },

  }));