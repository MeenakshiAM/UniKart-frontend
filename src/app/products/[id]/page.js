"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import EmptyState from "@/components/EmptyState";
import PageHero from "@/components/PageHero";
import Panel from "@/components/Panel";
import StatusMessage from "@/components/StatusMessage";
import { findDemoProductById } from "@/data/demoCatalog";
import { getProductById } from "@/services/product.service";

function formatPrice(product) {
  const amount = product?.price?.finalPrice ?? product?.price?.basePrice ?? 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ProductDetailsPage({ params }) {
  const [state, setState] = useState({
    loading: true,
    product: null,
    error: "",
  });

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      const demoProduct = findDemoProductById(params.id);

      if (demoProduct) {
        setState({
          loading: false,
          product: demoProduct,
          error: "",
        });
        return;
      }

      try {
        const data = await getProductById(params.id);

        if (isMounted) {
          setState({
            loading: false,
            product: data?.product || null,
            error: "",
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            loading: false,
            product: null,
            error: error.message || "Unable to load product.",
          });
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  if (state.loading) {
    return <div className="card-surface rounded-[2rem] p-8 text-sm text-[var(--muted)]">Loading product details...</div>;
  }

  if (state.error || !state.product) {
    return (
      <EmptyState
        title="Product unavailable"
        description={state.error || "This product could not be loaded."}
        action={
          <Link href="/products" className="btn-primary">
            Back to products
          </Link>
        }
      />
    );
  }

  const product = state.product;

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Product Details"
        title={product.title}
        subtitle={product.subCategory || product.category}
        actions={
          product.sellerId ? (
            <Link href={`/seller/${product.sellerId}`} className="btn-secondary">
              More From Seller
            </Link>
          ) : null
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel className="overflow-hidden">
          <div className="grid gap-4 md:grid-cols-2">
            {product.images?.length ? (
              product.images.map((image, index) => (
                <div key={image.public_id || index} className="overflow-hidden rounded-[1.5rem] bg-[rgba(157,60,31,0.08)]">
                  <img src={image.url} alt={`${product.title} ${index + 1}`} className="h-72 w-full object-cover" />
                </div>
              ))
            ) : (
              <div className="flex h-72 items-center justify-center rounded-[1.5rem] bg-[rgba(157,60,31,0.08)] text-sm text-[var(--muted)]">
                No images available
              </div>
            )}
          </div>
        </Panel>

        <Panel>
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-[rgba(157,60,31,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
                {product.category}
              </span>
              <span className="text-sm text-[var(--muted)]">Status: {product.status}</span>
            </div>

            <div>
              <p className="text-sm text-[var(--muted)]">Price</p>
              <p className="mt-2 text-3xl font-semibold">{formatPrice(product)}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-[var(--muted)]">Base Price</p>
                <p className="mt-2 font-semibold">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(product.price?.basePrice || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Quantity</p>
                <p className="mt-2 font-semibold">{product.quantity ?? "N/A"}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-[var(--muted)]">Description</p>
              <p className="mt-2 leading-7">{product.description}</p>
            </div>

            <StatusMessage type="info">
              Reviews and booking flows are intentionally not implemented here because the backend review and booking APIs are currently unstable.
            </StatusMessage>
          </div>
        </Panel>
      </div>
    </div>
  );
}
