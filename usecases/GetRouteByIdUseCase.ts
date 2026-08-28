import {
  RouteRepository,
} from "../repository/RouteRepository";

export function getRouteByIdUseCase(
  routeId: string
) {
  return RouteRepository.getRouteById(
    routeId
  );
}