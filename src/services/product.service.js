import { createApiRequester } from "@/services/api";

const productApi = createApiRequester("http://localhost:4002");

export function getProducts(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return productApi(`/api/products${query ? `?${query}` : ""}`, { method: "GET" });
}

export function getProductById(id) {
  return productApi(`/api/products/${encodeURIComponent(id)}`, { method: "GET" });
}

export function getProductsBySellerId(sellerId) {
  return productApi(`/api/products/seller/${encodeURIComponent(sellerId)}`, { method: "GET" });
}

export function getMyProducts() {
  return productApi("/api/products/my", { method: "GET" });
}

export function getMyDrafts() {
  return productApi("/api/products/my/drafts", { method: "GET" });
}

export function getDraftById(id) {
  return productApi(`/api/products/my/drafts/${encodeURIComponent(id)}`, { method: "GET" });
}

export function getMyRejectedProducts() {
  return productApi("/api/products/my/rejected", { method: "GET" });
}

export function getMyHiddenProducts() {
  return productApi("/api/products/my/hidden", { method: "GET" });
}

export function getMyOutOfStockProducts() {
  return productApi("/api/products/my/out-of-stock", { method: "GET" });
}

export function createProduct(formData) {
  return productApi("/api/products/create", {
    method: "POST",
    body: formData,
  });
}

export function updateProduct(id, formData) {
  return productApi(`/api/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: formData,
  });
}

export function hideProduct(id) {
  return productApi(`/api/products/${encodeURIComponent(id)}/hide`, {
    method: "PATCH",
  });
}

export function unhideProduct(id) {
  return productApi(`/api/products/${encodeURIComponent(id)}/unhide`, {
    method: "PATCH",
  });
}

export function deleteProduct(id) {
  return productApi(`/api/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function getServices(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return productApi(`/api/services${query ? `?${query}` : ""}`, { method: "GET" });
}

export function getServiceById(serviceId, view) {
  const query = view ? "?view=true" : "";
  return productApi(`/api/services/${encodeURIComponent(serviceId)}${query}`, {
    method: "GET",
  });
}

export function getServiceSlots(serviceId, params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return productApi(`/api/services/${encodeURIComponent(serviceId)}/slots${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}
