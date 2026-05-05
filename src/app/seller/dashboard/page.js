"use client";

import { useEffect, useState } from "react";
import PageCard from "@/components/PageCard";
import StatusMessage from "@/components/StatusMessage";
import ProductCard from "@/components/ProductCard";

import { getStoredUser } from "@/utils/auth";
import { getPublicSellerProfile } from "@/services/auth.service";
import { getProductsBySellerId } from "@/services/product.service";

export default function SellerDashboardPage() {
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    const load = async () => {
      try {
        const user = getStoredUser();

        if (!user?.id) {
          throw new Error("User not found");
        }

        // 🔥 GET SELLER PROFILE
        const sellerRes = await getPublicSellerProfile(user.id);

        const sellerData =
          sellerRes?.seller ||
          sellerRes?.data?.seller ||
          sellerRes ||
          null;

        setSeller(sellerData);

        // 🔥 GET PRODUCTS
        const productRes = await getProductsBySellerId(user.id);

        setProducts(productRes?.products || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <PageCard title="Seller Dashboard">
        <p>Loading your dashboard...</p>
      </PageCard>
    );
  }

  // ---------------- NO SELLER ----------------
  if (!seller) {
    return (
      <PageCard title="Seller Dashboard">
        <StatusMessage type="error">
          No seller profile found. Please apply to become a seller.
        </StatusMessage>
      </PageCard>
    );
  }

  // ---------------- UI ----------------
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <PageCard
        title={`Welcome, ${seller.shopName || "Seller"}`}
        subtitle="Your complete seller dashboard"
      >

        <div className="grid md:grid-cols-3 gap-4 mt-4">

          {/* STATUS */}
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-500">Status</p>
            <p
              className={
                seller.status === "ACTIVE"
                  ? "text-green-600 font-bold"
                  : seller.status === "PENDING"
                  ? "text-yellow-600 font-bold"
                  : "text-red-600 font-bold"
              }
            >
              {seller.status}
            </p>
          </div>

          {/* PRODUCTS */}
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-500">Products</p>
            <p className="text-xl font-bold">{products.length}</p>
          </div>

          {/* VIOLATIONS */}
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-500">Violations</p>
            <p className="text-xl font-bold">
              {seller.violationCount || 0}
            </p>
          </div>

        </div>

        {/* SHOP INFO */}
        <div className="mt-6 border rounded-lg p-4">
          <h2 className="font-bold mb-2">Shop Info</h2>
          <p className="text-sm text-gray-600">
            {seller.shopDescription || "No description added"}
          </p>
        </div>

      </PageCard>

      {/* PRODUCTS SECTION */}
      <PageCard title="Your Products">

        {products.length === 0 ? (
          <StatusMessage type="info">
            You haven't added any products yet
          </StatusMessage>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

      </PageCard>

    </div>
  );
}