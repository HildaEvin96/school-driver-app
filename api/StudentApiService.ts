import { apiClient } from "./apiClient";

export type ApiStudent = {
  id: string;
  name: string;
  className: string;
  division: string;
  routeId: string;
  pickupLocation: string;
  dropOffLocation: string;
  parentName: string;
  parentPhone: string;
  status: string;
};

export const StudentApiService = {
  async getStudents():
    Promise<ApiStudent[]> {

    const response =
      await apiClient.get<
        ApiStudent[]
      >("/students");

    return response.data;
  },
};