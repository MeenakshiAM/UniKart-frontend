import { createApiRequester } from "@/services/api";

const api = createApiRequester("http://localhost:4002/api");

// ================= GET REVIEWS =================
export function getReviewsByProduct(productId) {
  if (!productId) throw new Error("productId is required");

  return api(`/reviews/product/${productId}`, {
    method: "GET",
  }).then((res) => res?.data ?? res);
}

// ================= CREATE REVIEW =================
export function createReview(productId, data) {
  if (!productId) throw new Error("productId is required");

  // 🔥 DEBUG (CORRECTED)
  console.log("🔥 productId received:", productId);
  console.log("🔥 type of productId:", typeof productId);

  return api(`/reviews/product/${productId}`, {
    method: "POST",
    body: JSON.stringify(data),
  }).then((res) => res?.data ?? res);
}