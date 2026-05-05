"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageCard from "@/components/PageCard";
import StatusMessage from "@/components/StatusMessage";
import {
  registerSeller,
  getPublicSellerProfile,
} from "@/services/auth.service";
import { getStoredUser } from "@/utils/auth";

const initialForm = {
  shopName: "",
  shopDescription: "",
  agreedToCommission: false,
};

export default function BecomeSellerPage() {
  const [user, setUser] = useState(null);
  const [seller, setSeller] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [status, setStatus] = useState({ type: "info", message: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    console.log("🚀 BecomeSellerPage mounted");

    const storedUser = getStoredUser();
    console.log("👤 Stored User:", storedUser);

    setUser(storedUser);

    const fetchSeller = async () => {
      try {
        console.log("📡 Fetching seller profile...");

        // ✅ FIXED: id instead of _id
        if (!storedUser?.id) {
          console.log("❌ No user ID found");
          setSeller(null);
          setLoading(false);
          return;
        }

        const data = await getPublicSellerProfile(storedUser.id);

        console.log("📦 API Response:", data);

        const sellerData =
          data?.seller ||
          data?.data?.seller ||
          data?.data ||
          data ||
          null;

        console.log("🧠 Seller Data:", sellerData);

        setSeller(sellerData);
      } catch (error) {
        console.log("❌ Seller fetch error:", error);
        setSeller(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSeller();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.shopName.trim()) {
      setStatus({ type: "error", message: "Shop name is required." });
      return;
    }

    setSubmitting(true);

    try {
      await registerSeller(form);

      const user = getStoredUser();

      // ✅ FIXED HERE TOO
      const updated = await getPublicSellerProfile(user.id);

      const sellerData =
        updated?.seller ||
        updated?.data?.seller ||
        updated?.data ||
        updated ||
        null;

      setSeller(sellerData);

      setStatus({
        type: "success",
        message: "⏳ Seller request submitted! Waiting for admin approval.",
      });

      setForm(initialForm);
    } catch (error) {
      console.log("❌ Submit error:", error);

      setStatus({
        type: "error",
        message: error.message || "Unable to submit seller request.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isBlockedByRole = user?.role && user.role !== "BUYER";

  if (loading) {
    return (
      <ProtectedRoute>
        <PageCard title="Loading...">
          <p className="text-sm text-gray-500">
            Checking seller status...
          </p>
        </PageCard>
      </ProtectedRoute>
    );
  }

  if (seller?.status === "PENDING") {
    return (
      <ProtectedRoute>
        <PageCard title="Seller Application Pending">
          <StatusMessage type="info">
            ⏳ Your seller application is under review. Please wait for admin approval.
          </StatusMessage>
        </PageCard>
      </ProtectedRoute>
    );
  }

  if (seller?.status === "REJECTED") {
    return (
      <ProtectedRoute>
        <PageCard title="Application Rejected">
          <StatusMessage type="error">
            ❌ {seller?.rejectionReason || "Your application was rejected."}
          </StatusMessage>

          <button
            className="btn-primary mt-4"
            onClick={() => setSeller(null)}
          >
            Reapply
          </button>
        </PageCard>
      </ProtectedRoute>
    );
  }

  if (seller?.status === "ACTIVE") {
    return (
      <ProtectedRoute>
        <PageCard title="Seller Dashboard">
          <StatusMessage type="success">
            🎉 You are an approved seller!
          </StatusMessage>

          <div className="flex gap-4 mt-4">
            <a href="/seller/products" className="btn-primary">
              My Products
            </a>
            <a href="/seller/create" className="btn-secondary">
              Add Product
            </a>
          </div>
        </PageCard>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PageCard
        title="Apply to become a seller"
        subtitle="Submit your shop details for admin approval"
      >
        <div className="space-y-6">
          <StatusMessage type={status.type}>
            {status.message}
          </StatusMessage>

          {isBlockedByRole && (
            <StatusMessage type="info">
              Your current role is {user.role}. Only BUYER users can apply.
            </StatusMessage>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="field"
              name="shopName"
              value={form.shopName}
              onChange={handleChange}
              placeholder="Shop name"
              disabled={isBlockedByRole}
            />

            <textarea
              className="field min-h-32"
              name="shopDescription"
              value={form.shopDescription}
              onChange={handleChange}
              placeholder="Shop description"
              disabled={isBlockedByRole}
            />

            <label className="flex gap-2 text-sm">
              <input
                type="checkbox"
                name="agreedToCommission"
                checked={form.agreedToCommission}
                onChange={handleChange}
                disabled={isBlockedByRole}
              />
              I agree to commission terms
            </label>

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || isBlockedByRole}
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      </PageCard>
    </ProtectedRoute>
  );
}