import axios from "axios";
import {
  getAuthHeaders,
  logoutForUnauthorized,
} from "@/utils/auth";

const DEFAULT_BASE_URL = "http://localhost:4001";

// ---------------- helper ----------------
function safeParseJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ---------------- core requester ----------------
export function createApiRequester(baseUrl = DEFAULT_BASE_URL) {
  return async function apiRequest(path, options = {}) {
    const headers = getAuthHeaders({
      "Content-Type": "application/json",
      ...(options.headers || {}),
    });

    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers,
    });

    const text = await response.text();
    const data = safeParseJson(text);

    if (!response.ok) {
      const err = new Error(data?.message || "Request failed");
      err.status = response.status;

      if (response.status === 401) {
        logoutForUnauthorized();
      }

      throw err;
    }

    return data;
  };
}

// ---------------- SINGLE INSTANCE ----------------
export const apiRequest = createApiRequester();

// ---------------- CLEAN WRAPPER (for your admin page) ----------------
export const API = {
  get: (url) => apiRequest(url, { method: "GET" }),

  post: (url, body) =>
    apiRequest(url, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  patch: (url, body) =>
    apiRequest(url, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (url) =>
    apiRequest(url, { method: "DELETE" }),
};