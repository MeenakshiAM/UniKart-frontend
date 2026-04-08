"use client";

import { useCallback, useEffect, useState } from "react";
import { Heart, Loader2, Trash2 } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import PageHero from "@/components/PageHero";
import Panel from "@/components/Panel";
import ProtectedRoute from "@/components/ProtectedRoute";
import StatusMessage from "@/components/StatusMessage";
import { getWishlist, toggleWishlist } from "@/services/cart.service";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [busyProductId, setBusyProductId] = useState("");

  const loadWishlist = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getWishlist();
      setWishlist(Array.isArray(data) ? data : []);
      setStatus({ type: "info", message: "" });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to load wishlist.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const handleRemove = async (productId) => {
    setBusyProductId(productId);
    setStatus({ type: "info", message: "" });

    try {
      const response = await toggleWishlist(productId);
      setWishlist((current) => current.filter((item) => item.productId !== productId));
      setStatus({
        type: "success",
        message: response?.message || "Wishlist updated.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to update wishlist.",
      });
    } finally {
      setBusyProductId("");
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <PageHero
          eyebrow="Wishlist"
          title="Saved products"
          subtitle="These entries are loaded from the wishlist-service endpoints exactly as returned by the backend."
        />

        <StatusMessage type={status.type}>{status.message}</StatusMessage>

        {loading ? (
          <div className="card-surface rounded-[2rem] p-8 text-sm text-[var(--muted)]">Loading wishlist...</div>
        ) : wishlist.length === 0 ? (
          <EmptyState
            title="Your wishlist is empty"
            description="Tap the heart icon on products you want to save for later."
          />
        ) : (
          <Panel>
            <div className="space-y-4">
              {wishlist.map((item) => (
                <div
                  key={item._id || item.productId}
                  className="flex flex-col gap-4 rounded-[1.5rem] border border-[rgba(114,75,43,0.12)] bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-[rgba(157,60,31,0.08)] p-3 text-[var(--brand)]">
                      <Heart className="h-5 w-5 fill-current" />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--muted)]">Product ID</p>
                      <p className="font-semibold break-all">{item.productId}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(item.productId)}
                    disabled={busyProductId === item.productId}
                    className="btn-secondary"
                  >
                    {busyProductId === item.productId ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>
    </ProtectedRoute>
  );
}
