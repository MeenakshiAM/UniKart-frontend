"use client";

import { useEffect, useState } from "react";
import EmptyState from "@/components/EmptyState";
import PageHero from "@/components/PageHero";
import Panel from "@/components/Panel";
import StatusMessage from "@/components/StatusMessage";
import { findDemoServiceById } from "@/data/demoCatalog";
import { getServiceById, getServiceSlots } from "@/services/product.service";

export default function ServiceDetailsPage({ params }) {
  const [serviceState, setServiceState] = useState({
    loading: true,
    service: null,
    error: "",
  });
  const [slotFilters, setSlotFilters] = useState({
    startDate: "",
    endDate: "",
  });
  const [slotState, setSlotState] = useState({
    loading: false,
    slots: [],
    error: "",
  });

  useEffect(() => {
    let isMounted = true;

    const loadService = async () => {
      const demoService = findDemoServiceById(params.serviceId);

      if (demoService) {
        setServiceState({
          loading: false,
          service: demoService,
          error: "",
        });
        return;
      }

      try {
        const data = await getServiceById(params.serviceId, true);

        if (isMounted) {
          setServiceState({
            loading: false,
            service: data?.data || null,
            error: "",
          });
        }
      } catch (error) {
        if (isMounted) {
          setServiceState({
            loading: false,
            service: null,
            error: error.message || "Unable to load service.",
          });
        }
      }
    };

    loadService();

    return () => {
      isMounted = false;
    };
  }, [params.serviceId]);

  const handleLoadSlots = async (event) => {
    event.preventDefault();

    if (findDemoServiceById(params.serviceId)) {
      setSlotState({
        loading: false,
        slots: [],
        error: "Demo services do not have live booking slots yet.",
      });
      return;
    }

    if (!slotFilters.startDate || !slotFilters.endDate) {
      setSlotState({
        loading: false,
        slots: [],
        error: "Please choose both start date and end date.",
      });
      return;
    }

    setSlotState({
      loading: true,
      slots: [],
      error: "",
    });

    try {
      const data = await getServiceSlots(params.serviceId, slotFilters);
      setSlotState({
        loading: false,
        slots: data?.data || [],
        error: "",
      });
    } catch (error) {
      setSlotState({
        loading: false,
        slots: [],
        error: error.message || "Unable to load service slots.",
      });
    }
  };

  if (serviceState.loading) {
    return <div className="card-surface rounded-[2rem] p-8 text-sm text-[var(--muted)]">Loading service...</div>;
  }

  if (serviceState.error || !serviceState.service) {
    return (
      <EmptyState
        title="Service unavailable"
        description={serviceState.error || "This service could not be loaded."}
      />
    );
  }

  const service = serviceState.service;

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Service Details"
        title={service.title}
        subtitle={service.description}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Panel>
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-[var(--muted)]">Category</p>
                <p className="mt-2 font-semibold">{service.category}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Service Type</p>
                <p className="mt-2 font-semibold">{service.serviceType}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Status</p>
                <p className="mt-2 font-semibold">{service.status}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Base Price</p>
                <p className="mt-2 font-semibold">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(service?.pricing?.basePrice || 0)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-[var(--muted)]">Location</p>
              <p className="mt-2 leading-7">
                {service?.location?.venue || "Venue not provided"}
                {service?.location?.building ? `, ${service.location.building}` : ""}
                {service?.location?.room ? `, ${service.location.room}` : ""}
              </p>
            </div>

            <div>
              <p className="text-sm text-[var(--muted)]">Requirements</p>
              <p className="mt-2 leading-7">
                {service?.requirements?.length ? service.requirements.join(", ") : "No special requirements listed."}
              </p>
            </div>
          </div>
        </Panel>

        <Panel>
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold tracking-tight">View available slots</h2>

            <form onSubmit={handleLoadSlots} className="grid gap-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium">Start Date</span>
                <input
                  className="field"
                  type="date"
                  value={slotFilters.startDate}
                  onChange={(event) => setSlotFilters((current) => ({ ...current, startDate: event.target.value }))}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium">End Date</span>
                <input
                  className="field"
                  type="date"
                  value={slotFilters.endDate}
                  onChange={(event) => setSlotFilters((current) => ({ ...current, endDate: event.target.value }))}
                />
              </label>

              <button type="submit" className="btn-primary">
                Load Slots
              </button>
            </form>

            <StatusMessage type="error">{slotState.error}</StatusMessage>

            {slotState.loading ? (
              <p className="text-sm text-[var(--muted)]">Loading slots...</p>
            ) : slotState.slots.length > 0 ? (
              <div className="space-y-3">
                {slotState.slots.map((slot) => (
                  <div key={slot._id} className="rounded-[1.5rem] border border-[rgba(114,75,43,0.12)] bg-white/70 p-4">
                    <p className="font-semibold">{new Date(slot.date).toLocaleDateString()}</p>
                    <div className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                      {slot.timeSlots?.map((timeSlot) => (
                        <div key={timeSlot._id} className="flex items-center justify-between gap-3 rounded-2xl bg-[rgba(118,86,66,0.06)] px-3 py-2">
                          <span>
                            {timeSlot.startTime} - {timeSlot.endTime}
                          </span>
                          <span>{timeSlot.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <StatusMessage type="info">
                Pick a date range to view slots. Booking is intentionally not implemented because the booking backend is not stable yet.
              </StatusMessage>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
