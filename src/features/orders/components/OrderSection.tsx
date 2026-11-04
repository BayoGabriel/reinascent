import type { ReactNode } from "react";

interface OrderSectionProps {
  title: string;
  children: ReactNode;
}

/** Titled block separated by a rule — the order page's visual rhythm. */
export function OrderSection({ title, children }: OrderSectionProps) {
  return (
    <section className="border-t border-line pt-7">
      <h2 className="mb-3 text-base font-semibold text-[#1F253F]">{title}</h2>
      <dl>{children}</dl>
    </section>
  );
}
