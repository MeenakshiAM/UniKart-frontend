import { createApiRequester } from "@/services/api";

const api = createApiRequester("http://localhost:4002");

// ================= CORE WRAPPER =================
function request(path, options = {}) {
  return api(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  }).then((res) => res?.data ?? res);
}

// ─────────────────────────────────────────────
// BUYER (USER) ROUTES
// ─────────────────────────────────────────────

// Create a new booking
export function createBooking(data) {
  return request("/api/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Get all bookings made by the logged-in user
export function getMyBookings() {
  return request("/api/bookings/my-bookings", {
    method: "GET",
  });
}

// User cancels their own booking
export function cancelBooking(bookingId) {
  return request(`/api/bookings/${bookingId}/cancel`, {
    method: "POST",
  });
}


// ─────────────────────────────────────────────
// SELLER (PROVIDER) DASHBOARD ROUTES
// ─────────────────────────────────────────────

// Get all bookings made for the seller's services
export function getProviderBookings() {
  return request("/api/bookings/provider/bookings", {
    method: "GET",
  });
}

// Get seller's schedule for today
export function getTodaySchedule() {
  return request("/api/bookings/provider/today", {
    method: "GET",
  });
}


// ─────────────────────────────────────────────
// SELLER ACTIONS
// ─────────────────────────────────────────────

// Seller confirms a pending booking
export function confirmBooking(bookingId) {
  return request(`/api/bookings/${bookingId}/confirm`, {
    method: "POST",
  });
}

// Seller marks a booking as completed
export function completeBooking(bookingId) {
  return request(`/api/bookings/${bookingId}/complete`, {
    method: "POST",
  });
}


// ─────────────────────────────────────────────
// SHARED (SINGLE DETAILS)
// ─────────────────────────────────────────────

// Get details of a specific booking (Works for both Buyer and Seller)
export function getBookingDetails(bookingId) {
  return request(`/api/bookings/${bookingId}`, {
    method: "GET",
  });
}