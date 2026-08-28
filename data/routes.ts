export type RouteItem = {
  id: string;
  driverPhone: string;
  routeName: string;
  startLocation: string;
  endLocation: string;
};

export const routes: RouteItem[] = [

  // =====================================================
  // HILDA
  // Phone: +919999000001
  // Routes: 1, 2, 3, 4
  // =====================================================

  {
    id: "1",
    driverPhone: "+919999000001",
    routeName: "1",
    startLocation: "Kaloor Junction",
    endLocation: "Edappally Toll",
  },

  {
    id: "2",
    driverPhone: "+919999000001",
    routeName: "2",
    startLocation: "Vyttila Mobility Hub",
    endLocation: "Palarivattom Junction",
  },

  {
    id: "3",
    driverPhone: "+919999000001",
    routeName: "3",
    startLocation: "Aluva Metro Station",
    endLocation: "Kalamassery Medical College",
  },

  {
    id: "4",
    driverPhone: "+919999000001",
    routeName: "4",
    startLocation: "Kakkanad Civil Station",
    endLocation: "Infopark Phase 1",
  },


  // =====================================================
  // EVIN
  // Phone: +919999000002
  // Route: 5
  // =====================================================

  {
    id: "5",
    driverPhone: "+919999000002",
    routeName: "5",
    startLocation: "Thrippunithura",
    endLocation: "Vyttila Hub",
  },

];