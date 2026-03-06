import logo from "@/assets/grave_goods_logo.png";

export function AboutPage() {
  return (
    <main className="mx-auto w-[min(1120px,92vw)] py-10">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="grid gap-4">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">About Grave Goods</p>
          <h2 className="max-w-3xl font-display text-4xl leading-tight md:text-6xl">Small team. Loud stickers. Zero corporate voice.</h2>
          <p className="max-w-2xl text-zinc-300">
            Grave Goods is an independent sticker and button shop built for people who like their design bold and their values clear.
            We keep runs small, quality high, and communication honest.
          </p>
          <p className="max-w-2xl text-sm text-zinc-300/90">
            Our standard line is 3&quot; custom vinyl with weather-resistant laminate, tuned for bottles, laptops, road cases,
            helmets, and whatever else sees real use.
          </p>
        </div>
        <div className="mx-auto w-full max-w-[340px] rounded-3xl border border-white/20 bg-black/60 p-6 shadow-2xl shadow-black/70">
          <img alt="Grave Goods logo badge" className="mx-auto w-full max-w-[280px] rounded-full border border-white/15" src={logo} />
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-white/15 bg-zinc-900/80 p-5">
          <h3 className="font-display text-xl text-white">How We Work</h3>
          <p className="mt-3 text-sm text-zinc-300">
            We print, cut, and pack with attention to detail. If something is off, we fix it. No runaround, no script, no pretending.
          </p>
        </article>
        <article className="rounded-2xl border border-white/15 bg-zinc-900/80 p-5">
          <h3 className="font-display text-xl text-white">What We Believe</h3>
          <p className="mt-3 text-sm text-zinc-300">
            Everyone deserves respect, safety, and a fair shot. We stand with queer folks, outsiders, workers, artists, and organizers.
          </p>
        </article>
        <article className="rounded-2xl border border-white/15 bg-zinc-900/80 p-5">
          <h3 className="font-display text-xl text-white">What You Get</h3>
          <p className="mt-3 text-sm text-zinc-300">
            Durable materials, clean cuts, strong contrast, and stickers that stay sharp in the real world. Built to hold up, not just look good online.
          </p>
        </article>
      </section>
    </main>
  );
}
