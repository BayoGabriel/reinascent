import { Icon } from "@/components/ui/Icon";
import { WhyCard, type WhyCardData } from "./WhyCard";

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

/** Placeholder imagery — swap `imageUrl` values when real photography lands. */
const CARDS: WhyCardData[] = [
  {
    imageUrl: img("photo-1616486338812-3dadae4b4ace"),
    alt: "Styled luxury living room with warm lighting",
    label: "Handmade Quality",
    href: "/products",
  },
  {
    imageUrl: img("photo-1586023492125-27b2c045efd7"),
    alt: "Sculptural glass decor pieces on a shelf",
    label: "Natural Materials",
    href: "/products",
  },
  {
    imageUrl: img("photo-1618220179428-22790b461013"),
    alt: "Elegant interior detail with textured finishes",
    label: "Timeless Design",
    href: "/products",
  },
  {
    imageUrl: img("photo-1600210492486-724fe5c67fb0"),
    alt: "Curated tableware arranged on a dining table",
    label: "Curated Collections",
    href: "/products",
  },
];

/** Static "Why choose us" bento section beneath the homepage hero. */
export function WhyChooseUs() {
  const [lead, topA, topB, wide] = CARDS;
  return (
    <section
      aria-labelledby="why-choose-us"
      className="mx-auto w-full max-w-7xl px-4 py-20 font-instrument sm:px-6"
    >
      <div className="mb-10 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#34D3FF] px-3 py-1 font-instrument text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
            <Icon name="sparkles" className="size-3" />
            Why choose us
          </span>
          <h2
            id="why-choose-us"
            className="mt-4 font-serif text-4xl font-medium leading-[1.05] tracking-tight text-[#1F253F] sm:text-5xl"
          >
            Crafted for comfort,
            <br />
            designed for serenity
          </h2>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-[#1F253F]/60 lg:justify-self-end">
          Every piece in our collection is chosen to bring calm and character
          into your home — thoughtfully sourced, meticulously finished, and
          made to be lived with for years.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[2fr_3fr]">
        <WhyCard
          card={lead}
          sizes="(min-width: 1024px) 32vw, 100vw"
          className="min-h-72 lg:min-h-0"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <WhyCard card={topA} sizes="(min-width: 1024px) 20vw, 50vw" />
          <WhyCard card={topB} sizes="(min-width: 1024px) 20vw, 50vw" />
          <WhyCard
            card={wide}
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="sm:col-span-2 lg:min-h-60"
          />
        </div>
      </div>
    </section>
  );
}
