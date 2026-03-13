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
    <header className="sticky top-0 z-50 isolate border-b border-base-300 bg-base-100/80 text-base-content backdrop-blur">
      <div className="navbar mx-auto w-[min(1120px,92vw)] gap-3 py-3 lg:pb-3 lg:pt-4">
        <div className="navbar-start">
          <a className="btn btn-ghost h-auto min-h-0 gap-3 px-0 hover:bg-transparent" href="#/" onClick={onHomeClick}>
            <img alt="Grave Goods logo" className="h-9 w-9 rounded-full border border-base-300 object-cover sm:h-10 sm:w-10" src={logo} />
            <h1 className="font-display text-lg tracking-[0.06em] text-base-content sm:text-2xl">Grave Goods</h1>
          </a>
        </div>

        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal gap-2 rounded-full border border-base-300 bg-base-200/70 px-3 py-2">
            <li>
              <a className={routeName === "shop" ? "active font-semibold" : ""} href="#/">
                Shop
              </a>
            </li>
            <li>
              <a className={routeName === "about" ? "active font-semibold" : ""} href="#/about">
                About
              </a>
            </li>
            {authUser ? (
              <li>
                <a className={routeName === "orders" || routeName === "order" ? "active font-semibold" : ""} href="#/orders">
                  Orders
                </a>
              </li>
            ) : null}
            {isAdmin ? (
              <li>
                <a className={routeName === "admin" ? "active font-semibold" : ""} href="#/admin">
                  Admin
                </a>
              </li>
            ) : null}
          </ul>
        </div>

        <div className="navbar-end hidden gap-3 lg:flex">
          <a className={`btn btn-ghost ${routeName === "checkout" ? "btn-active" : ""}`} href="#/checkout">
            Checkout
          </a>
          {authUser ? (
            <button
              className="btn btn-ghost"
              disabled={logoutPending}
              onClick={onLogout}
              type="button"
            >
              {logoutPending ? "Signing out..." : "Logout"}
            </button>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={() => onOpenAuth("login")} type="button">
                Sign in
              </button>
              <button className="btn btn-outline rounded-full" onClick={() => onOpenAuth("register")} type="button">
                Create Account
              </button>
            </>
          )}
          <button className="btn btn-ghost" onClick={onOpenCart} type="button">
            Cart ({itemCount})
          </button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            className="btn btn-outline"
            onClick={onOpenCart}
            type="button"
          >
            Cart ({itemCount})
          </button>
          <button
            aria-expanded={mobileNavOpen}
            aria-label="Toggle menu"
            className="btn btn-square btn-outline"
            onClick={onToggleMobileNav}
            type="button"
          >
            {mobileNavOpen ? "×" : "☰"}
          </button>
        </div>
      </div>

      {mobileNavOpen ? (
        <div className="border-t border-base-300 bg-base-100/95 lg:hidden">
          <div className="mx-auto grid w-[min(1120px,92vw)] gap-2 py-3">
            <a
              className={`btn justify-start ${
                routeName === "shop"
                  ? "btn-primary"
                  : "btn-outline border-base-300"
              }`}
              href="#/"
            >
              Shop
            </a>
            <a
              className={`btn justify-start ${
                routeName === "about"
                  ? "btn-primary"
                  : "btn-outline border-base-300"
              }`}
              href="#/about"
            >
              About
            </a>
            {authUser ? (
              <a
                className={`btn justify-start ${
                  routeName === "orders" || routeName === "order"
                    ? "btn-primary"
                    : "btn-outline border-base-300"
                }`}
                href="#/orders"
              >
                Orders
              </a>
            ) : null}
            {isAdmin ? (
              <a
                className={`btn justify-start ${
                  routeName === "admin"
                    ? "btn-primary"
                    : "btn-outline border-base-300"
                }`}
                href="#/admin"
              >
                Admin
              </a>
            ) : null}
            <a
              className={`btn justify-start ${
                routeName === "checkout"
                  ? "btn-primary"
                  : "btn-outline border-base-300"
              }`}
              href="#/checkout"
            >
              Checkout
            </a>
            {authUser ? (
              <button
                className="btn btn-outline justify-start border-base-300 disabled:opacity-50"
                disabled={logoutPending}
                onClick={onLogout}
                type="button"
              >
                {logoutPending ? "Signing out..." : "Logout"}
              </button>
            ) : (
              <>
                <button
                  className="btn btn-outline justify-start border-base-300"
                  onClick={() => onOpenAuth("login")}
                  type="button"
                >
                  Sign in
                </button>
                <button
                  className="btn btn-outline justify-start border-base-300"
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
