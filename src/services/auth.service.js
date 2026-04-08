import { apiRequest } from "@/services/api";

export function registerUser(payload) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function verifyEmailToken(token) {
  return apiRequest(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
    method: "GET",
  });
}

export function resendVerification(payload) {
  return apiRequest("/api/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function uploadProfileImage(formData) {
  return apiRequest("/api/auth/profile-image", {
    method: "PATCH",
    body: formData,
  });
}

export function registerSeller(payload) {
  return apiRequest("/api/auth/register-seller", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getPublicSellerProfile(userId) {
  return apiRequest(`/api/auth/profile/${encodeURIComponent(userId)}`, {
    method: "GET",
  });
}
