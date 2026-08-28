import {
  RouteRepository,
} from "../repository/RouteRepository";

export function getRoutesUseCase() {
  return RouteRepository.getAllRoutes();
}