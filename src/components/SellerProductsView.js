"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DashboardNav from "@/components/DashboardNav";
import EmptyState from "@/components/EmptyState";
import PageHero from "@/components/PageHero";
import ProductCard from "@/components/ProductCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import StatusMessage from "@/components/StatusMessage";
import {
  deleteProduct,
  hideProduct,
  unhideProduct,
} from "@/services/product.service";

export default function SellerProductsView({
  title,
  subtitle,
  loadProducts,
  emptyDescription,
  showUnhide = false,
  allowEdit = true,
  allowVisibilityAction = true,
}) {
  const [state, setState] = useState({
    loading: true,
    products: [],
    error: "",
    notice: "",
  });
  const [busyId, setBusyId] = useState("");

  const fetchProducts = async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));

    try {
      const data = await loadProducts();
      setState({
        loading: false,
        products: data?.products || [],
        error: "",
        notice: "",
      });
    } catch (error) {
      setState({
        loading: false,
        products: [],
        error: error.message || "Unable to load products.",
        notice: "",
      });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const runAction = async (productId, action, successMessage) => {
    setBusyId(productId);

    try {
      await action(productId);
      setState((current) => ({
        ...current,
        notice: successMessage,
      }));
      await fetchProducts();
    } catch (error) {
      setState((current) => ({
        ...current,
        error: error.message || "Action failed.",
      }));
    } finally {
      setBusyId("");
    }
  };

  return (
    <ProtectedRoute>
      <PageHero
        eyebrow="Seller Dashboard"
        title={title}
        subtitle={subtitle}
        actions={
          <Link href="/dashboard/products/create" className="btn-primary">
            Create Product
          </Link>
        }
      />

      <DashboardNav />

      <div className="space-y-6">
        <StatusMessage type="error">{state.error}</StatusMessage>
        <StatusMessage type="success">{state.notice}</StatusMessage>

        {state.loading ? (
          <div className="card-surface rounded-[2rem] p-8 text-sm text-[var(--muted)]">Loading products...</div>
        ) : state.products.length === 0 ? (
          <EmptyState
            title="No products found"
            description={emptyDescription}
            action={
              <Link href="/dashboard/products/create" className="btn-primary">
                Add Product
              </Link>
            }
          />
        ) : (
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {state.products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                actionArea={
                  <div className="flex flex-wrap gap-3">
                    {allowEdit ? (
                      <Link href={`/dashboard/products/edit/${product._id}`} className="btn-secondary">
                        Edit
                      </Link>
                    ) : null}
                    {allowVisibilityAction
                      ? showUnhide
                        ? (
                          <button
                            type="button"
                            className="btn-secondary"
                            disabled={busyId === product._id}
                            onClick={() => runAction(product._id, unhideProduct, "Product restored successfully.")}
                          >
                            Unhide
                          </button>
                        )
                        : (
                          <button
                            type="button"
                            className="btn-secondary"
                            disabled={busyId === product._id}
                            onClick={() => runAction(product._id, hideProduct, "Product hidden successfully.")}
                          >
                            Hide
                          </button>
                        )
                      : null}
                    <button
                      type="button"
                      className="rounded-2xl border border-[rgba(161,43,43,0.18)] bg-[rgba(161,43,43,0.08)] px-5 py-3 font-semibold text-[var(--danger)]"
                      disabled={busyId === product._id}
                      onClick={() => runAction(product._id, deleteProduct, "Product deleted successfully.")}
                    >
                      Delete
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
