"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { uploadProductImage } from "../upload-image";
import type { ImageRow } from "./images-fieldset";

const box =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-[#1F253F] outline-none placeholder:text-cocoa/50 focus:border-gold";

interface Props {
  index: number;
  value: ImageRow;
  onChange: (row: ImageRow) => void;
  onRemove: () => void;
}

/** One image row — file picker uploads to Cloudinary, then preview + alt. */
export function ImageUploadRow({ index, value, onChange, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    const res = await uploadProductImage(file);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    if ("error" in res) setError(res.error);
    else onChange({ ...value, url: res.url });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        {value.url ? (
          <span className="relative block size-12 shrink-0 overflow-hidden rounded-lg bg-stone-100">
            <Image
              src={value.url}
              alt={value.alt || `Product image ${index + 1}`}
              fill
              sizes="48px"
              className="object-cover"
            />
          </span>
        ) : (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              aria-label={`Choose image ${index + 1}`}
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void upload(f);
              }}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-line px-3 py-2 text-xs font-medium text-cocoa hover:border-gold hover:text-[#1F253F] disabled:opacity-60"
            >
              <Icon name="plus" className="size-3.5" />
              {uploading ? "Uploading…" : "Choose image"}
            </button>
          </>
        )}
        <input
          value={value.alt}
          onChange={(e) => onChange({ ...value, alt: e.target.value })}
          placeholder="Alt text"
          aria-label={`Image ${index + 1} alt`}
          className={`${box} max-w-48`}
        />
        <button
          type="button"
          aria-label="Remove image"
          onClick={onRemove}
          className="shrink-0 rounded-lg p-2 text-cocoa/50 hover:bg-red-50 hover:text-red-600"
        >
          <Icon name="trash" className="size-4" />
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
