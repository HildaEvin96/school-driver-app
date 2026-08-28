export type RouteItem = {
  id: string;
  routeName: string;
  startLocation: string;
  endLocation: string;
};

export type StudentStatus =
  | "pending"
  | "pickedUp"
  | "droppedOff"
  | "absent";

export type Student = {
  id: string;
  name: string;
  className: string;
  division: string;
  routeId: string;
  pickupLocation: string;
  dropOffLocation: string;
  parentName: string;
  parentPhone: string;
  status: StudentStatus;
};