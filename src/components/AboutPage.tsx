import logo from "@/assets/grave_goods_logo.png";

export function AboutPage() {
  return (
    <main className="gg-page">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="grid gap-4">
          <p className="gg-kicker text-zinc-300">About Grave Goods</p>
          <h2 className="max-w-[16ch] font-display text-4xl leading-[1.12] tracking-[-0.01em] md:text-6xl md:leading-[1.08]">
            Small team. Loud stickers. Zero corporate voice.
          </h2>
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

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-white/15 bg-zinc-900/80 p-5">
          <h3 className="font-display text-xl text-white">How We Work</h3>
          <p className="mt-3 text-sm text-zinc-300">
            We run small batches so quality stays high and timelines stay honest. Every order gets packed by hand with real checks before it ships.
          </p>
        </article>
        <article className="rounded-2xl border border-white/15 bg-zinc-900/80 p-5">
          <h3 className="font-display text-xl text-white">Materials + Durability</h3>
          <p className="mt-3 text-sm text-zinc-300">
            Standard line is laminated vinyl with weather resistance and strong adhesion. Made for bottles, laptops, hard cases, helmets, and daily abuse.
          </p>
        </article>
        <article className="rounded-2xl border border-white/15 bg-zinc-900/80 p-5">
          <h3 className="font-display text-xl text-white">Values</h3>
          <p className="mt-3 text-sm text-zinc-300">
            We stand with queer folks, outsiders, workers, artists, and organizers. The studio is intentionally small, independent, and people-first.
          </p>
        </article>
        <article className="rounded-2xl border border-white/15 bg-zinc-900/80 p-5">
          <h3 className="font-display text-xl text-white">Shipping + Support</h3>
          <p className="mt-3 text-sm text-zinc-300">
            If anything arrives wrong or damaged, we fix it quickly. Direct support, clear communication, no scripted runaround.
          </p>
        </article>
      </section>

      <section className="mt-8 rounded-2xl border border-white/15 bg-[linear-gradient(120deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">Studio Notes</p>
        <div className="mt-3 grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
          <p>Small-batch production keeps designs fresh and dead stock low.</p>
          <p>Catalog includes stickers, buttons, and curated bundles.</p>
          <p>Built for expressive people who want gear that actually says something.</p>
        </div>
      </section>
    </main>
  );
}
