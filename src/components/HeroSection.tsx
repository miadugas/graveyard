import logo from "@/assets/grave_goods_logo.png";
import heroTentaclesOne from "@/assets/hero-tentacles-1.svg";

export function HeroSection() {
  return (
    <section className="relative mb-0 overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,#080809_0%,#111214_52%,#050506_100%)] text-zinc-100 shadow-[0_30px_80px_-48px_rgba(0,0,0,0.95)]">
      {/* Left accent bar */}
      <div className="absolute inset-y-0 left-0 w-4 bg-primary" />

      {/* Dot pattern overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-18 [background-image:radial-gradient(rgba(255,255,255,0.06)_0.7px,transparent_0.7px)] [background-size:10px_10px]" />

      {/* Radial glow overlays */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_30%),radial-gradient(circle_at_85%_15%,rgb(var(--gg-accent-rgb)/0.18),transparent_24%)]" />

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-[linear-gradient(180deg,rgba(5,5,6,0)_0%,rgba(5,5,6,0.32)_28%,rgba(5,5,6,0.74)_58%,#080808_100%)]" />

      {/* Center tentacle background */}
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-[80%] -translate-x-1/2 -translate-y-1/2 opacity-[0.06] grayscale brightness-[1.5] contrast-[1.1] blur-[0.5px] sm:w-[70%] lg:w-[55%]"
        src={heroTentaclesOne}
      />

      {/* Tentacle decorations — left & right */}
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-6.5rem] left-[-7rem] z-0 w-[20rem] rotate-[-18deg] opacity-[0.04] grayscale brightness-[1.45] contrast-[1.05] blur-[1px] sm:left-[-6rem] sm:w-[24rem] lg:bottom-[-5.5rem] lg:left-[-3rem] lg:w-[22rem]"
        src={heroTentaclesOne}
      />
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-6rem] right-[-7.5rem] z-0 w-[20rem] scale-x-[-1] rotate-[14deg] opacity-[0.04] grayscale brightness-[1.45] contrast-[1.05] blur-[1px] sm:right-[-6rem] sm:w-[24rem] lg:bottom-[-5rem] lg:right-[-3.5rem] lg:w-[22rem]"
        src={heroTentaclesOne}
      />

      {/* Split layout content */}
      <div className="relative z-20 grid min-h-[22rem] items-center gap-6 px-8 py-10 sm:px-10 lg:min-h-[26rem] lg:grid-cols-[1fr_auto] lg:gap-12 lg:px-14 lg:py-14">
        {/* Left side — branding & text */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <span className="mb-3 font-poster text-[0.78rem] uppercase leading-none tracking-[0.14em] text-zinc-400 sm:text-[0.88rem] lg:text-[0.96rem]">
            Your
          </span>
          <h1 className="font-poster uppercase leading-[0.92] tracking-[-0.04em] text-white text-[2.6rem] sm:text-[3.6rem] lg:text-[5rem] xl:text-[5.8rem]">
            VISIBLE
            <br />
            DISSENT
          </h1>
          <span className="mt-3 font-poster text-[0.78rem] uppercase leading-none tracking-[0.14em] text-zinc-400 drop-shadow-[0_0_14px_rgb(var(--gg-accent-rgb)/0.18)] sm:text-[0.88rem] lg:text-[0.96rem]">
            No Gods, Just Stickers
          </span>

          <p className="mt-5 max-w-[28rem] text-[0.84rem] leading-6 text-zinc-300 sm:text-[0.9rem] lg:text-[0.96rem]">
            Small-batch stickers and buttons for people who&rsquo;d rather be
            loud than polite.
          </p>

          <a
            className="btn mt-8 min-h-14 rounded-[1.75rem] border-0 bg-[rgb(var(--gg-accent-rgb))] px-10 font-poster text-base uppercase tracking-[0.12em] text-white shadow-[0_0_0_1px_rgb(var(--gg-accent-rgb)/0.3),0_18px_50px_-20px_rgb(var(--gg-accent-rgb)/0.55)] transition-all duration-200 hover:scale-[1.04] hover:brightness-110 hover:shadow-[0_24px_60px_-16px_rgb(var(--gg-accent-rgb)/0.7)] active:scale-[0.97] sm:min-h-16 sm:text-lg"
            href="#shop-products"
          >
            Browse the Drop
          </a>
        </div>

        {/* Right side — logo badge */}
        <div className="hidden lg:flex lg:items-center lg:justify-center">
          <img
            alt="Grave Goods logo badge"
            className="w-[18rem] object-contain opacity-95 drop-shadow-[0_24px_32px_rgba(0,0,0,0.3)] xl:w-[22rem]"
            src={logo}
          />
        </div>

        {/* Mobile: centered logo below text */}
        <div className="flex justify-center lg:hidden">
          <img
            alt="Grave Goods logo badge"
            className="w-[min(60vw,12rem)] object-contain opacity-90 drop-shadow-[0_16px_24px_rgba(0,0,0,0.25)]"
            src={logo}
          />
        </div>
      </div>
    </section>
  );
}
