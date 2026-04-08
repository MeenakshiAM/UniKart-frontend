"use client";

import { Heart, Loader2, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { getToken } from "@/utils/auth";

export default function ProductCommerceActions({
  product,
  isWishlisted,
  busyAction,
  onAddToCart,
  onToggleWishlist,
}) {
  const router = useRouter();

  const requireAuth = () => {
    if (getToken()) {
      return true;
    }

    router.push(`/login?next=${encodeURIComponent("/products")}`);
    return false;
  };

  const handleAddToCart = () => {
    if (!requireAuth()) {
      return;
    }

    onAddToCart(product);
  };

  const handleWishlistToggle = () => {
    if (!requireAuth()) {
      return;
    }

    onToggleWishlist(product);
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={busyAction === `cart-${product._id}`}
        className="btn-primary"
      >
        {busyAction === `cart-${product._id}` ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ShoppingCart className="mr-2 h-4 w-4" />
        )}
        Add to Cart
      </button>

      <button
        type="button"
        onClick={handleWishlistToggle}
        disabled={busyAction === `wishlist-${product._id}`}
        className={`btn-secondary ${isWishlisted ? "border-[rgba(157,60,31,0.35)] text-[var(--brand)]" : ""}`}
      >
        {busyAction === `wishlist-${product._id}` ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Heart className={`mr-2 h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
        )}
        {isWishlisted ? "Wishlisted" : "Wishlist"}
      </button>
    </div>
  );
}
