"use client";

import { useEffect, useState } from "react";
import EmptyState from "@/components/EmptyState";
import PageHero from "@/components/PageHero";
import Pagination from "@/components/Pagination";
import ServiceCard from "@/components/ServiceCard";
import StatusMessage from "@/components/StatusMessage";

import { getServices } from "@/services/service.service";

export default function ServicesPage() {
  const [page, setPage] = useState(1);

  const [state, setState] = useState({
    loading: true,
    services: [],
    pagination: null,
    error: "",
  });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await getServices({ page, limit: 9 });
console.log("🔥 RAW RESPONSE:", data);
        if (!mounted) return;
        console.log("🔥 RAW RESPONSE:", data);
        setState({
          loading: false,
          services: Array.isArray(data) ? data : data?.data || [],
          pagination: data?.pagination || null,
          error: "",
        });
      } catch (err) {
        if (!mounted) return;

        setState({
          loading: false,
          services: [],
          pagination: null,
          error: err.message || "Failed to load services",
        });
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [page]);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Services"
        title="Browse services"
        subtitle="Explore all available services from the platform."
      />

      {state.error && (
        <StatusMessage type="error">{state.error}</StatusMessage>
      )}

      {state.loading ? (
        <div className="card-surface p-6">Loading services...</div>
      ) : state.services.length === 0 ? (
        <EmptyState
          title="No services found"
          description="No services are available right now."
        />
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {state.services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>

          <Pagination
            page={state.pagination?.page || page}
            totalPages={state.pagination?.totalPages || 1}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}