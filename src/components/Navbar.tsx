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
  const accountLabel = authUser?.fullName?.trim() || authUser?.email || "Guest";
  const accountInitial = accountLabel.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 isolate border-b border-base-300 bg-base-100/80 text-base-content backdrop-blur">
      <div className="navbar mx-auto w-[min(1120px,92vw)] gap-3 py-3 lg:pb-3 lg:pt-4">
        <div className="navbar-start">
          <a className="btn btn-ghost h-auto min-h-0 gap-3 px-0 hover:bg-transparent" href="#/" onClick={onHomeClick}>
            <img alt="Grave Goods logo" className="h-9 w-9 rounded-full border border-base-300 object-cover sm:h-10 sm:w-10" src={logo} />
            <h1 className="font-poster text-lg tracking-[0.06em] text-base-content sm:text-2xl">Grave Goods</h1>
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

        <div className="navbar-end hidden gap-2 lg:flex">
          <div className="dropdown dropdown-end">
            <div className="btn btn-ghost btn-circle" role="button" tabIndex={0}>
              <div className="indicator">
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13 5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                {itemCount > 0 ? <span className="badge badge-primary badge-sm indicator-item">{itemCount}</span> : null}
              </div>
            </div>
            <div className="card card-compact dropdown-content z-20 mt-3 w-64 border border-base-300 bg-base-100 shadow-2xl" tabIndex={0}>
              <div className="card-body">
                <span className="text-lg font-bold">{itemCount} item{itemCount === 1 ? "" : "s"}</span>
                <span className="text-sm text-base-content/65">
                  {itemCount > 0 ? "Your cart is ready for checkout." : "Your cart is empty right now."}
                </span>
                <div className="card-actions mt-2">
                  <button className="btn btn-primary btn-block" onClick={onOpenCart} type="button">
                    View cart
                  </button>
                  <a className={`btn btn-outline btn-block ${routeName === "checkout" ? "btn-active" : ""}`} href="#/checkout">
                    Checkout
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="dropdown dropdown-end">
            <div className="btn btn-ghost btn-circle avatar" role="button" tabIndex={0}>
              {authUser ? (
                <div className="bg-primary text-primary-content flex w-10 items-center justify-center rounded-full font-semibold">
                  {accountInitial}
                </div>
              ) : (
                <div className="bg-base-200 border border-base-300 flex w-10 items-center justify-center rounded-full text-sm font-semibold">
                  {accountInitial}
                </div>
              )}
            </div>
            <ul className="menu menu-sm dropdown-content rounded-box z-20 mt-3 w-56 border border-base-300 bg-base-100 p-2 shadow-2xl" tabIndex={0}>
              <li className="menu-title">
                <span>{authUser ? accountLabel : "Account"}</span>
              </li>
              {authUser ? (
                <>
                  <li>
                    <a href="#/orders">Orders</a>
                  </li>
                  {isAdmin ? (
                    <li>
                      <a href="#/admin">Admin</a>
                    </li>
                  ) : null}
                  <li>
                    <a href="#/checkout">Checkout</a>
                  </li>
                  <li>
                    <button disabled={logoutPending} onClick={onLogout} type="button">
                      {logoutPending ? "Signing out..." : "Logout"}
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <button onClick={() => onOpenAuth("login")} type="button">Sign in</button>
                  </li>
                  <li>
                    <button onClick={() => onOpenAuth("register")} type="button">Create Account</button>
                  </li>
                  <li>
                    <a href="#/checkout">Checkout</a>
                  </li>
                </>
              )}
            </ul>
          </div>
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
