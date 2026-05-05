import { apiRequest } from "@/services/api";

// get all users
export function getAllUsers() {
  return apiRequest("/api/auth/users", {
    method: "GET",
  });
}

// approve seller
export function approveSeller(sellerId) {
  return apiRequest(`/api/auth/seller/approve/${sellerId}`, {
    method: "PUT",
  });
}

// reject seller
export function rejectSeller(sellerId, reason) {
  return apiRequest(`/api/auth/seller/reject/${sellerId}`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
  });
}

// get seller by userId
export function getSellerByUserId(userId) {
  return apiRequest(`/api/auth/seller/${userId}`, {
    method: "GET",
  });
}