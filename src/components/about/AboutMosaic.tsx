import Image, { type StaticImageData } from "next/image";
import type { AboutTile, AboutTileTone } from "@/features/content-management/types";
import perspImage from "@/assets/images/persp.png";
import missionImage from "@/assets/images/mission.png";
import visionImage from "@/assets/images/vision.png";
import { cn } from "@/lib/utils";

const TONES: Record<AboutTileTone, string> = {
  cream: "bg-[#f9ecd4]",
  sky: "bg-[#c9e8fa]",
  pink: "bg-[#f6def3]",
};

/** Mosaic photography is static — matched to each tile by its title so the
 *  admin can still reorder or rename rows without breaking the pairing. */
const STATIC_IMAGES: [RegExp, StaticImageData][] = [
  [/perspective|insight/i, perspImage],
  [/mission/i, missionImage],
  [/vision/i, visionImage],
];

/** Alternating image/tinted-card rows (Perspective, Mission, Vision). */
export function AboutMosaic({ tiles }: { tiles: AboutTile[] }) {
  if (!tiles.length) return null;
  return (
    <section className="mx-auto mt-14 grid w-full max-w-5xl gap-4 px-4 sm:px-6">
      {tiles.map((tile, i) => {
        const src =
          STATIC_IMAGES.find(([pattern]) => pattern.test(tile.title))?.[1] ??
          tile.imageUrl;
        return (
          <div
            key={tile.title}
            className="grid overflow-hidden rounded-3xl md:grid-cols-2"
          >
            <div
              className={cn(
                "relative aspect-[4/3] md:aspect-auto md:min-h-72",
                i % 2 === 1 && "md:order-2",
              )}
            >
              <Image
                src={src}
                alt={tile.alt}
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
            <div
              className={cn(
                "flex flex-col justify-center p-8 sm:p-10",
                TONES[tile.tone],
              )}
            >
              <h2 className="text-2xl font-semibold tracking-tight text-[#1F253F] sm:text-3xl">
                {tile.title}
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#1F253F]/70">
                {tile.body}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
