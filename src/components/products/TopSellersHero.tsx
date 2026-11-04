import Image from "next/image";

/** Static top-sellers hero — bold title block beside a framed product shot. */
export function TopSellersHero() {
  return (
    <section
      aria-labelledby="top-sellers-title"
      className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2"
    >
      <div>
        <h1
          id="top-sellers-title"
          className="text-6xl font-black tracking-tight text-[#1F253F] sm:text-8xl"
        >
          Top
          <br />
          Sellers
        </h1>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-[#1F253F]/60">
          The pieces our customers keep coming back for — signature scents,
          sculptural burners, and accents that turn a house into a sanctuary.
        </p>
      </div>
      <div className="relative mx-auto aspect-square w-full max-w-md">
        <span
          aria-hidden="true"
          className="absolute left-[4%] top-[14%] h-[72%] w-[22%] -rotate-[18deg] bg-[#b07d10] [clip-path:polygon(0_0,100%_10%,100%_90%,0_100%)]"
        />
        <span
          aria-hidden="true"
          className="absolute left-[16%] top-[4%] size-0 rotate-[200deg] border-y-[18px] border-l-[28px] border-y-transparent border-l-[#b07d10]"
        />
        <span
          aria-hidden="true"
          className="absolute right-[2%] top-[6%] h-[26%] w-[20%] rotate-[14deg] bg-[#b07d10] [clip-path:polygon(0_10%,100%_0,85%_100%,0_85%)]"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-[12%] right-0 h-[32%] w-[18%] rotate-[8deg] bg-[#b07d10] [clip-path:polygon(15%_0,100%_10%,85%_100%,0_90%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-[10%] rotate-[5deg] bg-[#fdf3dd] [clip-path:polygon(14%_0,100%_9%,86%_100%,0_91%)]"
        />
        <Image
          src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"
          alt="Ornate black incense burner with rising smoke"
          fill
          priority
          sizes="(min-width: 1024px) 33vw, 90vw"
          className="relative z-10 object-contain p-10"
        />
      </div>
    </section>
  );
}
