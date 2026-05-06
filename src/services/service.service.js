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
  return request(`/api/services${id}`, {
    method: "PUT",
    body: formData,
  });
}

// ================= DELETE SERVICE =================
export function deleteService(id) {
  return request(`/api/services/${id}`, {
    method: "DELETE",
  });
}

// ================= LIST =================
// ================= LIST (PUBLIC SERVICES) =================
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

// ================= SINGLE =================
export function getServiceById(id) {
  return request(`/api/services/${id}`, {
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
// ================= SLOTS =================
export const getServiceSlots = (serviceId) => {
  console.log("🔥 serviceId received in API:", serviceId);

  if (!serviceId) {
    console.error("❌ serviceId is missing!");
    throw new Error("serviceId is required for getServiceSlots");
  }

  return request(`/api/services/${serviceId}/slots`, {
    method: "GET",
  });
};
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
// ================= ADMIN SERVICE MODERATION =================

// Approve service
export function approveService(serviceId) {
  return request(`/api/services/admin/${serviceId}/approve`, {
    method: "POST",
  });
}

// Reject service
export function rejectService(serviceId, data) {
  return request(`/api/services/admin/${serviceId}/reject`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ================= SLOT APIs =================

// CREATE SLOT (single)
export function createSlot(serviceId, data) {
  console.log("🚀 Sending payload:", data);

  return request(`/api/services/${serviceId}/slots`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// BULK CREATE SLOTS
export function bulkCreateSlots(serviceId, data) {
  return request(`/api/services/${serviceId}/slots/bulk`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// UPDATE SLOT
export function updateSlot(slotId, data) {
  return request(`/api/services/slots/${slotId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// DELETE SLOT
export function deleteSlot(slotId) {
  return request(`/api/services/slots/${slotId}`, {
    method: "DELETE",
  });
}

// PROVIDER STATS
export function getProviderStats() {
  return request(`/api/services/provider/stats`, {
    method: "GET",
  });
}

export function getServiceSlotsInRange(serviceId, startDate, endDate) {
  console.log("🚀 RANGE CALL:", { serviceId, startDate, endDate });

  return request(
    `/api/services/${serviceId}/slots/range?startDate=${startDate}&endDate=${endDate}`
  );
}