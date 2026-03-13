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
          className={`card rounded-box border p-5 text-left shadow-lg transition hover:-translate-y-0.5 ${
            activeFilter === spotlight.type
              ? "border-primary/70 bg-primary/15"
              : "border-base-300 bg-base-200/75 hover:border-primary/40 hover:bg-primary/10"
          }`}
          key={spotlight.type}
          onClick={() => onSelectFilter(spotlight.type)}
          type="button"
        >
          <h3 className="font-display text-xl text-base-content">{spotlight.title}</h3>
          <p className="mt-2 text-sm text-base-content/70">{spotlight.description}</p>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.12em] text-base-content/85">
            {spotlight.cta} →
          </p>
        </button>
      ))}
    </section>
  );
}
