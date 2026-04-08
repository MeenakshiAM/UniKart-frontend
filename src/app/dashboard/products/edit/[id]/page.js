"use client";

import { useEffect, useState } from "react";
import DashboardNav from "@/components/DashboardNav";
import EmptyState from "@/components/EmptyState";
import PageHero from "@/components/PageHero";
import ProductForm from "@/components/ProductForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import StatusMessage from "@/components/StatusMessage";
import { getDraftById, getProductById, updateProduct } from "@/services/product.service";

function mapProductToForm(product) {
  return {
    title: product?.title || "",
    description: product?.description || "",
    category: product?.category || "ELECTRONICS",
    subCategory: product?.subCategory || "",
    basePrice: product?.price?.basePrice ? String(product.price.basePrice) : "",
    quantity: product?.quantity != null ? String(product.quantity) : "",
    isDraft: product?.status === "DRAFT",
  };
}

export default function EditProductPage({ params }) {
  const [form, setForm] = useState(null);
  const [existingProduct, setExistingProduct] = useState(null);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      setLoading(true);

      try {
        let data;

        try {
          data = await getDraftById(params.id);
        } catch (draftError) {
          data = await getProductById(params.id);
        }

        const product = data?.product;

        if (isMounted) {
          setExistingProduct(product || null);
          setForm(mapProductToForm(product));
          setStatus({
            type: "info",
            message:
              "Editing uses the stable public product endpoint or the draft endpoint when available. Rejected and hidden products may not be editable because the backend does not provide a direct fetch-by-id route for them.",
          });
        }
      } catch (error) {
        if (isMounted) {
          setStatus({
            type: "error",
            message: error.message || "Unable to load product for editing.",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.description.trim() || !form.basePrice) {
      setStatus({
        type: "error",
        message: "Title, description, and base price are required.",
      });
      return;
    }

    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("description", form.description);
    payload.append("category", form.category);
    payload.append("subCategory", form.subCategory);
    payload.append("basePrice", form.basePrice);
    payload.append("price.basePrice", form.basePrice);
    payload.append("price[basePrice]", form.basePrice);
    payload.append("quantity", form.quantity || "0");
    payload.append("isDraft", String(form.isDraft));

    files.forEach((file) => {
      payload.append("images", file);
    });

    setSubmitting(true);

    try {
      const data = await updateProduct(params.id, payload);
      setStatus({
        type: "success",
        message: data?.message || "Product updated successfully.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to update product.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <PageHero
        eyebrow="Seller Dashboard"
        title="Edit product"
        subtitle="This editor sends `basePrice` as a flat field because nested `price.basePrice` is unreliable in the current backend."
      />

      <DashboardNav />

      <div className="space-y-6">
        <StatusMessage type={status.type}>{status.message}</StatusMessage>

        {loading ? (
          <div className="card-surface rounded-[2rem] p-8 text-sm text-[var(--muted)]">Loading product...</div>
        ) : !form || !existingProduct ? (
          <EmptyState
            title="Product not editable"
            description="The backend could not provide this product through the available edit-safe endpoints."
          />
        ) : (
          <ProductForm
            form={form}
            onChange={handleChange}
            onFilesChange={(event) => setFiles(Array.from(event.target.files || []))}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel="Save Changes"
            fileNote="Leave images empty to keep existing images. Upload new files only if you want to replace them."
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
