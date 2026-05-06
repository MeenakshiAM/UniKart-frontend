import { createApiRequester } from "@/services/api";

const api = createApiRequester("http://localhost:4002");

export function createBooking(data) {
  return api("/api/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  }).then((res) => res?.data ?? res);
}