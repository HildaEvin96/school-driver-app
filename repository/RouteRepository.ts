import { db } from "../database/database";

export type RouteDbModel = {
  id: string;
  routeName: string;
  startLocation: string;
  endLocation: string;
};

export const RouteRepository = {
  getAllRoutes(): RouteDbModel[] {
    return db.getAllSync<RouteDbModel>(
      `SELECT * FROM routes`
    );
  },

  getRouteById(
    routeId: string
  ): RouteDbModel | null {
    const route =
      db.getFirstSync<RouteDbModel>(
        `
        SELECT *
        FROM routes
        WHERE id = ?
        `,
        [routeId]
      );

    return route ?? null;
  },
};