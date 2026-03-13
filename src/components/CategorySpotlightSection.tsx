import type { ProductType } from "@/types";

const categorySpotlights: Array<{
  type: ProductType;
  title: string;
  description: string;
  cta: string;
}> = [
  {
    type: "sticker",
    title: "Sticker Drops",
    description: "Sharp message-forward vinyl with weather-resistant finish.",
    cta: "Browse stickers"
  },
  {
    type: "button",
    title: "Button Pins",
    description: "Small loud buttons for jackets, bags, and everyday armor.",
    cta: "Browse buttons"
  },
  {
    type: "bundle",
    title: "Bundle Packs",
    description: "Curated sets for gifts, crews, and quick restocks.",
    cta: "Browse bundles"
  }
];

interface CategorySpotlightSectionProps {
  activeFilter: ProductType | "all";
  onSelectFilter: (filter: ProductType) => void;
}

export function CategorySpotlightSection({
  activeFilter,
  onSelectFilter
}: CategorySpotlightSectionProps) {
  return (
    <section className="mb-8 grid gap-4 md:grid-cols-3">
      {categorySpotlights.map((spotlight) => (
        <button
          className={`rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:border-[#cf9cff]/60 hover:bg-[rgba(168,85,247,0.10)] ${
            activeFilter === spotlight.type
              ? "border-[#cf9cff]/70 bg-[rgba(168,85,247,0.16)]"
              : "border-white/15 bg-zinc-900/70"
          }`}
          key={spotlight.type}
          onClick={() => onSelectFilter(spotlight.type)}
          type="button"
        >
          <h3 className="font-display text-xl text-white">{spotlight.title}</h3>
          <p className="mt-2 text-sm text-zinc-300">{spotlight.description}</p>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.12em] text-zinc-200">
            {spotlight.cta} →
          </p>
        </button>
      ))}
    </section>
  );
}
