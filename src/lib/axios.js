"use client";

import axios from "axios";
import { getStoredToken, logoutForUnauthorized } from "@/utils/auth";

const apiClient = axios.create({
  baseURL: "http://localhost:4004/api",
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    };
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      logoutForUnauthorized();
    }

    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error.message ||
      "Request failed.";

    return Promise.reject(new Error(message));
  }
);

export default apiClient;
