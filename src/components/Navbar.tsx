import logo from "@/assets/grave_goods_logo.png";
import type { AuthUser } from "@/types";

type NavbarRoute = "shop" | "about" | "admin" | "checkout" | "orders" | "order";
type AuthMode = "login" | "register";

interface NavbarProps {
  routeName: NavbarRoute;
  authUser: AuthUser | null | undefined;
  isAdmin: boolean;
  itemCount: number;
  mobileNavOpen: boolean;
  logoutPending: boolean;
  onHomeClick: () => void;
  onOpenCart: () => void;
  onToggleMobileNav: () => void;
  onOpenAuth: (mode: AuthMode) => void;
  onLogout: () => void;
}

export function Navbar({
  routeName,
  authUser,
  isAdmin,
  itemCount,
  mobileNavOpen,
  logoutPending,
  onHomeClick,
  onOpenCart,
  onToggleMobileNav,
  onOpenAuth,
  onLogout
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 isolate border-b border-white/15 bg-black/65 text-zinc-100 backdrop-blur">
      <div className="mx-auto flex w-[min(1120px,92vw)] items-center justify-between gap-3 py-3 lg:pb-3 lg:pt-4">
        <a className="flex items-center gap-3" href="#/" onClick={onHomeClick}>
          <img alt="Grave Goods logo" className="h-9 w-9 rounded-full border border-white/30 object-cover sm:h-10 sm:w-10" src={logo} />
          <h1 className="font-display text-lg tracking-[0.06em] text-white sm:text-2xl">Grave Goods</h1>
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          <a
            className={`flex min-h-11 items-center whitespace-nowrap border-b-2 px-1 text-base font-medium transition ${
              routeName === "shop"
                ? "border-white text-white"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
            href="#/"
          >
            Shop
          </a>
          <a
            className={`flex min-h-11 items-center whitespace-nowrap border-b-2 px-1 text-base font-medium transition ${
              routeName === "about"
                ? "border-white text-white"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
            href="#/about"
          >
            About
          </a>
          {authUser ? (
            <a
              className={`flex min-h-11 items-center whitespace-nowrap border-b-2 px-1 text-base font-medium transition ${
                routeName === "orders" || routeName === "order"
                  ? "border-white text-white"
                  : "border-transparent text-zinc-400 hover:text-white"
              }`}
              href="#/orders"
            >
              Orders
            </a>
          ) : null}
          {isAdmin ? (
            <a
              className={`flex min-h-11 items-center whitespace-nowrap border-b-2 px-1 text-base font-medium transition ${
                routeName === "admin"
                  ? "border-white text-white"
                  : "border-transparent text-zinc-400 hover:text-white"
              }`}
              href="#/admin"
            >
              Admin
            </a>
          ) : null}
        </nav>

        <div className="hidden items-center gap-4 text-base lg:flex">
          <a
            className={`whitespace-nowrap transition ${
              routeName === "checkout"
                ? "font-semibold text-white"
                : "text-zinc-400 hover:text-white"
            }`}
            href="#/checkout"
          >
            Checkout
          </a>
          <span aria-hidden="true" className="h-6 w-px bg-white/20" />
          {authUser ? (
            <button
              className="whitespace-nowrap text-zinc-400 transition hover:text-white disabled:opacity-50"
              disabled={logoutPending}
              onClick={onLogout}
              type="button"
            >
              {logoutPending ? "Signing out..." : "Logout"}
            </button>
          ) : (
            <>
              <button
                className="whitespace-nowrap text-zinc-400 transition hover:text-white"
                onClick={() => onOpenAuth("login")}
                type="button"
              >
                Sign in
              </button>
              <span aria-hidden="true" className="h-6 w-px bg-white/20" />
              <button
                className="whitespace-nowrap text-zinc-400 transition hover:text-white"
                onClick={() => onOpenAuth("register")}
                type="button"
              >
                Create Account
              </button>
            </>
          )}
          <button
            className="inline-flex min-h-11 items-center whitespace-nowrap text-zinc-300 transition hover:text-white"
            onClick={onOpenCart}
            type="button"
          >
            Cart ({itemCount})
          </button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            className="min-h-11 whitespace-nowrap rounded-md border border-white/25 px-3 py-2 text-sm text-zinc-200 transition hover:bg-white hover:text-black"
            onClick={onOpenCart}
            type="button"
          >
            Cart ({itemCount})
          </button>
          <button
            aria-expanded={mobileNavOpen}
            aria-label="Toggle menu"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-white/25 text-zinc-200 transition hover:bg-white hover:text-black"
            onClick={onToggleMobileNav}
            type="button"
          >
            {mobileNavOpen ? "×" : "☰"}
          </button>
        </div>
      </div>

      {mobileNavOpen ? (
        <div className="border-t border-white/10 bg-black/90 lg:hidden">
          <div className="mx-auto grid w-[min(1120px,92vw)] gap-2 py-3">
            <a
              className={`min-h-11 whitespace-nowrap rounded-md border px-3 py-2 text-sm transition ${
                routeName === "shop"
                  ? "border-white bg-white text-black"
                  : "border-white/25 text-zinc-300 hover:bg-white hover:text-black"
              }`}
              href="#/"
            >
              Shop
            </a>
            <a
              className={`min-h-11 whitespace-nowrap rounded-md border px-3 py-2 text-sm transition ${
                routeName === "about"
                  ? "border-white bg-white text-black"
                  : "border-white/25 text-zinc-300 hover:bg-white hover:text-black"
              }`}
              href="#/about"
            >
              About
            </a>
            {authUser ? (
              <a
                className={`min-h-11 whitespace-nowrap rounded-md border px-3 py-2 text-sm transition ${
                  routeName === "orders" || routeName === "order"
                    ? "border-white bg-white text-black"
                    : "border-white/25 text-zinc-300 hover:bg-white hover:text-black"
                }`}
                href="#/orders"
              >
                Orders
              </a>
            ) : null}
            {isAdmin ? (
              <a
                className={`min-h-11 whitespace-nowrap rounded-md border px-3 py-2 text-sm transition ${
                  routeName === "admin"
                    ? "border-white bg-white text-black"
                    : "border-white/25 text-zinc-300 hover:bg-white hover:text-black"
                }`}
                href="#/admin"
              >
                Admin
              </a>
            ) : null}
            <a
              className={`min-h-11 whitespace-nowrap rounded-md border px-3 py-2 text-sm transition ${
                routeName === "checkout"
                  ? "border-white bg-white text-black"
                  : "border-white/25 text-zinc-300 hover:bg-white hover:text-black"
              }`}
              href="#/checkout"
            >
              Checkout
            </a>
            {authUser ? (
              <button
                className="min-h-11 whitespace-nowrap rounded-md border border-white/25 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white hover:text-black disabled:opacity-50"
                disabled={logoutPending}
                onClick={onLogout}
                type="button"
              >
                {logoutPending ? "Signing out..." : "Logout"}
              </button>
            ) : (
              <>
                <button
                  className="min-h-11 whitespace-nowrap rounded-md border border-white/25 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white hover:text-black"
                  onClick={() => onOpenAuth("login")}
                  type="button"
                >
                  Sign in
                </button>
                <button
                  className="min-h-11 whitespace-nowrap rounded-md border border-white/25 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white hover:text-black"
                  onClick={() => onOpenAuth("register")}
                  type="button"
                >
                  Create Account
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
