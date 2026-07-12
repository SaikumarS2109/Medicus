"use client";

import { useSession } from "next-auth/react";
import { useState, useRef } from "react";

export default function UploadProfilePicture({
  onSuccess,
}: {
  onSuccess?: (url: string) => void;
}) {
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  if (!session) {
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const file = fileInputRef.current?.files?.[0];
      if (!file) {
        setError("No file selected");
        return;
      }

      // Upload to Vercel Blob
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Upload failed");
      }

      const { url } = await uploadRes.json();

      // Update patient profile with picture URL
      if (session.user.role === "patient") {
        const patientRes = await fetch("/api/patients", { method: "GET" });
        const patientData = await patientRes.json();

        if (patientData.length > 0) {
          const patientId = patientData[0].id;

          const updateRes = await fetch(`/api/patients/${patientId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profilePictureUrl: url }),
          });

          if (!updateRes.ok) {
            throw new Error("Failed to update profile");
          }

          setPreview(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          onSuccess?.(url);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {preview && (
        <div className="mb-4">
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 rounded-lg object-cover"
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-2">
            Choose Profile Picture
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required
            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {loading ? "Uploading..." : "Upload Picture"}
        </button>
      </form>
    </div>
  );
}
