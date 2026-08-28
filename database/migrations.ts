import { db } from "./database";
import { seedDatabase } from "./seed";


export function initializeDatabase() {

  console.log(
    "Database Initialized"
  );


  db.execSync(`

    CREATE TABLE IF NOT EXISTS routes (
      id TEXT PRIMARY KEY,
      routeName TEXT,
      startLocation TEXT,
      endLocation TEXT
    );


    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name TEXT,
      className TEXT,
      division TEXT,
      routeId TEXT,
      pickupLocation TEXT,
      dropOffLocation TEXT,
      parentName TEXT,
      parentPhone TEXT,
      status TEXT
    );


    CREATE TABLE IF NOT EXISTS trip_history (
      id TEXT PRIMARY KEY,

      routeId TEXT,
      routeName TEXT,
      routePath TEXT,

      tripType TEXT,

      tripDate TEXT,

      startTime TEXT,
      endTime TEXT,

      durationMinutes INTEGER,

      totalStudents INTEGER,
      completedStudents INTEGER,
      absentStudents INTEGER,

      busNumber TEXT,

      status TEXT,

      createdAt TEXT
    );

  `);


  console.log(
    "Trip History Table Ready"
  );


  seedDatabase();

}