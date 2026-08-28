import axios from "axios";

export const apiClient = axios.create({
  baseURL:
    "https://6a7ae4ee8c69b3eb4a17a371.mockapi.io/api/v1",

  timeout: 10000,

  headers: {
    "Content-Type":
      "application/json",
  },
});