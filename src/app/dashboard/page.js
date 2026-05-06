"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  UserCircle,
  Plus,
  ShoppingBag,
  Wrench,
  Settings2,
} from "lucide-react";

import ProtectedRoute from "@/components/ProtectedRoute";
import { getStoredUser } from "@/utils/auth";

import { getMyProducts } from "@/services/product.service";
import { getMyServices } from "@/services/service.service";

const getProviderBookings = async () => [];

/* ================= MAIN DASHBOARD ================= */
export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    fetchTabData(activeTab);
  }, [activeTab]);

  /* ================= CLEAN NORMALIZER ================= */
  const normalize = (res) => {
    if (!res) return [];

    // direct array
    if (Array.isArray(res)) return res;

    // safe deep extraction (handles ALL your backend chaos)
    return (
      res?.data?.data ??
      res?.data ??
      res?.products ??
      res?.services ??
      res?.bookings ??
      []
    );
  };

  /* ================= FETCH ================= */
  const fetchTabData = async (type) => {
    setLoading(true);

    try {
      let res = null;

      switch (type) {
        case "products":
          res = await getMyProducts();
          break;
        case "services":
          res = await getMyServices();
          break;
        case "bookings":
          res = await getProviderBookings();
          break;
      }

      const data = normalize(res);

      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Dashboard error:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* HEADER */}
        <div className="flex items-center gap-5 mb-8 bg-white p-6 rounded-3xl border shadow-sm">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
            {user?.profileImage ? (
              <img src={user.profileImage} className="w-full h-full object-cover" />
            ) : (
              <UserCircle className="w-10 h-10 text-slate-400" />
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.name?.split(" ")[0] || "Student"}!
            </h1>
            <p className="text-slate-500">{user?.email}</p>
          </div>
        </div>

        {/* PANEL */}
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">

          {/* TABS */}
          <div className="flex gap-2 p-4 border-b bg-slate-50">
            <Tab active={activeTab === "products"} onClick={() => setActiveTab("products")}>
              Products
            </Tab>

            <Tab active={activeTab === "services"} onClick={() => setActiveTab("services")}>
              Services
            </Tab>

            <Tab active={activeTab === "bookings"} onClick={() => setActiveTab("bookings")}>
              Bookings
            </Tab>

            {activeTab !== "bookings" && (
              <Link
                href={
                  activeTab === "products"
                    ? "/dashboard/products/create"
                    : "/services/create"
                }
                className="ml-auto px-4 py-2 bg-black text-white rounded-xl"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Create
              </Link>
            )}
          </div>

          {/* CONTENT */}
          <div className="p-6 bg-slate-50">

            {loading ? (
              <p className="text-center text-slate-400">Loading...</p>
            ) : items.length === 0 ? (
              <p className="text-center text-slate-400">No data found</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) =>
                  activeTab === "bookings" ? (
                    <BookingCard key={item?._id || item?.id} booking={item} />
                  ) : (
                    <Card key={item?._id || item?.id} item={item} type={activeTab} />
                  )
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

/* ================= TAB ================= */
function Tab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl font-semibold transition ${
        active ? "bg-black text-white" : "text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

/* ================= BOOKING CARD ================= */
function BookingCard({ booking }) {
  return (
    <div className="bg-white p-5 rounded-2xl border">
      <h3 className="font-bold">{booking?.service?.name || "Service"}</h3>
      <p className="text-sm text-slate-500">{booking?.user?.name || "User"}</p>

      <p className="mt-2 text-sm">
        {booking?.date || "TBD"} • {booking?.timeSlot || "N/A"}
      </p>

      <p className="mt-2 font-semibold">
        {booking?.status || "PENDING"}
      </p>
    </div>
  );
}

/* ================= PRODUCT / SERVICE CARD ================= */
function Card({ item, type }) {
  const id = item?._id || item?.id;

  const title = item?.title || item?.name || "Untitled";

  const price =
    typeof item?.price === "object"
      ? item?.price?.finalPrice ?? item?.price?.amount ?? 0
      : item?.price ?? item?.hourlyRate ?? 0;

  const image =
    item?.images?.[0]?.url ||
    item?.images?.[0] ||
    item?.image ||
    item?.thumbnail;

  return (
    <div className="bg-white p-5 rounded-2xl border">

      {image ? (
        <img src={image} className="h-40 w-full object-cover rounded-xl" />
      ) : (
        <div className="h-40 flex items-center justify-center bg-slate-100">
          {type === "products" ? <ShoppingBag /> : <Wrench />}
        </div>
      )}

      <h3 className="font-bold mt-3">{title}</h3>

      <p className="text-sm text-slate-500">{item?.description}</p>

      <p className="mt-2 font-bold">₹{price}</p>

      <p className="text-sm text-slate-500">{item?.status}</p>

      {id && (
        <Link
          href={`/dashboard/${type}/${id}/edit`}
          className="text-blue-600 mt-3 inline-block"
        >
          <Settings2 className="w-4 h-4 inline" /> Edit
        </Link>
      )}
    </div>
  );
}