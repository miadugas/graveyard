import type { ProductType } from "@/types";

const categorySpotlights: Array<{
  type: ProductType;
  title: string;
  description: string;
  cta: string;
}> = [
  {
    type: "sticker",
    title: "Stickers",
    description: "Weatherproof vinyl that says what you won't say to their face.",
    cta: "See the stickers"
  },
  {
    type: "button",
    title: "Buttons",
    description: "Pin your politics to your jacket and walk outside.",
    cta: "See the buttons"
  },
  {
    type: "bundle",
    title: "Bundles",
    description: "Grab the set. Arm your friends.",
    cta: "See the bundles"
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
    <section className="mb-6 mt-6 grid gap-4 md:grid-cols-3">
      {categorySpotlights.map((spotlight) => (
        <button
          className={`group/card card rounded-box border p-5 text-left shadow-lg transition hover:-translate-y-0.5 ${
            activeFilter === spotlight.type
              ? "border-primary bg-primary/15 shadow-[0_0_24px_rgb(var(--gg-accent-rgb)/0.2)]"
              : "border-base-300 bg-base-200/75 hover:border-primary/70 hover:bg-primary/10 hover:shadow-[0_0_20px_rgb(var(--gg-accent-rgb)/0.15)]"
          }`}
          key={spotlight.type}
          onClick={() => onSelectFilter(spotlight.type)}
          type="button"
        >
          <h3 className="font-poster text-2xl uppercase tracking-[-0.02em] text-base-content">{spotlight.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-base-content/65">{spotlight.description}</p>
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary transition-all group-hover/card:gap-3">
            {spotlight.cta}
            <span className="transition-transform group-hover/card:translate-x-0.5">→</span>
          </p>
        </button>
      ))}
    </section>
  );
}
