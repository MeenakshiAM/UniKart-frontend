"use client";

import { useState } from "react";
import DashboardNav from "@/components/DashboardNav";
import PageHero from "@/components/PageHero";
import ProductForm, { initialProductForm } from "@/components/ProductForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import StatusMessage from "@/components/StatusMessage";
import { createProduct } from "@/services/product.service";

export default function CreateProductPage() {
  const [form, setForm] = useState(initialProductForm);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "info", message: "" });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "info", message: "" });

    if (!form.title.trim() || !form.description.trim() || !form.basePrice || files.length === 0) {
      setStatus({
        type: "error",
        message: "Title, description, base price, and at least one image are required.",
      });
      return;
    }

    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("description", form.description);
    payload.append("type", "PRODUCT");
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
      const data = await createProduct(payload);
      setStatus({
        type: "success",
        message: data?.message || "Product created successfully.",
      });
      setForm(initialProductForm);
      setFiles([]);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to create product.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <PageHero
        eyebrow="Seller Dashboard"
        title="Create product"
        subtitle="This form sends multipart data with the exact backend field names. The backend currently leaves auth disabled on create, but this UI still assumes seller usage."
      />

      <DashboardNav />

      <div className="space-y-6">
        <StatusMessage type={status.type}>{status.message}</StatusMessage>

        <ProductForm
          form={form}
          onChange={handleChange}
          onFilesChange={(event) => setFiles(Array.from(event.target.files || []))}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Create Product"
          helper="The frontend sends `basePrice` as a flat field to match the backend workaround you requested."
        />
      </div>
    </ProtectedRoute>
  );
}
