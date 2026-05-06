"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import PageCard from "@/components/PageCard";
import StatusMessage from "@/components/StatusMessage";

import {
  getMyActiveServices,
  getMyPendingServices,
  getMyRejectedServices,
  deleteService,
} from "@/services/service.service";

export default function SellerServicePage() {
  const router = useRouter();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("ACTIVE");

  // 🔥 DEBUG VERSION FETCHER (SAFE + CLEAR)
  const fetchServices = async () => {
  setLoading(true);

  try {
    let res;

    if (status === "ACTIVE") {
      res = await getMyActiveServices();
    } else if (status === "PENDING") {
      res = await getMyPendingServices();
    } else {
      res = await getMyRejectedServices();
    }

    console.log("🔥 RAW RESPONSE:", res);

    // ✅ SAFE EXTRACTION (IMPORTANT FIX)
    const list =
      res?.data?.data ||   // if nested { data: { data: [] } }
      res?.data ||         // normal backend response
      res ||               // direct array
      [];

    console.log("🔥 FINAL LIST:", list);

    setServices(Array.isArray(list) ? list : []);
  } catch (err) {
    console.log("❌ FETCH ERROR:", err);
    setServices([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchServices();
  }, [status]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this service?")) return;

    try {
      await deleteService(id);
      fetchServices();
    } catch (err) {
      console.log("DELETE ERROR:", err);
    }
  };

  return (
    <div className="p-6 space-y-5">

      <PageCard title="My Services" />

      {/* STATUS FILTER */}
      <div className="flex gap-2">
        {["ACTIVE", "PENDING", "REJECTED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1 border rounded ${
              status === s ? "bg-black text-white" : ""
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* CREATE */}
      <button
        onClick={() => router.push("/seller/service/create")}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        + Create Service
      </button>

      {/* CONTENT */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : services.length === 0 ? (
        <StatusMessage type="info">
          No services found
        </StatusMessage>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">

          {services.map((s) => (
            <div key={s._id} className="border p-4 rounded">

              <h2 className="font-bold">{s.title}</h2>

              <p className="text-sm text-gray-500">
                {s.category}
              </p>

              <p className="mt-2 font-semibold">
                ₹{s?.pricing?.basePrice}
              </p>

              <p className="text-xs mt-1">
                Status: {s.status}
              </p>

              <div className="flex gap-2 mt-3">

                <button
                  onClick={() =>
                    router.push(`/seller/service/edit/${s._id}`)
                  }
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(s._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}