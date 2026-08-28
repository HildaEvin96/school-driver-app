import { db } from "./database";


export type TripType =
  | "pickup"
  | "dropoff";


export type TripHistory = {
  id: string;

  routeId: string;
  routeName: string;
  routePath: string;

  tripType: TripType;

  tripDate: string;

  startTime: string;
  endTime: string;

  durationMinutes: number;

  totalStudents: number;
  completedStudents: number;
  absentStudents: number;

  busNumber: string;

  status: string;

  createdAt: string;
};


export type SaveTripHistoryInput = {
  routeId: string;
  routeName: string;
  routePath: string;

  tripType: TripType;

  startTime: string;
  endTime: string;

  durationMinutes: number;

  totalStudents: number;
  completedStudents: number;
  absentStudents: number;

  busNumber?: string;
};


export function saveTripHistory(
  trip: SaveTripHistoryInput
) {

  try {

    const now =
      new Date();


    const id =
      `trip_${now.getTime()}`;


    const tripDate =
      now.toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );


    const createdAt =
      now.toISOString();


    db.runSync(
      `
      INSERT INTO trip_history (
        id,
        routeId,
        routeName,
        routePath,
        tripType,
        tripDate,
        startTime,
        endTime,
        durationMinutes,
        totalStudents,
        completedStudents,
        absentStudents,
        busNumber,
        status,
        createdAt
      )
      VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?
      )
      `,
      [
        id,

        trip.routeId,
        trip.routeName,
        trip.routePath,

        trip.tripType,

        tripDate,

        trip.startTime,
        trip.endTime,

        trip.durationMinutes,

        trip.totalStudents,
        trip.completedStudents,
        trip.absentStudents,

        trip.busNumber ?? "",

        "completed",

        createdAt,
      ]
    );


    console.log(
      "TRIP HISTORY SAVED:",
      id
    );


    return id;


  } catch (error) {

    console.log(
      "SAVE TRIP HISTORY ERROR:",
      error
    );


    throw error;

  }

}


// =====================================
// GET ALL TRIP HISTORY
// =====================================

export function getTripHistory():
  TripHistory[] {

  try {

    const trips =
      db.getAllSync<TripHistory>(
        `
        SELECT *
        FROM trip_history
        ORDER BY createdAt DESC
        `
      );


    console.log(
      "TRIP HISTORY LOADED:",
      trips.length
    );


    return trips;


  } catch (error) {

    console.log(
      "GET TRIP HISTORY ERROR:",
      error
    );


    return [];

  }

}