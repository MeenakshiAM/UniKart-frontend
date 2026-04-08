import axios from "axios";
import { getAuthHeaders, getStoredToken, logoutForUnauthorized } from "@/utils/auth";

const DEFAULT_BASE_URL = "http://localhost:4001";

function safeParseJson(text) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

function extractErrorMessage(data, fallbackMessage) {
  if (!data) {
    return fallbackMessage;
  }

  if (typeof data === "string") {
    return data;
  }

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (typeof data.error === "string" && data.error.trim()) {
    return data.error;
  }

  return fallbackMessage;
}

export function createApiRequester(baseUrl = DEFAULT_BASE_URL) {
  return async function apiRequestWithBase(path, options = {}) {
    const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

    const headers = isFormData
      ? getAuthHeaders(options.headers)
      : getAuthHeaders({
          "Content-Type": "application/json",
          ...(options.headers || {}),
        });

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers,
      });

      const rawText = await response.text();
      const data = safeParseJson(rawText);

      if (!response.ok) {
        const message = extractErrorMessage(data, `Request failed with status ${response.status}`);
        const error = new Error(message);
        error.status = response.status;
        error.data = data;

        if (response.status === 401) {
          logoutForUnauthorized();
        }

        throw error;
      }

      return data;
    } catch (error) {
      if (error.status) {
        throw error;
      }

      throw new Error("Unable to connect to the server. Please try again.");
    }
  };
}

export const apiRequest = createApiRequester();

export function createAxiosRequester(baseUrl = DEFAULT_BASE_URL) {
  const client = axios.create({
    baseURL: baseUrl,
  });

  client.interceptors.request.use((config) => {
    const token = getStoredToken();

    if (token) {
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      };
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        logoutForUnauthorized();
      }

      const message = extractErrorMessage(
        error?.response?.data,
        error?.message || "Unable to connect to the server. Please try again."
      );

      const requestError = new Error(message);
      requestError.status = error?.response?.status;
      requestError.data = error?.response?.data;

      return Promise.reject(requestError);
    }
  );

  return async function axiosRequestWithBase(path, options = {}) {
    const { method = "GET", data, params, headers, ...rest } = options;

    const response = await client.request({
      url: path,
      method,
      data,
      params,
      headers,
      ...rest,
    });

    return response.data;
  };
}
