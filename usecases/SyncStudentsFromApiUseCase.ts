import {
  StudentRepository,
} from "../repository/StudentRepository";

export async function syncStudentsFromApiUseCase() {
  return await StudentRepository.syncStudentsFromApi();
}