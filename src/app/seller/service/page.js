"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import PageCard from "@/components/PageCard";
import StatusMessage from "@/components/StatusMessage";

import {
  getMyActiveServices,
  getMyPendingServices,
  getMyRejectedServices,
  deleteService,
} from "@/services/service.service";

export default function SellerServicePage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("ACTIVE");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState({
    type: "",
    message: "",
  });

  // ---------------- FETCH ----------------
  const fetchServices = async (tab) => {
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      let res;

      switch (tab) {
        case "ACTIVE":
          res = await getMyActiveServices();
          break;

        case "PENDING":
          res = await getMyPendingServices();
          break;

        case "REJECTED":
          res = await getMyRejectedServices();
          break;

        default:
          res = await getMyActiveServices();
      }

      console.log("🔥 RAW RESPONSE:", res);

      const list =
        res?.data?.data ||
        res?.data ||
        res ||
        [];

      setServices(Array.isArray(list) ? list : []);

      if (!list.length) {
        setStatus({
          type: "info",
          message: "No services found in this section",
        });
      }
    } catch (err) {
      console.log(err);

      setServices([]);
      setStatus({
        type: "error",
        message: err.message || "Failed to load services",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices(activeTab);
  }, [activeTab]);

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
    if (!confirm("Delete this service?")) return;

    try {
      await deleteService(id);
      fetchServices(activeTab);
    } catch (err) {
      console.log(err);
    }
  };

  // ---------------- TAB STYLE ----------------
  const tabClass = (tab) =>
    `text-left px-2 py-1 rounded ${
      activeTab === tab
        ? "bg-black text-white"
        : "hover:bg-gray-100"
    }`;

  // ---------------- UI ----------------
  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r p-5 space-y-4">

        <h2 className="text-xl font-bold text-black">
          Services Panel
        </h2>

        <nav className="flex flex-col gap-3 text-sm">

          <button className={tabClass("ACTIVE")} onClick={() => setActiveTab("ACTIVE")}>
            Active Services
          </button>

          <button className={tabClass("PENDING")} onClick={() => setActiveTab("PENDING")}>
            Pending
          </button>

          <button className={tabClass("REJECTED")} onClick={() => setActiveTab("REJECTED")}>
            Rejected
          </button>

          <hr />

          <button
            onClick={() => router.push("/seller/service/create")}
            className="text-green-600 font-bold text-left"
          >
            ➕ Create Service
          </button>

        </nav>

      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6 space-y-6">

        <PageCard title="Seller Service Panel" />

        <StatusMessage type={status.type}>
          {status.message}
        </StatusMessage>

        <PageCard title={`${activeTab} Services`}>

          {loading ? (
            <p className="text-sm text-gray-500">Loading services...</p>
          ) : services.length === 0 ? (
            <StatusMessage type="info">
              No services found in this section
            </StatusMessage>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {services.map((s) => (
                <div
                  key={s._id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-4 flex flex-col"
                >

                  {/* IMAGE SAFE */}
                  <img
                    src={
                      s.images?.[0]?.url ||
                      s.images?.[0] ||
                      "/placeholder.png"
                    }
                    className="w-full h-48 object-cover rounded-xl"
                  />

                  {/* INFO */}
                  <div className="mt-4 flex-1">

                    <h2 className="font-semibold text-lg">
                      {s.title}
                    </h2>

                    <p className="text-xs text-gray-500 mt-1">
                      {s.category}
                    </p>

                    <p className="font-bold text-xl mt-2">
                      ₹{s?.pricing?.basePrice}
                    </p>

                    <p className="text-sm mt-1 text-blue-600">
                      {s.status}
                    </p>

                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2 mt-4">

                    <button
                      onClick={() =>
                        router.push(`/seller/service/edit/${s._id}`)
                      }
                      className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(s._id)}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm"
                    >
                      Delete
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}

        </PageCard>

      </main>

    </div>
  );
}