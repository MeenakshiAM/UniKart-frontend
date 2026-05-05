import { createApiRequester } from "@/services/api";

const serviceApi = createApiRequester("http://localhost:4003"); 
// (change port if your service backend is different)

function request(path, options = {}) {
  return serviceApi(path, options).then((res) => {
    return res?.data ?? res;
  });
}

// ===============================
// SERVICES LIST
// ===============================
export function getServices(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      query.set(k, v);
    }
  });

  return request(`/api/services?${query.toString()}`, {
    method: "GET",
  });
}

// ===============================
// SERVICE DETAILS
// ===============================
export function getServiceById(id) {
  return request(`/api/services/${id}`, {
    method: "GET",
  });
}

// ===============================
// SLOTS
// ===============================
export function getServiceSlots(id, filters) {
  const query = new URLSearchParams(filters).toString();

  return request(`/api/services/${id}/slots?${query}`, {
    method: "GET",
  });
}
 
// ===============================
// SELLER SERVICES
// ===============================
export function getMyServices(params = {}) {
  const query = new URLSearchParams(params).toString();

  return request(`/api/services/my?${query}`, {
    method: "GET",
  });
}

export function createService(formData) {
  return request("/api/services", {
    method: "POST",
    body: formData,
  });
}

export function updateService(id, formData) {
  return request(`/api/services/${id}`, {
    method: "PATCH",
    body: formData,
  });
}

export function deleteService(id) {
  return request(`/api/services/${id}`, {
    method: "DELETE",
  });
}