import { Suspense } from "react";
import type { Metadata } from "next";

import { ReviewGate } from "./ReviewGate";

type Props = PageProps<"/products/[slug]/review">;

export const metadata: Metadata = { title: "Rate This Product — Raina Scents" };

/** Dynamic segment — session/purchase checks stream inside a Suspense hole. */
export default function ReviewPage({ params }: Props) {
  return (
    <Suspense fallback={null}>
      <ReviewGate params={params} />
    </Suspense>
  );
}
