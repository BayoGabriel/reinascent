interface AboutHeroProps {
  heading: string;
  subheading: string;
}

/** About page title block — centered heading and subcopy. */
export function AboutHero({ heading, subheading }: AboutHeroProps) {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-40 text-center sm:px-6">
      <h1 className="text-[5xl] lg:text-[150px] font-semibold tracking-tight text-[#1F253F] sm:text-7xl">
        {heading}
      </h1>
      {subheading && (
        <p className="mx-auto mt-5 max-w-xl text-sm lg:text-md leading-relaxed text-[#4D525F]">
          {subheading}
        </p>
      )}
    </section>
  );
}
