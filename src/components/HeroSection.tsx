import logo from "@/assets/grave_goods_logo.png";
import heroTentaclesOne from "@/assets/hero-tentacles-1.svg";

export function HeroSection() {
  return (
    <section className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,#080809_0%,#111214_52%,#050506_100%)] text-zinc-100 shadow-[0_30px_80px_-48px_rgba(0,0,0,0.95)]">
      <div className="absolute inset-y-0 left-0 w-4 bg-[#a855f7]" />
      <div className="pointer-events-none absolute inset-0 opacity-18 [background-image:radial-gradient(rgba(255,255,255,0.06)_0.7px,transparent_0.7px)] [background-size:10px_10px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(168,85,247,0.18),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-44 bg-[linear-gradient(180deg,rgba(5,5,6,0)_0%,rgba(5,5,6,0.32)_28%,rgba(5,5,6,0.74)_58%,#080808_100%)]" />
      <div className="pointer-events-none absolute inset-x-8 bottom-0 z-10 h-24 rounded-full bg-black/30 blur-3xl sm:inset-x-16 lg:inset-x-24" />
      <div className="relative px-8 pb-10 pt-8 sm:px-10 lg:px-12 lg:pb-12 lg:pt-10">
        {/* <div className="grid gap-4 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-zinc-400 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
          <span>Small Batch</span>
          <span className="hidden h-px bg-white/10 sm:block" />
          <span className="text-center">Weatherproof Vinyl</span>
          <span className="hidden h-px bg-white/10 sm:block" />
          <span className="sm:text-right">Visible Dissent</span>
        </div> */}

        <div className="relative min-h-[28rem] lg:min-h-[34rem] xl:min-h-[35rem]">
          <div className="relative z-20 flex justify-center pb-6 pt-2 sm:pb-8 lg:pb-0">
            <p className="max-w-[30rem] text-center text-[0.84rem] leading-6 text-zinc-300 sm:max-w-[36rem] sm:text-[0.9rem] lg:max-w-none lg:whitespace-nowrap lg:text-[0.96rem]">
              Stickers and buttons for laptops, bottles, jackets, and anywhere
              else you want the message to hit first.
            </p>
          </div>

          {/* <div className="pointer-events-none absolute inset-x-0 top-[5.9rem] z-20 text-center sm:top-[6.7rem] lg:top-[7.8rem] xl:top-[8.55rem]">
            <span className="block font-poster text-[0.88rem] uppercase leading-none tracking-[0.12em] text-[#cf9cff] drop-shadow-[0_0_14px_rgba(168,85,247,0.18)] sm:text-[0.96rem] lg:text-[1.02rem]">
              Your
            </span>
          </div> */}

          <div className="pointer-events-none absolute inset-x-0 top-28 z-0 text-center font-poster uppercase leading-none tracking-[-0.075em] text-white sm:top-32 lg:top-16">
            <span className="mb-2 block font-poster text-[0.76rem] uppercase leading-none tracking-[0.12em] text-[#cf9cff] drop-shadow-[0_0_14px_rgba(168,85,247,0.18)] sm:text-[0.88rem] lg:mb-3 lg:text-[1.02rem]">
              Your
            </span>
            <span className="block whitespace-nowrap text-[2.55rem] sm:text-[3.4rem] lg:text-[7.2rem] xl:text-[8.2rem]">
              VISIBLE DISSENT
            </span>
            <span className="mt-2 block font-poster text-[0.78rem] uppercase leading-none tracking-[0.12em] text-[#cf9cff] drop-shadow-[0_0_14px_rgba(168,85,247,0.18)] sm:text-[0.92rem] lg:mt-3 lg:text-[1.08rem]">
              Purveyor
            </span>
          </div>

          {/* <div className="pointer-events-none absolute inset-x-0 top-[17.2rem] z-30 text-center sm:top-[20.8rem] lg:top-[23.4rem] xl:top-[25.8rem]">
            <span className="block font-poster text-[0.92rem] uppercase leading-none tracking-[0.12em] text-[#cf9cff] drop-shadow-[0_0_14px_rgba(168,85,247,0.18)] sm:text-[1rem] lg:text-[1.08rem]">
              Purveyor
            </span>
          </div> */}

          <div className="z-10 pt-28">
            <img
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute bottom-[-6.5rem] left-[-7rem] z-0 w-[20rem] rotate-[-18deg] opacity-[0.035] grayscale brightness-[1.45] contrast-[1.05] blur-[1px] sm:left-[-6rem] sm:w-[24rem] lg:bottom-[-5.5rem] lg:left-[-3rem] lg:w-[27rem]"
              src={heroTentaclesOne}
            />
            <img
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute bottom-[-6rem] right-[-7.5rem] z-0 w-[20rem] scale-x-[-1] rotate-[14deg] opacity-[0.035] grayscale brightness-[1.45] contrast-[1.05] blur-[1px] sm:right-[-6rem] sm:w-[24rem] lg:bottom-[-5rem] lg:right-[-3.5rem] lg:w-[28rem]"
              src={heroTentaclesOne}
            />
            <img
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute bottom-[-8rem] left-1/2 z-0 w-[min(100%,26rem)] -translate-x-1/2 opacity-[0.05] grayscale brightness-[1.55] contrast-[1.08] blur-[1.5px] sm:bottom-[-9rem] sm:w-[28rem] lg:bottom-[-10rem] lg:w-[31rem] xl:bottom-[-11rem] xl:w-[34rem]"
              src={heroTentaclesOne}
            />
            <img
              alt="Grave Goods logo badge"
              className="absolute left-1/2 top-[50%] z-20 w-[min(82vw,14rem)] -translate-x-1/2 object-contain opacity-95 drop-shadow-[0_24px_24px_rgba(0,0,0,0.22)] sm:top-[63%] sm:w-[15rem] lg:top-[16rem] lg:w-[21rem] xl:top-[16.5rem] xl:w-[23rem]"

              src={logo}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
