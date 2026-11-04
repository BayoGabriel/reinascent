import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export interface WhyCardData {
  imageUrl: string;
  alt: string;
  label: string;
  href: string;
}

interface WhyCardProps {
  card: WhyCardData;
  className?: string;
  sizes: string;
}

/** Single bento tile — the whole card is the click target (label + arrow cue). */
export function WhyCard({ card, className, sizes }: WhyCardProps) {
  return (
    <Link
      href={card.href}
      className={cn(
        "group relative block min-h-56 overflow-hidden rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-gold",
        className,
      )}
    >
      <Image
        src={card.imageUrl}
        alt={card.alt}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
      <span className="absolute bottom-5 left-5 text-sm font-medium text-white drop-shadow">
        {card.label}
      </span>
      <span className="absolute bottom-5 right-5 grid size-9 place-items-center rounded-full bg-white/95 text-[#1F253F] shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
        <Icon name="arrowUpRight" className="size-4" />
      </span>
    </Link>
  );
}
