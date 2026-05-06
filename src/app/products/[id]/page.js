"use client";

import { useEffect, useState } from "react";
import { getProductById } from "@/services/product.service";
import { addToCart, toggleWishlist } from "@/services/cart.service";
import { getReviewsByProduct, createReview } from "@/services/review.service";
import { getToken } from "@/utils/auth";
import Link from "next/link";
import { ShoppingCart, Heart } from "lucide-react";

export default function ProductDetailsPage({ params }) {
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [loadingAction, setLoadingAction] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);

  // review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // ================= LOAD PRODUCT + REVIEWS =================
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProductById(params.id);
        setProduct(data?.product);

        // load reviews safely
        try {
          const rev = await getReviewsByProduct(params.id);
          setReviews(rev?.data || []);
        } catch (err) {
          console.log("Reviews not available yet");
          setReviews([]);
        }
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params.id]);

  // ================= CART =================
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
        priceAtTime: product.price?.finalPrice || product.price?.basePrice,
      });
      setMessage("Added to cart");
    } catch {
      setMessage("Failed to add to cart");
    } finally {
      setLoadingAction("");
    }
  };

  // ================= WISHLIST =================
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

  // ================= ADD REVIEW =================
  const handleReviewSubmit = async () => {
  if (!getToken()) {
    setMessage("Login required");
    return;
  }

  setReviewLoading(true);

  try {
    const newReview = await createReview(product._id, {
      targetType: "PRODUCT",
      targetId: product._id,
      rating,
      text: comment,
    });

    setReviews((prev) => [newReview?.review, ...prev]);
    setComment("");
    setRating(5);
    setMessage("Review added");
  } catch (err) {
    setMessage("Failed to add review");
    console.log( err);
  } finally {
    setReviewLoading(false);
  }
};

  // ================= UI STATES =================
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

      {/* ================= PRODUCT ================= */}
      <div className="grid md:grid-cols-2 gap-8 mt-6">

        <img
          src={product.images?.[0]?.url}
          className="w-full h-80 object-cover rounded"
        />

        <div className="space-y-4">

          <h1 className="text-2xl font-bold">{product.title}</h1>
          <p className="text-gray-500">{product.category}</p>

          <p className="text-xl font-semibold">
            ₹{product.price?.finalPrice || product.price?.basePrice}
          </p>

          <p className="text-gray-700">{product.description}</p>

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
              {loadingAction === "wishlist" ? "Updating..." : "Wishlist"}
            </button>

          </div>

          {message && (
            <p className="text-sm text-gray-600">{message}</p>
          )}

        </div>
      </div>

      {/* ================= REVIEW SECTION ================= */}
      <div className="mt-12 border-t pt-6">

        <h2 className="text-xl font-semibold mb-4">Reviews</h2>

        {/* REVIEW FORM */}
        <div className="space-y-2 mb-6">

          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="border p-2 rounded"
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} Stars
              </option>
            ))}
          </select>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review..."
            className="w-full border p-2 rounded"
          />

          <button
            onClick={handleReviewSubmit}
            className="px-4 py-2 bg-black text-white rounded"
          >
            {reviewLoading ? "Posting..." : "Add Review"}
          </button>

        </div>

        {/* REVIEW LIST */}
        <div className="space-y-4">

          {reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet</p>
          ) : (
            reviews.map((r, i) => (
              <div key={i} className="border p-3 rounded">

                <p className="font-semibold">
                  ⭐ {r.rating}/5
                </p>

                <p>{r.text}</p>

              </div>
            ))
          )}

        </div>

      </div>
    </div>
  );
}