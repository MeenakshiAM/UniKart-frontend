"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import PageCard from "@/components/PageCard";
import StatusMessage from "@/components/StatusMessage";

import {
  getMyServices,
  deleteService,
} from "@/services/service.service";

export default function SellerServicesPage() {
  const router = useRouter();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await getMyServices();
      setServices(res?.data || []);
    } catch (err) {
      console.log(err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteService(id);
      fetchServices();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="p-6">

      <PageCard title="My Services">

        <button
          onClick={() =>router.push("/seller/service/create")}
          className="bg-green-600 text-white px-3 py-2 rounded mb-4"
        >
          + Create Service
        </button>

        {loading ? (
          <p>Loading...</p>
        ) : services.length === 0 ? (
          <StatusMessage type="info">
            No services found
          </StatusMessage>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">

            {services.map((s) => (
              <div
                key={s._id}
                className="border p-4 rounded-lg"
              >

                <h2 className="font-bold">{s.title}</h2>

                <p className="text-sm text-gray-500">
                  ₹{s.price}
                </p>

                <p className="text-xs mt-1">
                  Status: {s.status}
                </p>

                <div className="flex gap-2 mt-3">

                  <button
                    onClick={() =>
                      router.push(`/seller/services/edit/${s._id}`)
                    }
                    className="bg-blue-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(s._id)}
                    className="bg-red-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Delete
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </PageCard>
    </div>
  );
}