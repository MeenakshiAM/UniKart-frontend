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

  // ================= LOAD SERVICE =================
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

  // ================= LOAD RAZORPAY =================
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

  // ================= BOOK + PAYMENT =================
  const handleBookSlot = async (slotId, timeSlotId) => {
    try {
      console.log("🚀 Creating booking...");

      const payload = {
        serviceId: params.serviceId,
        slotId,
        timeSlotId,
        participants: 1,
      };

      const res = await createBooking(payload);

      const booking = res?.data || res;
      const bookingId = booking._id;
      const amount = booking.pricing.totalAmount;

      console.log("✅ Booking created:", bookingId);

      // ================= TOKEN =================
      const token = getToken();

      if (!token) {
        alert("Login required");
        return;
      }

      // ================= DECODE USER =================
      let userId;

      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        userId = decoded.userId;
      } catch {
        alert("Invalid token");
        return;
      }

      // ================= LOAD RAZORPAY =================
      const loaded = await loadRazorpay();
      if (!loaded) {
        alert("Razorpay failed to load");
        return;
      }

      // ================= CREATE ORDER =================
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
            userId, // 🔥 FIXED
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      // ================= RAZORPAY =================
      const options = {
        key: data.data.key,
        amount: data.data.amount,
        currency: "INR",
        order_id: data.data.razorpayOrderId,
        name: "UniKart Services",

        handler: async (res) => {
          try {
            // VERIFY PAYMENT
            await fetch(
              "http://localhost:4008/api/payments/confirm",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpayOrderId: res.razorpay_order_id,
                  razorpayPaymentId: res.razorpay_payment_id,
                  razorpaySignature: res.razorpay_signature,
                }),
              }
            );

            // MARK BOOKING PAID
            await fetch(
              `http://localhost:4002/api/bookings/${bookingId}/pay`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            alert("🎉 Booking confirmed!");

          } catch {
            alert("Payment verification failed");
          }
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", () => {
        alert("Payment failed ❌");
      });

      rzp.open();

    } catch (err) {
      console.error("❌ Booking failed:", err.message);
      alert(err.message);
    }
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
                <div key={slot._id} className="border p-3 rounded">

                  <p className="font-semibold">
                    📅 {new Date(slot.date).toDateString()}
                  </p>

                  <div className="mt-2 space-y-2">
                    {slot.timeSlots?.map((t) => (
                      <div
                        key={t._id}
                        className="flex justify-between items-center border p-2 rounded"
                      >
                        <span>
                          ⏰ {t.startTime} - {t.endTime}
                        </span>

                        <button
                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                          onClick={() =>
                            handleBookSlot(slot._id, t._id)
                          }
                        >
                          Book
                        </button>

                      </div>
                    ))}
                  </div>

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