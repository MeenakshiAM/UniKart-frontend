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

export default function SlotManagerPage() {
  const { serviceId } = useParams();

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });

  // 🧠 TEMP FIX (replace later with JWT)
  const providerId =
    typeof window !== "undefined"
      ? localStorage.getItem("userId")
      : null;

  // ================= LOAD =================
  const loadSlots = async () => {
    setLoading(true);

    try {
      const res = await getServiceSlots(serviceId);

      console.log("🔥 RAW RESPONSE:", res);

      const data =
        res?.slots || res?.data?.slots || res?.data || res;

      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (serviceId) loadSlots();
  }, [serviceId]);

  // ================= CREATE =================
 const handleCreate = async () => {
  console.log("🔥 FORM STATE:", form);

  const payload = {
    date: form.date,
    startTime: form.startTime,
    endTime: form.endTime,
  };

  console.log("🚀 FINAL PAYLOAD:", payload);

  try {
    await createSlot(serviceId, payload);

    setForm({ date: "", startTime: "", endTime: "" });
    loadSlots();
  } catch (err) {
    console.log("❌ Create failed:", err);
  }
};

  // ================= DELETE =================
  const handleDelete = async (slotId, time) => {
    if (time?.status === "booked") {
      alert("Booked slot cannot be deleted");
      return;
    }

    try {
      await deleteSlot(slotId, providerId);
      loadSlots();
    } catch (err) {
      console.log(err);
    }
  };

  // ================= EDIT =================
  const handleEdit = async (slot, idx) => {
  const time = slot.timeSlots?.[idx];

  const newStart = prompt("New start time", time?.startTime);
  const newEnd = prompt("New end time", time?.endTime);

  if (!newStart || !newEnd) return;

  const updatedSlots = [...slot.timeSlots];

  updatedSlots[idx] = {
    ...updatedSlots[idx],
    startTime: newStart,
    endTime: newEnd,
  };

  const payload = {
    timeSlots: updatedSlots,
  };

  console.log("🚀 UPDATE PAYLOAD:", payload);

  try {
    await updateSlot(slot._id, payload); // 👈 IMPORTANT CHANGE
    loadSlots();
  } catch (err) {
    console.log("❌ Update failed:", err);
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
          slots.map((slot) => (
            <div key={slot._id} className="bg-white p-4 rounded-xl shadow">

              <p className="font-semibold">
                📅 {new Date(slot.date).toDateString()}
              </p>

              <div className="mt-2 space-y-2">

                {Array.isArray(slot.timeSlots)
                  ? slot.timeSlots.map((time, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center border p-2 rounded"
                      >
                        <p className="text-sm">
                          ⏰ {time.startTime} - {time.endTime}
                        </p>

                        <div className="flex gap-2">

                          <button
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                            onClick={() => handleEdit(slot, idx)}
                          >
                            Edit
                          </button>

                          <button
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                            onClick={() => handleDelete(slot._id, time)}
                          >
                            Delete
                          </button>

                        </div>
                      </div>
                    ))
                  : null}

              </div>

            </div>
          ))
        )}

      </div>

    </div>
  );
}