"use client";

import { useEffect, useState } from "react";
import EmptyState from "@/components/EmptyState";
import PageHero from "@/components/PageHero";
import Panel from "@/components/Panel";
import StatusMessage from "@/components/StatusMessage";

import { findDemoServiceById } from "@/data/demoCatalog";
import {
  getServiceById,
  getServiceSlotsInRange,
} from "@/services/service.service";

import { getToken } from "@/utils/auth";
import { createBooking } from "@/services/booking.service";

export default function ServiceDetailsPage({ params }) {
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isDemo, setIsDemo] = useState(false);

  const [slotFilters, setSlotFilters] = useState({
    startDate: "",
    endDate: "",
  });

  const [slots, setSlots] = useState([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [slotError, setSlotError] = useState("");

  const [bookings, setBookings] = useState([]);

  // ================= SERVICE LOAD =================
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const demo = findDemoServiceById(params.serviceId);

      if (demo) {
        setService(demo);
        setIsDemo(true);
        setLoading(false);
        return;
      }

      try {
        const res = await getServiceById(params.serviceId);
        setService(res?.data ?? res ?? null);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load service");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params.serviceId]);

  // ================= LOAD BOOKINGS =================
  const loadBookings = async () => {
    try {
      const res = await fetch(
        "http://localhost:4002/api/bookings/bookings",
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await res.json();

      const normalized = data?.data ?? data ?? [];
      setBookings(Array.isArray(normalized) ? normalized : []);
    } catch (err) {
      console.error("Booking load failed", err);
      setBookings([]);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // ================= RAZORPAY =================
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  // ================= LOAD SLOTS =================
  const handleLoadSlots = async (e) => {
    e.preventDefault();

    if (isDemo) {
      setSlotError("Demo services don’t support slots.");
      return;
    }

    const { startDate, endDate } = slotFilters;

    if (!startDate || !endDate) {
      setSlotError("Select both dates.");
      return;
    }

    setSlotLoading(true);
    setSlotError("");
    setSlots([]);

    try {
      const res = await getServiceSlotsInRange(
        params.serviceId,
        startDate,
        endDate
      );

      setSlots(res || []);
    } catch (err) {
      setSlotError(err.message || "Failed to load slots");
    } finally {
      setSlotLoading(false);
    }
  };

  // ================= BOOK SLOT =================
  const handleBookSlot = async (slotId, timeSlotId) => {
    try {
      const res = await createBooking({
        serviceId: params.serviceId,
        slotId,
        timeSlotId,
        participants: 1,
      });

      const booking = res?.data || res;
      const bookingId = booking?._id;
      const amount = booking?.pricing?.totalAmount;

      const token = getToken();
      if (!token) return alert("Login required");

      const decoded = JSON.parse(atob(token.split(".")[1]));

      const loaded = await loadRazorpay();
      if (!loaded) return alert("Razorpay failed");

      const response = await fetch(
        "http://localhost:4008/api/payments/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount,
            currency: "INR",
            userId: decoded.userId,
          }),
        }
      );

      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      const options = {
        key: data.data.key,
        amount: data.data.amount,
        currency: "INR",
        order_id: data.data.razorpayOrderId,
        name: "UniKart Services",

        handler: async (res) => {
          try {
            await fetch(
              "http://localhost:4008/api/payments/confirm",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(res),
              }
            );

            await fetch(
              `http://localhost:4002/api/bookings/${bookingId}/pay`,
              { method: "PATCH" }
            );

            alert("🎉 Booking confirmed!");

            // 🔥 REFRESH BOOKINGS AFTER PAYMENT
            await loadBookings();

          } catch {
            alert("Payment verification failed");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      alert(err.message);
    }
  };

  // ================= SAFE STATUS CHECK =================
  const getBookingStatus = (slotId, timeSlotId) => {
    if (!Array.isArray(bookings)) return "AVAILABLE";

    const booking = bookings.find((b) => {
      return (
        String(b?.slotId) === String(slotId) &&
        String(b?.timeSlotId) === String(timeSlotId)
      );
    });

    if (!booking) return "AVAILABLE";

    const status = booking?.status;

    if (status === "confirmed" || status === "completed") return "BOOKED";
    if (status === "pending_payment") return "PENDING";

    return "AVAILABLE";
  };

  // ================= UI =================
  if (loading) return <div className="p-6">Loading service...</div>;

  if (!service || error) {
    return (
      <EmptyState
        title="Service unavailable"
        description={error || "Service not found"}
      />
    );
  }

  return (
    <div className="space-y-6">

      <PageHero
        eyebrow="Service Details"
        title={service.title}
        subtitle={service.description}
      />

      <div className="grid lg:grid-cols-2 gap-6">

        <Panel>
          <Info label="Category" value={service.category} />
          <Info label="Type" value={service.serviceType} />
          <Info label="Status" value={service.status} />
        </Panel>

        <Panel>
          <h2 className="font-semibold mb-3">Slots</h2>

          <form onSubmit={handleLoadSlots} className="space-y-2">
            <input
              type="date"
              value={slotFilters.startDate}
              onChange={(e) =>
                setSlotFilters({ ...slotFilters, startDate: e.target.value })
              }
              className="field"
            />

            <input
              type="date"
              value={slotFilters.endDate}
              onChange={(e) =>
                setSlotFilters({ ...slotFilters, endDate: e.target.value })
              }
              className="field"
            />

            <button className="btn-primary w-full">
              Load Slots
            </button>
          </form>

          {slotError && (
            <StatusMessage type="error">{slotError}</StatusMessage>
          )}

          <div className="mt-4 space-y-4">

            {slotLoading ? (
              <p>Loading slots...</p>
            ) : slots.length === 0 ? (
              <p>No slots found</p>
            ) : (
              slots.map((slot) => (
                <div key={slot._id} className="border p-3 rounded-lg bg-white">

                  <p className="font-semibold mb-2">
                    📅 {new Date(slot.date).toDateString()}
                  </p>

                  {slot.timeSlots?.map((t) => {
                    const status = getBookingStatus(slot._id, t._id);

                    return (
                      <div
                        key={t._id}
                        className="flex justify-between items-center border p-2 rounded mb-2"
                      >
                        <span>
                          ⏰ {t.startTime} - {t.endTime}
                        </span>

                        {status === "BOOKED" ? (
                          <span className="text-xs px-3 py-1 rounded bg-red-100 text-red-600">
                            Booked
                          </span>
                        ) : status === "PENDING" ? (
                          <span className="text-xs px-3 py-1 rounded bg-yellow-100 text-yellow-700">
                            Pending
                          </span>
                        ) : (
                          <button
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                            onClick={() =>
                              handleBookSlot(slot._id, t._id)
                            }
                          >
                            Book
                          </button>
                        )}
                      </div>
                    );
                  })}

                </div>
              ))
            )}

          </div>
        </Panel>

      </div>
    </div>
  );
}

// ================= HELPER =================
function Info({ label, value }) {
  return (
    <div className="mb-2">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="font-medium">{value || "N/A"}</p>
    </div>
  );
}