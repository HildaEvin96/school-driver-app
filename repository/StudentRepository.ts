import { db } from "../database/database";

import {
  StudentApiService,
} from "../api/StudentApiService";


export type StudentDbModel = {
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


export const StudentRepository = {

  // =========================
  // SQLite - Get All Students
  // =========================

  getAllStudents(): StudentDbModel[] {
    return db.getAllSync<StudentDbModel>(
      `
      SELECT *
      FROM students
      ORDER BY id
      `
    );
  },


  // =========================
  // SQLite - Students By Route
  // =========================

  getStudentsByRoute(
    routeId: string
  ): StudentDbModel[] {

    return db.getAllSync<StudentDbModel>(
      `
      SELECT *
      FROM students
      WHERE routeId = ?
      `,
      [routeId]
    );
  },


  // =========================
  // SQLite - Student By ID
  // =========================

  getStudentById(
    studentId: string
  ): StudentDbModel | null {

    const student =
      db.getFirstSync<StudentDbModel>(
        `
        SELECT *
        FROM students
        WHERE id = ?
        `,
        [studentId]
      );

    return student ?? null;
  },


  // =========================
  // SQLite - Update Status
  // =========================

  updateStudentStatus(
    studentId: string,
    status: string
  ) {

    db.runSync(
      `
      UPDATE students
      SET status = ?
      WHERE id = ?
      `,
      [
        status,
        studentId,
      ]
    );
  },


  // =========================
  // SQLite - Reset Status
  // =========================

  resetStudentStatus(
    studentId: string
  ) {

    db.runSync(
      `
      UPDATE students
      SET status = 'pending'
      WHERE id = ?
      `,
      [studentId]
    );
  },


  // =========================
  // REST API
  // =========================

  async fetchStudentsFromApi() {

    const apiStudents =
      await StudentApiService.getStudents();

    return apiStudents;
  },


  // =========================
  // API → SQLite Sync
  // =========================

  async syncStudentsFromApi() {

    // API students fetch
    const apiStudents =
      await StudentApiService.getStudents();


    // Debug log
    console.log(
      "API STUDENTS RECEIVED:",
      apiStudents.map(
        (student) => ({
          id: student.id,
          name: student.name,
          routeId: student.routeId,
          pickupLocation:
            student.pickupLocation,
        })
      )
    );


    // SQLite transaction
    db.withTransactionSync(() => {

      // =====================================
      // 1. Remove duplicate SQLite rows
      // Same ID ഉണ്ടെങ്കിൽ one row മാത്രം keep
      // =====================================

      db.runSync(
        `
        DELETE FROM students
        WHERE rowid NOT IN (
          SELECT MIN(rowid)
          FROM students
          GROUP BY id
        )
        `
      );


      // =====================================
      // 2. Prevent future duplicate IDs
      // =====================================

      db.runSync(
        `
        CREATE UNIQUE INDEX IF NOT EXISTS
        idx_students_unique_id
        ON students(id)
        `
      );


      // =====================================
      // 3. Get all API IDs
      // =====================================

      const apiIds =
        apiStudents.map(
          (student) => student.id
        );


      // =====================================
      // 4. Remove old SQLite students
      // API-ൽ ഇല്ലാത്ത students delete
      // =====================================

      if (apiIds.length > 0) {

        const placeholders =
          apiIds
            .map(() => "?")
            .join(",");


        db.runSync(
          `
          DELETE FROM students
          WHERE id NOT IN (${placeholders})
          `,
          apiIds
        );

      } else {

        // API empty ആണെങ്കിൽ
        // local stale students remove
        db.runSync(
          `
          DELETE FROM students
          `
        );

      }


      // =====================================
      // 5. Insert / Update API Students
      // =====================================

      apiStudents.forEach(
        (student) => {

          // Existing student check
          const existingStudent =
            db.getFirstSync<StudentDbModel>(
              `
              SELECT *
              FROM students
              WHERE id = ?
              `,
              [student.id]
            );


          if (existingStudent) {

            // =====================================
            // Existing Student
            // Master data update
            // Current local status preserve ചെയ്യുന്നു
            // =====================================

            db.runSync(
              `
              UPDATE students
              SET
                name = ?,
                className = ?,
                division = ?,
                routeId = ?,
                pickupLocation = ?,
                dropOffLocation = ?,
                parentName = ?,
                parentPhone = ?
              WHERE id = ?
              `,
              [
                student.name,
                student.className,
                student.division,
                student.routeId,
                student.pickupLocation,
                student.dropOffLocation,
                student.parentName,
                student.parentPhone,
                student.id,
              ]
            );

          } else {

            // =====================================
            // New API Student
            // =====================================

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
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

          }

        }
      );

    });


    // =====================================
    // 6. Check SQLite after sync
    // =====================================

    const sqliteStudents =
      this.getAllStudents();


    console.log(
      "SQLITE STUDENTS AFTER SYNC:",
      sqliteStudents.length
    );


    console.log(
      "SQLITE STUDENT LIST:",
      sqliteStudents.map(
        (student) => ({
          id: student.id,
          name: student.name,
          routeId:
            student.routeId,
          pickupLocation:
            student.pickupLocation,
          dropOffLocation:
            student.dropOffLocation,
        })
      )
    );


    return apiStudents;
  },

};