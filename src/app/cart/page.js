"use client";

import { useEffect, useState } from "react";
import { Loader2, ShoppingCart, Trash2 } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import PageHero from "@/components/PageHero";
import Panel from "@/components/Panel";
import ProtectedRoute from "@/components/ProtectedRoute";
import StatusMessage from "@/components/StatusMessage";
import { clearCart, getCart, removeFromCart } from "@/services/cart.service";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export default function CartPage() {
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [busyAction, setBusyAction] = useState("");

  const loadCart = async () => {
    setLoading(true);

    try {
      const data = await getCart();
      setCart({
        items: data?.data?.items || [],
        totalPrice: data?.data?.totalPrice || 0,
      });
      setStatus({ type: "info", message: "" });
    } catch (error) {
      if ((error.message || "").toLowerCase().includes("cart not found")) {
        setCart({ items: [], totalPrice: 0 });
        setStatus({ type: "info", message: "" });
      } else {
        setStatus({
          type: "error",
          message: error.message || "Unable to load cart.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleRemove = async (productId) => {
    setBusyAction(`remove-${productId}`);
    setStatus({ type: "info", message: "" });

    try {
      const data = await removeFromCart(productId);
      setCart({
        items: data?.data?.items || [],
        totalPrice: data?.data?.totalPrice || 0,
      });
      setStatus({ type: "success", message: "Item removed from cart." });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to remove item from cart.",
      });
    } finally {
      setBusyAction("");
    }
  };

  const handleClearCart = async () => {
    setBusyAction("clear");
    setStatus({ type: "info", message: "" });

    try {
      const data = await clearCart();
      setCart({
        items: data?.data?.items || [],
        totalPrice: data?.data?.totalPrice || 0,
      });
      setStatus({ type: "success", message: "Cart cleared successfully." });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to clear cart.",
      });
    } finally {
      setBusyAction("");
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <PageHero
          eyebrow="Cart"
          title="Your shopping cart"
          subtitle="This page reads directly from the cart-service APIs and shows the exact item fields returned by the backend."
        />

        <StatusMessage type={status.type}>{status.message}</StatusMessage>

        {loading ? (
          <div className="card-surface rounded-[2rem] p-8 text-sm text-[var(--muted)]">Loading cart...</div>
        ) : cart.items.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            description="Add a few products from the marketplace to see them here."
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Panel>
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={item.productId}
                    className="rounded-[1.5rem] border border-[rgba(114,75,43,0.12)] bg-white/70 p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-2">
                        <p className="text-sm text-[var(--muted)]">Product ID</p>
                        <p className="font-semibold break-all">{item.productId}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
                          <span>Quantity: {item.quantity}</span>
                          <span>Price at time: {formatCurrency(item.priceAtTime)}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(item.productId)}
                        disabled={busyAction === `remove-${item.productId}`}
                        className="btn-secondary"
                      >
                        {busyAction === `remove-${item.productId}` ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel>
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-6 w-6 text-[var(--brand)]" />
                  <h2 className="text-2xl font-semibold tracking-tight">Summary</h2>
                </div>

                <div className="rounded-[1.5rem] bg-[rgba(157,60,31,0.08)] p-5">
                  <p className="text-sm text-[var(--muted)]">Total price</p>
                  <p className="mt-2 text-3xl font-semibold">{formatCurrency(cart.totalPrice)}</p>
                </div>

                <p className="text-sm text-[var(--muted)]">
                  Items in cart: <span className="font-semibold text-[var(--text)]">{cart.items.length}</span>
                </p>

                <button
                  type="button"
                  onClick={handleClearCart}
                  disabled={busyAction === "clear"}
                  className="btn-primary w-full"
                >
                  {busyAction === "clear" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Clear Cart
                </button>
              </div>
            </Panel>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
