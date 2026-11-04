import type { HeroTag } from "../types";

/** Floating pill pinned to a slide; an empty label renders a bare hotspot dot. */
export function HeroTagPill({ tag }: { tag: HeroTag }) {
  const style = { left: `${tag.x}%`, top: `${tag.y}%` };
  if (!tag.label) {
    return (
      <span
        style={style}
        className="absolute hidden size-2.5 rounded-full bg-gold-soft shadow-[0_0_0_4px_rgba(255,255,255,0.25)] md:block"
      />
    );
  }
  return (
    <span
      style={style}
      className="absolute hidden -translate-y-1/2 items-center gap-2 md:flex"
    >
      <span className="rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md">
        {tag.value && <b className="mr-1.5 font-bold text-gold-soft">{tag.value}</b>}
        {tag.label}
      </span>
      <span className="size-2 rounded-full bg-white/70" />
    </span>
  );
}
