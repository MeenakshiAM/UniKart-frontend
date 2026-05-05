"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import PageCard from "@/components/PageCard";
import StatusMessage from "@/components/StatusMessage";
import ProductCard from "@/components/ProductCard";

import {
  getMyProducts,
  getMyDrafts,
  getMyRejectedProducts,
  getMyHiddenProducts,
  getMyOutOfStockProducts,
  getMyPendingProducts,
} from "@/services/product.service";

export default function SellerProductsPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("ACTIVE");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState({
    type: "",
    message: "",
  });

  // ---------------- FETCH ----------------
  const fetchProducts = async (tab) => {
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      let res;

      switch (tab) {
        case "ACTIVE":
          res = await getMyProducts();
          break;

        case "PENDING":
          res = await getMyPendingProducts();
          break;

        case "DRAFT":
          res = await getMyDrafts();
          break;

        case "REJECTED":
          res = await getMyRejectedProducts();
          break;

        case "HIDDEN":
          res = await getMyHiddenProducts();
          break;

        case "OUT_OF_STOCK":
          res = await getMyOutOfStockProducts();
          break;

        default:
          res = await getMyProducts();
      }

      setProducts(res?.products || []);

      if (!res?.products?.length) {
        setStatus({
          type: "info",
          message: "No products found in this section",
        });
      }
    } catch (err) {
      console.log(err);

      setProducts([]);
      setStatus({
        type: "error",
        message: err.message || "Failed to load products",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(activeTab);
  }, [activeTab]);

  // ---------------- TAB STYLE ----------------
  const tabClass = (tab) =>
    `text-left px-2 py-1 rounded ${
      activeTab === tab
        ? "bg-orange-500 text-white"
        : "hover:bg-gray-100"
    }`;

  // ---------------- UI ----------------
  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r p-5 space-y-4">

        <h2 className="text-xl font-bold text-orange-500">
          Products Panel
        </h2>

        <nav className="flex flex-col gap-3 text-sm">

          <button
            className={tabClass("ACTIVE")}
            onClick={() => setActiveTab("ACTIVE")}
          >
            Active Products
          </button>

          <button
            className={tabClass("PENDING")}
            onClick={() => setActiveTab("PENDING")}
          >
            Pending
          </button>

          <button
            className={tabClass("DRAFT")}
            onClick={() => setActiveTab("DRAFT")}
          >
            Drafts
          </button>

          <button
            className={tabClass("REJECTED")}
            onClick={() => setActiveTab("REJECTED")}
          >
            Rejected
          </button>

          <button
            className={tabClass("HIDDEN")}
            onClick={() => setActiveTab("HIDDEN")}
          >
            Hidden
          </button>

          <button
            className={tabClass("OUT_OF_STOCK")}
            onClick={() => setActiveTab("OUT_OF_STOCK")}
          >
            Out of Stock
          </button>

          <hr />

          <button
            onClick={() => router.push("/dashboard/products/create")}
            className="text-green-600 font-bold text-left"
          >
            ➕ Create Product
          </button>

        </nav>

      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6 space-y-6">

        <PageCard title="Seller Product Panel" />

        <StatusMessage type={status.type}>
          {status.message}
        </StatusMessage>

        <PageCard title={`${activeTab} Products`}>

          {loading ? (
            <p className="text-sm text-gray-500">Loading products...</p>
          ) : products.length === 0 ? (
            <StatusMessage type="info">
              No products found in this section
            </StatusMessage>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>
          )}

        </PageCard>

      </main>

    </div>
  );
}