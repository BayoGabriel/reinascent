/** Client-side helper: POST a file to the admin upload endpoint, which
 *  stores it on Cloudinary and returns the hosted URL. */
export async function uploadProductImage(
  file: File,
): Promise<{ url: string } | { error: string }> {
  try {
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/admin/uploads", {
      method: "POST",
      body,
    });
    const json = (await res.json()) as {
      data?: { url: string };
      error?: { message?: string };
    };
    if (!res.ok || !json.data?.url) {
      return { error: json.error?.message ?? "Upload failed — try again." };
    }
    return { url: json.data.url };
  } catch {
    return { error: "Upload failed — check your connection." };
  }
}
