"use client";

import { useEffect, useState } from "react";
import EmptyState from "@/components/EmptyState";
import PageHero from "@/components/PageHero";
import ProductCard from "@/components/ProductCard";
import StatusMessage from "@/components/StatusMessage";
import { getProductsBySellerId } from "@/services/product.service";

export default function SellerProductsPage({ params }) {
  const [state, setState] = useState({
    loading: true,
    products: [],
    error: "",
  });

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const data = await getProductsBySellerId(params.sellerId);

        if (isMounted) {
          setState({
            loading: false,
            products: data?.products || [],
            error: "",
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            loading: false,
            products: [],
            error: error.message || "Unable to load seller products.",
          });
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [params.sellerId]);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Seller Storefront"
        title="Products from this seller"
        subtitle={`Seller ID: ${params.sellerId}`}
      />

      <StatusMessage type="error">{state.error}</StatusMessage>

      {state.loading ? (
        <div className="card-surface rounded-[2rem] p-8 text-sm text-[var(--muted)]">Loading seller products...</div>
      ) : state.products.length === 0 ? (
        <EmptyState
          title="No active products"
          description="This seller does not currently have public active products."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {state.products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
