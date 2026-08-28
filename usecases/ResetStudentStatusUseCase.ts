import { StudentRepository } from "../repository/StudentRepository";

export function resetStudentStatusUseCase(
  studentId: string
) {
  StudentRepository.resetStudentStatus(
    studentId
  );
}