import { db } from "./database";

import { routes } from "../data/routes";
import { students } from "../data/students";

export function seedDatabase() {
  console.log("Seed Database Called");

  // =========================
  // Insert Routes
  // =========================

  const routeCount =
    db.getFirstSync<{ count: number }>(
      `SELECT COUNT(*) as count FROM routes`
    );

  if (routeCount?.count === 0) {
    routes.forEach((route) => {
      db.runSync(
        `
        INSERT INTO routes
        (
          id,
          routeName,
          startLocation,
          endLocation
        )
        VALUES
        (?,?,?,?)
        `,
        [
          route.id,
          route.routeName,
          route.startLocation,
          route.endLocation,
        ]
      );
    });
  }

  // =========================
  // Insert Students
  // =========================

  const studentCount =
    db.getFirstSync<{ count: number }>(
      `SELECT COUNT(*) as count FROM students`
    );

  if (studentCount?.count === 0) {
    students.forEach((student) => {
      db.runSync(
        `
        INSERT INTO students
        (
          id,
          name,
          className,
          division,
          routeId,
          pickupLocation,
          dropOffLocation,
          parentName,
          parentPhone,
          status
        )
        VALUES
        (?,?,?,?,?,?,?,?,?,?)
        `,
        [
          student.id,
          student.name,
          student.className,
          student.division,
          student.routeId,
          student.pickupLocation,
          student.dropOffLocation,
          student.parentName,
          student.parentPhone,
          student.status,
        ]
      );
    });
  }

  // =========================
  // Verify Database Data
  // =========================

  const savedRoutes =
    db.getAllSync(
      `SELECT * FROM routes`
    );

  const savedStudents =
    db.getAllSync(
      `SELECT * FROM students`
    );

 
}