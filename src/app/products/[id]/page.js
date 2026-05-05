"use client";

import { useEffect, useState } from "react";
import { getProductById } from "@/services/product.service";
import { addToCart, toggleWishlist } from "@/services/cart.service";
import { getToken } from "@/utils/auth";
import Link from "next/link";
import { ShoppingCart, Heart } from "lucide-react";

export default function ProductDetailsPage({ params }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [loadingAction, setLoadingAction] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProductById(params.id);
        setProduct(data?.product);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!getToken()) {
      setMessage("Please login first");
      return;
    }

    setLoadingAction("cart");

    try {
      await addToCart({
        productId: product._id,
        quantity: 1,
        priceAtTime:
          product.price?.finalPrice || product.price?.basePrice,
      });
      setMessage("Added to cart");
    } catch {
      setMessage("Failed to add to cart");
    } finally {
      setLoadingAction("");
    }
  };

  const handleWishlist = async () => {
    if (!getToken()) {
      setMessage("Please login first");
      return;
    }

    setLoadingAction("wishlist");

    try {
      await toggleWishlist(product._id);
      setIsWishlisted((p) => !p);
      setMessage("Wishlist updated");
    } catch {
      setMessage("Failed to update wishlist");
    } finally {
      setLoadingAction("");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  if (!product) {
    return (
      <div className="text-center mt-10">
        <p>Product not found</p>
        <Link href="/products">Back</Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto">

      <Link href="/products" className="text-sm underline">
        Back
      </Link>

      <div className="grid md:grid-cols-2 gap-8 mt-6">

        {/* IMAGE */}
        <img
          src={product.images?.[0]?.url}
          className="w-full h-80 object-cover rounded"
        />

        {/* DETAILS */}
        <div className="space-y-4">

          <h1 className="text-2xl font-bold">{product.title}</h1>

          <p className="text-gray-500">{product.category}</p>

          <p className="text-xl font-semibold">
            ₹{product.price?.finalPrice || product.price?.basePrice}
          </p>

          <p className="text-gray-700">
            {product.description}
          </p>

          {/* BUTTONS */}
          <div className="flex gap-4 pt-4">

            <button
              onClick={handleAddToCart}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded"
            >
              <ShoppingCart size={18} />
              {loadingAction === "cart" ? "Adding..." : "Add to Cart"}
            </button>

            <button
              onClick={handleWishlist}
              className="flex items-center gap-2 px-4 py-2 border rounded"
            >
              <Heart size={18} fill={isWishlisted ? "black" : "none"} />
              {loadingAction === "wishlist"
                ? "Updating..."
                : "Wishlist"}
            </button>

          </div>

          {message && (
            <p className="text-sm text-gray-600">{message}</p>
          )}

        </div>
      </div>
    </div>
  );
}