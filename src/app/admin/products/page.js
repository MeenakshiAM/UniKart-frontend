"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageCard from "@/components/PageCard";
import StatusMessage from "@/components/StatusMessage";

import {
  getPendingProducts,
  getRejectedProducts,
  approveProduct,
  rejectProduct,
} from "@/services/product.service";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("PENDING_APPROVAL");
  const [loading, setLoading] = useState(true);

  // ---------------- FETCH ----------------
  const fetchProducts = async (status) => {
    setLoading(true);

    try {
      let res = { products: [] };

      if (status === "PENDING_APPROVAL") {
        res = await getPendingProducts();
      } else if (status === "REJECTED") {
        res = await getRejectedProducts();
      } else {
        // ACTIVE not supported yet in backend service
        res = await getPendingProducts();
      }

      setProducts(res?.products || []);
    } catch (err) {
      console.log("Fetch error:", err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(statusFilter);
  }, [statusFilter]);

  // ---------------- ACTIONS ----------------
  const handleApprove = async (id) => {
    try {
      await approveProduct(id);
      fetchProducts(statusFilter);
    } catch (err) {
      console.log(err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      const reason = prompt("Enter rejection reason:");
      if (!reason) return;

      await rejectProduct(id, reason);
      fetchProducts(statusFilter);
    } catch (err) {
      console.log(err.message);
    }
  };

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <ProtectedRoute>
        <PageCard title="Product Moderation">
          <p>Loading products...</p>
        </PageCard>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PageCard title="Product Moderation Panel">

        {/* FILTER BAR */}
        <div className="flex gap-2 mb-4">
          {["PENDING_APPROVAL", "REJECTED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded border text-sm ${
                statusFilter === status
                  ? "bg-black text-white"
                  : "bg-white"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* EMPTY STATE */}
        {products.length === 0 && (
          <StatusMessage type="info">
            No products found for {statusFilter.replace("_", " ")}
          </StatusMessage>
        )}

        {/* PRODUCT LIST */}
        <div className="space-y-4">
          {products.map((p) => (
            <div
              key={p._id}
              className="border p-4 rounded-lg flex justify-between items-center"
            >
              {/* LEFT SIDE */}
              <div>
                <h2 className="font-bold">{p.title}</h2>

                <p className="text-sm text-gray-500">
                  ₹{p?.price?.finalPrice ?? p?.price}
                </p>

                <p className="text-sm mt-2">
                  Status:{" "}
                  <b
                    className={
                      p.status === "ACTIVE"
                        ? "text-green-600"
                        : p.status === "PENDING_APPROVAL"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }
                  >
                    {p.status}
                  </b>
                </p>

                {p.moderationReason && (
                  <p className="text-xs text-red-500 mt-1">
                    Reason: {p.moderationReason}
                  </p>
                )}
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2">

                {p.status !== "ACTIVE" && (
                  <button
                    onClick={() => handleApprove(p._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Approve
                  </button>
                )}

                {p.status !== "REJECTED" && (
                  <button
                    onClick={() => handleReject(p._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
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