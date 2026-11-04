"use client";

import { Icon } from "@/components/ui/Icon";
import { ImageUploadRow } from "./image-upload-row";

export interface ImageRow {
  url: string;
  alt: string;
}

/** Dynamic list of product images — each row uploads to Cloudinary. */
export function ImagesFieldset({
  images,
  onChange,
}: {
  images: ImageRow[];
  onChange: (rows: ImageRow[]) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-[#1F253F]">Images</legend>
      <p className="mt-1 text-xs text-cocoa/60">
        Upload product photos — they are stored on Cloudinary.
      </p>
      <div className="mt-2 space-y-2">
        {images.map((img, i) => (
          <ImageUploadRow
            key={i}
            index={i}
            value={img}
            onChange={(row) =>
              onChange(images.map((r, j) => (j === i ? row : r)))
            }
            onRemove={() => onChange(images.filter((_, j) => j !== i))}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...images, { url: "", alt: "" }])}
        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gold hover:text-cocoa"
      >
        <Icon name="plus" className="size-3.5" /> Add image
      </button>
    </fieldset>
  );
}
