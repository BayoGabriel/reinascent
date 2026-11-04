import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { getProductBySlug } from "@/features/products/service";
import { getPromoBanner } from "../service";

const KEY = "home.flash_sale";

/** Flash-sale promo banner — copy, discount, and featured product are
 *  managed via the `home.flash_sale` promo_banner content section. */
export async function FlashSaleBanner() {
  const banner = await getPromoBanner(KEY);
  const product = banner.productSlug
    ? await getProductBySlug(banner.productSlug)
    : null;
  const imageUrl = product?.images[0]?.url || banner.imageUrl;
  const alt = product?.images[0]?.alt || banner.alt;
  return (
    <section aria-label={banner.eyebrow} className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6">
      <div className="grid items-center gap-8 rounded-[2rem] bg-[#fdf6e0] px-6 py-10 sm:px-10 lg:grid-cols-[1.2fr_auto_1fr] lg:gap-4">
        <div className="max-w-sm">
          <h2 className="w-fit font-joti text-4xl tracking-tight text-[#1F253F]">
            {banner.eyebrow}
          </h2>
          <span className="mt-1 block h-1.5 w-40 border-b-4 border-double border-ink" aria-hidden="true" />
          <div className="mt-5 space-y-1 font-jost text-[24.62px] font-normal leading-[1.72] text-[#1F253F]/70">
            {banner.lines.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <Link
            href={banner.cta.href}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-yellow-300 py-2 pl-5 pr-1.5 text-xs font-semibold text-[#1F253F] transition-colors hover:bg-yellow-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            {banner.cta.label}
            <span className="grid size-6 place-items-center rounded-full border border-ink/70">
              <Icon name="arrowRight" className="size-3" />
            </span>
          </Link>
        </div>
        <p className="whitespace-pre-line lg:w-[290px] text-center font-kavoon text-6xl leading-[1.1] tracking-tight text-orange-500 sm:text-7xl lg:text-[122.53px]">
          {banner.discountText}
        </p>
        {imageUrl && (
          <div className="relative mx-auto w-fit">
            <span className="absolute -top-2 left-0 z-10 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#1F253F] shadow">
              {product?.compareAtPrice ? (
                <>
                  <s className="text-cocoa/60">${product.compareAtPrice.toLocaleString()}</s>
                  {" / "}
                </>
              ) : null}
              ${(product?.price ?? 0).toLocaleString()}
            </span>
            <span className="relative block size-48 overflow-hidden rounded-full bg-white/70 sm:size-56 lg:size-64">
              <Image src={imageUrl} alt={alt} fill sizes="256px" className="object-cover" />
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
