import { StudentRepository } from "../repository/StudentRepository";

export function getStudentsByRouteUseCase(
  routeId: string
) {
  return StudentRepository.getStudentsByRoute(
    routeId
  );
}