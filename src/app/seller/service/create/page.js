"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageCard from "@/components/PageCard";
import StatusMessage from "@/components/StatusMessage";

import { createService } from "@/services/service.service";

export default function CreateServicePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    city: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMsg("");

    try {
      const fd = new FormData();

      Object.entries(form).forEach(([k, v]) => {
        fd.append(k, v);
      });

      await createService(fd);

      setMsg("Service created successfully 🚀");
      setTimeout(() => router.push("/seller/services"), 1000);
    } catch (err) {
      console.log(err);
      setMsg("Failed to create service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">

      <PageCard title="Create Service">

        <div className="space-y-3">

          <input
            name="title"
            placeholder="Service Title"
            className="border p-2 w-full"
            onChange={handleChange}
          />

          <input
            name="category"
            placeholder="Category"
            className="border p-2 w-full"
            onChange={handleChange}
          />

          <input
            name="city"
            placeholder="City"
            className="border p-2 w-full"
            onChange={handleChange}
          />

          <input
            name="price"
            type="number"
            placeholder="Price"
            className="border p-2 w-full"
            onChange={handleChange}
          />

          <textarea
            name="description"
            placeholder="Description"
            className="border p-2 w-full"
            onChange={handleChange}
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded w-full"
          >
            {loading ? "Creating..." : "Create Service"}
          </button>

        </div>

        {msg && <StatusMessage>{msg}</StatusMessage>}

      </PageCard>
    </div>
  );
}