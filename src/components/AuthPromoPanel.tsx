import logo from "@/assets/grave_goods_logo.png";

export function AuthPromoPanel() {
  return (
    <div className="relative hidden min-h-[480px] overflow-hidden lg:block">
      {/* Dark purple gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgb(var(--gg-accent-rgb)/0.25),transparent_50%),linear-gradient(160deg,rgba(10,10,10,0.4),rgba(0,0,0,0.85)),linear-gradient(180deg,#1a0a2e_0%,#0d0d0d_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(168,85,247,0.06)_45%,transparent_100%)]" />

      {/* Logo badge */}
      <img
        alt="Grave Goods logo badge"
        className="absolute bottom-10 left-1/2 w-[65%] max-w-[260px] -translate-x-1/2 rotate-[8deg] rounded-full border border-white/10 object-cover shadow-[0_30px_80px_rgba(0,0,0,0.6)] drop-shadow-[0_0_40px_rgb(var(--gg-accent-rgb)/0.3)]"
        src={logo}
      />

      {/* Promo perks */}
      <div className="relative z-10 p-8 pt-10">
        <p className="font-poster text-xs uppercase tracking-[0.2em] text-primary">Why join?</p>
        <ul className="mt-5 space-y-4 text-sm text-base-content/65">
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 text-primary">✦</span>
            <span>10% off your first order — just for signing up</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 text-primary">✦</span>
            <span>Early access to limited drops before they sell out</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 text-primary">✦</span>
            <span>Order history so you know what you already grabbed</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 text-primary">✦</span>
            <span>Faster checkout every time after the first</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
