"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import PageHero from "@/components/PageHero";
import Panel from "@/components/Panel";
import StatusMessage from "@/components/StatusMessage";

import {
  getServiceById,
  getServiceSlots,
  createSlot,
  deleteSlot,
} from "@/services/service.service";

export default function SellerServiceDetailPage() {
  const { id } = useParams();

  const [service, setService] = useState(null);
  const [slots, setSlots] = useState([]);

  const [loading, setLoading] = useState(true);
  const [slotLoading, setSlotLoading] = useState(false);

  const [error, setError] = useState("");

  const [newSlot, setNewSlot] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });

  // ---------------- SERVICE ----------------
  const loadService = async () => {
    try {
      const res = await getServiceById(id);
      setService(res?.data ?? res);
    } catch (err) {
      setError("Failed to load service");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- SLOTS ----------------
  const loadSlots = async () => {
    try {
      const res = await getServiceSlots(id);

      const data =
        res?.data?.data ||
        res?.data ||
        res ||
        [];

      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
      setSlots([]);
    }
  };

  useEffect(() => {
    if (!id) return;
    loadService();
    loadSlots();
  }, [id]);

  // ---------------- CREATE SLOT ----------------
  const handleCreateSlot = async () => {
    if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) {
      alert("Please fill all fields");
      return;
    }

    try {
      setSlotLoading(true);

      await createSlot(id, newSlot);

      setNewSlot({
        date: "",
        startTime: "",
        endTime: "",
      });

      await loadSlots();
    } catch (err) {
      console.log(err);
    } finally {
      setSlotLoading(false);
    }
  };

  // ---------------- DELETE SLOT ----------------
  const handleDeleteSlot = async (slotId) => {
    try {
      await deleteSlot(slotId);
      loadSlots();
    } catch (err) {
      console.log(err);
    }
  };

  // ---------------- UI ----------------
  if (loading) return <p className="p-6">Loading...</p>;

  if (!service) {
    return <StatusMessage type="error">Service not found</StatusMessage>;
  }

  return (
    <div className="space-y-6 p-6">

      <PageHero
        eyebrow="Seller Panel"
        title={service.title}
        subtitle="Manage service & availability slots"
      />

      <div className="grid lg:grid-cols-2 gap-6">

        {/* SERVICE INFO */}
        <Panel>
          <h2 className="font-semibold mb-3">Service Info</h2>

          <p><b>Category:</b> {service.category}</p>
          <p><b>Status:</b> {service.status}</p>
          <p><b>Type:</b> {service.serviceType}</p>
        </Panel>

        {/* CREATE SLOT */}
        <Panel>
          <h2 className="font-semibold mb-3">Create Slot</h2>

          <div className="space-y-2">

            <input
              type="date"
              value={newSlot.date}
              onChange={(e) =>
                setNewSlot({ ...newSlot, date: e.target.value })
              }
              className="field"
            />

            <input
              type="time"
              value={newSlot.startTime}
              onChange={(e) =>
                setNewSlot({ ...newSlot, startTime: e.target.value })
              }
              className="field"
            />

            <input
              type="time"
              value={newSlot.endTime}
              onChange={(e) =>
                setNewSlot({ ...newSlot, endTime: e.target.value })
              }
              className="field"
            />

            <button
              onClick={handleCreateSlot}
              className="btn-primary w-full"
            >
              {slotLoading ? "Creating..." : "+ Add Slot"}
            </button>

          </div>
        </Panel>

      </div>

      {/* SLOT LIST */}
      <Panel>
        <h2 className="font-semibold mb-3">My Slots</h2>

        {slots.length === 0 ? (
          <p className="text-gray-500">No slots created</p>
        ) : (
          slots.map((slot) => (
            <div
              key={slot._id}
              className="flex justify-between border p-3 rounded mb-2"
            >
              <div>
                <p className="font-semibold">
                  {slot.date
                    ? new Date(slot.date).toDateString()
                    : "No date"}
                </p>

                <p className="text-sm text-gray-500">
                  {slot.timeSlots?.[0]?.startTime || "--:--"} -{" "}
                  {slot.timeSlots?.[0]?.endTime || "--:--"}
                </p>
              </div>

              <button
                onClick={() => handleDeleteSlot(slot._id)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          ))
        )}

      </Panel>

    </div>
  );
}