/** Pill button pair used across account forms. */
export function FormActions({
  pending,
  submitLabel = "Save changes",
  onCancel,
}: {
  pending: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}) {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <button
        type="reset"
        onClick={onCancel}
        className="rounded-full border border-line px-5 py-2 text-sm font-medium text-[#1F253F] transition-colors hover:bg-cream"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-cocoa disabled:opacity-60"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </div>
  );
}
