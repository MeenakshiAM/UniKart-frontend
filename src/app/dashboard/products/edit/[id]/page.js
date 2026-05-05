"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNav from "@/components/DashboardNav";
import EmptyState from "@/components/EmptyState";
import PageHero from "@/components/PageHero";
import ProductForm from "@/components/ProductForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import StatusMessage from "@/components/StatusMessage";

import {
  getDraftById,
  getProductById,
  updateProduct,
} from "@/services/product.service";

function mapProductToForm(product) {
  return {
    title: product?.title || "",
    description: product?.description || "",
    category: product?.category || "ELECTRONICS",
    subCategory: product?.subCategory || "",
    basePrice: product?.price?.basePrice
      ? String(product.price.basePrice)
      : "",
    quantity: product?.quantity != null ? String(product.quantity) : "",
    isDraft: product?.status === "DRAFT",
  };
}

export default function EditProductPage({ params }) {
  const router = useRouter();

  const [form, setForm] = useState(null);
  const [existingProduct, setExistingProduct] = useState(null);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);

      try {
        let data;

        try {
          data = await getDraftById(params.id);
        } catch {
          data = await getProductById(params.id);
        }

        const product = data?.product;

        setExistingProduct(product);
        setForm(mapProductToForm(product));
      } catch (error) {
        setStatus({
          type: "error",
          message: error.message || "Unable to load product",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("description", form.description);
    payload.append("category", form.category);
    payload.append("subCategory", form.subCategory);
    payload.append("basePrice", form.basePrice);
    payload.append("quantity", form.quantity || "0");
    payload.append("isDraft", String(form.isDraft));

    files.forEach((f) => payload.append("images", f));

    setSubmitting(true);

    try {
      const res = await updateProduct(params.id, payload);

      setStatus({
        type: "success",
        message: "Product updated successfully 🎉",
      });

      // 🔥 IMPORTANT: redirect to product page after update
      setTimeout(() => {
        router.push(`/products/${res?.product?._id || params.id}`);
      }, 800);
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Update failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <PageHero
        eyebrow="Seller Dashboard"
        title="Edit Product"
        subtitle="Update your product details safely"
      />

      <DashboardNav />

      <div className="space-y-6">
        <StatusMessage type={status.type}>
          {status.message}
        </StatusMessage>

        {loading ? (
          <div className="p-6 text-gray-500">Loading...</div>
        ) : !form ? (
          <EmptyState
            title="Product not found"
            description="Cannot load this product"
          />
        ) : (
          <ProductForm
            form={form}
            onChange={handleChange}
            onFilesChange={(e) =>
              setFiles(Array.from(e.target.files || []))
            }
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel="Save Changes"
          />
        )}
      </div>
    </ProtectedRoute>
  );
}