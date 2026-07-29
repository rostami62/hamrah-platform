"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { attachMedicalDocumentAction } from "@/lib/patient-files/medical-report-actions";

export function DocumentUpload({
  patientFileId,
  existingDocuments,
}: {
  patientFileId: string;
  existingDocuments: { id: string; file_name: string }[];
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<string[]>(existingDocuments.map((d) => d.file_name));
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const path = `${patientFileId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("medical-documents").upload(path, file);
      if (uploadError) throw uploadError;

      await attachMedicalDocumentAction(patientFileId, path, file.name);
      setUploaded((prev) => [...prev, file.name]);
    } catch {
      setError("بارگذاری فایل ناموفق بود؛ دوباره تلاش کنید.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="mt-3">
      <span className="text-xs font-medium text-primary-700">مدارک / آزمایش‌ها</span>
      {uploaded.length > 0 && (
        <ul className="mt-1 list-inside list-disc text-xs text-primary-600">
          {uploaded.map((name, i) => (
            <li key={`${name}-${i}`}>{name}</li>
          ))}
        </ul>
      )}
      <input
        ref={inputRef}
        type="file"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleUpload(file);
        }}
        className="mt-2 block w-full text-xs text-primary-700 file:ml-2 file:rounded-[var(--radius-control)] file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-700"
      />
      {uploading && <p className="mt-1 text-xs text-primary-500">در حال بارگذاری...</p>}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
