import logo from "@/assets/grave_goods_logo.png";

export function AuthPromoPanel() {
  return (
    <div className="relative hidden min-h-full lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_22%),linear-gradient(145deg,rgba(16,16,16,0.15),rgba(0,0,0,0.7)),linear-gradient(180deg,#fb7185_0%,#ea580c_32%,#2563eb_68%,#0f172a_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.08)_45%,transparent_100%)]" />
      <img
        alt="Grave Goods logo badge"
        className="absolute bottom-10 left-1/2 w-[72%] max-w-md -translate-x-1/2 rotate-[8deg] rounded-full border border-white/20 object-cover shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
        src={logo}
      />
      <div className="absolute left-8 top-8 max-w-[240px] rounded-[1.75rem] border border-white/20 bg-black/30 px-5 py-4 backdrop-blur-sm">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-200">First Order Perk</p>
        <p className="mt-2 font-display text-3xl leading-none text-white">10% off</p>
        <p className="mt-3 text-sm leading-6 text-zinc-100">Sharp drops. Faster checkout. Order history in one place.</p>
      </div>
    </div>
  );
}
