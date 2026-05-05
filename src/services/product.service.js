import { createApiRequester } from "@/services/api";

const productApi = createApiRequester("http://localhost:4002");

// =====================================================
// CORE REQUEST WRAPPER (FIXED RESPONSE NORMALIZER)
// =====================================================
function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;

  return productApi(path, {
    ...options,

    headers: {
      ...(isFormData
        ? {} // browser handles multipart
        : { "Content-Type": "application/json" }),

      ...(options.headers || {}),
    },
  }).then((res) => {
    // 🔥 NORMALIZE RESPONSE HERE (VERY IMPORTANT FIX)
    // handles: axios / fetch / custom wrapper
    return res?.data ?? res;
  });
}

// =====================================================
// PUBLIC PRODUCTS
// =====================================================
export function getProducts(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();

  return request(`/api/products${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

export function getProductById(id) {
  return request(`/api/products/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

// =====================================================
// SELLER PRODUCTS
// =====================================================
export function getMyProducts() {
  return request("/api/products/my", { method: "GET" });
}

export function getProductsBySellerId(sellerId) {
  return request(`/api/products/seller/${encodeURIComponent(sellerId)}`, {
    method: "GET",
  });
}

// =====================================================
// CREATE PRODUCT
// =====================================================
export function createProduct(formData) {
  return request("/api/products/create", {
    method: "POST",
    body: formData,
  });
}

// =====================================================
// UPDATE / DELETE
// =====================================================
export function updateProduct(id, formData) {
  return request(`/api/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: formData,
  });
}

export function deleteProduct(id) {
  return request(`/api/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// =====================================================
// STATUS ACTIONS
// =====================================================
export function hideProduct(id) {
  return request(`/api/products/${encodeURIComponent(id)}/hide`, {
    method: "PATCH",
  });
}

export function unhideProduct(id) {
  return request(`/api/products/${encodeURIComponent(id)}/unhide`, {
    method: "PATCH",
  });
}

// =====================================================
// FILTERS (SELLER SIDE)
// =====================================================
export function getMyDrafts() {
  return request("/api/products/my/drafts", { method: "GET" });
}

export function getMyRejectedProducts() {
  return request("/api/products/my/rejected", { method: "GET" });
}

export function getMyHiddenProducts() {
  return request("/api/products/my/hidden", { method: "GET" });
}

export function getMyOutOfStockProducts() {
  return request("/api/products/my/out-of-stock", { method: "GET" });
}

export function getMyPendingProducts() {
  return request("/api/products/my/pending", { method: "GET" });
}

// =====================================================
// ADMIN MODERATION (FIXED)
// =====================================================
export function getPendingProducts() {
  return request("/api/products/admin/pending", {
    method: "GET",
  });
}

export function getRejectedProducts() {
  return request("/api/products/admin/rejected", {
    method: "GET",
  });
}

export function approveProduct(id) {
  return request(`/api/products/approve/${encodeURIComponent(id)}`, {
    method: "PATCH",
  });
}

export function rejectProduct(id, reason) {
  return request(`/api/products/reject/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}
export function getDraftById(id) {
  return request(`/api/products/my/drafts/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}