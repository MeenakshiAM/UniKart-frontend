"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import PageCard from "@/components/PageCard";
import StatusMessage from "@/components/StatusMessage";

import {
  getServiceSlots,
  createSlot,
  updateSlot,
  deleteSlot,
} from "@/services/service.service";

// ---------------- FORMAT DATE ----------------
const formatDate = (dateStr) => {
  if (!dateStr) return "-";

  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function SlotManagerPage() {
  const { serviceId } = useParams();

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });

  // ================= LOAD =================
  const loadSlots = async () => {
    setLoading(true);

    try {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const res = await getServiceSlots(serviceId, {
        startDate: today.toISOString().split("T")[0],
        endDate: nextWeek.toISOString().split("T")[0],
      });

      const data =
        res?.data?.data ||
        res?.data ||
        res ||
        [];

      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, [serviceId]);

  // ================= CREATE =================
  const handleCreate = async () => {
    if (!form.date || !form.startTime || !form.endTime) return;

    try {
      await createSlot(serviceId, form);
      setForm({ date: "", startTime: "", endTime: "" });
      loadSlots();
    } catch (err) {
      console.log(err);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (slotId, status) => {
    if (status === "booked") {
      alert("Booked slot cannot be deleted");
      return;
    }

    try {
      await deleteSlot(slotId);
      loadSlots();
    } catch (err) {
      console.log(err);
    }
  };

  // ================= EDIT (basic placeholder) =================
  const handleEdit = async (slot) => {
    const newStart = prompt("New start time", slot.timeSlots?.[0]?.startTime);
    const newEnd = prompt("New end time", slot.timeSlots?.[0]?.endTime);

    if (!newStart || !newEnd) return;

    try {
      await updateSlot(slot._id, {
        startTime: newStart,
        endTime: newEnd,
      });

      loadSlots();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="p-6 space-y-6">

      <PageCard title="Slot Manager" />

      {/* CREATE SLOT */}
      <div className="bg-white p-4 rounded-xl shadow space-y-3">

        <h2 className="font-semibold">Create Slot</h2>

        <input
          type="date"
          value={form.date}
          onChange={(e) =>
            setForm({ ...form, date: e.target.value })
          }
          className="border p-2 w-full"
        />

        <input
          type="time"
          value={form.startTime}
          onChange={(e) =>
            setForm({ ...form, startTime: e.target.value })
          }
          className="border p-2 w-full"
        />

        <input
          type="time"
          value={form.endTime}
          onChange={(e) =>
            setForm({ ...form, endTime: e.target.value })
          }
          className="border p-2 w-full"
        />

        <button
          onClick={handleCreate}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          + Add Slot
        </button>

      </div>

      {/* SLOT LIST */}
      <div className="grid gap-4">

        {loading ? (
          <p>Loading slots...</p>
        ) : slots.length === 0 ? (
          <StatusMessage type="info">
            No slots created yet
          </StatusMessage>
        ) : (
          slots.map((slot) => {

            const time = slot.timeSlots?.[0] || {};
            const status = time.status || "available";

            return (
              <div
                key={slot._id}
                className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
              >

                {/* LEFT SIDE */}
                <div>
                  <p className="font-semibold">
                    📅 {formatDate(slot.date)}
                  </p>

                  <p className="text-sm text-gray-600">
                    ⏰ {time.startTime || "--:--"} - {time.endTime || "--:--"}
                  </p>

                  <span
                    className={`text-xs px-2 py-1 rounded mt-1 inline-block ${
                      status === "booked"
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {status.toUpperCase()}
                  </span>
                </div>

                {/* RIGHT SIDE ACTIONS */}
                <div className="flex gap-2">

                  <button
                    onClick={() => handleEdit(slot)}
                    disabled={status === "booked"}
                    className={`px-3 py-1 rounded text-sm ${
                      status === "booked"
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(slot._id, status)}
                    disabled={status === "booked"}
                    className={`px-3 py-1 rounded text-sm ${
                      status === "booked"
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    Delete
                  </button>

                </div>

              </div>
            );
          })
        )}

      </div>

    </div>
  );
}