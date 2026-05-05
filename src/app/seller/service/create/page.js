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
    serviceType: "",
    city: "",
  });

  const [images, setImages] = useState([]);
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

    Object.entries(form).forEach(([key, value]) => {
      if (key !== "price") {
        fd.append(key, value);
      }
    });

    // FIX: pricing structure for backend
    fd.append("pricing[basePrice]", form.price);
    fd.append("pricing[pricingType]", "fixed");

    // default serviceType
    if (!form.serviceType) {
      fd.append("serviceType", "in_person");
    }

    // images
    images.forEach((file) => {
      fd.append("images", file);
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

          {/* TITLE */}
          <input
            name="title"
            placeholder="Service Title"
            className="border p-2 w-full"
            onChange={handleChange}
          />

          {/* DESCRIPTION */}
          <textarea
            name="description"
            placeholder="Description"
            className="border p-2 w-full"
            onChange={handleChange}
          />

          {/* CATEGORY */}
          <select
            name="category"
            className="border p-2 w-full"
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            <option value="tuition">Tuition</option>
            <option value="saree_draping">Saree Draping</option>
            <option value="mehandi">Mehandi</option>
            <option value="hairstyling">Hairstyling</option>
            <option value="threading_plucking">Threading / Plucking</option>
            <option value="designing">Designing</option>
            <option value="freelancing">Freelancing</option>
            <option value="photography">Photography</option>
            <option value="event_planning">Event Planning</option>
            <option value="online_classes">Online Classes</option>
            <option value="consulting">Consulting</option>
            <option value="other">Other</option>
          </select>

          {/* SERVICE TYPE */}
          <select
            name="serviceType"
            className="border p-2 w-full"
            onChange={handleChange}
          >
            <option value="">Select Service Type</option>
            <option value="in_person">In Person</option>
            <option value="online">Online</option>
            <option value="both">Both</option>
          </select>

          {/* CITY */}
          <input
            name="city"
            placeholder="City"
            className="border p-2 w-full"
            onChange={handleChange}
          />

          {/* PRICE */}
          <input
            name="price"
            type="number"
            placeholder="Price"
            className="border p-2 w-full"
            onChange={handleChange}
          />

          {/* IMAGES */}
          <input
            type="file"
            multiple
            accept="image/*"
            className="border p-2 w-full"
            onChange={(e) => setImages([...e.target.files])}
          />

          {/* SUBMIT */}
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