"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Trash2,
  ShoppingCart,
  CreditCard
} from "lucide-react";

import ProtectedRoute from "@/components/ProtectedRoute";
import { getCart, removeFromCart, clearCart } from "@/services/cart.service";
import { getProductById } from "@/services/product.service";
import { getToken } from "@/utils/auth";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

// 🔥 Load Razorpay
const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

export default function CartPage() {
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  // 🔥 LOAD CART
  const loadCart = async () => {
    setLoading(true);

    try {
      const data = await getCart();
      const rawItems = data?.data?.items || [];

      const detailed = await Promise.all(
        rawItems.map(async (item) => {
          try {
            const res = await getProductById(item.productId);
            const product = res?.product;

            return {
              ...item,
              title: product?.title,
              image: product?.images?.[0]?.url,
            };
          } catch {
            return item;
          }
        })
      );

      setCart({
        items: detailed,
        totalPrice: data?.data?.totalPrice || 0,
      });

    } catch {
      setCart({ items: [], totalPrice: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // ❌ REMOVE
  const handleRemove = async (id) => {
    setBusy(id);

    try {
      await removeFromCart(id);
      loadCart();
    } catch {
      setMessage("Failed to remove item");
    } finally {
      setBusy("");
    }
  };

  // 🧹 CLEAR
  const handleClear = async () => {
    setBusy("clear");

    try {
      await clearCart();
      loadCart();
    } catch {
      setMessage("Failed to clear cart");
    } finally {
      setBusy("");
    }
  };

  // 💳 PAYMENT (FINAL FIX)
  const handlePayment = async () => {
    if (!cart.items.length) return;

    const token = getToken();
    if (!token) {
      alert("Login required");
      return;
    }

    // ✅ FIX 1: Correct decoding
    let userId;
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      userId = decoded.userId; // ✅ CORRECT FIELD
      console.log("USER ID:", userId);
    } catch {
      alert("Invalid token");
      return;
    }

    const loaded = await loadRazorpay();
    if (!loaded) {
      alert("Razorpay failed to load");
      return;
    }

    try {
      const response = await fetch("http://localhost:4008/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ important
        },
        body: JSON.stringify({
          amount: cart.totalPrice,
          currency: "INR",
          userId: userId, // ✅ THIS FIXES YOUR BUG
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      const options = {
        key: data.data.key,
        amount: data.data.amount,
        currency: "INR",
        order_id: data.data.razorpayOrderId,
        name: "UniKart",

        handler: async (res) => {
          try {
            await fetch("http://localhost:4008/api/payments/confirm", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpayOrderId: res.razorpay_order_id,
                razorpayPaymentId: res.razorpay_payment_id,
                razorpaySignature: res.razorpay_signature,
              }),
            });

            alert("Payment successful 🎉");
            handleClear();
          } catch {
            alert("Payment verification failed");
          }
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", () => {
        alert("Payment failed");
      });

      rzp.open();

    } catch (err) {
      console.error(err);
      alert(err.message || "Payment failed");
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto px-6 py-10">

        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <ShoppingCart /> Your Cart
        </h1>

        {loading ? (
          <p>Loading...</p>
        ) : cart.items.length === 0 ? (
          <p className="text-gray-500">Cart is empty</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">

            {/* ITEMS */}
            <div className="md:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between border p-4 rounded"
                >

                  <div className="flex gap-4 items-center">
                    <img
                      src={item.image || "/placeholder.png"}
                      className="w-20 h-20 object-cover rounded"
                    />

                    <div>
                      <h2 className="font-semibold">
                        {item.title || "Product"}
                      </h2>

                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>

                      <p className="font-medium">
                        {formatCurrency(item.priceAtTime)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="text-red-500"
                  >
                    {busy === item.productId ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Trash2 />
                    )}
                  </button>

                </div>
              ))}
            </div>

            {/* SUMMARY */}
            <div className="border p-6 rounded space-y-4">

              <h2 className="text-xl font-semibold">Summary</h2>

              <p>Total Items: {cart.items.length}</p>

              <p className="text-lg font-bold">
                {formatCurrency(cart.totalPrice)}
              </p>

              <button
                onClick={handlePayment}
                className="w-full bg-green-600 text-white py-2 rounded flex items-center justify-center gap-2"
              >
                <CreditCard size={18} />
                Pay Now
              </button>

              <button
                onClick={handleClear}
                className="w-full bg-red-500 text-white py-2 rounded"
              >
                Clear Cart
              </button>

            </div>
          </div>
        )}

        {message && (
          <p className="mt-4 text-center text-sm text-gray-500">
            {message}
          </p>
        )}

      </div>
    </ProtectedRoute>
  );
}