import { StudentRepository } from "../repository/StudentRepository";

export function updateStudentStatusUseCase(
  studentId: string,
  status: string
) {
  StudentRepository.updateStudentStatus(
    studentId,
    status
  );
}