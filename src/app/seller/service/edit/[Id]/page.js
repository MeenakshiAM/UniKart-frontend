"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import PageCard from "@/components/PageCard";
import StatusMessage from "@/components/StatusMessage";

import {
  getServiceById,
  updateService,
} from "@/services/service.service";

export default function EditServicePage() {
  const router = useRouter();
  const { id } = useParams();

  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      const res = await getServiceById(id);
      setForm(res?.data || {});
    };

    load();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const fd = new FormData();

      Object.entries(form).forEach(([k, v]) => {
        fd.append(k, v);
      });

      await updateService(id, fd);

      setMsg("Updated successfully 🚀");
      setTimeout(() => router.push("/seller/services"), 1000);
    } catch (err) {
      console.log(err);
      setMsg("Update failed");
    }
  };

  if (!form) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">

      <PageCard title="Edit Service">

        <div className="space-y-3">

          <input
            name="title"
            value={form.title || ""}
            onChange={handleChange}
            className="border p-2 w-full"
          />

          <input
            name="price"
            value={form.price || ""}
            onChange={handleChange}
            className="border p-2 w-full"
          />

          <textarea
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            className="border p-2 w-full"
          />

          <button
            onClick={handleUpdate}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          >
            Update Service
          </button>

        </div>

        {msg && <StatusMessage>{msg}</StatusMessage>}

      </PageCard>
    </div>
  );
}