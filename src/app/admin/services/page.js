"use client";

import { useEffect, useState } from "react";
import {
  getPendingServices,
  approveService,
  rejectService,
} from "@/services/service.service";

export default function AdminServicePage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await getPendingServices();
      setServices(res || []);
      console.log(res);
    } catch (err) {
      console.log("FETCH ERROR:", err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveService(id);
      fetchPending();
    } catch (err) {
      console.log(err);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      await rejectService(id, { reason });
      fetchPending();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="space-y-4">

      <h1 className="text-xl font-bold">
        🛠️ Service Moderation
      </h1>

      {loading ? (
        <p>Loading...</p>
      ) : services.length === 0 ? (
        <p className="text-gray-500">No pending services</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">

          {services.map((s) => (
            <div key={s._id} className="border p-4 rounded bg-white">

              <h2 className="font-bold">{s.title}</h2>
              <p className="text-sm text-gray-500">{s.category}</p>

              <p className="mt-2">
                ₹{s?.pricing?.basePrice}
              </p>

              <p className="text-xs mt-1">
                Provider: {s.providerName}
              </p>

              <div className="flex gap-2 mt-3">

                <button
                  onClick={() => handleApprove(s._id)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Approve
                </button>

                <button
                  onClick={() => handleReject(s._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}