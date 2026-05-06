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

        console.log("🔥 SERVICE RESPONSE:", res);

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

      console.log("🔥 SLOT RESPONSE:", res);

      setSlots(res || []);
    } catch (err) {
      console.log(err);
      setSlotError(err.message || "Failed to load slots");
    } finally {
      setSlotLoading(false);
    }
  };

  // ================= BOOK SLOT =================
  const handleBookSlot = async (slotId, timeSlotId) => {
    try {
      const payload = {
        serviceId: params.serviceId,
        slotId,
        timeSlotId,
        participants: 1,
      };

      console.log("🚀 BOOKING PAYLOAD:", payload);

      const res = await createBooking(payload);

      console.log("✅ BOOKING SUCCESS:", res);

      alert("Booking successful!");
    } catch (err) {
      console.error("❌ Booking failed:", err.message);
      alert(err.message);
    }
  };

  // ================= LOADING UI =================
  if (loading) {
    return <div className="p-6">Loading service...</div>;
  }

  if (!service || error) {
    return (
      <EmptyState
        title="Service unavailable"
        description={error || "Service not found"}
      />
    );
  }

  // ================= UI =================
  return (
    <div className="space-y-6">

      <PageHero
        eyebrow="Service Details"
        title={service.title}
        subtitle={service.description}
      />

      <div className="grid lg:grid-cols-2 gap-6">

        {/* LEFT */}
        <Panel>
          <Info label="Category" value={service.category} />
          <Info label="Type" value={service.serviceType} />
          <Info label="Status" value={service.status} />
        </Panel>

        {/* RIGHT */}
        <Panel>
          <h2 className="font-semibold mb-3">Slots</h2>

          {/* FILTER */}
          <form onSubmit={handleLoadSlots} className="space-y-2">

            <input
              type="date"
              value={slotFilters.startDate}
              onChange={(e) =>
                setSlotFilters({
                  ...slotFilters,
                  startDate: e.target.value,
                })
              }
              className="field"
            />

            <input
              type="date"
              value={slotFilters.endDate}
              onChange={(e) =>
                setSlotFilters({
                  ...slotFilters,
                  endDate: e.target.value,
                })
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

          {/* SLOT LIST */}
          <div className="mt-4 space-y-4">

            {slotLoading ? (
              <p className="text-sm text-gray-500">Loading slots...</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-gray-500">No slots found</p>
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

                        <span className="text-sm">
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

// ================= HELPERS =================
function Info({ label, value }) {
  return (
    <div className="mb-2">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="font-medium">{value || "N/A"}</p>
    </div>
  );
}