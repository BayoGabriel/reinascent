/** Static flash-sale hero — tilted "NEW ARRIVAL" badge graphic. */
export function FlashSaleHero() {
  return (
    <section aria-labelledby="flash-sale-title" className="overflow-hidden">
      <div className="relative mx-auto h-[380px] w-full max-w-3xl sm:h-[460px]">
        <span
          aria-hidden="true"
          className="absolute left-[16%] top-[22%] size-0 -rotate-[24deg] border-y-[26px] border-l-[42px] border-y-transparent border-l-[#f4c20d]"
        />
        <span
          aria-hidden="true"
          className="absolute left-[8%] top-[36%] size-0 rotate-[160deg] border-y-[24px] border-l-[38px] border-y-transparent border-l-[#e8503a]"
        />
        <div className="absolute left-[26%] top-[14%] -rotate-[8deg] bg-[#e8503a] px-8 py-5 [clip-path:polygon(8%_0,100%_0,92%_100%,0_100%)] sm:px-12 sm:py-7">
          <h1
            id="flash-sale-title"
            className="text-6xl font-black italic tracking-tight text-white sm:text-8xl"
          >
            NEW
          </h1>
        </div>
        <div className="absolute left-[13%] top-[46%] -rotate-[4deg] bg-[#33465b] px-8 py-5 [clip-path:polygon(6%_0,100%_0,94%_100%,0_100%)] sm:px-12 sm:py-7">
          <span className="block text-5xl font-black italic tracking-tight text-white sm:text-7xl">
            ARRIVAL
          </span>
        </div>
      </div>
    </section>
  );
}
