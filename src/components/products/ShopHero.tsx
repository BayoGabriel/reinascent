import Image from "next/image";

/** Static shop hero — full-bleed photo band with the "Shop" wordmark. */
export function ShopHero() {
  return (
    <section
      aria-labelledby="shop-title"
      className="relative isolate h-[380px] overflow-hidden sm:h-[520px]"
    >
      <Image
        src="/assets/images/hero3.svg"
        alt="Diffuser bottle and reeds on a stone surface"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <h1
        id="shop-title"
        className="absolute inset-0 grid place-items-center text-[clamp(6rem,20vw,18rem)] font-medium leading-none tracking-tight text-white"
      >
        Shop
      </h1>
    </section>
  );
}
