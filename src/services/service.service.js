import { createApiRequester } from "@/services/api";

const serviceApi = createApiRequester("http://localhost:4002");

// ================= CORE =================
function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;

  return serviceApi(path, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  }).then((res) => res?.data ?? res);
}

// ================= CREATE SERVICE =================
export function createService(formData) {
  return request("/api/service", {
    method: "POST",
    body: formData,
  });
}

// ================= UPDATE SERVICE =================
export function updateService(id, formData) {
  return request(`/api/service/${id}`, {
    method: "PUT",
    body: formData,
  });
}

// ================= DELETE SERVICE =================
export function deleteService(id) {
  return request(`/api/service/${id}`, {
    method: "DELETE",
  });
}

// ================= LIST =================
export function getServices(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      query.set(k, v);
    }
  });

  return request(`/api/service?${query.toString()}`, {
    method: "GET",
  });
}

// ================= SINGLE =================
export function getServiceById(id) {
  return request(`/api/service/${id}`, {
    method: "GET",
  });
}

// ================= MY SERVICES =================
export function getMyServices(status = "") {
  const q = status ? `?status=${status}` : "";
  return request(`/api/services/provider/my-services`, {
    method: "GET",
  });
}

// ================= SLOTS =================
export function getServiceSlots(id, filters) {
  const query = new URLSearchParams(filters).toString();

  return request(`/api/services/${id}/slots?${query}`, {
    method: "GET",
  });
}
export function getPendingServices(params = {}) {
  const query = new URLSearchParams(params).toString();

  return request(`/api/services/admin/pending?${query}`, {
    method: "GET",
  });
}
export const getMyActiveServices = () =>
  request("/api/services/provider/active");

export const getMyPendingServices = () =>
  request("/api/services/provider/pending");

export const getMyRejectedServices = () =>
  request("/api/services/provider/rejected");
