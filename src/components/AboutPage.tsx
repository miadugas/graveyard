import logo from "@/assets/grave_goods_logo.png";
import heroTentaclesOne from "@/assets/hero-tentacles-1.svg";

export function AboutPage() {
  return (
    <main className="gg-page relative overflow-hidden">
      {/* Background tentacle SVG — single, left-aligned, vertically centered, fully visible */}
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 z-0 w-[28rem] -translate-y-1/2 opacity-[0.09] brightness-[1.6] blur-[0.5px] sm:w-[34rem] lg:left-8 lg:w-[42rem]"
        src={heroTentaclesOne}
      />

      {/* Hero section */}
      <section className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="grid gap-5">
          <p className="font-poster text-xs uppercase tracking-[0.2em] text-primary">
            About Grave Goods
          </p>
          <h2 className="font-poster text-4xl uppercase leading-[0.95] tracking-[-0.03em] text-base-content md:text-6xl">
            Small team.
            <br />
            Loud stickers.
            <br />
            <span className="text-primary">Zero corporate voice.</span>
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-zinc-300">
            Grave Goods is an independent sticker and button shop for people who&rsquo;d
            rather say it on their laptop than say it to HR. We keep runs small,
            quality high, and our mouths unfiltered.
          </p>
          <p className="max-w-xl text-sm leading-relaxed text-zinc-400">
            Every piece is 3&quot; custom vinyl with weather-resistant laminate &mdash; tuned
            for bottles, laptops, road cases, helmets, and whatever else takes a beating.
          </p>
        </div>
        <div className="relative mx-auto w-full max-w-[280px]">
          <div className="absolute -inset-4 rounded-full bg-primary/10 blur-2xl" />
          <img
            alt="Grave Goods logo badge"
            className="relative w-full rounded-full border border-white/10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
            src={logo}
          />
        </div>
      </section>

      {/* Values grid */}
      <section className="relative z-10 mt-12 grid gap-4 md:grid-cols-2">
        <article className="group/card card rounded-2xl border border-base-300 bg-base-200/75 p-6 transition hover:border-primary/60 hover:shadow-[0_0_24px_rgb(var(--gg-accent-rgb)/0.15)]">
          <h3 className="font-poster text-xl uppercase tracking-[-0.01em] text-base-content">How We Work</h3>
          <p className="mt-3 text-sm leading-relaxed text-base-content/65">
            Small batches. Hand-packed. Real quality checks before anything ships.
            We don&rsquo;t do mass production and we don&rsquo;t do excuses.
          </p>
        </article>
        <article className="group/card card rounded-2xl border border-base-300 bg-base-200/75 p-6 transition hover:border-primary/60 hover:shadow-[0_0_24px_rgb(var(--gg-accent-rgb)/0.15)]">
          <h3 className="font-poster text-xl uppercase tracking-[-0.01em] text-base-content">Built to Last</h3>
          <p className="mt-3 text-sm leading-relaxed text-base-content/65">
            Laminated vinyl. Weather resistant. Strong adhesion. Made for daily abuse &mdash;
            not your junk drawer.
          </p>
        </article>
        <article className="group/card card rounded-2xl border border-base-300 bg-base-200/75 p-6 transition hover:border-primary/60 hover:shadow-[0_0_24px_rgb(var(--gg-accent-rgb)/0.15)]">
          <h3 className="font-poster text-xl uppercase tracking-[-0.01em] text-base-content">Who We Stand With</h3>
          <p className="mt-3 text-sm leading-relaxed text-base-content/65">
            Queer folks. Outsiders. Workers. Artists. Organizers. Anyone who&rsquo;s
            been told to quiet down and chose not to.
          </p>
        </article>
        <article className="group/card card rounded-2xl border border-base-300 bg-base-200/75 p-6 transition hover:border-primary/60 hover:shadow-[0_0_24px_rgb(var(--gg-accent-rgb)/0.15)]">
          <h3 className="font-poster text-xl uppercase tracking-[-0.01em] text-base-content">If Something&rsquo;s Wrong</h3>
          <p className="mt-3 text-sm leading-relaxed text-base-content/65">
            We fix it. Fast. Direct support from real people &mdash; no bots,
            no scripts, no runaround.
          </p>
        </article>
      </section>

      {/* Studio notes banner */}
      <section className="relative z-10 mt-10 overflow-hidden rounded-2xl border border-primary/20 bg-[linear-gradient(135deg,rgba(168,85,247,0.08),rgba(168,85,247,0.02)_50%,rgba(0,0,0,0))] p-6">
        <p className="relative font-poster text-sm uppercase tracking-[0.16em] text-primary">Studio Notes</p>
        <div className="relative mt-4 grid gap-4 text-sm leading-relaxed text-base-content/70 sm:grid-cols-3">
          <p>Small-batch production keeps designs fresh and dead stock nonexistent.</p>
          <p>Stickers, buttons, and curated bundles &mdash; that&rsquo;s the whole catalog. No filler.</p>
          <p>Built for people who want their gear to say something worth reading.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mt-12 text-center">
        <p className="font-poster text-2xl uppercase tracking-[-0.02em] text-base-content sm:text-3xl">
          Enough reading.
        </p>
        <a
          className="btn mt-6 min-h-14 rounded-[1.75rem] border-0 bg-[rgb(var(--gg-accent-rgb))] px-10 font-poster text-base uppercase tracking-[0.12em] text-white shadow-[0_0_0_1px_rgb(var(--gg-accent-rgb)/0.3),0_18px_50px_-20px_rgb(var(--gg-accent-rgb)/0.55)] transition-all duration-200 hover:scale-[1.04] hover:brightness-110 hover:shadow-[0_24px_60px_-16px_rgb(var(--gg-accent-rgb)/0.7)] active:scale-[0.97]"
          href="#/"
        >
          Go see the stickers
        </a>
      </section>
    </main>
  );
}
