"use client";

import { useCallback, useEffect, useState } from "react";
import { Heart, Loader2, Trash2 } from "lucide-react";

import ProtectedRoute from "@/components/ProtectedRoute";
import { getWishlist, toggleWishlist } from "@/services/cart.service";
import { getProductById } from "@/services/product.service";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  // 🔥 LOAD WISHLIST + PRODUCT DETAILS
  const loadWishlist = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getWishlist();
      const raw = Array.isArray(data) ? data : [];

      // 👉 fetch product details
      const detailed = await Promise.all(
        raw.map(async (item) => {
          try {
            const res = await getProductById(item.productId);
            const product = res?.product;

            return {
              ...item,
              title: product?.title,
              image: product?.images?.[0]?.url,
              price:
                product?.price?.finalPrice ||
                product?.price?.basePrice,
            };
          } catch {
            return item;
          }
        })
      );

      setWishlist(detailed);

    } catch {
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // ❌ REMOVE FROM WISHLIST
  const handleRemove = async (productId) => {
    setBusy(productId);
    setMessage("");

    try {
      await toggleWishlist(productId);

      setWishlist((prev) =>
        prev.filter((item) => item.productId !== productId)
      );

      setMessage("Removed from wishlist");
    } catch {
      setMessage("Failed to remove");
    } finally {
      setBusy("");
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto px-6 py-10">

        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Heart /> Wishlist
        </h1>

        {loading ? (
          <p>Loading...</p>
        ) : wishlist.length === 0 ? (
          <p className="text-gray-500">Your wishlist is empty</p>
        ) : (
          <div className="space-y-4">

            {wishlist.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between border p-4 rounded"
              >

                {/* LEFT */}
                <div className="flex items-center gap-4">

                  <img
                    src={item.image || "https://via.placeholder.com/150"}
                    className="w-20 h-20 object-cover rounded"
                  />

                  <div>
                    <h2 className="font-semibold">
                      {item.title || "Product"}
                    </h2>

                    <p className="text-sm text-gray-500">
                      ₹{item.price || "N/A"}
                    </p>
                  </div>

                </div>

                {/* REMOVE */}
                <button
                  onClick={() => handleRemove(item.productId)}
                  className="text-red-500 flex items-center gap-1"
                >
                  {busy === item.productId ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>

              </div>
            ))}

          </div>
        )}

        {message && (
          <p className="mt-6 text-center text-sm text-gray-600">
            {message}
          </p>
        )}

      </div>
    </ProtectedRoute>
  );
}