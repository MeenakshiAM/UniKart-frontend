"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageCard from "@/components/PageCard";
import StatusMessage from "@/components/StatusMessage";
import { API } from "@/services/api";

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // ---------------- FETCH ----------------
  const fetchSellers = async () => {
    try {
      const res = await API.get("/api/auth/admin/sellers");

      const data = res?.users || res?.sellers || [];
      setSellers(data);
      setFiltered(data);
    } catch (err) {
      console.log("Fetch error:", err.message);
      setSellers([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  // ---------------- FILTER LOGIC ----------------
  useEffect(() => {
    if (statusFilter === "ALL") {
      setFiltered(sellers);
    } else {
      setFiltered(
        sellers.filter((s) => (s.status || "NO_REQUEST") === statusFilter)
      );
    }
  }, [statusFilter, sellers]);

  // ---------------- ACTIONS ----------------
  const approveSeller = async (id) => {
    try {
      await API.patch(`/api/auth/approve-seller/${id}`);
      fetchSellers();
    } catch (err) {
      console.log(err.message);
    }
  };

  const rejectSeller = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      await API.patch(`/api/auth/reject-seller/${id}`, { reason });
      fetchSellers();
    } catch (err) {
      console.log(err.message);
    }
  };

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <ProtectedRoute>
        <PageCard title="Admin Panel">
          <p>Loading sellers...</p>
        </PageCard>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PageCard title="Admin Seller Panel">

        {/* 🔥 FILTER BAR */}
        <div className="flex gap-2 mb-4 flex-wrap">

          {["ALL", "PENDING", "ACTIVE", "REJECTED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded border text-sm ${
                statusFilter === status
                  ? "bg-black text-white"
                  : "bg-white"
              }`}
            >
              {status}
            </button>
          ))}

        </div>

        {/* EMPTY STATE */}
        {filtered.length === 0 && (
          <StatusMessage type="info">
            No sellers found for {statusFilter}
          </StatusMessage>
        )}

        {/* LIST */}
        <div className="space-y-4">

          {filtered.map((s) => (
            <div
              key={s._id}
              className="border p-4 rounded-lg flex justify-between"
            >
              {/* LEFT */}
              <div>
                <h2 className="font-bold">{s.name}</h2>
                <p className="text-sm">{s.email}</p>

                <p className="mt-2 text-sm">
                  🏪 Shop: {s.shopName || "Not created"}
                </p>

                <p className="text-sm">
                  Status:{" "}
                  <b
                    className={
                      s.status === "ACTIVE"
                        ? "text-green-600"
                        : s.status === "PENDING"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }
                  >
                    {s.status || "NO_REQUEST"}
                  </b>
                </p>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2">

                {s.status !== "ACTIVE" && (
                  <button
                    onClick={() => approveSeller(s._id)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Approve
                  </button>
                )}

                {s.status !== "REJECTED" && (
                  <button
                    onClick={() => rejectSeller(s._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                )}

              </div>
            </div>
          ))}

        </div>
      </PageCard>
    </ProtectedRoute>
  );
}