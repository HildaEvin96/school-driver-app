import {
  StudentRepository,
} from "../repository/StudentRepository";

export async function fetchStudentsFromApiUseCase() {
  return await StudentRepository.fetchStudentsFromApi();
}