"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch("http://localhost:4008/api/orders/my", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const data = await res.json();
      setOrders(data.data || []);
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>

        {loading ? (
          <p>Loading...</p>
        ) : orders.length === 0 ? (
          <p>No orders found</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="border p-4 rounded-xl">
                <p className="font-bold">Order ID: {order._id}</p>
                <p>Status: {order.status}</p>
                <p>Payment: {order.paymentStatus}</p>

                <div className="mt-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="text-sm">
                      {item.name} × {item.quantity} — ₹{item.price}
                    </div>
                  ))}
                </div>

                <p className="mt-2 font-semibold">
                  Total: ₹{order.totalAmount}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}