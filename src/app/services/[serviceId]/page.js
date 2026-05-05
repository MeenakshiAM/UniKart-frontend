"use client";

import { useEffect, useState } from "react";
import EmptyState from "@/components/EmptyState";
import PageHero from "@/components/PageHero";
import Panel from "@/components/Panel";
import StatusMessage from "@/components/StatusMessage";

import { findDemoServiceById } from "@/data/demoCatalog";
import { getServiceById, getServiceSlots } from "@/services/product.service";

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

  // 🔥 LOAD SERVICE
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
        const res = await getServiceById(params.serviceId, true);

        setService(res?.data || null);
        setIsDemo(false);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load service");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params.serviceId]);

  // 🔥 LOAD SLOTS
  const handleLoadSlots = async (e) => {
    e.preventDefault();

    if (isDemo) {
      setSlotError("Demo services don’t support booking yet.");
      return;
    }

    if (!slotFilters.startDate || !slotFilters.endDate) {
      setSlotError("Select both dates.");
      return;
    }

    setSlotLoading(true);
    setSlotError("");

    try {
      const res = await getServiceSlots(params.serviceId, slotFilters);
      setSlots(res?.data || []);
    } catch (err) {
      setSlotError(err.message || "Failed to load slots");
    } finally {
      setSlotLoading(false);
    }
  };

  // 🔥 STATES
  if (loading) {
    return <div className="card-surface p-6">Loading service...</div>;
  }

  if (!service || error) {
    return (
      <EmptyState
        title="Service unavailable"
        description={error || "Service not found"}
      />
    );
  }

  // 🔥 UI
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
          <div className="space-y-4">

            <Info label="Category" value={service.category} />
            <Info label="Type" value={service.serviceType} />
            <Info label="Status" value={service.status} />

            <Info
              label="Price"
              value={formatCurrency(service?.pricing?.basePrice)}
            />

            <Info
              label="Location"
              value={formatLocation(service.location)}
            />

            <Info
              label="Requirements"
              value={
                service?.requirements?.length
                  ? service.requirements.join(", ")
                  : "None"
              }
            />

          </div>
        </Panel>

        {/* RIGHT */}
        <Panel>
          <h2 className="text-xl font-semibold mb-4">Available Slots</h2>

          <form onSubmit={handleLoadSlots} className="space-y-3">

            <input
              type="date"
              className="field"
              value={slotFilters.startDate}
              onChange={(e) =>
                setSlotFilters((s) => ({ ...s, startDate: e.target.value }))
              }
            />

            <input
              type="date"
              className="field"
              value={slotFilters.endDate}
              onChange={(e) =>
                setSlotFilters((s) => ({ ...s, endDate: e.target.value }))
              }
            />

            <button className="btn-primary w-full">
              Load Slots
            </button>
          </form>

          <StatusMessage type="error">{slotError}</StatusMessage>

          {slotLoading ? (
            <p>Loading slots...</p>
          ) : slots.length > 0 ? (
            <div className="space-y-3 mt-4">
              {slots.map((slot) => (
                <div key={slot._id} className="border p-3 rounded">

                  <p className="font-semibold">
                    {new Date(slot.date).toDateString()}
                  </p>

                  {slot.timeSlots?.map((t) => (
                    <div
                      key={t._id}
                      className="flex justify-between text-sm mt-2"
                    >
                      <span>{t.startTime} - {t.endTime}</span>
                      <span>{t.status}</span>
                    </div>
                  ))}

                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-4">
              No slots loaded
            </p>
          )}

          {/* 🚧 FUTURE BOOKING */}
          {!isDemo && slots.length > 0 && (
            <button className="btn-primary w-full mt-4">
              Book Now (Coming Soon)
            </button>
          )}

        </Panel>

      </div>
    </div>
  );
}

// 🔥 SMALL HELPERS
function Info({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold">{value || "N/A"}</p>
    </div>
  );
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount || 0);
}

function formatLocation(loc = {}) {
  return [loc.venue, loc.building, loc.room].filter(Boolean).join(", ") || "N/A";
}