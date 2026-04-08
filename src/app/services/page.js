"use client";

import { useEffect, useState } from "react";
import EmptyState from "@/components/EmptyState";
import PageHero from "@/components/PageHero";
import Pagination from "@/components/Pagination";
import ServiceCard from "@/components/ServiceCard";
import StatusMessage from "@/components/StatusMessage";
import { demoServices, mergeCatalogItems } from "@/data/demoCatalog";
import { getServices } from "@/services/product.service";

export default function ServicesPage() {
  const [page, setPage] = useState(1);
  const [state, setState] = useState({
    loading: true,
    services: [],
    pagination: null,
    error: "",
  });

  useEffect(() => {
    let isMounted = true;

    const loadServices = async () => {
      try {
        const data = await getServices({ page, limit: 9 });
        const backendServices = data?.data || [];
        const visibleServices = page === 1 ? mergeCatalogItems(backendServices, demoServices) : backendServices;

        if (isMounted) {
          setState({
            loading: false,
            services: visibleServices,
            pagination: data?.pagination || null,
            error: "",
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            loading: false,
            services: page === 1 ? demoServices : [],
            pagination: null,
            error: error.message || "Unable to load services.",
          });
        }
      }
    };

    loadServices();

    return () => {
      isMounted = false;
    };
  }, [page]);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Services"
        title="Browse services"
        subtitle="This page intentionally uses only the stable basic listing endpoint and avoids broken nearby search, booking, and review flows."
      />

      <StatusMessage type="error">{state.error}</StatusMessage>

      {state.loading ? (
        <div className="card-surface rounded-[2rem] p-8 text-sm text-[var(--muted)]">Loading services...</div>
      ) : state.services.length === 0 ? (
        <EmptyState
          title="No services found"
          description="The backend did not return any active services right now."
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
