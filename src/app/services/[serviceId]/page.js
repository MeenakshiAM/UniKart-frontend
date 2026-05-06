"use client";

import { useEffect, useState } from "react";
import EmptyState from "@/components/EmptyState";
import PageHero from "@/components/PageHero";
import Panel from "@/components/Panel";
import StatusMessage from "@/components/StatusMessage";

import { findDemoServiceById } from "@/data/demoCatalog";
import {
  getServiceById,
  getServiceSlots,
} from "@/services/service.service";

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

  // ================= UI STATES =================
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

          {slotLoading && <p>Loading slots...</p>}

          {slots.map((slot) => (
            <div key={slot._id} className="border p-2 mt-2">
              {slot.date}
            </div>
          ))}
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