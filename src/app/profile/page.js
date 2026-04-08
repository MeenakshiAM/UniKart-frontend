"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageCard from "@/components/PageCard";
import StatusMessage from "@/components/StatusMessage";
import { uploadProfileImage } from "@/services/auth.service";
import { getStoredUser, updateStoredUser } from "@/utils/auth";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);
    setStatus({ type: "info", message: "" });

    try {
      const data = await uploadProfileImage(formData);
      const profileImage = data?.profileImage || "";
      updateStoredUser({ profileImage });
      setUser((current) => (current ? { ...current, profileImage } : current));
      setStatus({
        type: "success",
        message: data?.message || "Profile image updated successfully.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Profile image upload failed.",
      });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <ProtectedRoute>
      <PageCard
        title="Your profile"
        subtitle="This page shows the user returned by login and uploads profile images through the exact `image` form-data field required by the backend."
      >
        <div className="space-y-6">
          <StatusMessage type={status.type}>{status.message}</StatusMessage>

          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <div className="rounded-[2rem] border border-[rgba(114,75,43,0.12)] bg-white/70 p-5">
              <div className="relative mx-auto h-56 w-full overflow-hidden rounded-[1.5rem] bg-[rgba(157,60,31,0.08)]">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name || "Profile image"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
                    No profile image yet
                  </div>
                )}
              </div>

              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-medium">Upload profile image</span>
                <input type="file" accept="image/*" className="field" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-[rgba(114,75,43,0.12)] bg-white/70 p-5">
                <p className="text-sm text-[var(--muted)]">User ID</p>
                <p className="mt-2 break-all font-semibold">{user?.id || "Unavailable"}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[rgba(114,75,43,0.12)] bg-white/70 p-5">
                <p className="text-sm text-[var(--muted)]">Role</p>
                <p className="mt-2 font-semibold">{user?.role || "Unavailable"}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[rgba(114,75,43,0.12)] bg-white/70 p-5">
                <p className="text-sm text-[var(--muted)]">Name</p>
                <p className="mt-2 font-semibold">{user?.name || "Unavailable"}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[rgba(114,75,43,0.12)] bg-white/70 p-5">
                <p className="text-sm text-[var(--muted)]">Email</p>
                <p className="mt-2 break-all font-semibold">{user?.email || "Unavailable"}</p>
              </div>
            </div>
          </div>
        </div>
      </PageCard>
    </ProtectedRoute>
  );
}
