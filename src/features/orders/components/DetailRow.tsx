interface DetailRowProps {
  label: string;
  value: string;
}

/** Label/value line used inside order information sections. */
export function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="grid gap-1 py-2.5 sm:grid-cols-[10rem_1fr]">
      <dt className="text-sm text-cocoa/70">{label}:</dt>
      <dd className="text-sm text-[#1F253F]">{value}</dd>
    </div>
  );
}
